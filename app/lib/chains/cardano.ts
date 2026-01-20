/**
 * Cardano Chain Integration
 * Using Blockfrost API (free tier: 50k requests/day)
 * Alternative: Koios API (free, community-run)
 */

// Koios API - free, no API key required
const KOIOS_API = 'https://api.koios.rest/api/v1';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

export interface CardanoBalance {
  address: string;
  balance: number; // in ADA
  balanceLovelace: number; // in lovelace (1 ADA = 1,000,000 lovelace)
  price?: number;
  value?: number;
  stakeAddress?: string;
  isStaked?: boolean;
  poolId?: string;
}

/**
 * Validate Cardano address format
 * Shelley addresses start with addr1 (mainnet) or addr_test1 (testnet)
 * Byron addresses start with Ae2 or DdzFF
 */
export function isValidCardanoAddress(address: string): boolean {
  // Shelley mainnet (Bech32)
  if (/^addr1[a-z0-9]{50,}$/.test(address)) return true;
  
  // Shelley stake address
  if (/^stake1[a-z0-9]{50,}$/.test(address)) return true;
  
  // Byron Icarus (base58)
  if (/^Ae2[a-zA-Z0-9]{50,}$/.test(address)) return true;
  
  // Byron Daedalus (base58)
  if (/^DdzFF[a-zA-Z0-9]{50,}$/.test(address)) return true;
  
  return false;
}

/**
 * Get ADA price from DeFiLlama
 */
async function getAdaPrice(): Promise<number> {
  try {
    const response = await fetch(`${DEFILLAMA_PRICE_API}/coingecko:cardano`);
    const data = await response.json();
    return data.coins?.['coingecko:cardano']?.price || 0;
  } catch (error) {
    console.error('Error fetching ADA price:', error);
    return 0;
  }
}

/**
 * Get address info from Koios
 */
async function getAddressInfo(address: string): Promise<{
  balance: number;
  stakeAddress?: string;
} | null> {
  try {
    const response = await fetch(`${KOIOS_API}/address_info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _addresses: [address] }),
    });

    if (!response.ok) {
      console.error('Koios API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data && data.length > 0) {
      const addressData = data[0];
      return {
        balance: parseInt(addressData.balance || '0'),
        stakeAddress: addressData.stake_address,
      };
    }
    
    return { balance: 0 };
  } catch (error) {
    console.error('Error fetching Cardano address info:', error);
    return null;
  }
}

/**
 * Check if stake address is delegated
 */
async function getStakeInfo(stakeAddress: string): Promise<{
  isStaked: boolean;
  poolId?: string;
} | null> {
  if (!stakeAddress) return { isStaked: false };
  
  try {
    const response = await fetch(`${KOIOS_API}/account_info`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _stake_addresses: [stakeAddress] }),
    });

    if (!response.ok) return { isStaked: false };

    const data = await response.json();
    
    if (data && data.length > 0) {
      const accountData = data[0];
      return {
        isStaked: !!accountData.delegated_pool,
        poolId: accountData.delegated_pool,
      };
    }
    
    return { isStaked: false };
  } catch (error) {
    console.error('Error fetching stake info:', error);
    return { isStaked: false };
  }
}

/**
 * Get Cardano holdings for an address
 */
export async function getCardanoHoldings(address: string): Promise<CardanoBalance | null> {
  // Validate address first
  if (!isValidCardanoAddress(address)) {
    console.error('Invalid Cardano address:', address);
    return null;
  }
  
  // Fetch address info and price in parallel
  const [addressInfo, price] = await Promise.all([
    getAddressInfo(address),
    getAdaPrice(),
  ]);
  
  if (!addressInfo) return null;
  
  // Check staking status if we have a stake address
  let stakeInfo: { isStaked: boolean; poolId?: string } = { isStaked: false };
  if (addressInfo.stakeAddress) {
    const info = await getStakeInfo(addressInfo.stakeAddress);
    if (info) stakeInfo = info;
  }
  
  // Balance in lovelace (1 ADA = 1,000,000 lovelace)
  const balanceLovelace = addressInfo.balance;
  const balance = balanceLovelace / 1e6;
  
  return {
    address,
    balance,
    balanceLovelace,
    price,
    value: balance * price,
    stakeAddress: addressInfo.stakeAddress,
    isStaked: stakeInfo.isStaked,
    poolId: stakeInfo.poolId,
  };
}
