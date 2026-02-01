import React, { useState, useEffect } from 'react';
import { MarketEvent, NewsHeadline, PortfolioItem } from '../types';
import { Calendar, Globe, ExternalLink, Clock, AlertTriangle, CheckCircle2, TrendingUp, Zap, Radio, Newspaper, Sparkles, RefreshCw } from 'lucide-react';
import { generateMarketHeadlines } from '../services/geminiService';

const EVENTS: MarketEvent[] = [
    { id: '1', title: 'FOMC Rate Decision', date: 'Today, 2:00 PM', impact: 'HIGH', category: 'ECONOMY' },
    { id: '2', title: 'Powell Press Conference', date: 'Today, 2:30 PM', impact: 'HIGH', category: 'ECONOMY' },
    { id: '3', title: 'US CPI Data Release', date: 'Tomorrow, 8:30 AM', impact: 'HIGH', category: 'ECONOMY' },
    { id: '4', title: 'Ethereum "Pectra" Upgrade', date: 'Mar 15, 2025', impact: 'MEDIUM', category: 'CRYPTO' },
    { id: '5', title: 'Non-Farm Payrolls', date: 'Friday, 8:30 AM', impact: 'HIGH', category: 'ECONOMY' },
    { id: '6', title: 'SEC ETF Deadline', date: 'May 23, 2025', impact: 'HIGH', category: 'REGULATION' },
    { id: '7', title: 'Bitcoin Halving Anniversary', date: 'Apr 20, 2025', impact: 'MEDIUM', category: 'CRYPTO' },
    { id: '8', title: 'ECB Monetary Policy', date: 'Jun 12, 2025', impact: 'HIGH', category: 'ECONOMY' },
    { id: '9', title: 'Solana Breakpoint Conf', date: 'Sep 20, 2025', impact: 'LOW', category: 'CRYPTO' },
];

const INITIAL_NEWS_FEED: NewsHeadline[] = [
    { id: '1', title: 'MicroStrategy buys another 12,000 BTC at $68k average', source: 'CoinDesk', time: '10m ago', sentiment: 'POSITIVE' },
    { id: '2', title: 'Solana network experiences brief congestion', source: 'The Block', time: '22m ago', sentiment: 'NEGATIVE' },
    { id: '3', title: 'Coinbase launches new Layer-2 smart wallet integration', source: 'Decrypt', time: '45m ago', sentiment: 'POSITIVE' },
    { id: '4', title: 'Global regulators discuss stablecoin framework in Basel', source: 'Reuters', time: '1h ago', sentiment: 'NEUTRAL' },
    { id: '5', title: 'Uniswap V4 audit complete, launch imminent', source: 'Defiant', time: '2h ago', sentiment: 'POSITIVE' },
    { id: '6', title: 'BlackRock iShares Bitcoin ETF hits $20B AUM', source: 'Bloomberg', time: '3h ago', sentiment: 'POSITIVE' },
];

interface MarketNewsProps {
    isExpanded?: boolean;
    portfolio?: PortfolioItem[];
}

const MarketNews: React.FC<MarketNewsProps> = ({ isExpanded = false, portfolio = [] }) => {
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'NEWS'>('NEWS');
  const [newsFeed, setNewsFeed] = useState<NewsHeadline[]>(INITIAL_NEWS_FEED);
  const [newItemsCount, setNewItemsCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Manual Refresh with AI
  const refreshNews = async () => {
      if (isRefreshing) return;
      setIsRefreshing(true);
      
      // Simulate network wait for effect
      await new Promise(resolve => setTimeout(resolve, 800));

      const aiNews = await generateMarketHeadlines(portfolio);
      if (aiNews && aiNews.length > 0) {
          setNewsFeed(prev => [...aiNews, ...prev].slice(0, 50));
          setNewItemsCount(c => c + aiNews.length);
      }
      setIsRefreshing(false);
  };

  // Show more items if expanded
  const displayEvents = isExpanded ? EVENTS : EVENTS.slice(0, 5);
  const displayNews = isExpanded ? newsFeed : newsFeed.slice(0, 5);

  return (
    <div className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/40 dark:border-white/10 p-6 rounded-[2rem] shadow-xl flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards ${isExpanded ? 'bg-white dark:bg-slate-950' : ''}`} style={{ animationDelay: '400ms' }}>
      
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center">
             <div className="relative mr-3">
                 <div className="absolute inset-0 bg-blue-500 blur-lg opacity-40 rounded-full animate-pulse"></div>
                 <Globe className="w-5 h-5 text-blue-500 relative z-10" />
             </div>
             <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center">
                    Global Market Intel
                </h3>
                {isExpanded && <p className="text-sm text-slate-500 mt-1">Real-time economic calendar and news aggregation</p>}
             </div>
        </div>

        <div className="flex items-center gap-3">
            {!isExpanded && (
                 <div className="flex items-center px-2.5 py-1 bg-red-500/10 rounded-full border border-red-500/20">
                    <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-red-600 dark:text-red-400">LIVE</span>
                </div>
            )}
            
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl backdrop-blur-sm">
                <button 
                    onClick={() => setActiveTab('EVENTS')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'EVENTS' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                    Calendar
                </button>
                <button 
                    onClick={() => { setActiveTab('NEWS'); setNewItemsCount(0); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center ${activeTab === 'NEWS' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}
                >
                    Feed
                    {newItemsCount > 0 && activeTab !== 'NEWS' && (
                        <span className="ml-1.5 flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                    )}
                </button>
            </div>
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto custom-scrollbar pr-1 -mr-1 ${isExpanded ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : ''}`}>
         {activeTab === 'EVENTS' ? (
             <div className={isExpanded ? 'contents' : 'space-y-3'}>
                 {displayEvents.map(event => (
                     <div key={event.id} className="group flex items-start p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-white/5 hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm">
                         <div className={`mt-1 min-w-[4px] h-8 rounded-full mr-3 ${
                             event.impact === 'HIGH' ? 'bg-red-500' : event.impact === 'MEDIUM' ? 'bg-amber-500' : 'bg-blue-500'
                         }`}></div>
                         <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.title}</h4>
                                {isExpanded && (
                                    <span className="text-[10px] font-mono text-slate-500 border border-slate-200 dark:border-slate-600 px-1.5 rounded">{event.category}</span>
                                )}
                             </div>
                             <div className="flex items-center mt-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                 <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                                 {event.date}
                             </div>
                         </div>
                         <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                              event.impact === 'HIGH' ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 
                              event.impact === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                         }`}>
                             {event.impact}
                         </div>
                     </div>
                 ))}
             </div>
         ) : (
             <>
                 {/* AI Refresh Button for News */}
                 <button 
                    onClick={refreshNews}
                    disabled={isRefreshing}
                    className="w-full mb-3 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border border-indigo-500/20 rounded-xl flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 transition-all group"
                 >
                    <RefreshCw className={`w-3.5 h-3.5 mr-2 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {isRefreshing ? 'Analyzing Market...' : 'Refresh with AI Analysis'}
                 </button>

                 <div className={isExpanded ? 'contents' : 'space-y-3'}>
                     {displayNews.map((news, idx) => (
                         <div 
                            key={news.id} 
                            className={`group p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border border-white/20 dark:border-white/5 hover:bg-white dark:hover:bg-slate-700 transition-all cursor-pointer animate-in fade-in slide-in-from-right-4 duration-500 shadow-sm hover:shadow-md ${news.time === 'Just now' ? 'ring-1 ring-indigo-500/30 bg-indigo-500/5' : ''}`}
                         >
                             <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide flex items-center">
                                    <Radio className={`w-3.5 h-3.5 mr-1.5 ${news.time === 'Just now' ? 'animate-pulse text-red-500' : ''}`} /> {news.source}
                                 </span>
                                 <span className={`text-[10px] flex items-center ${news.time === 'Just now' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                     {news.time === 'Just now' ? <Zap className="w-3.5 h-3.5 mr-1 fill-indigo-400" /> : <Clock className="w-3 h-3 mr-1" />} 
                                     {news.time}
                                 </span>
                             </div>
                             <h4 className={`text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${isExpanded ? 'text-base' : ''}`}>
                                 {news.title}
                             </h4>
                             <div className="mt-3 flex items-center justify-between">
                                 <div className={`flex items-center text-[10px] font-bold ${
                                     news.sentiment === 'POSITIVE' ? 'text-emerald-600 dark:text-emerald-400' : 
                                     news.sentiment === 'NEGATIVE' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
                                 }`}>
                                     {news.sentiment === 'POSITIVE' ? <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> : 
                                      news.sentiment === 'NEGATIVE' ? <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> : <Newspaper className="w-3.5 h-3.5 mr-1.5" />}
                                     {news.sentiment}
                                 </div>
                                 <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                             </div>
                         </div>
                     ))}
                 </div>
             </>
         )}
      </div>
    </div>
  );
};

export default MarketNews;