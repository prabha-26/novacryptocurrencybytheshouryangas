import React from 'react';
import { Megaphone, TrendingUp, AlertTriangle, Globe, Activity, Zap } from 'lucide-react';

const NEWS_HEADLINES = [
    "🚨 MARKET ALERT: Bitcoin (BTC) flashes rare 'Golden Cross' signal on weekly timeframe; institutional buy walls detected at $64k.",
    "⚠️ REGULATORY: SEC approves 3 new Ether Futures ETFs, signaling potential shift in regulatory stance for altcoins.",
    "🌍 MACRO: Federal Reserve Chair hints at aggressive rate cuts in Q4 if inflation drops below 2.5%.",
    "🚀 SOLANA BREAKOUT: SOL surpasses BNB in market cap as network activity hits all-time high of 40M daily txs.",
    "💎 INSTITUTIONAL: BlackRock Digital Asset Fund accumulates another 5,000 BTC in overnight OTC trading.",
    "📉 GAS FEES: Ethereum L2 adoption surges 400% post-upgrade; mainnet gas fees drop to 3-year lows.",
    "🇯🇵 JAPAN: Govt approves law allowing VCs to hold crypto assets directly; Yen volatility drives record trading.",
    "🤖 AI X CRYPTO: Fetch.ai and Ocean Protocol announce merger to create largest decentralized AI infrastructure network.",
    "🏦 BANKING: Standard Chartered revises BTC year-end target to $120,000 citing supply shock from halving.",
];

const NewsTicker: React.FC = () => {
  return (
    <div className="w-full bg-slate-950 text-white overflow-hidden flex items-center h-12 border-b border-white/10 relative z-20 hover:bg-slate-900 transition-colors group">
      {/* Live Wire Badge - "Effective on Wire" visual style */}
      <div className="bg-red-600 h-full px-6 flex items-center justify-center z-10 font-black text-xs uppercase tracking-widest shrink-0 shadow-[0_0_20px_rgba(220,38,38,0.5)] relative overflow-hidden cursor-default transition-all duration-300 group-hover:bg-red-500">
        
        {/* Animated Glare */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        
        {/* Pulsing Dot */}
        <div className="relative flex mr-3">
           <div className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"></div>
           <div className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></div>
        </div>
        
        LIVE WIRE
      </div>
      
      {/* Ticker Container with Gradient Fade */}
      <div className="flex-1 overflow-hidden relative h-full flex items-center bg-slate-900/50">
        {/* Left/Right Fades for text smoothing */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>

        <div className="animate-marquee whitespace-nowrap flex items-center space-x-16 absolute pl-4">
          {/* Double map for seamless loop */}
          {[...NEWS_HEADLINES, ...NEWS_HEADLINES, ...NEWS_HEADLINES].map((item, index) => {
             let Icon = Globe;
             let colorClass = "text-blue-400";
             
             if (item.includes("MARKET ALERT") || item.includes("Bitcoin")) {
                 Icon = Zap;
                 colorClass = "text-amber-400";
             } else if (item.includes("REGULATORY") || item.includes("SEC")) {
                 Icon = AlertTriangle;
                 colorClass = "text-red-400";
             } else if (item.includes("MACRO") || item.includes("Federal")) {
                 Icon = Activity;
                 colorClass = "text-emerald-400";
             } else if (item.includes("SOLANA")) {
                 Icon = TrendingUp;
                 colorClass = "text-purple-400";
             }

             return (
                <span key={`${index}`} className="text-sm font-bold flex items-center text-slate-100 tracking-wide">
                   <Icon className={`w-4 h-4 mr-2.5 ${colorClass}`} />
                   {item}
                </span>
             );
          })}
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;