import { CoinData } from '../types';

// Fallback data in case API limit is reached
import { INITIAL_COINS, EXCHANGE_RATES } from '../constants';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Map CoinGecko IDs to Binance Symbols (USDT pairs) for WebSocket streaming
const ID_TO_SYMBOL: Record<string, string> = {
  'bitcoin': 'btcusdt',
  'ethereum': 'ethusdt',
  'solana': 'solusdt',
  'binancecoin': 'bnbusdt',
  'ripple': 'xrpusdt',
  'cardano': 'adausdt',
  'avalanche-2': 'avaxusdt',
  'polkadot': 'dotusdt',
  'dogecoin': 'dogeusdt',
  'chainlink': 'linkusdt',
  'matic-network': 'maticusdt',
  'shiba-inu': 'shibusdt',
  'litecoin': 'ltcusdt',
  'uniswap': 'uniusdt'
};

export const fetchMarketData = async (currency: string = 'usd'): Promise<CoinData[]> => {
  try {
    // Add a timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      `${COINGECKO_API_URL}/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Market data API unavailable (Status: ${response.status}). Switching to simulation mode.`);
      return getFallbackData(currency);
    }

    const data = await response.json();
    
    // Safety check for array format
    if (!Array.isArray(data)) {
        console.warn('Market data format invalid. Switching to simulation mode.');
        return getFallbackData(currency);
    }

    return data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      image: coin.image,
      market_cap: coin.market_cap,
      total_volume: coin.total_volume,
      high_24h: coin.high_24h,
      low_24h: coin.low_24h,
      sparkline_in_7d: coin.sparkline_in_7d
    }));
  } catch (error) {
    // Gracefully handle network errors (e.g. Failed to fetch) without spamming error console
    // This allows the app to function offline or when API is blocked (CORS/Rate Limit)
    console.warn('Market data fetch failed (Network/API Error). Using simulation data.');
    return getFallbackData(currency);
  }
};

const getFallbackData = (currency: string): CoinData[] => {
  const rate = EXCHANGE_RATES[currency] || 1;
  
  // Return the initial constant data
  return INITIAL_COINS.map(coin => ({
    ...coin,
    current_price: coin.current_price * rate,
    high_24h: coin.high_24h * rate,
    low_24h: coin.low_24h * rate,
    market_cap: coin.market_cap * rate,
    total_volume: coin.total_volume * rate,
    sparkline_in_7d: { 
        price: Array(168).fill(0).map(() => coin.current_price * rate * (1 + (Math.random() * 0.1 - 0.05))) 
    }
  }));
};

/**
 * Real-time WebSocket connection to Binance for "Effective on Wire" updates.
 * Pushes updates only when they happen, rather than polling.
 */
export const subscribeToLivePrices = (
  coins: CoinData[],
  currency: string,
  onUpdate: (updates: Record<string, number>) => void
): (() => void) => {
  // 1. Identify valid symbols to track
  const symbolsToTrack = coins
    .map(c => ID_TO_SYMBOL[c.id])
    .filter(Boolean);

  if (symbolsToTrack.length === 0) return () => {};

  // 2. Construct Stream URL (Combined streams for efficiency)
  // Format: <symbol>@miniTicker
  const streams = symbolsToTrack.map(s => `${s}@miniTicker`).join('/');
  const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streams}`);

  // 3. Get Conversion Rate (Binance streams are typically USDT based)
  const rate = EXCHANGE_RATES[currency] || 1;

  ws.onopen = () => {
    // console.log('🔴 Live Wire: Connected to Binance Real-time Stream');
  };

  ws.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data);
      // Payload format for combined stream isn't always wrapped in 'data', 
      // but if using /ws/<combined>, it usually sends raw object events if not using /stream?streams=...
      // MiniTicker Event: { e: '24hrMiniTicker', E: 123456789, s: 'BTCUSDT', c: '64000.00', ... }
      
      const ticker = payload;
      
      if (ticker && ticker.e === '24hrMiniTicker') {
        const symbol = ticker.s.toLowerCase();
        const price = parseFloat(ticker.c);

        // Find the CoinGecko ID that matches this Binance Symbol
        const coinId = Object.keys(ID_TO_SYMBOL).find(key => ID_TO_SYMBOL[key] === symbol);
        
        if (coinId && !isNaN(price)) {
            // Apply currency conversion immediately
            onUpdate({ [coinId]: price * rate });
        }
      }
    } catch (e) {
      console.error('WS Parse Error', e);
    }
  };

  ws.onerror = (err) => {
    console.warn('Live Stream Error', err);
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  };
};