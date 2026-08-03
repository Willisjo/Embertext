/**
 * Bitcoin API Service
 * Uses CoinGecko API - works WITHOUT an API key (keyless access)
 * Optional: Add COINGECKO_API_KEY for higher rate limits
 */

export interface BitcoinPrice {
  usd: number;
  kes: number;
  usd_24h_change: number;
  kes_24h_change: number;
  lastUpdated: string;
}

export interface HistoricalData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

const COINGECKO_BASE = "https://api.coingecko.com/api/v3";
const EXCHANGE_RATE_API = "https://open.er-api.com/v6/latest/USD";

let priceCache: { data: BitcoinPrice | null; timestamp: number } = { data: null, timestamp: 0 };
let kesRateCache: { rate: number; timestamp: number } = { rate: 129, timestamp: 0 };
const CACHE_DURATION = 30000; // 30 seconds

function getCoinGeckoHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  // Optional: Add API key if configured for higher rate limits
  if (process.env.COINGECKO_API_KEY) {
    headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
  }
  return headers;
}

async function getKESRate(): Promise<number> {
  const now = Date.now();
  if (now - kesRateCache.timestamp < CACHE_DURATION * 10) {
    return kesRateCache.rate;
  }

  try {
    const res = await fetch(EXCHANGE_RATE_API, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error("Failed to fetch exchange rate");
    const data = await res.json();
    if (data.rates?.KES) {
      kesRateCache = { rate: data.rates.KES, timestamp: now };
      return data.rates.KES;
    }
  } catch (e) {
    console.warn("Using fallback KES rate");
  }

  return kesRateCache.rate;
}

export async function getBitcoinPrice(): Promise<BitcoinPrice> {
  const now = Date.now();
  if (now - priceCache.timestamp < CACHE_DURATION && priceCache.data) {
    return priceCache.data;
  }

  try {
    const [btcRes, kesRate] = await Promise.all([
      fetch(
        `${COINGECKO_BASE}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
        { 
          headers: getCoinGeckoHeaders(),
          next: { revalidate: 30 } 
        }
      ),
      getKESRate(),
    ]);

    if (!btcRes.ok) {
      // If rate limited (429), return cached data if available
      if (btcRes.status === 429 && priceCache.data) {
        console.warn("CoinGecko rate limited, using cached price");
        return priceCache.data;
      }
      throw new Error(`Failed to fetch Bitcoin price: ${btcRes.status}`);
    }

    const btcData = await btcRes.json();
    const btcUsd = btcData.bitcoin.usd;
    const btcUsdChange = btcData.bitcoin.usd_24h_change || 0;

    const price: BitcoinPrice = {
      usd: btcUsd,
      kes: btcUsd * kesRate,
      usd_24h_change: btcUsdChange,
      kes_24h_change: btcUsdChange,
      lastUpdated: new Date().toISOString(),
    };

    priceCache = { data: price, timestamp: now };
    return price;
  } catch (error) {
    console.error("Bitcoin price fetch error:", error);
    // Return cached or fallback
    if (priceCache.data) return priceCache.data;
    return {
      usd: 65000,
      kes: 65000 * kesRateCache.rate,
      usd_24h_change: 0,
      kes_24h_change: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function getBitcoinHistory(days: number): Promise<HistoricalData> {
  try {
    const res = await fetch(
      `${COINGECKO_BASE}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`,
      { 
        headers: getCoinGeckoHeaders(),
        next: { revalidate: 300 } 
      }
    );

    if (!res.ok) {
      if (res.status === 429) {
        console.warn("CoinGecko rate limited for history, returning empty");
        return { prices: [], market_caps: [], total_volumes: [] };
      }
      throw new Error(`Failed to fetch historical data: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error("Historical data fetch error:", error);
    return { prices: [], market_caps: [], total_volumes: [] };
  }
}

export function convertBTC(value: number, from: string, to: string, btcPriceUsd: number, kesRate: number): number {
  const btcToUsd = btcPriceUsd;
  const usdToKes = kesRate;
  const satToBtc = 1 / 100000000;

  let btcValue = 0;
  switch (from.toLowerCase()) {
    case "btc": btcValue = value; break;
    case "sat": btcValue = value * satToBtc; break;
    case "usd": btcValue = value / btcToUsd; break;
    case "kes": btcValue = value / (btcToUsd * usdToKes); break;
    default: btcValue = value;
  }

  switch (to.toLowerCase()) {
    case "btc": return btcValue;
    case "sat": return btcValue / satToBtc;
    case "usd": return btcValue * btcToUsd;
    case "kes": return btcValue * btcToUsd * usdToKes;
    default: return btcValue;
  }
}

export function formatBtc(value: number): string {
  if (value >= 1) return value.toFixed(8);
  if (value >= 0.0001) return value.toFixed(8);
  return value.toExponential(4);
}

export function formatSat(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}
