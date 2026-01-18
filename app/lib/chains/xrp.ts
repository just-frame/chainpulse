/**
 * XRP Ledger Chain Integration
 * Using public XRPL API
 */

// XRPL public servers
const XRPL_API = 'https://xrplcluster.com';
const XRPL_API_BACKUP = 'https://s1.ripple.com:51234';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface XRPBalance {
  address: string;
  balance: number; // in XRP
  balanceDrops: number; // in drops (1 XRP = 1,000,000 drops)
  price?: number;
  value?: number;
  reserve: number; // account reserve (10 XRP base + 2 XRP per object)
  sequence?: number;
}

/**
 * Validate XRP address format
 * XRP addresses start with 'r' and are 25-35 characters (base58)
 */
export function isValidXRPAddress(address: string): boolean {
  // XRP addresses: start with 'r', 25-35 chars, base58 (no 0, O, I, l)
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address);
}

/**
 * Get XRP price from DeFiLlama
 */
async function getXRPPrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:ripple`);
    const data = await response.json();
    return data.coins?.['coingecko:ripple']?.price || 0;
  } catch (error) {
    console.error('Error fetching XRP price:', error);
    return 0;
  }
}

/**
 * Get account info from XRPL
 */
async function getAccountInfo(address: string): Promise<{
  balance: string;
  ownerCount: number;
  sequence: number;
} | null> {
  try {
    const response = await fetch(XRPL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'account_info',
        params: [{
          account: address,
          ledger_index: 'validated',
        }],
      }),
    });

    const data = await response.json();
    
    if (data.result?.status === 'success' && data.result?.account_data) {
      const accountData = data.result.account_data;
      return {
        balance: accountData.Balance,
        ownerCount: accountData.OwnerCount || 0,
        sequence: accountData.Sequence || 0,
      };
    }
    
    // Account not found or not activated
    if (data.result?.error === 'actNotFound') {
      return null;
    }
    
    console.error('XRPL API error:', data.result?.error);
    return null;
  } catch (error) {
    console.error('Error fetching XRP account info:', error);
    return null;
  }
}

/**
 * Get XRP holdings for an address
 */
export async function getXRPHoldings(address: string): Promise<XRPBalance | null> {
  // Validate address first
  if (!isValidXRPAddress(address)) {
    console.error('Invalid XRP address:', address);
    return null;
  }
  
  // Fetch account info and price in parallel
  const [accountInfo, price] = await Promise.all([
    getAccountInfo(address),
    getXRPPrice(),
  ]);
  
  if (!accountInfo) {
    // Account doesn't exist or not activated
    return null;
  }
  
  // Balance in drops (1 XRP = 1,000,000 drops)
  const balanceDrops = parseInt(accountInfo.balance);
  const balance = balanceDrops / 1e6;
  
  // Calculate reserve (10 XRP base + 2 XRP per owned object)
  const reserve = 10 + (accountInfo.ownerCount * 2);
  
  return {
    address,
    balance,
    balanceDrops,
    price,
    value: balance * price,
    reserve,
    sequence: accountInfo.sequence,
  };
}
