/**
 * Zcash Chain Integration
 * Supports both transparent (t-addresses) and shielded (z-addresses) with viewing keys
 * 
 * Address Types:
 * - t1/t3: Transparent (public, like Bitcoin)
 * - zs1: Shielded Sapling (private, needs viewing key)
 * - u1: Unified addresses (can contain both)
 */

// Blockchair API for transparent addresses
const BLOCKCHAIR_API = 'https://api.blockchair.com/zcash';

// ZecBlockExplorer as backup
const ZECBLOCKEXPLORER_API = 'https://api.zecblockexplorer.com';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface ZcashBalance {
  address: string;
  addressType: 'transparent' | 'shielded' | 'unified';
  balance: number; // in ZEC
  balanceZatoshi: number; // in zatoshi (1 ZEC = 100,000,000 zatoshi)
  price?: number;
  value?: number;
  isShielded: boolean;
  // For shielded addresses
  viewingKey?: string;
}

/**
 * Detect Zcash address type
 */
export function getZcashAddressType(address: string): 'transparent' | 'shielded' | 'unified' | 'unknown' {
  // Transparent P2PKH (starts with t1)
  if (address.startsWith('t1')) return 'transparent';
  // Transparent P2SH (starts with t3)
  if (address.startsWith('t3')) return 'transparent';
  // Shielded Sapling (starts with zs)
  if (address.startsWith('zs')) return 'shielded';
  // Unified address (starts with u1)
  if (address.startsWith('u1')) return 'unified';
  // Legacy Sprout (starts with zc) - deprecated but might exist
  if (address.startsWith('zc')) return 'shielded';
  
  return 'unknown';
}

/**
 * Validate Zcash address format
 */
export function isValidZcashAddress(address: string): boolean {
  // Transparent t1 (P2PKH): 35 chars
  if (/^t1[a-zA-Z0-9]{33}$/.test(address)) return true;
  
  // Transparent t3 (P2SH): 35 chars
  if (/^t3[a-zA-Z0-9]{33}$/.test(address)) return true;
  
  // Shielded Sapling zs1: 78 chars (Bech32)
  if (/^zs1[a-z0-9]{75,}$/.test(address)) return true;
  
  // Unified u1: variable length (Bech32m)
  if (/^u1[a-z0-9]{100,}$/.test(address)) return true;
  
  // Legacy Sprout zc: 95 chars (deprecated)
  if (/^zc[a-zA-Z0-9]{93}$/.test(address)) return true;
  
  return false;
}

/**
 * Get ZEC price from DeFiLlama
 */
async function getZecPrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:zcash`);
    const data = await response.json();
    return data.coins?.['coingecko:zcash']?.price || 0;
  } catch (error) {
    console.error('Error fetching ZEC price:', error);
    return 0;
  }
}

/**
 * Get transparent address balance
 * Note: Free Zcash APIs are unreliable. For production, consider:
 * - Running your own Zcash node
 * - Using Blockchair with API key
 * - Self-hosting a Zcash insight server
 */
async function getTransparentBalance(address: string): Promise<number | null> {
  // Try multiple APIs with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    // Try zcha.in API (most reliable free option)
    const response = await fetch(
      `https://api.zcha.in/v2/mainnet/accounts/${address}`,
      { signal: controller.signal }
    );
    
    if (response.ok) {
      const data = await response.json();
      // Balance in ZEC, convert to zatoshi
      if (data.balance !== undefined) {
        return Math.round(parseFloat(data.balance) * 1e8);
      }
    }
  } catch (e) {
    // API failed, try next
  }
  
  try {
    // Fallback: Blockchair (may require API key)
    const response = await fetch(
      `${BLOCKCHAIR_API}/dashboards/address/${address}`,
      { signal: controller.signal }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.data?.[address]) {
        return data.data[address].address.balance || 0;
      }
    }
  } catch (e) {
    // API failed
  }
  
  clearTimeout(timeout);
  
  // Return 0 if all APIs fail - address detection still works
  console.warn('Zcash balance APIs unavailable. Address valid but balance unknown.');
  return 0;
}

/**
 * Get shielded balance using viewing key
 * NOTE: This requires a Zcash node with the viewing key imported,
 * or a specialized API service. For now, we return a placeholder
 * indicating the user needs to check their wallet.
 * 
 * In production, you would:
 * 1. Run a Zcash node with z_importviewingkey
 * 2. Use a service like Electric Coin Company's lightwalletd
 * 3. Or integrate with a wallet SDK that supports viewing keys
 */
async function getShieldedBalance(
  address: string, 
  viewingKey?: string
): Promise<{ balance: number; error?: string } | null> {
  const addressType = getZcashAddressType(address);
  
  if (addressType === 'transparent') {
    // Shouldn't reach here, but handle it
    const balance = await getTransparentBalance(address);
    return balance !== null ? { balance } : null;
  }
  
  if (!viewingKey) {
    // Can't view shielded balance without viewing key
    return {
      balance: 0,
      error: 'Shielded address requires viewing key to display balance',
    };
  }
  
  // TODO: Implement actual shielded balance lookup
  // This would require:
  // 1. A Zcash lightwalletd server
  // 2. The librustzcash SDK
  // 3. Or a specialized privacy-preserving API
  
  // For now, return an indicator that viewing key was provided
  return {
    balance: 0,
    error: 'Shielded balance lookup coming soon. Use your Zcash wallet to view shielded funds.',
  };
}

/**
 * Get Zcash holdings for an address
 */
export async function getZcashHoldings(
  address: string,
  viewingKey?: string
): Promise<ZcashBalance | null> {
  // Validate address first
  if (!isValidZcashAddress(address)) {
    console.error('Invalid Zcash address:', address);
    return null;
  }
  
  const addressType = getZcashAddressType(address);
  const isShielded = addressType === 'shielded' || addressType === 'unified';
  
  // Fetch price
  const price = await getZecPrice();
  
  if (isShielded) {
    // Shielded address
    const result = await getShieldedBalance(address, viewingKey);
    
    if (!result) return null;
    
    return {
      address,
      addressType: addressType as 'shielded' | 'unified',
      balance: result.balance,
      balanceZatoshi: result.balance * 1e8,
      price,
      value: result.balance * price,
      isShielded: true,
      viewingKey,
    };
  } else {
    // Transparent address
    const balanceZatoshi = await getTransparentBalance(address);
    
    if (balanceZatoshi === null) return null;
    
    const balance = balanceZatoshi / 1e8;
    
    return {
      address,
      addressType: 'transparent',
      balance,
      balanceZatoshi,
      price,
      value: balance * price,
      isShielded: false,
    };
  }
}

/**
 * Check if address is shielded (requires special handling)
 */
export function isShieldedAddress(address: string): boolean {
  const type = getZcashAddressType(address);
  return type === 'shielded' || type === 'unified';
}
