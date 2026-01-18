// Crypto icon URLs from CoinGecko and other sources
// Using CoinGecko's CDN for reliable icon delivery
// Note: For production, cache these locally to avoid rate limits

export const CRYPTO_ICONS: Record<string, string> = {
  // Major coins
  BTC: 'https://assets.coingecko.com/coins/images/1/standard/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/standard/ethereum.png',
  SOL: 'https://assets.coingecko.com/coins/images/4128/standard/solana.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png',
  XRP: 'https://assets.coingecko.com/coins/images/44/standard/xrp-symbol-white-128.png',
  ADA: 'https://assets.coingecko.com/coins/images/975/standard/cardano.png',
  DOGE: 'https://assets.coingecko.com/coins/images/5/standard/dogecoin.png',
  AVAX: 'https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png',
  DOT: 'https://assets.coingecko.com/coins/images/12171/standard/polkadot.png',
  MATIC: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
  POL: 'https://assets.coingecko.com/coins/images/4713/standard/polygon.png',
  LINK: 'https://assets.coingecko.com/coins/images/877/standard/chainlink-new-logo.png',
  UNI: 'https://assets.coingecko.com/coins/images/12504/standard/uniswap-logo.png',
  ATOM: 'https://assets.coingecko.com/coins/images/1481/standard/cosmos_hub.png',
  LTC: 'https://assets.coingecko.com/coins/images/2/standard/litecoin.png',
  
  // Hyperliquid
  HYPE: 'https://coin-images.coingecko.com/coins/images/50882/standard/hyperliquid.jpg',
  
  // Stablecoins
  USDT: 'https://assets.coingecko.com/coins/images/325/standard/Tether.png',
  USDC: 'https://assets.coingecko.com/coins/images/6319/standard/usdc.png',
  DAI: 'https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png',
  
  // Solana ecosystem
  JUP: 'https://assets.coingecko.com/coins/images/34188/standard/jup.png',
  PYTH: 'https://assets.coingecko.com/coins/images/31924/standard/pyth.png',
  RENDER: 'https://assets.coingecko.com/coins/images/11636/standard/rndr.png',
  RAY: 'https://assets.coingecko.com/coins/images/13928/standard/PSigc4ie_400x400.jpg',
  ORCA: 'https://assets.coingecko.com/coins/images/17547/standard/Orca_Logo.png',
  JITOSOL: 'https://assets.coingecko.com/coins/images/28046/standard/JitoSOL-200.png',
  MSOL: 'https://assets.coingecko.com/coins/images/17752/standard/mSOL.png',
  BSOL: 'https://assets.coingecko.com/coins/images/26636/standard/blazesolana.png',
  
  // Memecoins
  SHIB: 'https://assets.coingecko.com/coins/images/11939/standard/shiba.png',
  PEPE: 'https://assets.coingecko.com/coins/images/29850/standard/pepe-token.jpeg',
  WIF: 'https://assets.coingecko.com/coins/images/33566/standard/dogwifhat.jpg',
  BONK: 'https://assets.coingecko.com/coins/images/28600/standard/bonk.jpg',
  
  // SPX6900 - meme coin
  SPX: 'https://assets.coingecko.com/coins/images/31401/standard/centeredcoin_%281%29.png',
  SPX6900: 'https://assets.coingecko.com/coins/images/31401/standard/centeredcoin_%281%29.png',
  
  // DeFi
  AAVE: 'https://assets.coingecko.com/coins/images/12645/standard/aave-token-round.png',
  MKR: 'https://assets.coingecko.com/coins/images/1364/standard/Mark_Maker.png',
  CRV: 'https://assets.coingecko.com/coins/images/12124/standard/Curve.png',
  
  // Layer 2s
  ARB: 'https://assets.coingecko.com/coins/images/16547/standard/arb.jpg',
  OP: 'https://assets.coingecko.com/coins/images/25244/standard/Optimism.png',
};

// Get icon URL for a symbol, with fallback
export function getIconUrl(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();
  return CRYPTO_ICONS[upperSymbol] || null;
}

// Color palette for fallback icons (generates consistent colors per symbol)
const FALLBACK_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#6366f1', // indigo
];

function getColorForSymbol(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

// Generate a nice placeholder icon based on symbol
export function getPlaceholderIcon(symbol: string, _color?: string): string {
  const letter = symbol.slice(0, 2).toUpperCase();
  const bgColor = _color || getColorForSymbol(symbol);
  
  // Create a gradient-style icon
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.6" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#grad)"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-family="system-ui,-apple-system,sans-serif" font-size="14" font-weight="700" letter-spacing="-0.5">${letter}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
