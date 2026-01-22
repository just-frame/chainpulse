/**
 * Solana Chain Integration
 * Using Helius DAS API + Jupiter for comprehensive token data
 */

const HELIUS_API_KEY = process.env.HELIUS_API_KEY;
const HELIUS_RPC = HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';

const HELIUS_DAS_API = HELIUS_API_KEY
  ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
  : null;

// DeFiLlama for prices (free, no auth required, excellent coverage)
const DEFILLAMA_PRICE_API = 'https://coins.llama.fi/prices/current';

// DexScreener for token icons (has every meme coin)
const DEXSCREENER_API = 'https://api.dexscreener.com/latest/dex/tokens';

// Minimum USD value to show (filters dust)
const MIN_USD_VALUE = 1.00;

export interface SolanaBalance {
  mint: string;
  symbol: string;
  name: string;
  balance: number;
  decimals: number;
  imageUrl?: string;
  price?: number;
  value?: number;
  isStaked?: boolean;
  stakingProtocol?: string;
}

export interface SolanaNFT {
  mint: string;
  name: string;
  collection?: string;
  imageUrl?: string;
  floorPrice?: number;
  purchasePrice?: number; // Price paid in SOL
  purchaseDate?: string;
  acquisitionType?: 'minted' | 'purchased' | 'received' | 'unknown';
}

export interface SolanaDomain {
  name: string; // e.g., "vitalik.sol"
  mint: string;
  purchasePrice?: number; // Price paid in SOL
  purchaseDate?: string;
}

export interface SolanaPortfolio {
  tokens: SolanaBalance[];
  nfts: SolanaNFT[];
  domains: SolanaDomain[];
}

// Liquid Staking Tokens on Solana
const SOLANA_STAKING_TOKENS: Record<string, { protocol: string }> = {
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': { protocol: 'Jito' }, // jitoSOL
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { protocol: 'Marinade' }, // mSOL
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': { protocol: 'BlazeStake' }, // bSOL
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': { protocol: 'Lido' }, // stSOL
  'he1iusmfkpAdwvxLNGV8Y1iSbj4rUy6yMhEA3fotn9A': { protocol: 'Helius' }, // hSOL
  '5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm': { protocol: 'Socean' }, // scnSOL
  'LAinEtNLgpmCP9Rvsf5Hn8W6EhNiKLZQti1xfWMLy6X': { protocol: 'Laine' }, // laineSOL
  'edge86g9cVz87xcpKpy3J77vbp4wYd9idEV562CCntt': { protocol: 'Edgevana' }, // edgeSOL
  'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v': { protocol: 'Jupiter' }, // jupSOL
  'vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7': { protocol: 'The Vault' }, // vSOL
  'BonK1YhkXEGLZzwtcvRTip3gAL9nCeQD7ppZBLXhtTs': { protocol: 'Bonk' }, // bonkSOL
  'Comp4ssDzXcLeu2MnLuGNNFC4cmLPMng8qWHPvzAMU1h': { protocol: 'Sanctum' }, // compassSOL
  'picobAEvs6w7QEknPce34wAE4gknZA9v5tTonnmHYdX': { protocol: 'Picasso' }, // picoSOL
  'Dso1bDeDjCQxTrWHqUUi63oBvV7Mdm6WaobLbQ7gnPQ': { protocol: 'Drift' }, // dSOL
  'pathdXw4He1Xk3eX84pDdDZnGKEme3GivBamGCVPZ5a': { protocol: 'Pathfinders' }, // pathSOL
  'strng7mqqc1MBJJV6vMzYbEqnwVGvKKGKedeCvtktWA': { protocol: 'Stronghold' }, // strongSOL
  'LnTRntk2kTfWEY6cVB8K9649pgJbt6dJLS1Ns1GZCWg': { protocol: 'Lantern' }, // lanternSOL
};

// Hardcoded icons for popular Solana tokens (reliable fallback)
const SOLANA_TOKEN_ICONS: Record<string, string> = {
  'So11111111111111111111111111111111111111112': 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png', // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 'https://assets.coingecko.com/coins/images/325/standard/Tether.png', // USDT
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'https://assets.coingecko.com/coins/images/34188/standard/jup.png', // JUP
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg', // BONK
  'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm': 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg', // WIF
  'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3': 'https://assets.coingecko.com/coins/images/31924/standard/pyth.png', // PYTH
  'rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof': 'https://assets.coingecko.com/coins/images/11636/standard/rndr.png', // RENDER
  'J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn': 'https://assets.coingecko.com/coins/images/28046/standard/JitoSOL-200.png', // jitoSOL
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 'https://assets.coingecko.com/coins/images/17752/standard/mSOL.png', // mSOL
  'bSo13r4TkiE4KumL71LsHTPpL2euBYLFx6h9HP3piy1': 'https://assets.coingecko.com/coins/images/26636/standard/blazestake.png', // bSOL
  'J3NKxxXZcnNiMjKw9hYb2K4LUxgwB6t1FtPtQVsv3KFr': 'https://assets.coingecko.com/coins/images/31401/standard/centeredcoin_%281%29.png', // SPX6900
  '7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs': 'https://assets.coingecko.com/coins/images/22876/standard/ETH_wh_small.png', // WETH
  '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj': 'https://assets.coingecko.com/coins/images/37507/standard/stSol.png', // stSOL
  'jupSoLaHXQiZZTSfEWMTRRgpnyFm8f6sZdosWBjx93v': 'https://assets.coingecko.com/coins/images/36432/standard/jupSOL-200.png', // jupSOL
};

/**
 * Fetch icons from DexScreener for tokens missing icons
 */
async function getDexScreenerIcons(mints: string[]): Promise<Map<string, string>> {
  const icons = new Map<string, string>();
  if (mints.length === 0) return icons;

  try {
    // DexScreener allows batching with comma-separated addresses
    const response = await fetch(`${DEXSCREENER_API}/${mints.join(',')}`);
    const data = await response.json();
    
    if (data.pairs) {
      for (const pair of data.pairs) {
        const mint = pair.baseToken?.address;
        const imageUrl = pair.info?.imageUrl;
        if (mint && imageUrl && !icons.has(mint)) {
          icons.set(mint, imageUrl);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching DexScreener icons:', error);
  }

  return icons;
}

/**
 * Fetch prices from DeFiLlama for multiple Solana mints
 */
async function getSolanaPrices(mints: string[]): Promise<Map<string, number>> {
  const prices = new Map<string, number>();
  if (mints.length === 0) return prices;

  try {
    // Format: solana:mint1,solana:mint2,...
    const ids = mints.map(m => `solana:${m}`).join(',');
    const response = await fetch(`${DEFILLAMA_PRICE_API}/${ids}`);
    const data = await response.json();
    
    if (data.coins) {
      for (const [key, priceData] of Object.entries(data.coins)) {
        const mint = key.replace('solana:', '');
        const price = (priceData as { price?: number })?.price;
        if (price !== undefined) {
          prices.set(mint, price);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching DeFiLlama prices:', error);
  }

  return prices;
}

/**
 * Get native staked SOL (delegated to validators)
 */
async function getNativeStakedSol(address: string): Promise<{ balance: number; validators: number }> {
  if (!HELIUS_API_KEY) {
    return { balance: 0, validators: 0 };
  }

  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'stake-accounts',
        method: 'getProgramAccounts',
        params: [
          'Stake11111111111111111111111111111111111111',
          {
            encoding: 'jsonParsed',
            filters: [
              {
                memcmp: {
                  offset: 12, // Staker authority offset
                  bytes: address,
                },
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    
    if (data.result && Array.isArray(data.result)) {
      let totalStaked = 0;
      const validatorSet = new Set<string>();
      
      for (const account of data.result) {
        const stakeInfo = account.account?.data?.parsed?.info;
        if (stakeInfo?.stake?.delegation) {
          const lamports = parseInt(stakeInfo.stake.delegation.stake || '0');
          totalStaked += lamports;
          validatorSet.add(stakeInfo.stake.delegation.voter);
        }
      }
      
      return {
        balance: totalStaked / 1e9,
        validators: validatorSet.size,
      };
    }
    
    return { balance: 0, validators: 0 };
  } catch (error) {
    console.error('Error fetching native staked SOL:', error);
    return { balance: 0, validators: 0 };
  }
}

/**
 * Get native SOL balance
 */
async function getSolBalance(address: string): Promise<number> {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address],
      }),
    });

    const data = await response.json();
    if (data.result?.value !== undefined) {
      return data.result.value / 1e9;
    }
    return 0;
  } catch (error) {
    console.error('Error fetching SOL balance:', error);
    return 0;
  }
}

/**
 * Get all fungible tokens using Helius DAS API + Jupiter enrichment
 */
async function getTokensWithHelius(address: string): Promise<SolanaBalance[]> {
  if (!HELIUS_DAS_API) {
    console.warn('[Solana] Helius API key not set, falling back to basic RPC');
    return getTokensBasic(address);
  }

  console.log('[Solana] Fetching tokens for:', address);

  try {
    const response = await fetch(HELIUS_DAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-das',
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'fungible',
          displayOptions: { showNativeBalance: true },
        },
      }),
    });

    if (!response.ok) {
      console.error('[Solana] Helius API error:', response.status, response.statusText);
      return getTokensBasic(address);
    }

    const data = await response.json();
    
    // Check for API error
    if (data.error) {
      console.error('[Solana] Helius API returned error:', data.error);
      return getTokensBasic(address);
    }

    console.log('[Solana] Helius response - nativeBalance:', data.result?.nativeBalance?.lamports, 'items:', data.result?.items?.length || 0);

    const balances: SolanaBalance[] = [];
    const mints: string[] = [];

    // Process native SOL first
    if (data.result?.nativeBalance) {
      const solBalance = data.result.nativeBalance.lamports / 1e9;
      if (solBalance > 0.0001) {
        mints.push('So11111111111111111111111111111111111111112');
        balances.push({
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          balance: solBalance,
          decimals: 9,
          imageUrl: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
        });
      }
    }

    // Process SPL tokens
    if (data.result?.items) {
      for (const item of data.result.items) {
        const tokenInfo = item.token_info;
        const content = item.content;
        const metadata = content?.metadata;
        
        if (tokenInfo && tokenInfo.balance > 0) {
          const decimals = tokenInfo.decimals || 0;
          const balance = tokenInfo.balance / Math.pow(10, decimals);
          
          if (balance > 0.0001) {
            const mint = item.id;
            
            // Priority: Helius metadata > fallback
            const symbol = tokenInfo.symbol || metadata?.symbol || mint.slice(0, 6);
            const name = metadata?.name || symbol;
            // Icon priority: hardcoded > Helius CDN > Helius files
            const imageUrl = SOLANA_TOKEN_ICONS[mint] || content?.links?.image || content?.files?.[0]?.cdn_uri;
            
            mints.push(mint);
            balances.push({
              mint,
              symbol: symbol.toUpperCase(),
              name,
              balance,
              decimals,
              imageUrl,
            });
          }
        }
      }
    }

    // Find mints that need icons from DexScreener
    const mintsNeedingIcons = balances
      .filter(b => !b.imageUrl)
      .map(b => b.mint);

    // Fetch prices and missing icons in parallel
    const [prices, dexScreenerIcons] = await Promise.all([
      getSolanaPrices(mints),
      mintsNeedingIcons.length > 0 ? getDexScreenerIcons(mintsNeedingIcons) : Promise.resolve(new Map<string, string>()),
    ]);
    
    // Enrich balances with prices, icons, staking info, and filter dust
    const enrichedBalances: SolanaBalance[] = [];
    for (const balance of balances) {
      const price = prices.get(balance.mint) || 0;
      const value = balance.balance * price;
      
      // Only include if value >= threshold OR it's a known token with price
      if (value >= MIN_USD_VALUE || (price > 0 && value >= 0.01)) {
        // Add DexScreener icon if we don't have one
        const imageUrl = balance.imageUrl || dexScreenerIcons.get(balance.mint);
        
        // Check if it's a liquid staking token
        const stakingInfo = SOLANA_STAKING_TOKENS[balance.mint];
        
        enrichedBalances.push({
          ...balance,
          imageUrl,
          price,
          value,
          isStaked: !!stakingInfo,
          stakingProtocol: stakingInfo?.protocol,
        });
      }
    }

    // Sort by value descending
    enrichedBalances.sort((a, b) => (b.value || 0) - (a.value || 0));

    console.log('[Solana] Token results - raw:', balances.length, 'after dust filter:', enrichedBalances.length);
    
    return enrichedBalances;
  } catch (error) {
    console.error('[Solana] Error fetching tokens with Helius DAS:', error);
    return getTokensBasic(address);
  }
}

/**
 * Fallback: Basic token fetching without metadata
 */
async function getTokensBasic(address: string): Promise<SolanaBalance[]> {
  try {
    const response = await fetch(HELIUS_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenAccountsByOwner',
        params: [
          address,
          { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
          { encoding: 'jsonParsed' },
        ],
      }),
    });

    const data = await response.json();
    const balances: SolanaBalance[] = [];

    if (data.result?.value) {
      for (const account of data.result.value) {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const amount = info.tokenAmount;
        
        if (parseFloat(amount.uiAmount) > 0) {
          balances.push({
            mint,
            symbol: mint.slice(0, 6),
            name: 'Unknown Token',
            balance: parseFloat(amount.uiAmount),
            decimals: amount.decimals,
          });
        }
      }
    }

    return balances;
  } catch (error) {
    console.error('Error fetching token accounts:', error);
    return [];
  }
}

/**
 * Get all Solana holdings for an address
 * Uses Helius DAS API for full token metadata + native staking
 */
export async function getSolanaHoldings(address: string): Promise<SolanaBalance[]> {
  // Fetch tokens and native staking in parallel
  const [tokens, nativeStaking] = await Promise.all([
    getTokensWithHelius(address),
    getNativeStakedSol(address),
  ]);
  
  const balances = [...tokens];
  
  // Add native staked SOL if any
  if (nativeStaking.balance > 0.0001) {
    // Get SOL price from existing tokens or fetch it
    const solToken = balances.find(b => b.symbol === 'SOL');
    const solPrice = solToken?.price || 0;
    
    balances.push({
      mint: 'native-staked',
      symbol: 'SOL',
      name: `Staked SOL (${nativeStaking.validators} validator${nativeStaking.validators !== 1 ? 's' : ''})`,
      balance: nativeStaking.balance,
      decimals: 9,
      imageUrl: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
      price: solPrice,
      value: nativeStaking.balance * solPrice,
      isStaked: true,
      stakingProtocol: 'Native',
    });
  }
  
  // If we got tokens, return them
  if (balances.length > 0) {
    // Re-sort by value after adding staked SOL
    balances.sort((a, b) => (b.value || 0) - (a.value || 0));
    return balances;
  }
  
  // Fallback: fetch SOL balance separately
  const solBalance = await getSolBalance(address);

  if (solBalance > 0.0001) {
    balances.push({
      mint: 'So11111111111111111111111111111111111111112',
      symbol: 'SOL',
      name: 'Solana',
      balance: solBalance,
      decimals: 9,
    });
  }

  return balances;
}

type AcquisitionType = 'minted' | 'purchased' | 'received' | 'unknown';

interface NFTEnrichmentData {
  price: number;
  date: string;
  acquisitionType: AcquisitionType;
}

/**
 * Fetch purchase/mint price for an NFT using Helius DAS + transaction parsing
 * Also determines how the user acquired the NFT (minted, purchased, or received)
 */
async function getNFTPurchasePrice(mint: string, ownerAddress?: string): Promise<NFTEnrichmentData | null> {
  if (!HELIUS_API_KEY || !HELIUS_DAS_API) return null;

  try {
    // Get ALL signatures for this asset (up to 1000)
    const sigResponse = await fetch(HELIUS_DAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'sigs',
        method: 'getSignaturesForAsset',
        params: { id: mint, limit: 1000 },
      }),
    });
    
    const sigData = await sigResponse.json();
    if (!sigData.result?.items?.length) return null;
    
    // Get signatures - the LAST one is usually the original mint/purchase
    const allSigs = sigData.result.items.map((item: [string, string]) => item[0]);
    
    // Take last 10 signatures (oldest transactions - likely the mint/first purchase)
    const oldestSigs = allSigs.slice(-10).reverse();
    
    // Parse these transactions
    const txResponse = await fetch(
      `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: oldestSigs }),
      }
    );
    
    const transactions = await txResponse.json();
    if (!Array.isArray(transactions)) return null;
    
    // Look for the original mint or first purchase
    for (const tx of transactions) {
      if (!tx || !tx.timestamp) continue;
      
      const type = (tx.type || '').toUpperCase();
      const feePayer = tx.feePayer;
      
      // Determine acquisition type based on transaction type and who paid fees
      let acquisitionType: AcquisitionType = 'unknown';
      
      if (type.includes('NFT_MINT') || type.includes('COMPRESSED_NFT_MINT')) {
        // User minted this NFT themselves if they paid the fees
        acquisitionType = (ownerAddress && feePayer === ownerAddress) ? 'minted' : 'received';
      } else if (type.includes('NFT_SALE') || type.includes('NFT_BUY') || type.includes('MARKETPLACE')) {
        // Marketplace purchase
        acquisitionType = 'purchased';
      } else if (type.includes('TRANSFER') || type.includes('NFT_TRANSFER')) {
        // Just a transfer - received as gift/airdrop
        acquisitionType = 'received';
      }
      
      // Check for mint, sale, or purchase transactions
      if (type.includes('MINT') || type.includes('SALE') || type.includes('BUY') || type.includes('NFT')) {
        // Check native SOL transfers (> 0.001 SOL to filter dust)
        const nativeTransfer = tx.nativeTransfers?.find(
          (t: { amount: number }) => t.amount > 1000000
        );
        
        if (nativeTransfer) {
          // If user paid SOL, they either minted or purchased
          if (acquisitionType === 'unknown') {
            acquisitionType = type.includes('MINT') ? 'minted' : 'purchased';
          }
          return {
            price: nativeTransfer.amount / 1e9,
            date: new Date(tx.timestamp * 1000).toISOString(),
            acquisitionType,
          };
        }
      }
    }
    
    // If no price found, return the mint date at least
    const oldestTx = transactions.find((tx: { timestamp?: number }) => tx?.timestamp);
    if (oldestTx?.timestamp) {
      const type = (oldestTx.type || '').toUpperCase();
      let acquisitionType: AcquisitionType = 'received'; // Default: likely airdrop if no payment
      
      if (type.includes('MINT') && ownerAddress && oldestTx.feePayer === ownerAddress) {
        acquisitionType = 'minted';
      }
      
      return {
        price: 0, // Free mint or airdrop
        date: new Date(oldestTx.timestamp * 1000).toISOString(),
        acquisitionType,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching NFT purchase price:', error);
    return null;
  }
}

/**
 * Batch fetch purchase prices for NFTs (limit to avoid rate limits)
 */
async function enrichNFTsWithPrices(nfts: SolanaNFT[], ownerAddress: string, limit = 10): Promise<SolanaNFT[]> {
  // Only fetch prices for the first N NFTs to avoid rate limiting
  const nftsToEnrich = nfts.slice(0, limit);
  const remainingNfts = nfts.slice(limit).map(nft => ({
    ...nft,
    acquisitionType: 'unknown' as AcquisitionType,
  }));
  
  const enrichedNfts = await Promise.all(
    nftsToEnrich.map(async (nft) => {
      const priceData = await getNFTPurchasePrice(nft.mint, ownerAddress);
      if (priceData) {
        return {
          ...nft,
          purchasePrice: priceData.price,
          purchaseDate: priceData.date,
          acquisitionType: priceData.acquisitionType,
        };
      }
      return { ...nft, acquisitionType: 'unknown' as AcquisitionType };
    })
  );
  
  return [...enrichedNfts, ...remainingNfts];
}

/**
 * Fetch purchase price for a domain using transaction history
 */
async function getDomainPurchasePrice(domainKey: string): Promise<{ price: number; date: string } | null> {
  if (!HELIUS_API_KEY) return null;

  try {
    // Get transaction history for the domain account
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${domainKey}/transactions?api-key=${HELIUS_API_KEY}&limit=100`
    );
    
    if (!response.ok) return null;
    
    const result = await response.json();
    if (result.error || !Array.isArray(result)) return null;
    
    // Look for the registration/purchase transaction (usually the oldest)
    const transactions = result.reverse(); // Oldest first
    
    // Find the earliest transaction (registration)
    const registrationTx = transactions[0];
    if (!registrationTx?.timestamp) return null;
    
    // Sum up all SOL transfers in the registration tx (rent + fees + actual cost)
    let totalSol = 0;
    if (registrationTx.nativeTransfers) {
      for (const transfer of registrationTx.nativeTransfers) {
        totalSol += (transfer.amount || 0);
      }
    }
    
    // Check for token transfers (USDC, FIDA, etc.)
    let tokenCost = '';
    if (registrationTx.tokenTransfers?.length > 0) {
      const t = registrationTx.tokenTransfers[0];
      if (t.tokenAmount > 0) {
        tokenCost = `${t.tokenAmount} ${t.mint?.slice(0, 4) || 'tokens'}`;
      }
    }
    
    return {
      price: totalSol / 1e9, // Convert lamports to SOL
      date: new Date(registrationTx.timestamp * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching domain purchase price:', error);
    return null;
  }
}

/**
 * Get .sol domains using Bonfida SNS API + enrich with purchase prices
 */
async function getSolanaDomains(address: string): Promise<SolanaDomain[]> {
  try {
    const response = await fetch(
      `https://sns-sdk-proxy.bonfida.workers.dev/domains/${address}`
    );
    const data = await response.json();
    
    if (data.s !== 'ok' || !data.result) return [];
    
    // Get basic domain info
    const domains: SolanaDomain[] = data.result.map((d: { key: string; domain: string }) => ({
      name: `${d.domain}.sol`,
      mint: d.key,
    }));
    
    // Enrich with purchase prices (in parallel)
    const enrichedDomains = await Promise.all(
      domains.map(async (domain) => {
        const priceData = await getDomainPurchasePrice(domain.mint);
        if (priceData) {
          return {
            ...domain,
            purchasePrice: priceData.price,
            purchaseDate: priceData.date,
          };
        }
        return domain;
      })
    );
    
    return enrichedDomains;
  } catch (error) {
    console.error('Error fetching Solana domains:', error);
    return [];
  }
}

/**
 * Get NFTs using Helius DAS API
 */
async function getSolanaNFTs(address: string, limit = 100): Promise<SolanaNFT[]> {
  if (!HELIUS_DAS_API) {
    return [];
  }

  try {
    const response = await fetch(HELIUS_DAS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'helius-nfts',
        method: 'searchAssets',
        params: {
          ownerAddress: address,
          tokenType: 'nonFungible',
          limit, // Limit NFTs fetched for performance
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    });

    const data = await response.json();
    const nfts: SolanaNFT[] = [];

    if (data.result?.items) {
      for (const item of data.result.items) {
        const content = item.content;
        const metadata = content?.metadata;
        const name = metadata?.name || 'Unknown NFT';
        
        // Skip spam/scam NFTs (comprehensive patterns)
        const nameLower = name.toLowerCase();
        const isSpam = 
          // Scam keywords
          nameLower.includes('claim') ||
          nameLower.includes('reward') ||
          nameLower.includes('airdrop') ||
          nameLower.includes('voucher') ||
          nameLower.includes('promo') ||
          nameLower.includes('free mint') ||
          nameLower.includes('giveaway') ||
          nameLower.includes('winner') ||
          nameLower.includes('bonus') ||
          nameLower.includes('limited offer') ||
          // URL patterns (scam links)
          nameLower.includes('.com') ||
          nameLower.includes('.io') ||
          nameLower.includes('.xyz') ||
          nameLower.includes('.gg') ||
          nameLower.includes('http') ||
          // Generic spam
          nameLower.includes('visit') ||
          nameLower.includes('redeem') ||
          nameLower.includes('eligible') ||
          // No image = likely spam
          (!content?.links?.image && !content?.files?.[0]?.cdn_uri && !content?.files?.[0]?.uri);
        
        if (isSpam) continue;
        
        const collection = item.grouping?.find(
          (g: { group_key: string }) => g.group_key === 'collection'
        );
        
        nfts.push({
          mint: item.id,
          name,
          collection: collection?.collection_metadata?.name || undefined,
          imageUrl: content?.links?.image || content?.files?.[0]?.cdn_uri || content?.files?.[0]?.uri,
        });
      }
    }

    return nfts;
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    return [];
  }
}

/**
 * Get complete Solana portfolio: tokens, NFTs, and domains
 */
export async function getSolanaPortfolio(address: string): Promise<SolanaPortfolio> {
  console.time(`[Solana] Total fetch for ${address.slice(0, 8)}`);
  
  // Fetch tokens, NFTs, and domains in parallel
  const [tokens, rawNfts, domains] = await Promise.all([
    (async () => {
      console.time('[Solana] Tokens');
      const result = await getSolanaHoldings(address);
      console.timeEnd('[Solana] Tokens');
      return result;
    })(),
    (async () => {
      console.time('[Solana] NFTs');
      const result = await getSolanaNFTs(address, 50); // Limit to 50 for faster loading
      console.timeEnd('[Solana] NFTs');
      return result;
    })(),
    (async () => {
      console.time('[Solana] Domains');
      const result = await getSolanaDomains(address);
      console.timeEnd('[Solana] Domains');
      return result;
    })(),
  ]);

  console.timeEnd(`[Solana] Total fetch for ${address.slice(0, 8)}`);
  console.log(`[Solana] Found ${tokens.length} tokens, ${rawNfts.length} NFTs, ${domains.length} domains`);
  
  // NFTs without price enrichment (too slow - TODO: lazy load prices on demand)
  const nfts = rawNfts.map(nft => ({
    ...nft,
    acquisitionType: 'unknown' as const,
  }));

  return { tokens, nfts, domains };
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  // Base58 check: 32-44 chars, no 0/O/I/l
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
