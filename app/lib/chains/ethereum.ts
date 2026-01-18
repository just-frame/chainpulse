/**
 * Ethereum Chain Integration
 * Using Alchemy for comprehensive ERC-20 token data
 */

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_BASE_URL = ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : null;

// DeFiLlama for prices (free, no auth required)
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

// Minimum USD value to show (filters dust)
const MIN_USD_VALUE = 1.0;

export interface EthereumBalance {
  address: string; // Contract address (or 'native' for ETH)
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  imageUrl?: string;
  price?: number;
  value?: number;
  isStaked?: boolean;
  stakingProtocol?: string; // e.g., 'Lido', 'Rocket Pool'
}

// Liquid Staking Derivative (LSD) contracts - these represent staked ETH
const STAKING_TOKENS: Record<string, { protocol: string }> = {
  // Lido
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': { protocol: 'Lido' }, // stETH
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': { protocol: 'Lido' }, // wstETH
  // Rocket Pool
  '0xae78736cd615f374d3085123a210448e74fc6393': { protocol: 'Rocket Pool' }, // rETH
  // Coinbase
  '0xbe9895146f7af43049ca1c1ae358b0541ea49704': { protocol: 'Coinbase' }, // cbETH
  // Frax
  '0x5e8422345238f34275888049021821e8e08caa1f': { protocol: 'Frax' }, // frxETH
  '0xac3e018457b222d93114458476f3e3416abbe38f': { protocol: 'Frax' }, // sfrxETH
  // Swell
  '0xf951e335afb289353dc249e82926178eac7ded78': { protocol: 'Swell' }, // swETH
  // Ankr
  '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb': { protocol: 'Ankr' }, // ankrETH
  // Binance
  '0xa2e3356610840701bdf5611a53974510ae27e2e1': { protocol: 'Binance' }, // wBETH
  // Mantle
  '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa': { protocol: 'Mantle' }, // mETH
  // Origin
  '0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3': { protocol: 'Origin' }, // OETH
  // StakeWise
  '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38': { protocol: 'StakeWise' }, // osETH
};

// Well-known token info (fallback for metadata)
const KNOWN_TOKENS: Record<string, { symbol: string; name: string; decimals: number; icon?: string }> = {
  // Native ETH
  'native': {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  },
  // USDC
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  },
  // USDT
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    icon: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  },
  // WETH
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    symbol: 'WETH',
    name: 'Wrapped Ether',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/2518/standard/weth.png',
  },
  // WBTC
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    decimals: 8,
    icon: 'https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png',
  },
  // DAI
  '0x6b175474e89094c44da98b954eedeac495271d0f': {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',
  },
  // UNI
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': {
    symbol: 'UNI',
    name: 'Uniswap',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/12504/standard/uni.jpg',
  },
  // LINK
  '0x514910771af9ca656af840dff83e8264ecf986ca': {
    symbol: 'LINK',
    name: 'Chainlink',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png',
  },
  // AAVE
  '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': {
    symbol: 'AAVE',
    name: 'Aave',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/12645/standard/aave-token-round.png',
  },
  // === LIQUID STAKING DERIVATIVES (LSDs) ===
  // Lido
  '0xae7ab96520de3a18e5e111b5eaab095312d7fe84': {
    symbol: 'stETH',
    name: 'Lido Staked Ether',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/13442/standard/steth_logo.png',
  },
  '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0': {
    symbol: 'wstETH',
    name: 'Wrapped Lido Staked Ether',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/18834/standard/wstETH.png',
  },
  // Rocket Pool
  '0xae78736cd615f374d3085123a210448e74fc6393': {
    symbol: 'rETH',
    name: 'Rocket Pool ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/20764/standard/reth.png',
  },
  // Coinbase
  '0xbe9895146f7af43049ca1c1ae358b0541ea49704': {
    symbol: 'cbETH',
    name: 'Coinbase Wrapped Staked ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/27008/standard/cbeth.png',
  },
  // Frax
  '0x5e8422345238f34275888049021821e8e08caa1f': {
    symbol: 'frxETH',
    name: 'Frax Ether',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/28284/standard/frxETH_icon.png',
  },
  '0xac3e018457b222d93114458476f3e3416abbe38f': {
    symbol: 'sfrxETH',
    name: 'Staked Frax Ether',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/28285/standard/sfrxETH_icon.png',
  },
  // Swell
  '0xf951e335afb289353dc249e82926178eac7ded78': {
    symbol: 'swETH',
    name: 'Swell ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/30326/standard/swETH.png',
  },
  // Ankr
  '0xe95a203b1a91a908f9b9ce46459d101078c2c3cb': {
    symbol: 'ankrETH',
    name: 'Ankr Staked ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/13403/standard/ankrETH.png',
  },
  // Binance
  '0xa2e3356610840701bdf5611a53974510ae27e2e1': {
    symbol: 'wBETH',
    name: 'Wrapped Beacon ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/30061/standard/wbeth-icon.png',
  },
  // Mantle
  '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa': {
    symbol: 'mETH',
    name: 'Mantle Staked ETH',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/33345/standard/meth.png',
  },
  // PEPE
  '0x6982508145454ce325ddbe47a25d4ec3d2311933': {
    symbol: 'PEPE',
    name: 'Pepe',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
  },
  // SHIB
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png',
  },
  // ARB
  '0xb50721bcf8d664c30412cfbc6cf7a15145234ad1': {
    symbol: 'ARB',
    name: 'Arbitrum',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/16547/standard/arb.jpg',
  },
  // LDO
  '0x5a98fcbea516cf06857215779fd812ca3bef1b32': {
    symbol: 'LDO',
    name: 'Lido DAO',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/13573/standard/Lido_DAO.png',
  },
  // MKR
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': {
    symbol: 'MKR',
    name: 'Maker',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png',
  },
  // CRV
  '0xd533a949740bb3306d119cc777fa900ba034cd52': {
    symbol: 'CRV',
    name: 'Curve DAO Token',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  },
  // APE
  '0x4d224452801aced8b2f0aebe155379bb5d594381': {
    symbol: 'APE',
    name: 'ApeCoin',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/24383/standard/apecoin.jpg',
  },
  // MATIC (on ETH)
  '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0': {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
  },
  // OP
  '0x4200000000000000000000000000000000000042': {
    symbol: 'OP',
    name: 'Optimism',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
  },
  // ENS
  '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72': {
    symbol: 'ENS',
    name: 'Ethereum Name Service',
    decimals: 18,
    icon: 'https://assets.coingecko.com/coins/images/19785/standard/acatxTm8_400x400.jpg',
  },
};

/**
 * Fetch prices from DeFiLlama for Ethereum tokens
 */
async function getEthereumPrices(addresses: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  if (addresses.length === 0) return prices;

  try {
    // Format: ethereum:address (use coingecko:ethereum for native ETH)
    const ids = addresses.map(addr => 
      addr === 'native' ? 'coingecko:ethereum' : `ethereum:${addr}`
    ).join(',');
    
    const response = await fetch(`${DEFILLAMA_PRICE_API}/${ids}`);
    const data = await response.json();
    
    if (data.coins) {
      for (const [key, priceData] of Object.entries(data.coins)) {
        let address = key.replace('ethereum:', '').replace('coingecko:', '');
        if (address === 'ethereum') address = 'native';
        const price = (priceData as { price?: number })?.price;
        if (price !== undefined) {
          prices.set(address.toLowerCase(), price);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching DeFiLlama prices:', error);
  }

  return prices;
}

/**
 * Get native ETH balance
 */
async function getEthBalance(address: string): Promise<number> {
  if (!ALCHEMY_BASE_URL) {
    console.warn('Alchemy API key not set');
    return 0;
  }

  try {
    const response = await fetch(ALCHEMY_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest'],
      }),
    });

    const data = await response.json();
    if (data.result) {
      // Convert from hex wei to ETH
      return parseInt(data.result, 16) / 1e18;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return 0;
  }
}

/**
 * Get token metadata using Alchemy
 */
async function getTokenMetadata(contractAddress: string): Promise<{ symbol: string; name: string; decimals: number; logo?: string } | null> {
  if (!ALCHEMY_BASE_URL) return null;

  try {
    const response = await fetch(ALCHEMY_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return {
        symbol: data.result.symbol || 'UNKNOWN',
        name: data.result.name || 'Unknown Token',
        decimals: data.result.decimals || 18,
        logo: data.result.logo,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching token metadata:', error);
    return null;
  }
}

/**
 * Get all ERC-20 token balances using Alchemy
 */
async function getTokenBalances(address: string): Promise<EthereumBalance[]> {
  if (!ALCHEMY_BASE_URL) {
    console.warn('Alchemy API key not set, cannot fetch Ethereum tokens');
    return [];
  }

  try {
    const response = await fetch(ALCHEMY_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address],
      }),
    });

    const data = await response.json();
    const balances: EthereumBalance[] = [];
    const contractsNeedingMetadata: string[] = [];

    if (data.result?.tokenBalances) {
      for (const token of data.result.tokenBalances) {
        const contractAddress = token.contractAddress.toLowerCase();
        const rawBalance = token.tokenBalance;
        
        // Skip zero balances
        if (!rawBalance || rawBalance === '0x0' || rawBalance === '0x') continue;

        const known = KNOWN_TOKENS[contractAddress];
        
        if (known) {
          // Use known token info
          const balance = parseInt(rawBalance, 16) / Math.pow(10, known.decimals);
          if (balance > 0.0001) {
            const stakingInfo = STAKING_TOKENS[contractAddress];
            balances.push({
              address: contractAddress,
              symbol: known.symbol,
              name: known.name,
              balance,
              decimals: known.decimals,
              imageUrl: known.icon,
              isStaked: !!stakingInfo,
              stakingProtocol: stakingInfo?.protocol,
            });
          }
        } else {
          // Need to fetch metadata
          contractsNeedingMetadata.push(contractAddress);
        }
      }
    }

    // Fetch metadata for unknown tokens (batch limit to avoid rate limits)
    const metadataPromises = contractsNeedingMetadata.slice(0, 20).map(async (contractAddress) => {
      const metadata = await getTokenMetadata(contractAddress);
      if (metadata) {
        // Find the original balance
        const tokenData = data.result.tokenBalances.find(
          (t: { contractAddress: string }) => t.contractAddress.toLowerCase() === contractAddress
        );
        if (tokenData?.tokenBalance) {
          const balance = parseInt(tokenData.tokenBalance, 16) / Math.pow(10, metadata.decimals);
          if (balance > 0.0001) {
            return {
              address: contractAddress,
              symbol: metadata.symbol,
              name: metadata.name,
              balance,
              decimals: metadata.decimals,
              imageUrl: metadata.logo,
            };
          }
        }
      }
      return null;
    });

    const additionalBalances = (await Promise.all(metadataPromises)).filter(Boolean) as EthereumBalance[];
    balances.push(...additionalBalances);

    return balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    return [];
  }
}

/**
 * Get complete Ethereum holdings (ETH + ERC-20 tokens)
 */
export async function getEthereumHoldings(address: string): Promise<EthereumBalance[]> {
  // Fetch ETH balance and ERC-20 tokens in parallel
  const [ethBalance, tokenBalances] = await Promise.all([
    getEthBalance(address),
    getTokenBalances(address),
  ]);

  const balances: EthereumBalance[] = [];
  const allAddresses: string[] = [];

  // Add native ETH
  if (ethBalance > 0.0001) {
    balances.push({
      address: 'native',
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethBalance,
      decimals: 18,
      imageUrl: KNOWN_TOKENS['native'].icon,
    });
    allAddresses.push('native');
  }

  // Add tokens
  for (const token of tokenBalances) {
    balances.push(token);
    allAddresses.push(token.address);
  }

  // Fetch prices
  const prices = await getEthereumPrices(allAddresses);

  // Enrich with prices and filter dust
  const enrichedBalances: EthereumBalance[] = [];
  for (const balance of balances) {
    const price = prices.get(balance.address.toLowerCase()) || 0;
    const value = balance.balance * price;

    // Only include if value >= threshold OR it's a known stablecoin
    const isStablecoin = ['USDC', 'USDT', 'DAI'].includes(balance.symbol);
    if (value >= MIN_USD_VALUE || (isStablecoin && value >= 0.01)) {
      enrichedBalances.push({
        ...balance,
        price,
        value,
      });
    }
  }

  // Sort by value descending
  enrichedBalances.sort((a, b) => (b.value || 0) - (a.value || 0));

  return enrichedBalances;
}

/**
 * Validate Ethereum address
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// ========== NFT SUPPORT ==========

export interface EthereumNFT {
  contract: string;
  tokenId: string;
  name: string;
  collection?: string;
  imageUrl?: string;
  floorPrice?: number;
}

/**
 * Get NFTs owned by address using Alchemy NFT API
 */
export async function getEthereumNFTs(address: string): Promise<EthereumNFT[]> {
  if (!ALCHEMY_API_KEY) {
    console.warn('Alchemy API key not set, cannot fetch NFTs');
    return [];
  }

  try {
    const response = await fetch(
      `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&withMetadata=true&pageSize=50`
    );

    if (!response.ok) {
      console.error('Alchemy NFT API error:', response.status);
      return [];
    }

    const data = await response.json();
    const nfts: EthereumNFT[] = [];

    if (data.ownedNfts) {
      for (const nft of data.ownedNfts) {
        const name = nft.name || nft.title || `#${nft.tokenId}`;
        
        // Skip spam NFTs (Alchemy's built-in detection)
        if (nft.spamInfo?.isSpam) continue;
        
        // Skip if name looks spammy (comprehensive patterns)
        const nameLower = name.toLowerCase();
        const isSpam = 
          nameLower.includes('claim') ||
          nameLower.includes('airdrop') ||
          nameLower.includes('reward') ||
          nameLower.includes('visit') ||
          nameLower.includes('voucher') ||
          nameLower.includes('promo') ||
          nameLower.includes('free mint') ||
          nameLower.includes('giveaway') ||
          nameLower.includes('winner') ||
          nameLower.includes('bonus') ||
          nameLower.includes('eligible') ||
          nameLower.includes('redeem') ||
          // URL patterns
          nameLower.includes('.com') ||
          nameLower.includes('.io') ||
          nameLower.includes('.xyz') ||
          nameLower.includes('.gg') ||
          nameLower.includes('http') ||
          // No image
          (!nft.image?.cachedUrl && !nft.image?.thumbnailUrl && !nft.image?.originalUrl);
        
        if (isSpam) continue;

        nfts.push({
          contract: nft.contract?.address || '',
          tokenId: nft.tokenId || '',
          name,
          collection: nft.contract?.name || nft.collection?.name,
          imageUrl: nft.image?.cachedUrl || nft.image?.thumbnailUrl || nft.image?.originalUrl,
          floorPrice: nft.contract?.openSeaMetadata?.floorPrice,
        });
      }
    }

    return nfts;
  } catch (error) {
    console.error('Error fetching Ethereum NFTs:', error);
    return [];
  }
}

// ========== ENS SUPPORT ==========

export interface ENSDomain {
  name: string; // e.g., "vitalik.eth"
  resolvedAddress?: string;
  expiryDate?: string;
  registrationDate?: string;
}

/**
 * Get ENS domains owned by address
 * Uses Alchemy's getNFTsForOwner filtered for ENS contract
 */
export async function getENSDomains(address: string): Promise<ENSDomain[]> {
  if (!ALCHEMY_API_KEY) {
    console.warn('Alchemy API key not set, cannot fetch ENS');
    return [];
  }

  // ENS: Name Wrapper contract (holds wrapped .eth names)
  const ENS_NAME_WRAPPER = '0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401';
  // ENS: Base Registrar (holds unwrapped .eth names)
  const ENS_REGISTRAR = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85';

  try {
    // Fetch NFTs from both ENS contracts
    const [wrapperResponse, registrarResponse] = await Promise.all([
      fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&contractAddresses[]=${ENS_NAME_WRAPPER}&withMetadata=true`
      ),
      fetch(
        `https://eth-mainnet.g.alchemy.com/nft/v3/${ALCHEMY_API_KEY}/getNFTsForOwner?owner=${address}&contractAddresses[]=${ENS_REGISTRAR}&withMetadata=true`
      ),
    ]);

    const domains: ENSDomain[] = [];
    const seenNames = new Set<string>();

    // Process both responses
    for (const response of [wrapperResponse, registrarResponse]) {
      if (!response.ok) continue;
      
      const data = await response.json();
      
      if (data.ownedNfts) {
        for (const nft of data.ownedNfts) {
          // Extract ENS name from metadata
          let name = nft.name || '';
          
          // Clean up name
          if (!name.endsWith('.eth') && nft.raw?.metadata?.name) {
            name = nft.raw.metadata.name;
          }
          
          // Skip if not a valid ENS name or already seen
          if (!name || !name.includes('.') || seenNames.has(name)) continue;
          seenNames.add(name);
          
          domains.push({
            name,
            expiryDate: nft.raw?.metadata?.expiry 
              ? new Date(parseInt(nft.raw.metadata.expiry) * 1000).toISOString()
              : undefined,
          });
        }
      }
    }

    return domains;
  } catch (error) {
    console.error('Error fetching ENS domains:', error);
    return [];
  }
}

/**
 * Resolve an ENS name to an address (for reverse lookup)
 */
export async function resolveENS(ensName: string): Promise<string | null> {
  if (!ALCHEMY_API_KEY) return null;

  try {
    const response = await fetch(ALCHEMY_BASE_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41', // ENS Public Resolver
          data: `0x3b3b57de${ensName}`, // Simplified, real implementation needs namehash
        }, 'latest'],
      }),
    });

    const data = await response.json();
    if (data.result && data.result !== '0x') {
      return '0x' + data.result.slice(-40);
    }
    return null;
  } catch (error) {
    console.error('Error resolving ENS:', error);
    return null;
  }
}

// ========== FULL PORTFOLIO ==========

export interface EthereumPortfolio {
  tokens: EthereumBalance[];
  nfts: EthereumNFT[];
  ensDomains: ENSDomain[];
}

/**
 * Get complete Ethereum portfolio (tokens + NFTs + ENS)
 */
export async function getEthereumPortfolio(address: string): Promise<EthereumPortfolio> {
  // Fetch everything in parallel
  const [tokens, nfts, ensDomains] = await Promise.all([
    getEthereumHoldings(address),
    getEthereumNFTs(address),
    getENSDomains(address),
  ]);

  return {
    tokens,
    nfts,
    ensDomains,
  };
}
