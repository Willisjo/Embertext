"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bitcoin,
  DollarSign,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2,
  Calculator,
  Clock,
} from "lucide-react";
import { cn, formatNumber } from "@/lib/utils";
import { formatSat } from "@/lib/bitcoin-api";
import toast from "react-hot-toast";

interface PriceData {
  usd: number;
  kes: number;
  usd_24h_change: number;
  lastUpdated: string;
}

export default function BitcoinPage() {
  const [price, setPrice] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sats, setSats] = useState("100000");
  const [usdAmount, setUsdAmount] = useState<number | null>(null);
  const [kesAmount, setKesAmount] = useState<number | null>(null);

  const fetchPrice = async () => {
    try {
      const res = await fetch("/api/bitcoin/price");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPrice(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch price");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!price || !sats) {
      setUsdAmount(null);
      setKesAmount(null);
      return;
    }
    const satsNum = parseFloat(sats);
    if (isNaN(satsNum) || satsNum <= 0) {
      setUsdAmount(null);
      setKesAmount(null);
      return;
    }
    const btc = satsNum / 100000000;
    setUsdAmount(btc * price.usd);
    setKesAmount(btc * price.kes);
  }, [sats, price]);

  const handleSatsChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setSats(value);
    }
  };

  const quickAmounts = [1000, 10000, 100000, 1000000, 10000000, 100000000];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center mx-auto mb-4">
          <Bitcoin className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Bitcoin Calculator</h1>
        <p className="text-muted-foreground">
          Convert satoshis to USD and Kenyan Shillings in real time
        </p>
      </motion.div>

      {/* Live Price */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card rounded-2xl p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bitcoin className="w-5 h-5 text-orange-500" />
            <span className="font-semibold">Live Bitcoin Price</span>
          </div>
          <button
            onClick={() => { setLoading(true); fetchPrice(); }}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title="Refresh price"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        </div>

        {loading && !price ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : price ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3" />
                USD
              </div>
              <p className="text-2xl font-bold">${formatNumber(price.usd, 2)}</p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                price.usd_24h_change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {price.usd_24h_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(price.usd_24h_change).toFixed(2)}% (24h)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-muted/50">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="text-sm">🇰🇪</span>
                KES
              </div>
              <p className="text-2xl font-bold">KSh {formatNumber(price.kes, 2)}</p>
              <div className={cn(
                "flex items-center gap-1 text-xs mt-1",
                price.usd_24h_change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                {price.usd_24h_change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(price.usd_24h_change).toFixed(2)}% (24h)
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">Unable to fetch price</p>
        )}

        {price?.lastUpdated && (
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            Updated: {new Date(price.lastUpdated).toLocaleTimeString()}
          </div>
        )}
      </motion.div>

      {/* Converter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 mb-6">
          <Calculator className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold">Satoshis Converter</span>
        </div>

        <div className="space-y-4">
          {/* Sats Input */}
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Satoshis</label>
            <div className="relative">
              <input
                type="text"
                value={sats}
                onChange={(e) => handleSatsChange(e.target.value)}
                className="w-full rounded-xl bg-muted/50 border-0 py-3 pl-10 pr-4 text-lg font-bold focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
              <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
            </div>
          </div>

          {/* Quick Amounts */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Quick select:</p>
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSats(amount.toString())}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    sats === amount.toString()
                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-accent border border-transparent"
                  )}
                >
                  {amount >= 1000000 ? `${amount / 1000000}M` : formatSat(amount)} sats
                </button>
              ))}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-orange-500" />
            </div>
          </div>

          {/* Results */}
          <div className="grid grid-cols-2 gap-4">
            <div className={cn(
              "p-4 rounded-xl transition-all",
              usdAmount !== null ? "bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-500/10" : "bg-muted/30"
            )}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <DollarSign className="w-3 h-3" />
                US Dollar
              </div>
              <p className="text-xl font-bold">
                {usdAmount !== null ? `$${formatNumber(usdAmount, 2)}` : "—"}
              </p>
            </div>
            <div className={cn(
              "p-4 rounded-xl transition-all",
              kesAmount !== null ? "bg-gradient-to-br from-orange-500/5 to-yellow-500/5 border border-orange-500/10" : "bg-muted/30"
            )}>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span>🇰🇪</span>
                Kenyan Shilling
              </div>
              <p className="text-xl font-bold">
                {kesAmount !== null ? `KSh ${formatNumber(kesAmount, 2)}` : "—"}
              </p>
            </div>
          </div>

          {/* Per-sat value */}
          {price && (
            <div className="text-center text-xs text-muted-foreground pt-2 border-t border-border/50">
              1 sat = ${formatNumber(price.usd / 100000000, 6)} USD / KSh {formatNumber(price.kes / 100000000, 4)} KES
            </div>
          )}
        </div>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6"
      >
        <InfoCard icon={Bitcoin} title="Real-Time Price" description="BTC price fetched live from CoinGecko, updated every 30 seconds." />
        <InfoCard icon={DollarSign} title="USD & KES" description="Convert sats to US Dollars and Kenyan Shillings simultaneously." />
        <InfoCard icon={RefreshCw} title="Auto-Refreshing" description="Exchange rates update automatically. Data refreshes every 30 seconds." />
      </motion.div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, description }: { icon: typeof Bitcoin; title: string; description: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
