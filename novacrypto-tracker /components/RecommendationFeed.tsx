import React, { useState } from 'react';
import { CoinData } from '../types';
import CryptoCoin from './CryptoCoin';
import { TrendingUp, TrendingDown, BarChart3, ArrowRight, Filter, Zap, Clock, Activity, LineChart } from 'lucide-react';

interface RecommendationFeedProps {
  coins: CoinData[];
  currencySymbol: string;
  onTrade: (type: 'BUY' | 'SELL', coinId: string) => void;
  isExpanded?: boolean;
}

const RecommendationFeed: React.FC<RecommendationFeedProps> = ({ coins, currencySymbol, onTrade, isExpanded = false }) => {
  const [filter, setFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');

  // Analyze coins based on volume/market_cap ratio (Turnover) and price action
  const allRecommendations = coins.map(coin => {
    const cap = coin.market_cap || 1; 
    const volumeTurnover = coin.total_volume / cap;
    const priceChange = coin.price_change_percentage_24h;
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let strength: 'STRONG' | 'MODERATE' | 'NEUTRAL' = 'NEUTRAL';
    let reason = '';
    let score = 0; // Confidence score 0-100

    // Enhanced Heuristic Logic (Stricter)
    if (volumeTurnover > 0.12 && priceChange > 2.5) { // Increased thresholds
        action = 'BUY';
        strength = priceChange > 6 ? 'STRONG' : 'MODERATE';
        reason = 'High Vol Breakout';
        score = Math.min(99, 60 + (volumeTurnover * 200) + priceChange);
    } 
    else if (volumeTurnover > 0.12 && priceChange < -2.5) {
        action = 'SELL';
        strength = priceChange < -6 ? 'STRONG' : 'MODERATE';
        reason = 'Heavy Volume Sell-off';
        score = Math.min(95, 60 + (volumeTurnover * 200) + Math.abs(priceChange));
    }
    else if (priceChange < -9 && volumeTurnover < 0.05) {
        action = 'BUY';
        strength = 'MODERATE';
        reason = 'Deep Oversold';
        score = Math.min(85, 45 + Math.abs(priceChange) * 3);
    }
    else if (priceChange > 18) {
        action = 'SELL';
        strength = 'STRONG';
        reason = 'Parabolic Top';
        score = Math.min(92, 50 + priceChange);
    }
    else if (Math.abs(priceChange) < 1 && volumeTurnover > 0.08) {
        action = 'BUY';
        strength = 'MODERATE';
        reason = 'Silent Accumulation';
        score = 68;
    }
    else {
        reason = 'Low Activity';
        score = 10;
    }

    // Simulate "Time detected" for realism
    const timeAgo = Math.floor(Math.random() * 45) + 1; // 1 to 45 mins ago

    // Simulate Tech Indicators for Expanded View
    // RSI: 0-30 (Oversold), 70-100 (Overbought)
    const baseRsi = action === 'BUY' ? 35 : 65;
    const rsi = Math.min(99, Math.max(1, baseRsi + (Math.random() * 10 - 5)));
    
    // MACD: Positive (Bullish), Negative (Bearish)
    const macd = (Math.random() * 2 - 1).toFixed(3);

    return {
        ...coin,
        volumeTurnover,
        signal: { action, strength, reason, score, timeAgo, rsi, macd }
    };
  })
  .filter(item => item.signal.strength !== 'NEUTRAL')
  .sort((a, b) => b.signal.score - a.signal.score);

  // Filter Logic
  // If expanded, show more items, else show 8
  const limit = isExpanded ? 50 : 8;
  const filteredRecommendations = allRecommendations.filter(item => {
      if (filter === 'ALL') return true;
      return item.signal.action === filter;
  }).slice(0, limit);

  const getSignalStyle = (action: string, strength: string) => {
    if (action === 'BUY') {
        return strength === 'STRONG' 
            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border-transparent' 
            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
    if (action === 'SELL') {
        return strength === 'STRONG' 
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 border-transparent' 
            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
                {isExpanded ? 'Advanced Market Signals' : 'Volume Signals'}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {isExpanded ? 'Real-time anomaly detection with technical indicators' : 'Real-time anomaly detection'}
            </p>
        </div>
        
        <div className="flex bg-slate-100/50 dark:bg-slate-700/50 p-1 rounded-xl backdrop-blur-sm self-start sm:self-auto">
            {(['ALL', 'BUY', 'SELL'] as const).map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        filter === f 
                        ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 pl-1 ${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min' : 'space-y-3'}`}>
        {filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((coin, idx) => (
                <button 
                    key={coin.id} 
                    onClick={() => onTrade(coin.signal.action === 'SELL' ? 'SELL' : 'BUY', coin.id)}
                    className={`w-full group flex flex-col justify-center rounded-xl bg-white/40 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:scale-[1.01] cursor-pointer text-left relative overflow-hidden shadow-sm hover:shadow-md animate-in slide-in-from-bottom-2 duration-500 fill-mode-backwards ${isExpanded ? 'p-5 h-auto' : 'p-3 h-auto'}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                >
                    {/* Main Row */}
                    <div className="flex items-center justify-between w-full">
                        {/* Signal Stripe */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${coin.signal.action === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

                        <div className="flex items-center space-x-3 pl-2">
                            <CryptoCoin symbol={coin.symbol} size={isExpanded ? 48 : 40} />
                            <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                    <span className={`font-bold text-slate-900 dark:text-white truncate ${isExpanded ? 'text-lg' : 'text-sm'}`}>{coin.name}</span>
                                    <span className="text-[10px] font-black text-slate-400">{coin.symbol.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center text-[10px] font-mono mt-1 space-x-3">
                                    <span className="text-slate-500 dark:text-slate-400 flex items-center">
                                        <Clock className="w-2.5 h-2.5 mr-1 opacity-70" /> {coin.signal.timeAgo}m ago
                                    </span>
                                    <span className={`font-bold flex items-center ${coin.price_change_percentage_24h >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Confidence Meter - Always show */}
                            <div className="hidden sm:flex flex-col items-end w-20">
                                <div className="flex items-center text-[9px] font-bold text-slate-400 mb-1">
                                    <Zap className="w-2.5 h-2.5 mr-1 text-amber-500" />
                                    {coin.signal.score.toFixed(0)}% Conf.
                                </div>
                                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${coin.signal.score > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${coin.signal.score}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="text-right flex flex-col items-end">
                                <div className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wide border uppercase flex items-center ${getSignalStyle(coin.signal.action, coin.signal.strength)}`}>
                                    {coin.signal.action === 'BUY' && <TrendingUp className="w-3 h-3 mr-1" />}
                                    {coin.signal.action === 'SELL' && <TrendingDown className="w-3 h-3 mr-1" />}
                                    {coin.signal.action}
                                </div>
                                <div className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 max-w-[100px] truncate font-medium">
                                    {coin.signal.reason}
                                </div>
                            </div>
                            
                            {!isExpanded && (
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                    <ArrowRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Extended Technical Data (Only visible when Expanded) */}
                    {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 w-full grid grid-cols-3 gap-4 animate-in fade-in duration-500">
                             <div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">RSI (14)</span>
                                <div className="flex items-center mt-1">
                                    <Activity className="w-3 h-3 mr-1.5 text-slate-400" />
                                    <span className={`text-sm font-mono font-bold ${coin.signal.rsi > 70 ? 'text-red-500' : coin.signal.rsi < 30 ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {coin.signal.rsi.toFixed(1)}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">MACD</span>
                                <div className="flex items-center mt-1">
                                    <LineChart className="w-3 h-3 mr-1.5 text-slate-400" />
                                    <span className={`text-sm font-mono font-bold ${parseFloat(coin.signal.macd) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {coin.signal.macd}
                                    </span>
                                </div>
                             </div>
                             <div>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Volume/Cap</span>
                                <div className="flex items-center mt-1">
                                    <BarChart3 className="w-3 h-3 mr-1.5 text-slate-400" />
                                    <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200">
                                        {coin.volumeTurnover.toFixed(3)}
                                    </span>
                                </div>
                             </div>
                        </div>
                    )}
                </button>
            ))
        ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 col-span-full">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                    <Filter className="w-5 h-5 opacity-50" />
                </div>
                <p className="text-xs font-medium">No signals found for {filter}</p>
                <button 
                    onClick={() => setFilter('ALL')}
                    className="mt-2 text-[10px] font-bold text-indigo-500 hover:text-indigo-600"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationFeed;