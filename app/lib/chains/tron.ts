/**
 * Tron Chain Integration
 * Using TronGrid API (free tier available)
 * Supports: TRX balance, TRC-20 tokens, staking (frozen TRX)
 */

// TronGrid API (official, free tier)
const TRONGRID_API = 'https://api.trongrid.io';

// DeFiLlama for prices
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

// Minimum USD value to show (filters dust)
const MIN_USD_VALUE = 1.0;

// Well-known TRC-20 tokens
const KNOWN_TRC20: Record<string, { symbol: string; name: string; decimals: number; icon?: string }> = {
  // USDT (by far the biggest on Tron)
  'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t': {
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  },
  // USDC
  'TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  },
  // USDD (Tron's algo stable)
  'TPYmHEhy5n8TCEfYGqW2rPxsghSfzghPDn': {
    symbol: 'USDD',
    name: 'Decentralized USD',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/25380/standard/USDD.jpg',
  },
  // TUSD
  'TUpMhErZL2fhh4sVNULAbNKLokS4GjC1F4': {
    symbol: 'TUSD',
    name: 'TrueUSD',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/3449/standard/tusd.png',
  },
  // BTT
  'TAFjULxiVgT4qWk6UZwjqwZXTSaGaqnVp4': {
    symbol: 'BTT',
    name: 'BitTorrent',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/22457/standard/btt_logo.png',
  },
  // WIN
  'TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7': {
    symbol: 'WIN',
    name: 'WINkLink',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/9129/standard/WINk.png',
  },
  // JST
  'TCFLL5dx5ZJdKnWuesXxi1VPwjLVmWZZy9': {
    symbol: 'JST',
    name: 'JUST',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/11095/standard/JUST.jpg',
  },
  // SUN
  'TSSMHYeV2uE9qYH95DqyoCuNCzEL1NvU3S': {
    symbol: 'SUN',
    name: 'Sun Token',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/12424/standard/SUN-icon.png',
  },
  // WTRX (wrapped TRX)
  'TNUC9Qb1rRpS5CbWLmNMxXBjyFoydXjWFR': {
    symbol: 'WTRX',
    name: 'Wrapped TRX',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png',
  },
};

export interface TronToken {
  contract: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  price?: number;
  value?: number;
  icon?: string;
}

export interface TronStaking {
  frozenForBandwidth: number; // TRX frozen for bandwidth
  frozenForEnergy: number; // TRX frozen for energy
  totalFrozen: number;
  bandwidthAvailable: number;
  energyAvailable: number;
}

export interface TronPortfolio {
  address: string;
  trxBalance: number;
  trxPrice: number;
  trxValue: number;
  tokens: TronToken[];
  staking: TronStaking;
  totalValue: number;
}

/**
 * Validate Tron address format
 */
export function isValidTronAddress(address: string): boolean {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address);
}

/**
 * Get prices from DeFiLlama for TRX and TRC-20 tokens
 */
async function getTronPrices(contracts: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  
  try {
    // Build price query - TRX + TRC-20 contracts
    const ids = [
      'coingecko:tron',
      ...contracts.map(c => `tron:${c}`),
    ].join(',');
    
    const response = await fetch(`${DEFILLAMA_PRICE_API}/${ids}`);
    const data = await response.json();
    
    if (data.coins) {
      // TRX price
      if (data.coins['coingecko:tron']) {
        prices.set('TRX', data.coins['coingecko:tron'].price);
      }
      
      // TRC-20 prices
      for (const [key, priceData] of Object.entries(data.coins)) {
        if (key.startsWith('tron:')) {
          const contract = key.replace('tron:', '');
          prices.set(contract, (priceData as { price: number }).price);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching Tron prices:', error);
  }
  
  // Set stablecoin prices if not fetched
  if (!prices.has('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t')) {
    prices.set('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', 1); // USDT
  }
  if (!prices.has('TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8')) {
    prices.set('TEkxiTehnzSmSe2XqrBj4w32RUN966rdz8', 1); // USDC
  }
  
  return prices;
}

/**
 * Get full account data from TronGrid
 */
async function getAccountData(address: string): Promise<{
  balance: number;
  frozenV2: Array<{ type?: string; amount?: number }>;
  trc20: Array<Record<string, string>>;
  bandwidth: { freeNetRemaining?: number; energyRemaining?: number };
} | null> {
  try {
    const response = await fetch(`${TRONGRID_API}/v1/accounts/${address}`);
    
    if (!response.ok) {
      console.error('TronGrid API error:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.success && data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Tron account:', error);
    return null;
  }
}

/**
 * Get TRC-20 token balances from TronGrid
 */
async function getTRC20Balances(address: string): Promise<TronToken[]> {
  try {
    const response = await fetch(
      `${TRONGRID_API}/v1/accounts/${address}/tokens?limit=100`
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const tokens: TronToken[] = [];
    
    if (data.data) {
      for (const token of data.data) {
        // Only process TRC-20 (not TRC-10)
        if (token.tokenType !== 'trc20') continue;
        
        const contract = token.tokenId;
        const known = KNOWN_TRC20[contract];
        const decimals = known?.decimals || token.tokenDecimal || 18;
        const balance = parseFloat(token.balance || '0') / Math.pow(10, decimals);
        
        if (balance > 0) {
          tokens.push({
            contract,
            symbol: known?.symbol || token.tokenAbbr || 'UNKNOWN',
            name: known?.name || token.tokenName || 'Unknown Token',
            balance,
            decimals,
            icon: known?.icon || token.tokenLogo,
          });
        }
      }
    }
    
    return tokens;
  } catch (error) {
    console.error('Error fetching TRC-20 tokens:', error);
    return [];
  }
}

/**
 * Get complete Tron portfolio
 */
export async function getTronPortfolio(address: string): Promise<TronPortfolio | null> {
  if (!isValidTronAddress(address)) {
    console.error('Invalid Tron address:', address);
    return null;
  }
  
  // Fetch account data and TRC-20 balances in parallel
  const [accountData, trc20Tokens] = await Promise.all([
    getAccountData(address),
    getTRC20Balances(address),
  ]);
  
  // TRX balance
  const trxBalance = accountData ? (accountData.balance || 0) / 1e6 : 0;
  
  // Parse staking (frozen TRX) - Tron uses "frozenV2" for staking
  let frozenForBandwidth = 0;
  let frozenForEnergy = 0;
  
  if (accountData?.frozenV2) {
    for (const frozen of accountData.frozenV2) {
      const amount = (frozen.amount || 0) / 1e6;
      if (frozen.type === 'BANDWIDTH' || !frozen.type) {
        frozenForBandwidth += amount;
      } else if (frozen.type === 'ENERGY') {
        frozenForEnergy += amount;
      }
    }
  }
  
  const totalFrozen = frozenForBandwidth + frozenForEnergy;
  
  // Get prices for TRX and all TRC-20 tokens
  const contracts = trc20Tokens.map(t => t.contract);
  const prices = await getTronPrices(contracts);
  
  const trxPrice = prices.get('TRX') || 0;
  const trxValue = trxBalance * trxPrice;
  const frozenValue = totalFrozen * trxPrice;
  
  // Enrich tokens with prices and filter dust
  const enrichedTokens: TronToken[] = [];
  for (const token of trc20Tokens) {
    const price = prices.get(token.contract) || 0;
    const value = token.balance * price;
    
    // Keep if value >= threshold or it's a known stablecoin
    const isStablecoin = ['USDT', 'USDC', 'USDD', 'TUSD'].includes(token.symbol);
    if (value >= MIN_USD_VALUE || (isStablecoin && value >= 0.01)) {
      enrichedTokens.push({
        ...token,
        price,
        value,
      });
    }
  }
  
  // Sort by value
  enrichedTokens.sort((a, b) => (b.value || 0) - (a.value || 0));
  
  // Calculate total value
  const tokensValue = enrichedTokens.reduce((sum, t) => sum + (t.value || 0), 0);
  const totalValue = trxValue + frozenValue + tokensValue;
  
  return {
    address,
    trxBalance,
    trxPrice,
    trxValue,
    tokens: enrichedTokens,
    staking: {
      frozenForBandwidth,
      frozenForEnergy,
      totalFrozen,
      bandwidthAvailable: accountData?.bandwidth?.freeNetRemaining || 0,
      energyAvailable: accountData?.bandwidth?.energyRemaining || 0,
    },
    totalValue,
  };
}

// Keep backward compatibility
export async function getTronHoldings(address: string) {
  const portfolio = await getTronPortfolio(address);
  if (!portfolio) return null;
  
  return {
    address,
    balance: portfolio.trxBalance,
    balanceSun: portfolio.trxBalance * 1e6,
    price: portfolio.trxPrice,
    value: portfolio.trxValue,
    bandwidth: portfolio.staking.bandwidthAvailable,
    energy: portfolio.staking.energyAvailable,
  };
}
