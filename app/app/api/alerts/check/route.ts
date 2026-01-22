import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { sendPriceAlertEmail } from '@/lib/email';

// Price cache to avoid hammering CoinGecko
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute

/**
 * Fetch current price for an asset from CoinGecko
 */
async function getAssetPrice(symbol: string): Promise<number | null> {
  // Check cache first
  const cached = priceCache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  // Map common symbols to CoinGecko IDs
  const symbolToId: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'solana',
    'HYPE': 'hyperliquid',
    'XRP': 'ripple',
    'DOGE': 'dogecoin',
    'LTC': 'litecoin',
    'ADA': 'cardano',
    'TRX': 'tron',
    'ZEC': 'zcash',
    'USDC': 'usd-coin',
    'USDT': 'tether',
  };

  const coinId = symbolToId[symbol.toUpperCase()] || symbol.toLowerCase();

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );

    if (!response.ok) {
      console.error(`[AlertCheck] CoinGecko error for ${symbol}:`, response.status);
      return null;
    }

    const data = await response.json();
    const price = data[coinId]?.usd;

    if (price) {
      priceCache[symbol] = { price, timestamp: Date.now() };
      return price;
    }

    return null;
  } catch (err) {
    console.error(`[AlertCheck] Failed to fetch price for ${symbol}:`, err);
    return null;
  }
}

/**
 * POST /api/alerts/check
 * Check all alerts for the current user and send notifications for triggered ones
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Get user's email
  const userEmail = user.email;
  if (!userEmail) {
    return NextResponse.json({ error: 'User email not found' }, { status: 400 });
  }

  // Get all enabled alerts for this user that haven't been triggered recently
  const { data: alerts, error: alertsError } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('enabled', true);

  if (alertsError) {
    console.error('[AlertCheck] Error fetching alerts:', alertsError);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ checked: 0, triggered: 0 });
  }

  const triggered: string[] = [];
  const checked = alerts.length;

  for (const alert of alerts) {
    // Skip if triggered within last hour (prevent spam)
    if (alert.last_triggered) {
      const lastTriggered = new Date(alert.last_triggered).getTime();
      const hourAgo = Date.now() - 60 * 60 * 1000;
      if (lastTriggered > hourAgo) {
        console.log(`[AlertCheck] Skipping ${alert.id} - triggered recently`);
        continue;
      }
    }

    // Get current price
    const currentPrice = await getAssetPrice(alert.asset);
    if (currentPrice === null) {
      console.log(`[AlertCheck] Could not get price for ${alert.asset}`);
      continue;
    }

    // Check if alert condition is met
    let shouldTrigger = false;
    
    if (alert.type === 'price') {
      if (alert.condition === 'above' && currentPrice > alert.threshold) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice < alert.threshold) {
        shouldTrigger = true;
      }
    }
    // TODO: Implement percent_change alerts (requires tracking previous prices)

    if (shouldTrigger) {
      console.log(`[AlertCheck] Alert triggered: ${alert.asset} ${alert.condition} ${alert.threshold}`);
      
      // Send email
      const emailResult = await sendPriceAlertEmail({
        to: userEmail,
        assetName: alert.asset_name || alert.asset,
        assetSymbol: alert.asset,
        condition: alert.condition,
        threshold: alert.threshold,
        currentPrice,
        alertType: alert.type,
      });

      if (emailResult.success) {
        // Update last_triggered timestamp
        await supabase
          .from('alerts')
          .update({ last_triggered: new Date().toISOString() })
          .eq('id', alert.id);

        triggered.push(alert.id);
      }
    }
  }

  return NextResponse.json({
    checked,
    triggered: triggered.length,
    triggeredIds: triggered,
    triggeredAlerts: triggered.map(id => {
      const alert = alerts.find(a => a.id === id);
      return alert ? {
        id: alert.id,
        asset: alert.asset,
        assetName: alert.asset_name,
        condition: alert.condition,
        threshold: alert.threshold,
        type: alert.type,
      } : null;
    }).filter(Boolean),
  });
}

/**
 * GET /api/alerts/check
 * Same as POST but for easier testing / cron integration
 */
export async function GET(request: NextRequest) {
  return POST(request);
}
