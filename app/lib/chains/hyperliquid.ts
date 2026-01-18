/**
 * Hyperliquid API Integration
 * Docs: https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
 */

const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';

export interface HyperliquidSpotBalance {
  coin: string;
  token: number;
  hold: string;
  total: string;
  entryNtl: string;
}

export interface HyperliquidStakingSummary {
  delegated: string;
  undelegated: string;
  totalPendingWithdrawal: string;
  nPendingWithdrawals: number;
}

export interface HyperliquidUserState {
  spotBalances: HyperliquidSpotBalance[];
  stakingSummary?: HyperliquidStakingSummary;
}

/**
 * Fetch spot balances for a user address
 */
export async function getSpotBalances(address: string): Promise<HyperliquidSpotBalance[]> {
  try {
    const response = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spotClearinghouseState',
        user: address,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`);
    }

    const data = await response.json();
    
    // The API returns balances array
    return data.balances || [];
  } catch (error) {
    console.error('Error fetching Hyperliquid spot balances:', error);
    return [];
  }
}

/**
 * Fetch staking/delegation summary for a user address
 */
export async function getStakingSummary(address: string): Promise<HyperliquidStakingSummary | null> {
  try {
    const response = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'delegatorSummary',
        user: address,
      }),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Hyperliquid staking summary:', error);
    return null;
  }
}

/**
 * Fetch all Hyperliquid holdings (spot + staking) for a user
 */
export async function getHyperliquidHoldings(address: string) {
  const [spotBalances, stakingSummary] = await Promise.all([
    getSpotBalances(address),
    getStakingSummary(address),
  ]);

  return {
    spotBalances,
    stakingSummary,
  };
}

/**
 * Get token metadata for Hyperliquid tokens
 */
export async function getTokenMetadata() {
  try {
    const response = await fetch(HYPERLIQUID_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'spotMeta',
      }),
    });

    if (!response.ok) {
      throw new Error(`Hyperliquid API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Hyperliquid token metadata:', error);
    return null;
  }
}
