import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { requireInvite } from '@/lib/invite-check';
import { sendPriceAlertEmail } from '@/lib/email';
import { logger } from '@/lib/logger';

// Price cache to avoid hammering CoinGecko
const priceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_TTL = 60000; // 1 minute

/**
 * Fetch current price for an asset from CoinGecko
 */
async function getAssetPrice(symbol: string): Promise<number | null> {
  logger.debug(`[AlertCheck] getAssetPrice called with symbol: "${symbol}"`);

  // Check cache first
  const cached = priceCache[symbol];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug(`[AlertCheck] Returning cached price for ${symbol}`);
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
  logger.debug(`[AlertCheck] Mapped symbol "${symbol}" to CoinGecko ID`);

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    logger.debug('[AlertCheck] Fetching price from CoinGecko');

    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
      logger.error(`[AlertCheck] CoinGecko error for ${symbol}: status ${response.status}`);
      return null;
    }

    const data = await response.json();
    // Don't log full API response - just note that we got one
    logger.debug('[AlertCheck] CoinGecko response received');

    const price = data[coinId]?.usd;

    if (price) {
      priceCache[symbol] = { price, timestamp: Date.now() };
      logger.debug(`[AlertCheck] Got price for ${symbol}`);
      return price;
    }

    logger.debug(`[AlertCheck] No price found in response for ${coinId}`);
    return null;
  } catch (err) {
    logger.error(`[AlertCheck] Failed to fetch price for ${symbol}`, err);
    return null;
  }
}

/**
 * POST /api/alerts/check
 * Check all alerts for the current user and send notifications for triggered ones
 */
export async function POST(request: NextRequest) {
  // Check invite status first
  const inviteError = await requireInvite();
  if (inviteError) return inviteError;

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
    logger.error('[AlertCheck] Error fetching alerts', alertsError);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }

  if (!alerts || alerts.length === 0) {
    return NextResponse.json({ checked: 0, triggered: 0 });
  }

  const triggered: string[] = [];
  const checked = alerts.length;

  for (const alert of alerts) {
    logger.debug(`[AlertCheck] Processing alert: asset=${alert.asset}, type=${alert.type}, condition=${alert.condition}`);

    // Skip if triggered within last hour (prevent spam)
    if (alert.last_triggered) {
      const lastTriggered = new Date(alert.last_triggered).getTime();
      const hourAgo = Date.now() - 60 * 60 * 1000;
      if (lastTriggered > hourAgo) {
        logger.debug(`[AlertCheck] Skipping alert - triggered recently`);
        continue;
      }
    }

    // Get current price
    const currentPrice = await getAssetPrice(alert.asset);
    logger.debug(`[AlertCheck] Price check completed for ${alert.asset}`);

    if (currentPrice === null) {
      logger.debug(`[AlertCheck] Could not get price for ${alert.asset}`);
      continue;
    }

    // Check if alert condition is met
    let shouldTrigger = false;

    if (alert.type === 'price') {
      logger.debug(`[AlertCheck] Evaluating price condition for ${alert.asset}`);
      if (alert.condition === 'above' && currentPrice > alert.threshold) {
        shouldTrigger = true;
      } else if (alert.condition === 'below' && currentPrice < alert.threshold) {
        shouldTrigger = true;
      }
    }
    // TODO: Implement percent_change alerts (requires tracking previous prices)

    logger.debug(`[AlertCheck] shouldTrigger = ${shouldTrigger}`);

    if (shouldTrigger) {
      logger.info(`[AlertCheck] Alert triggered: ${alert.asset} ${alert.condition}`);

      // Mark as triggered FIRST (so in-app notifications work regardless of email)
      triggered.push(alert.id);

      // Update last_triggered timestamp
      await supabase
        .from('alerts')
        .update({ last_triggered: new Date().toISOString() })
        .eq('id', alert.id);

      // Try to send email (don't block on failure)
      try {
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
          logger.info(`[AlertCheck] Email sent to ${logger.maskEmail(userEmail)} for ${alert.asset}`);
        } else {
          logger.warn(`[AlertCheck] Email failed for ${alert.asset}`);
        }
      } catch (emailError) {
        logger.error(`[AlertCheck] Email error for ${alert.asset}`, emailError);
        // Don't throw - alert is still triggered, just email failed
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
