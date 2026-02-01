import { CoinData, Asset } from './types';

export const CURRENCY_CONFIG: Record<string, { symbol: string; label: string }> = {
  usd: { symbol: '$', label: 'USD - US Dollar' },
  inr: { symbol: '₹', label: 'INR - Indian Rupee' },
  eur: { symbol: '€', label: 'EUR - Euro' },
  gbp: { symbol: '£', label: 'GBP - British Pound' },
  jpy: { symbol: '¥', label: 'JPY - Japanese Yen' },
  aud: { symbol: 'A$', label: 'AUD - Australian Dollar' },
  cad: { symbol: 'C$', label: 'CAD - Canadian Dollar' },
};

export const EXCHANGE_RATES: Record<string, number> = {
  usd: 1,
  inr: 83.5,
  eur: 0.92,
  gbp: 0.79,
  jpy: 151.5,
  aud: 1.52,
  cad: 1.36,
};

export const INITIAL_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    current_price: 64230.50,
    price_change_percentage_24h: 2.4,
    image: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    market_cap: 1200000000000,
    total_volume: 35000000000,
    high_24h: 65000,
    low_24h: 63000
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    current_price: 3450.12,
    price_change_percentage_24h: -1.2,
    image: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
    market_cap: 400000000000,
    total_volume: 15000000000,
    high_24h: 3550,
    low_24h: 3400
  },
  {
    id: 'solana',
    symbol: 'SOL',
    name: 'Solana',
    current_price: 145.60,
    price_change_percentage_24h: 5.8,
    image: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    market_cap: 65000000000,
    total_volume: 4000000000,
    high_24h: 150,
    low_24h: 138
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    current_price: 590.20,
    price_change_percentage_24h: 0.5,
    image: 'https://cryptologos.cc/logos/bnb-bnb-logo.png',
    market_cap: 87000000000,
    total_volume: 1200000000,
    high_24h: 600,
    low_24h: 585
  },
  {
    id: 'ripple',
    symbol: 'XRP',
    name: 'XRP',
    current_price: 0.62,
    price_change_percentage_24h: -0.8,
    image: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
    market_cap: 34000000000,
    total_volume: 1500000000,
    high_24h: 0.64,
    low_24h: 0.61
  },
  {
    id: 'cardano',
    symbol: 'ADA',
    name: 'Cardano',
    current_price: 0.45,
    price_change_percentage_24h: 1.1,
    image: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
    market_cap: 16000000000,
    total_volume: 400000000,
    high_24h: 0.46,
    low_24h: 0.44
  },
  {
    id: 'avalanche-2',
    symbol: 'AVAX',
    name: 'Avalanche',
    current_price: 35.40,
    price_change_percentage_24h: 3.2,
    image: 'https://cryptologos.cc/logos/avalanche-avax-logo.png',
    market_cap: 13000000000,
    total_volume: 600000000,
    high_24h: 36.50,
    low_24h: 34.00
  },
  {
    id: 'polkadot',
    symbol: 'DOT',
    name: 'Polkadot',
    current_price: 7.20,
    price_change_percentage_24h: -2.5,
    image: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.png',
    market_cap: 10000000000,
    total_volume: 250000000,
    high_24h: 7.50,
    low_24h: 7.10
  },
  {
    id: 'dogecoin',
    symbol: 'DOGE',
    name: 'Dogecoin',
    current_price: 0.12,
    price_change_percentage_24h: 8.4,
    image: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
    market_cap: 18000000000,
    total_volume: 2000000000,
    high_24h: 0.13,
    low_24h: 0.11
  },
  {
    id: 'chainlink',
    symbol: 'LINK',
    name: 'Chainlink',
    current_price: 13.50,
    price_change_percentage_24h: -1.5,
    image: 'https://cryptologos.cc/logos/chainlink-link-logo.png',
    market_cap: 8000000000,
    total_volume: 350000000,
    high_24h: 14.00,
    low_24h: 13.20
  },
  {
    id: 'matic-network',
    symbol: 'MATIC',
    name: 'Polygon',
    current_price: 0.70,
    price_change_percentage_24h: 0.8,
    image: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    market_cap: 6500000000,
    total_volume: 280000000,
    high_24h: 0.72,
    low_24h: 0.69
  },
  {
    id: 'shiba-inu',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    current_price: 0.000024,
    price_change_percentage_24h: 4.2,
    image: 'https://cryptologos.cc/logos/shiba-inu-shib-logo.png',
    market_cap: 14000000000,
    total_volume: 500000000,
    high_24h: 0.000025,
    low_24h: 0.000023
  },
  {
    id: 'litecoin',
    symbol: 'LTC',
    name: 'Litecoin',
    current_price: 85.20,
    price_change_percentage_24h: 0.3,
    image: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
    market_cap: 6000000000,
    total_volume: 400000000,
    high_24h: 86.50,
    low_24h: 84.00
  },
  {
    id: 'uniswap',
    symbol: 'UNI',
    name: 'Uniswap',
    current_price: 10.50,
    price_change_percentage_24h: -0.5,
    image: 'https://cryptologos.cc/logos/uniswap-uni-logo.png',
    market_cap: 7500000000,
    total_volume: 150000000,
    high_24h: 11.00,
    low_24h: 10.20
  }
];

export const INITIAL_ASSETS: Asset[] = [];