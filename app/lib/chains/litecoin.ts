/**
 * Litecoin Chain Integration
 * Using Blockcypher API (free tier available)
 */

// Blockcypher API
const BLOCKCYPHER_API = 'https://api.blockcypher.com/v1/ltc/main';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface LitecoinBalance {
  address: string;
  balance: number; // in LTC
  balanceSatoshis: number; // in litoshis (1 LTC = 100,000,000 litoshis)
  price?: number;
  value?: number;
  txCount?: number;
}

/**
 * Validate Litecoin address format
 * Legacy: starts with L or M
 * SegWit: starts with ltc1
 */
export function isValidLitecoinAddress(address: string): boolean {
  // Legacy P2PKH (starts with L)
  if (/^L[a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address)) return true;
  
  // Legacy P2SH (starts with M or 3)
  if (/^[M3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address)) return true;
  
  // Native SegWit (Bech32, starts with ltc1)
  if (/^ltc1[a-z0-9]{39,59}$/.test(address)) return true;
  
  return false;
}

/**
 * Get LTC price from DeFiLlama
 */
async function getLtcPrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:litecoin`);
    const data = await response.json();
    return data.coins?.['coingecko:litecoin']?.price || 0;
  } catch (error) {
    console.error('Error fetching LTC price:', error);
    return 0;
  }
}

/**
 * Get address balance from Blockcypher
 */
async function getAddressInfo(address: string): Promise<{
  balance: number;
  txCount: number;
} | null> {
  try {
    const response = await fetch(`${BLOCKCYPHER_API}/addrs/${address}/balance`);
    
    if (!response.ok) {
      console.error('Blockcypher LTC API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    return {
      balance: data.balance || 0, // in litoshis
      txCount: data.n_tx || 0,
    };
  } catch (error) {
    console.error('Error fetching LTC address info:', error);
    return null;
  }
}

/**
 * Get Litecoin holdings for an address
 */
export async function getLitecoinHoldings(address: string): Promise<LitecoinBalance | null> {
  // Validate address first
  if (!isValidLitecoinAddress(address)) {
    console.error('Invalid Litecoin address:', address);
    return null;
  }
  
  // Fetch balance and price in parallel
  const [addressInfo, price] = await Promise.all([
    getAddressInfo(address),
    getLtcPrice(),
  ]);
  
  if (!addressInfo) return null;
  
  // Balance in litoshis (1 LTC = 100,000,000 litoshis)
  const balanceSatoshis = addressInfo.balance;
  const balance = balanceSatoshis / 1e8;
  
  return {
    address,
    balance,
    balanceSatoshis,
    price,
    value: balance * price,
    txCount: addressInfo.txCount,
  };
}
