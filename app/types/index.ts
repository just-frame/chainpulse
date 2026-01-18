export interface Asset {
  symbol: string;
  name: string;
  chain: Chain;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  icon?: string;
  isStaked?: boolean;
  stakingProtocol?: string; // e.g., 'Lido', 'Marinade', 'Jito'
  stakingRewards?: number;
}

export interface NFT {
  mint: string;
  name: string;
  chain: Chain;
  collection?: string;
  imageUrl?: string;
  floorPrice?: number;
  purchasePrice?: number;
  purchaseDate?: string;
}

export interface Domain {
  name: string;
  chain: Chain;
  mint: string;
  purchasePrice?: number;
  purchaseDate?: string;
}

export type Chain = 
  | 'bitcoin'
  | 'ethereum'
  | 'solana'
  | 'hyperliquid'
  | 'hyperevm'
  | 'polygon'
  | 'base'
  | 'xrp'
  | 'dogecoin'
  | 'zcash'
  | 'cardano'
  | 'litecoin'
  | 'tron';

export interface Wallet {
  id: string;
  address: string;
  chain: Chain;
  label?: string;
  createdAt: Date;
}

export interface Portfolio {
  totalValue: number;
  change24h: number;
  change24hPercent: number;
  assets: Asset[];
  wallets: Wallet[];
}

export interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline7d?: number[];
}

export interface Alert {
  id: string;
  userId: string;
  type: 'price' | 'portfolio_value' | 'percent_change';
  asset?: string;
  condition: 'above' | 'below';
  threshold: number;
  enabled: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

// Chain configuration
export interface ChainConfig {
  id: Chain;
  name: string;
  nativeToken: string;
  explorer: string;
  color: string;
}

export const CHAIN_CONFIG: Record<Chain, ChainConfig> = {
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    nativeToken: 'BTC',
    explorer: 'https://mempool.space',
    color: '#f7931a',
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    nativeToken: 'ETH',
    explorer: 'https://etherscan.io',
    color: '#627eea',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    nativeToken: 'SOL',
    explorer: 'https://solscan.io',
    color: '#00ffa3',
  },
  hyperliquid: {
    id: 'hyperliquid',
    name: 'Hyperliquid',
    nativeToken: 'HYPE',
    explorer: 'https://hyperliquid.xyz',
    color: '#00d4aa',
  },
  hyperevm: {
    id: 'hyperevm',
    name: 'HyperEVM',
    nativeToken: 'HYPE',
    explorer: 'https://hyperliquid.xyz',
    color: '#00d4aa',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    nativeToken: 'MATIC',
    explorer: 'https://polygonscan.com',
    color: '#8247e5',
  },
  base: {
    id: 'base',
    name: 'Base',
    nativeToken: 'ETH',
    explorer: 'https://basescan.org',
    color: '#0052ff',
  },
  xrp: {
    id: 'xrp',
    name: 'XRP',
    nativeToken: 'XRP',
    explorer: 'https://xrpscan.com',
    color: '#23292f',
  },
  dogecoin: {
    id: 'dogecoin',
    name: 'Dogecoin',
    nativeToken: 'DOGE',
    explorer: 'https://dogechain.info',
    color: '#c2a633',
  },
  zcash: {
    id: 'zcash',
    name: 'Zcash',
    nativeToken: 'ZEC',
    explorer: 'https://zecblockexplorer.com',
    color: '#f4b728',
  },
  cardano: {
    id: 'cardano',
    name: 'Cardano',
    nativeToken: 'ADA',
    explorer: 'https://cardanoscan.io',
    color: '#0033ad',
  },
  litecoin: {
    id: 'litecoin',
    name: 'Litecoin',
    nativeToken: 'LTC',
    explorer: 'https://litecoinspace.org',
    color: '#bfbbbb',
  },
  tron: {
    id: 'tron',
    name: 'Tron',
    nativeToken: 'TRX',
    explorer: 'https://tronscan.org',
    color: '#ff0013',
  },
};
