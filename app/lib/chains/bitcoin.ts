/**
 * Bitcoin Chain Integration
 * Using Mempool.space API (free, no auth required)
 */

// Mempool.space API - public, reliable, no auth needed
const MEMPOOL_API = 'https://mempool.space/api';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface BitcoinBalance {
  address: string;
  balance: number; // in BTC
  balanceSats: number; // in satoshis
  price?: number;
  value?: number;
  txCount?: number;
}

export interface BitcoinUTXO {
  txid: string;
  vout: number;
  value: number; // satoshis
  status: {
    confirmed: boolean;
    block_height?: number;
  };
}

/**
 * Detect Bitcoin address type
 */
export function getBitcoinAddressType(address: string): 'legacy' | 'segwit' | 'native_segwit' | 'taproot' | 'unknown' {
  if (address.startsWith('1')) return 'legacy'; // P2PKH
  if (address.startsWith('3')) return 'segwit'; // P2SH (often SegWit)
  if (address.startsWith('bc1q')) return 'native_segwit'; // P2WPKH (Bech32)
  if (address.startsWith('bc1p')) return 'taproot'; // P2TR (Bech32m)
  return 'unknown';
}

/**
 * Validate Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Legacy (P2PKH): starts with 1, 25-34 chars
  if (/^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  
  // SegWit (P2SH): starts with 3, 25-34 chars
  if (/^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  
  // Native SegWit (Bech32): starts with bc1q, 42 chars
  if (/^bc1q[a-zA-HJ-NP-Z0-9]{38,58}$/.test(address)) return true;
  
  // Taproot (Bech32m): starts with bc1p, 62 chars
  if (/^bc1p[a-zA-HJ-NP-Z0-9]{58}$/.test(address)) return true;
  
  return false;
}

/**
 * Get BTC price from DeFiLlama
 */
async function getBtcPrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:bitcoin`);
    const data = await response.json();
    return data.coins?.['coingecko:bitcoin']?.price || 0;
  } catch (error) {
    console.error('Error fetching BTC price:', error);
    return 0;
  }
}

/**
 * Get address balance and stats from Mempool.space
 */
async function getAddressInfo(address: string): Promise<{
  funded: number;
  spent: number;
  txCount: number;
} | null> {
  try {
    const response = await fetch(`${MEMPOOL_API}/address/${address}`);
    
    if (!response.ok) {
      console.error('Mempool API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // chain_stats = confirmed, mempool_stats = unconfirmed
    const chainStats = data.chain_stats || {};
    const mempoolStats = data.mempool_stats || {};
    
    return {
      funded: (chainStats.funded_txo_sum || 0) + (mempoolStats.funded_txo_sum || 0),
      spent: (chainStats.spent_txo_sum || 0) + (mempoolStats.spent_txo_sum || 0),
      txCount: (chainStats.tx_count || 0) + (mempoolStats.tx_count || 0),
    };
  } catch (error) {
    console.error('Error fetching Bitcoin address info:', error);
    return null;
  }
}

/**
 * Get Bitcoin holdings for an address
 */
export async function getBitcoinHoldings(address: string): Promise<BitcoinBalance | null> {
  // Validate address first
  if (!isValidBitcoinAddress(address)) {
    console.error('Invalid Bitcoin address:', address);
    return null;
  }
  
  // Fetch balance and price in parallel
  const [addressInfo, price] = await Promise.all([
    getAddressInfo(address),
    getBtcPrice(),
  ]);
  
  if (!addressInfo) {
    return null;
  }
  
  // Balance = funded - spent (in satoshis)
  const balanceSats = addressInfo.funded - addressInfo.spent;
  const balance = balanceSats / 1e8; // Convert to BTC
  
  return {
    address,
    balance,
    balanceSats,
    price,
    value: balance * price,
    txCount: addressInfo.txCount,
  };
}

/**
 * Get multiple Bitcoin addresses' holdings
 * Useful for users with multiple BTC addresses (change addresses, etc.)
 */
export async function getBitcoinHoldingsMultiple(addresses: string[]): Promise<BitcoinBalance[]> {
  const results = await Promise.all(
    addresses.map(addr => getBitcoinHoldings(addr))
  );
  
  return results.filter((r): r is BitcoinBalance => r !== null && r.balance > 0);
}
