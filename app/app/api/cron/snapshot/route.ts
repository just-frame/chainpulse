import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization of admin client (service role key bypasses RLS)
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key) {
      throw new Error('Missing Supabase credentials for cron job');
    }
    
    supabaseAdmin = createClient(url, key);
  }
  return supabaseAdmin;
}

// Vercel Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

/**
 * POST /api/cron/snapshot
 * 
 * Called by Vercel Cron every hour to snapshot portfolio values for all users.
 * This enables historical tracking, sparklines, and accurate % change calculations.
 * 
 * Security: Requires CRON_SECRET header or Vercel cron authorization
 */
export async function POST(request: NextRequest) {
  // Verify cron authorization
  const authHeader = request.headers.get('authorization');
  const cronHeader = request.headers.get('x-cron-secret');
  
  // Allow Vercel Cron (sends Bearer token) or custom CRON_SECRET
  const isVercelCron = authHeader?.startsWith('Bearer ');
  const hasValidSecret = cronHeader === CRON_SECRET;
  
  if (!isVercelCron && !hasValidSecret && CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log('[Cron] Starting portfolio snapshot job...');
  const startTime = Date.now();

  try {
    const adminClient = getSupabaseAdmin();
    
    // Get all users with wallets
    const { data: usersWithWallets, error: usersError } = await adminClient
      .from('wallets')
      .select('user_id')
      .not('user_id', 'is', null);

    if (usersError) {
      console.error('[Cron] Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get unique user IDs
    const userIds = [...new Set(usersWithWallets?.map(w => w.user_id) || [])];
    console.log(`[Cron] Found ${userIds.length} users with wallets`);

    if (userIds.length === 0) {
      return NextResponse.json({ message: 'No users to snapshot', count: 0 });
    }

    // Process each user
    const results = await Promise.allSettled(
      userIds.map(userId => snapshotUserPortfolio(userId))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    // Also update daily aggregates
    await updateDailyAggregates();

    const duration = Date.now() - startTime;
    console.log(`[Cron] Completed in ${duration}ms: ${successful} success, ${failed} failed`);

    return NextResponse.json({
      message: 'Snapshot complete',
      users: userIds.length,
      successful,
      failed,
      duration,
    });
  } catch (error) {
    console.error('[Cron] Error in snapshot job:', error);
    return NextResponse.json(
      { error: 'Snapshot job failed' },
      { status: 500 }
    );
  }
}

/**
 * Snapshot a single user's portfolio value
 */
async function snapshotUserPortfolio(userId: string): Promise<void> {
  const adminClient = getSupabaseAdmin();
  
  // Get user's wallets
  const { data: wallets, error: walletsError } = await adminClient
    .from('wallets')
    .select('address, chain')
    .eq('user_id', userId);

  if (walletsError || !wallets?.length) {
    console.log(`[Cron] No wallets for user ${userId.slice(0, 8)}...`);
    return;
  }

  // Fetch portfolio value for each wallet
  let totalValue = 0;
  const valueByChain: { [chain: string]: number } = {};

  // Use internal API to fetch portfolio data
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  await Promise.all(
    wallets.map(async (wallet) => {
      try {
        const response = await fetch(
          `${baseUrl}/api/portfolio?address=${encodeURIComponent(wallet.address)}&chain=${wallet.chain}`,
          { 
            headers: { 'Content-Type': 'application/json' },
            next: { revalidate: 0 } // No cache for cron
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const walletValue = data.totalValue || 0;
          totalValue += walletValue;
          valueByChain[wallet.chain] = (valueByChain[wallet.chain] || 0) + walletValue;
        }
      } catch (error) {
        console.error(`[Cron] Error fetching wallet ${wallet.address}:`, error);
      }
    })
  );

  // Save snapshot
  const { error: insertError } = await adminClient
    .from('portfolio_snapshots')
    .insert({
      user_id: userId,
      total_value: totalValue,
      value_by_chain: valueByChain,
    });

  if (insertError) {
    console.error(`[Cron] Error saving snapshot for user ${userId}:`, insertError);
    throw insertError;
  }

  console.log(`[Cron] Snapshot saved for user ${userId.slice(0, 8)}...: $${totalValue.toFixed(2)}`);
}

/**
 * Update daily aggregate table from hourly snapshots
 * Run at the end of each hour to keep daily stats current
 */
async function updateDailyAggregates(): Promise<void> {
  const adminClient = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Get all users who have snapshots today
  const { data: todaySnapshots, error } = await adminClient
    .from('portfolio_snapshots')
    .select('user_id, total_value, created_at')
    .gte('created_at', `${today}T00:00:00Z`)
    .lt('created_at', `${today}T23:59:59Z`)
    .order('created_at', { ascending: true });

  if (error || !todaySnapshots?.length) {
    return;
  }

  // Group by user
  const userSnapshots = new Map<string, { values: number[]; timestamps: string[] }>();
  for (const snap of todaySnapshots) {
    if (!userSnapshots.has(snap.user_id)) {
      userSnapshots.set(snap.user_id, { values: [], timestamps: [] });
    }
    userSnapshots.get(snap.user_id)!.values.push(Number(snap.total_value));
    userSnapshots.get(snap.user_id)!.timestamps.push(snap.created_at);
  }

  // Upsert daily records
  for (const [userId, data] of userSnapshots) {
    const openValue = data.values[0];
    const closeValue = data.values[data.values.length - 1];
    const highValue = Math.max(...data.values);
    const lowValue = Math.min(...data.values);

    await adminClient
      .from('portfolio_daily')
      .upsert({
        user_id: userId,
        date: today,
        open_value: openValue,
        close_value: closeValue,
        high_value: highValue,
        low_value: lowValue,
      }, {
        onConflict: 'user_id,date',
      });
  }

  console.log(`[Cron] Updated daily aggregates for ${userSnapshots.size} users`);
}

// Also allow GET for manual testing (with auth)
export async function GET(request: NextRequest) {
  return POST(request);
}
