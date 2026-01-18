import { NextRequest, NextResponse } from 'next/server';
import { getHyperliquidHoldings } from '@/lib/chains/hyperliquid';
import { getSolanaPortfolio } from '@/lib/chains/solana';
import type { Asset, Chain, NFT, Domain } from '@/types';

// Token name mapping
const TOKEN_NAMES: { [key: string]: string } = {
  // Hyperliquid
  HYPE: 'Hyperliquid',
  NEKO: 'Neko',
  PURR: 'Purr',
  LICKO: 'Licko',
  LATINA: 'Latina',
  // Solana
  SOL: 'Solana',
  JUP: 'Jupiter',
  BONK: 'Bonk',
  WIF: 'dogwifhat',
  PYTH: 'Pyth Network',
  RENDER: 'Render Token',
  jitoSOL: 'Jito Staked SOL',
  mSOL: 'Marinade Staked SOL',
  bSOL: 'BlazeStake Staked SOL',
  // Common
  USDC: 'USD Coin',
  USDT: 'Tether',
};

// Price cache (simple in-memory, replace with Redis in production)
let priceCache: { [key: string]: { price: number; change24h: number; timestamp: number } } = {};
const PRICE_CACHE_TTL = 30000; // 30 seconds

async function fetchPrices(symbols: string[]): Promise<{ [key: string]: { price: number; change24h: number } }> {
  const now = Date.now();
  const uncachedSymbols = symbols.filter(s => {
    const cached = priceCache[s.toUpperCase()];
    return !cached || (now - cached.timestamp > PRICE_CACHE_TTL);
  });

  if (uncachedSymbols.length > 0) {
    try {
      // Map symbols to CoinGecko IDs
      const cgIdMap: { [key: string]: string } = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        SOL: 'solana',
        HYPE: 'hyperliquid',
        USDC: 'usd-coin',
        USDT: 'tether',
        NEKO: 'neko-on-hyperliquid',
        // Solana tokens
        JUP: 'jupiter-exchange-solana',
        BONK: 'bonk',
        WIF: 'dogwifcoin',
        PYTH: 'pyth-network',
        RENDER: 'render-token',
        JITOSOL: 'jito-staked-sol',
        MSOL: 'msol',
        BSOL: 'blazestake-staked-sol',
      };

      const ids = uncachedSymbols
        .map(s => cgIdMap[s.toUpperCase()])
        .filter(Boolean)
        .join(',');

      if (ids) {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { next: { revalidate: 30 } }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Update cache
          for (const [symbol, cgId] of Object.entries(cgIdMap)) {
            if (data[cgId]) {
              priceCache[symbol] = {
                price: data[cgId].usd,
                change24h: data[cgId].usd_24h_change || 0,
                timestamp: now,
              };
            }
          }
        }
      }
      
      // Set USDC price to 1 if not fetched
      if (!priceCache['USDC']) {
        priceCache['USDC'] = { price: 1, change24h: 0, timestamp: now };
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }

  // Return prices from cache
  const result: { [key: string]: { price: number; change24h: number } } = {};
  for (const symbol of symbols) {
    const cached = priceCache[symbol.toUpperCase()];
    if (cached) {
      result[symbol.toUpperCase()] = { price: cached.price, change24h: cached.change24h };
    }
  }
  return result;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') as Chain;

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const assets: Asset[] = [];
    let nfts: NFT[] = [];
    let domains: Domain[] = [];

    // HYPERLIQUID
    if (chain === 'hyperliquid') {
      const holdings = await getHyperliquidHoldings(address);
      
      // Process spot balances
      if (holdings.spotBalances && holdings.spotBalances.length > 0) {
        for (const balance of holdings.spotBalances) {
          const totalBalance = parseFloat(balance.total);
          if (totalBalance > 0.0001) {
            assets.push({
              symbol: balance.coin,
              name: TOKEN_NAMES[balance.coin] || balance.coin,
              chain: 'hyperliquid',
              balance: totalBalance,
              price: 0,
              value: 0,
              change24h: 0,
            });
          }
        }
      }

      // Process staking
      if (holdings.stakingSummary) {
        const stakedAmount = parseFloat(holdings.stakingSummary.delegated);
        if (stakedAmount > 0) {
          assets.push({
            symbol: 'HYPE',
            name: 'Hyperliquid',
            chain: 'hyperliquid',
            balance: stakedAmount,
            price: 0,
            value: 0,
            change24h: 0,
            isStaked: true,
          });
        }
      }
    }

    // SOLANA - tokens, NFTs, and domains
    if (chain === 'solana') {
      const portfolio = await getSolanaPortfolio(address);
      
      // Add tokens
      for (const token of portfolio.tokens) {
        assets.push({
          symbol: token.symbol,
          name: TOKEN_NAMES[token.symbol] || token.name,
          chain: 'solana',
          balance: token.balance,
          price: token.price || 0,
          value: token.value || 0,
          change24h: 0,
          icon: token.imageUrl,
        });
      }
      
      // Add NFTs
      nfts = portfolio.nfts.map(nft => ({
        mint: nft.mint,
        name: nft.name,
        chain: 'solana' as Chain,
        collection: nft.collection,
        imageUrl: nft.imageUrl,
        floorPrice: nft.floorPrice,
        purchasePrice: nft.purchasePrice,
        purchaseDate: nft.purchaseDate,
      }));
      
      // Add domains
      domains = portfolio.domains.map(domain => ({
        name: domain.name,
        chain: 'solana' as Chain,
        mint: domain.mint,
        purchasePrice: domain.purchasePrice,
        purchaseDate: domain.purchaseDate,
      }));
    }

    // Fetch prices for all assets
    if (assets.length > 0) {
      const symbols = [...new Set(assets.map(a => a.symbol))];
      const prices = await fetchPrices(symbols);

      // Update assets with prices
      for (const asset of assets) {
        const priceData = prices[asset.symbol.toUpperCase()];
        if (priceData) {
          asset.price = priceData.price;
          asset.change24h = priceData.change24h;
          asset.value = asset.balance * priceData.price;
        } else if (asset.symbol === 'USDC' || asset.symbol === 'USDT') {
          // Stablecoin fallback
          asset.price = 1;
          asset.change24h = 0;
          asset.value = asset.balance;
        }
      }
    }

    // Sort by value descending
    assets.sort((a, b) => b.value - a.value);

    return NextResponse.json({
      address,
      chain,
      assets,
      nfts,
      domains,
      totalValue: assets.reduce((sum, a) => sum + a.value, 0),
      nftCount: nfts.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio data' },
      { status: 500 }
    );
  }
}
