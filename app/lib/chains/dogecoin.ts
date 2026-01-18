/**
 * Dogecoin Chain Integration
 * Using Blockcypher API (free tier: 200 requests/hour)
 */

// Blockcypher API - free, no auth for basic usage
const BLOCKCYPHER_API = 'https://api.blockcypher.com/v1/doge/main';

// Backup: Dogechain API
const DOGECHAIN_API = 'https://dogechain.info/api/v1';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface DogecoinBalance {
  address: string;
  balance: number; // in DOGE
  balanceSatoshis: number; // in satoshis (1 DOGE = 100,000,000 satoshis)
  price?: number;
  value?: number;
  txCount?: number;
  unconfirmedBalance?: number;
}

/**
 * Validate Dogecoin address format
 * DOGE addresses start with 'D' or 'A' (older) and are 34 characters (base58)
 */
export function isValidDogecoinAddress(address: string): boolean {
  // Dogecoin addresses: start with D or A, 34 chars, base58
  return /^[DA][1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
}

/**
 * Get DOGE price from DeFiLlama
 */
async function getDogePrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:dogecoin`);
    const data = await response.json();
    return data.coins?.['coingecko:dogecoin']?.price || 0;
  } catch (error) {
    console.error('Error fetching DOGE price:', error);
    return 0;
  }
}

/**
 * Get address info from Blockcypher
 */
async function getAddressInfoBlockcypher(address: string): Promise<{
  balance: number;
  unconfirmedBalance: number;
  txCount: number;
} | null> {
  try {
    const response = await fetch(`${BLOCKCYPHER_API}/addrs/${address}/balance`);
    
    if (!response.ok) {
      console.error('Blockcypher API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    return {
      balance: data.balance || 0, // in satoshis
      unconfirmedBalance: data.unconfirmed_balance || 0,
      txCount: data.n_tx || 0,
    };
  } catch (error) {
    console.error('Error fetching Dogecoin address info:', error);
    return null;
  }
}

/**
 * Fallback: Get address info from Dogechain
 */
async function getAddressInfoDogechain(address: string): Promise<{
  balance: number;
  txCount: number;
} | null> {
  try {
    const response = await fetch(`${DOGECHAIN_API}/address/balance/${address}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.success === 1) {
      // Dogechain returns balance in DOGE, convert to satoshis
      return {
        balance: Math.round(parseFloat(data.balance) * 1e8),
        txCount: 0, // Dogechain balance endpoint doesn't return tx count
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching from Dogechain:', error);
    return null;
  }
}

/**
 * Get Dogecoin holdings for an address
 */
export async function getDogecoinHoldings(address: string): Promise<DogecoinBalance | null> {
  // Validate address first
  if (!isValidDogecoinAddress(address)) {
    console.error('Invalid Dogecoin address:', address);
    return null;
  }
  
  // Fetch balance and price in parallel
  const [addressInfo, price] = await Promise.all([
    getAddressInfoBlockcypher(address),
    getDogePrice(),
  ]);
  
  // Try fallback if primary fails
  let finalAddressInfo = addressInfo;
  if (!finalAddressInfo) {
    const fallbackInfo = await getAddressInfoDogechain(address);
    if (fallbackInfo) {
      finalAddressInfo = {
        balance: fallbackInfo.balance,
        unconfirmedBalance: 0,
        txCount: fallbackInfo.txCount,
      };
    }
  }
  
  if (!finalAddressInfo) {
    return null;
  }
  
  // Balance in satoshis (1 DOGE = 100,000,000 satoshis)
  const balanceSatoshis = finalAddressInfo.balance;
  const balance = balanceSatoshis / 1e8;
  
  return {
    address,
    balance,
    balanceSatoshis,
    price,
    value: balance * price,
    txCount: finalAddressInfo.txCount,
    unconfirmedBalance: (finalAddressInfo.unconfirmedBalance || 0) / 1e8,
  };
}
