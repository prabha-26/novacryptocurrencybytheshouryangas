import { CoinData } from '../types';

// Fallback data in case API limit is reached
import { INITIAL_COINS, EXCHANGE_RATES } from '../constants';

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

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
  
  // Return the initial constant data but slightly jittered to simulate live market activity
  // Apply exchange rate to prices
  return INITIAL_COINS.map(coin => ({
    ...coin,
    current_price: coin.current_price * rate * (1 + (Math.random() * 0.02 - 0.01)),
    high_24h: coin.high_24h * rate,
    low_24h: coin.low_24h * rate,
    market_cap: coin.market_cap * rate,
    sparkline_in_7d: { 
        price: Array(168).fill(0).map(() => coin.current_price * rate * (1 + (Math.random() * 0.1 - 0.05))) 
    }
  }));
};