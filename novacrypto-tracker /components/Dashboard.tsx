import React, { useMemo, useState } from 'react';
import { PortfolioStats, PortfolioItem, UserProfile, CoinData } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, Landmark, TrendingUp, TrendingDown, Calendar, PieChart as PieIcon, Coins, Briefcase, ChevronRight, Layers, Activity, Lock, Unlock, Sparkles, Zap, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Sector, ReferenceLine } from 'recharts';
import CryptoCoin from './CryptoCoin';
import PriceTicker from './PriceTicker';
import RecommendationFeed from './RecommendationFeed';
import NewsTicker from './NewsTicker';
import MarketNews from './MarketNews';
import ExpandableCard from './ExpandableCard';

interface DashboardProps {
  stats: PortfolioStats;
  portfolio: PortfolioItem[];
  currencySymbol: string;
  user: UserProfile | null;
  onOpenBanking: () => void;
  convertedFiatBalance: number;
  coins: CoinData[];
  onTrade: (type: 'BUY' | 'SELL', coinId: string) => void;
}

// Extended Brand Colors for Top Coins
const COIN_BRAND_COLORS: Record<string, string> = {
  BTC: '#F7931A',
  ETH: '#627EEA',
  SOL: '#14F195',
  BNB: '#F3BA2F',
  XRP: '#3B82F6',
  ADA: '#0033AD',
  AVAX: '#E84142',
  DOT: '#E6007A',
  DOGE: '#C2A633',
  TRX: '#EF0027',
  LINK: '#2A5ADA',
  MATIC: '#8247E5',
  SHIB: '#FFA409',
  LTC: '#345D9D',
  UNI: '#FF007A',
  USDC: '#2775CA',
  USDT: '#26A17B',
  DAI: '#F5AC37',
  BCH: '#8DC351',
  XLM: '#14B6E7',
  ATOM: '#2E3148',
  ETC: '#328332',
  FIL: '#0090FF',
  HBAR: '#00344A',
  LDO: '#F0865C',
  APT: '#32E6E1',
  ARB: '#2D374B',
  OP: '#FF0420',
  NEAR: '#000000',
  VET: '#15BDFF',
  ALGO: '#000000',
  QNT: '#000000',
  ICP: '#29B6F6',
  GRT: '#6747ED',
  FTM: '#1969FF',
  SAND: '#00ADEF',
  MANA: '#FF2D55',
  THETA: '#2AB8E6',
  AAVE: '#B6509E',
  EOS: '#000000',
  CAKE: '#D1884F',
  AXS: '#0055D5',
  FLOW: '#00EF8B',
  XTZ: '#2C7DF7',
  KCS: '#26A17B',
  MKR: '#1AAB9B',
  BSV: '#EAB300',
  RUNE: '#15D4D0',
  NEO: '#00E599',
  IOTA: '#1F1F1F',
  ZEC: '#F4B728',
  DASH: '#008DE4',
  MIOTA: '#1F1F1F',
  FIAT: '#64748b',
};

// Vibrant Neon Fallback Palette
const PALETTE = [
  '#FF3B30', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', 
  '#007AFF', '#5856D6', '#FF2D55', '#A2845E', '#8E8E93'
];

// Custom Render for Pie Chart Active Shape
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="filter drop-shadow-xl transition-all duration-300"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
        className="opacity-30"
      />
    </g>
  );
};

type TimeRange = '24H' | '7D' | '1M' | '1Y';

const Dashboard: React.FC<DashboardProps> = ({ stats, portfolio, currencySymbol, user, onOpenBanking, convertedFiatBalance, coins, onTrade }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  // --- Allocation Data Preparation ---
  const cryptoData = portfolio.map(item => {
    const symbol = item.coinData.symbol.toUpperCase();
    return {
      name: item.coinData.name,
      value: item.currentValue,
      symbol: symbol,
      color: COIN_BRAND_COLORS[symbol] || ''
    };
  }).sort((a, b) => b.value - a.value);

  let paletteIndex = 0;
  cryptoData.forEach((item) => {
      if (!item.color) {
          item.color = PALETTE[paletteIndex % PALETTE.length];
          paletteIndex++;
      }
  });

  const allocationData = [
    { name: 'Cash (Fiat)', value: convertedFiatBalance, symbol: 'FIAT', color: '#64748b' },
    ...cryptoData
  ];

  const netWorth = stats.totalBalance + convertedFiatBalance;
  const cryptoAllocation = netWorth > 0 ? (stats.totalBalance / netWorth) * 100 : 0;
  const cashAllocation = 100 - cryptoAllocation;

  // Stats Calculations
  const topAsset = allocationData.reduce((prev, current) => (prev.value > current.value) ? prev : current, allocationData[0]);
  const dominance = netWorth > 0 ? (topAsset.value / netWorth) * 100 : 0;
  const totalAssetsCount = portfolio.length + (convertedFiatBalance > 0 ? 1 : 0);

  // --- Historical Data Simulation ---
  const chartData = useMemo(() => {
    const now = Date.now();
    const msPerHour = 3600000;
    
    // Base 7D Data Calculation
    let baseData: { timestamp: number, value: number, dayLabel: string }[] = [];

    if (portfolio.length === 0) {
        baseData = Array(168).fill(0).map((_, i) => ({
            timestamp: now - ((168 - 1 - i) * msPerHour),
            value: convertedFiatBalance,
            dayLabel: ''
        }));
    } else {
        const validItems = portfolio.filter(item => item.coinData.sparkline_in_7d?.price && item.coinData.sparkline_in_7d.price.length > 0);
        if (validItems.length === 0) {
             baseData = Array(168).fill(0).map((_, i) => ({
                timestamp: now - ((168 - 1 - i) * msPerHour),
                value: convertedFiatBalance, // Fallback
                dayLabel: ''
            }));
        } else {
            const minLength = Math.min(...validItems.map(item => item.coinData.sparkline_in_7d!.price.length));
            baseData = Array(minLength).fill(0).map((_, idx) => {
                let totalValueAtPoint = convertedFiatBalance; 
                validItems.forEach(item => {
                    const prices = item.coinData.sparkline_in_7d!.price;
                    const priceIdx = prices.length - minLength + idx;
                    const priceAtPoint = prices[priceIdx];
                    totalValueAtPoint += item.amount * priceAtPoint;
                });
                
                // Real timestamp based on 7D window ending now
                const timeOffset = (minLength - 1 - idx) * msPerHour;
                const timestamp = now - timeOffset;

                return {
                    timestamp: timestamp,
                    value: totalValueAtPoint,
                    dayLabel: ''
                };
            });
        }
    }

    // Process based on Time Range
    let finalData = [];
    
    if (timeRange === '24H') {
        // Last 24 points
        finalData = baseData.slice(-24);
        // Format Labels
        finalData = finalData.map((d, i) => ({
            ...d,
            dayLabel: i % 6 === 0 ? new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
        }));
    } 
    else if (timeRange === '7D') {
        finalData = baseData;
        // Format Labels
        finalData = finalData.map((d, i) => ({
            ...d,
            dayLabel: i % 24 === 0 ? new Date(d.timestamp).toLocaleDateString(undefined, { weekday: 'short' }) : ''
        }));
    }
    else if (timeRange === '1M') {
        // Synthesize 3 more weeks prior to the 1 week of real data
        const startOfReal = baseData[0].value;
        const realStartTs = baseData[0].timestamp;
        
        const syntheticPoints = 24 * 23; // 23 days approx
        const syntheticData = [];
        let simValue = startOfReal;
        
        for (let i = 0; i < syntheticPoints; i++) {
            // Walk backwards
            const timeOffset = (i + 1) * msPerHour;
            // Random walk: +/- 0.5% per hour
            const volatility = 0.008;
            const change = simValue * (Math.random() * volatility - (volatility / 2));
            simValue -= change; // Reverse the change to go back in time
            
            syntheticData.unshift({
                timestamp: realStartTs - timeOffset,
                value: simValue,
                dayLabel: ''
            });
        }
        
        finalData = [...syntheticData, ...baseData];
        // Decimate for chart performance (take every 4th point)
        finalData = finalData.filter((_, i) => i % 4 === 0);
        
        finalData = finalData.map((d, i) => ({
            ...d,
            dayLabel: i % 24 === 0 ? new Date(d.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : ''
        }));
    }
    else if (timeRange === '1Y') {
        // Synthesize 51 more weeks
        const startOfReal = baseData[0].value;
        const realStartTs = baseData[0].timestamp;
        
        const syntheticPoints = 24 * 7 * 51; 
        const syntheticData = [];
        let simValue = startOfReal;
        
        // We can't generate hourly for a year, let's do daily
        const dailyPoints = 365 - 7;
        const msPerDay = 86400000;

        for (let i = 0; i < dailyPoints; i++) {
             const timeOffset = (i + 1) * msPerDay;
             const volatility = 0.02; // Higher daily volatility
             const change = simValue * (Math.random() * volatility - (volatility / 2));
             simValue -= change;

             syntheticData.unshift({
                 timestamp: realStartTs - timeOffset,
                 value: simValue,
                 dayLabel: ''
             });
        }

        // Downsample base data to daily roughly (take every 24th point)
        const dailyBase = baseData.filter((_, i) => i % 24 === 0);
        finalData = [...syntheticData, ...dailyBase];

        finalData = finalData.map((d, i) => ({
            ...d,
            dayLabel: i % 30 === 0 ? new Date(d.timestamp).toLocaleDateString(undefined, { month: 'short' }) : ''
        }));
    }

    return finalData;
  }, [portfolio, convertedFiatBalance, timeRange]);

  const startValue = chartData.length > 0 ? chartData[0].value : netWorth;
  const endValue = chartData.length > 0 ? chartData[chartData.length - 1].value : netWorth;
  const changeValue = endValue - startValue;
  const changePercent = startValue === 0 ? 0 : (changeValue / startValue) * 100;
  
  const isPositive = changeValue >= 0;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const pointChange = dataPoint.value - startValue;
      const pointPercent = startValue === 0 ? 0 : (pointChange / startValue) * 100;
      const isPointPos = pointChange >= 0;

      return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10 p-4 rounded-2xl shadow-2xl text-xs z-50 animate-in fade-in zoom-in-95 duration-200">
          <p className="font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {new Date(dataPoint.timestamp).toLocaleString(undefined, { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
              })}
          </p>
          <div className="flex flex-col space-y-1">
            <p className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                {currencySymbol}{dataPoint.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <div className={`flex items-center font-bold ${isPointPos ? 'text-emerald-500' : 'text-red-500'}`}>
                {isPointPos ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                {Math.abs(pointPercent).toFixed(2)}% <span className="text-slate-400 ml-1 font-medium">vs start</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      
      {/* 1. Breaking News Ticker - Enhanced Shadow */}
      <div className="rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/5 animate-in fade-in slide-in-from-top-4 duration-700 border border-slate-200/50 dark:border-slate-800/50">
        <NewsTicker />
      </div>

      {/* 2. KPI Cards Grid - Improved Spacing and Visuals */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Worth Card - Premium Mesh Gradient */}
        <ExpandableCard delay={0} className="p-0 border-0 bg-transparent shadow-none rounded-[2.5rem]">
            {() => (
                <div className="relative overflow-hidden group rounded-[2.5rem] p-[1px] bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 shadow-[0_10px_40px_-10px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.5)] h-full">
                    {/* Inner Content */}
                    <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-3xl rounded-[2.5rem]"></div>
                    
                    {/* Dynamic Blobs */}
                    <div className="absolute top-[-50%] right-[-20%] w-64 h-64 bg-indigo-500/40 rounded-full blur-[80px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[-30%] left-[-20%] w-64 h-64 bg-pink-500/40 rounded-full blur-[80px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>

                    <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-inner">
                                        <Briefcase className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-white/90 text-sm font-bold tracking-widest uppercase">NET WORTH</p>
                                </div>
                                <div className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/20 uppercase tracking-widest backdrop-blur-md">
                                    Total Wealth
                                </div>
                            </div>
                            
                            <h3 className="text-4xl lg:text-5xl font-black tracking-tighter text-white drop-shadow-xl mb-2 break-all">
                                <PriceTicker value={netWorth} currencySymbol={currencySymbol} className="text-white dark:text-white" />
                            </h3>
                            
                            {/* Breakdown */}
                            <div className="flex items-center space-x-4 text-indigo-100 text-xs font-medium mt-4 bg-black/20 p-3 rounded-2xl backdrop-blur-sm border border-white/10 w-fit">
                                 <div className="flex items-center">
                                    <Coins className="w-3.5 h-3.5 mr-2 opacity-80" />
                                    <span className="opacity-60 mr-1">Crypto:</span>
                                    <PriceTicker value={stats.totalBalance} currencySymbol={currencySymbol} fractionDigits={0} className="text-white font-bold" />
                                 </div>
                                 <div className="w-px h-3 bg-white/20"></div>
                                 <div className="flex items-center">
                                    <Wallet className="w-3.5 h-3.5 mr-2 opacity-80" />
                                    <span className="opacity-60 mr-1">Cash:</span>
                                    <PriceTicker value={convertedFiatBalance} currencySymbol={currencySymbol} fractionDigits={0} className="text-white font-bold" />
                                 </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="flex justify-between text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">
                                <span>Portfolio Distribution</span>
                                <span>{cryptoAllocation.toFixed(0)}% Crypto</span>
                            </div>
                            <div className="h-2.5 w-full bg-black/30 rounded-full overflow-hidden flex shadow-inner backdrop-blur-sm border border-white/5">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" style={{ width: `${cryptoAllocation}%` }}></div>
                                <div className="h-full bg-white/10" style={{ width: `${cashAllocation}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </ExpandableCard>

        {/* Wallet - Glassmorphic Light */}
        <ExpandableCard delay={100} className="hover:-translate-y-1 hover:shadow-lg transition-all rounded-[2.5rem]">
          {() => (
            <div className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="absolute top-8 right-8 p-3 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                    <Landmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                        <Wallet className="w-3.5 h-3.5 mr-2 opacity-60" /> Cash Balance
                    </p>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2 break-all">
                        <PriceTicker value={convertedFiatBalance} currencySymbol={currencySymbol} />
                    </h3>
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); onOpenBanking(); }}
                    className="mt-6 w-full py-4 rounded-xl bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 border border-slate-900/5 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center group uppercase tracking-wider backdrop-blur-md"
                >
                    Manage Funds <ArrowUpRight className="w-3 h-3 ml-2 opacity-50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
            </div>
          )}
        </ExpandableCard>

        {/* Crypto Holdings - Glassmorphic Dark */}
        <ExpandableCard delay={200} className="hover:-translate-y-1 hover:shadow-lg transition-all rounded-[2.5rem]">
          {() => (
            <div className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-8 right-8 animate-pulse">
                    <CryptoCoin symbol="BTC" animation="float" size={56} />
                </div>
                <div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center">
                         <Layers className="w-3.5 h-3.5 mr-2 opacity-60" /> Crypto Value
                    </p>
                    <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 break-all">
                        <PriceTicker value={stats.totalBalance} currencySymbol={currencySymbol} />
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border backdrop-blur-md ${
                            stats.totalProfit >= 0 
                            ? 'bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/5 text-red-600 dark:text-red-400 border-red-500/20'
                        }`}>
                            {stats.totalProfit >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1.5" />}
                            <span className="mr-1">{stats.totalProfit >= 0 ? 'Profit:' : 'Loss:'}</span>
                            <PriceTicker value={Math.abs(stats.totalProfit)} currencySymbol={currencySymbol} className="mr-1" />
                        </div>
                    </div>
                </div>
            </div>
          )}
        </ExpandableCard>

        {/* Top Performer - Highlight Card */}
        <ExpandableCard delay={300} className="hover:-translate-y-1 hover:shadow-lg transition-all rounded-[2.5rem] bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/10">
           {() => (
            <div className="p-8 h-full flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start">
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-500" /> Top Mover
                        </p>
                        <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
                            <TrendingUp className="w-5 h-5 text-amber-500" />
                        </div>
                    </div>
                    {stats.bestPerformer ? (
                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="p-1 bg-white dark:bg-slate-800 rounded-full shadow-md">
                                    <CryptoCoin 
                                        image={stats.bestPerformer.coinData.image} 
                                        symbol={stats.bestPerformer.coinData.symbol}
                                        size={48}
                                        interactive
                                        animation="none"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">{stats.bestPerformer.coinData.name}</h3>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest">{stats.bestPerformer.coinData.symbol.toUpperCase()}</span>
                                </div>
                            </div>
                            <p className="text-4xl font-black text-emerald-500 dark:text-emerald-400 flex items-center tracking-tighter truncate drop-shadow-sm">
                                +{stats.bestPerformer.profitPercentage.toFixed(2)}%
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-20 text-slate-400 text-xs font-bold uppercase tracking-widest">No Data Available</div>
                    )}
            </div>
           )}
        </ExpandableCard>
      </div>

      {/* 3. Main Grid Section - Allocation / Signals / Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* Column 1: Market News & Allocation */}
         <div className="lg:col-span-1 space-y-6 flex flex-col">
            {/* Allocation - REDESIGNED */}
            <ExpandableCard className="h-[480px] rounded-[2.5rem]" delay={400}>
                {({ isExpanded }) => (
                    <div className={`p-8 h-full flex flex-col`}>
                        <div className="flex items-center justify-between mb-4">
                             <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
                                    <PieIcon className="w-4 h-4 mr-2 text-indigo-500" /> Asset Allocation
                                </h3>
                                <p className="text-[10px] text-slate-500 mt-1 pl-6">Value Distribution</p>
                             </div>
                        </div>

                        <div className="flex-1 flex flex-col relative">
                            {/* Donut Chart with Center Text */}
                            <div className="flex-1 min-h-[220px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={allocationData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={isExpanded ? 85 : 70}
                                            outerRadius={isExpanded ? 110 : 90}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            onMouseEnter={onPieEnter}
                                            animationDuration={1500}
                                            animationBegin={200}
                                        >
                                            {allocationData.map((entry, index) => (
                                                <Cell 
                                                  key={`cell-${index}`} 
                                                  fill={entry.color} 
                                                  className="stroke-transparent outline-none"
                                                  style={{ filter: `drop-shadow(0px 0px 8px ${entry.color}50)` }}
                                                />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                
                                {/* Center Stats Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">
                                        {totalAssetsCount}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                        Assets
                                    </span>
                                </div>
                            </div>

                            {/* Summary Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mt-4 mb-4">
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Top Holding</span>
                                    <span className="text-xs font-black text-slate-900 dark:text-white block truncate px-2">{topAsset.name}</span>
                                    <span className="text-[10px] text-indigo-500 font-bold block">{dominance.toFixed(1)}%</span>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl text-center border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                                    <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">Exposure</span>
                                    <div className="flex items-center justify-center space-x-2">
                                        <span className="text-[10px] font-black text-emerald-500">{cryptoAllocation.toFixed(0)}% Crypto</span>
                                        <span className="text-[10px] font-black text-slate-300">|</span>
                                        <span className="text-[10px] font-black text-indigo-500">{cashAllocation.toFixed(0)}% Cash</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                                        <div className="h-full bg-emerald-500" style={{ width: `${cryptoAllocation}%` }}></div>
                                        <div className="h-full bg-indigo-500" style={{ width: `${cashAllocation}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Legend List */}
                            <div className="space-y-2 h-[120px] overflow-y-auto custom-scrollbar pr-2">
                                {allocationData.map((item, idx) => {
                                    const percent = netWorth > 0 ? (item.value / netWorth) * 100 : 0;
                                    const isActive = activeIndex === idx;
                                    
                                    return (
                                        <div 
                                          key={item.name} 
                                          className={`flex items-center justify-between p-2 px-3 rounded-xl text-xs transition-all cursor-default border border-transparent ${isActive ? 'bg-white dark:bg-slate-700/60 shadow-md border-slate-100 dark:border-slate-600 scale-[1.02]' : 'hover:bg-white/50 dark:hover:bg-slate-800/30'}`} 
                                          onMouseEnter={() => setActiveIndex(idx)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-2 h-8 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                                <span className={`font-bold ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="text-right flex items-center space-x-3">
                                                 <PriceTicker value={item.value} currencySymbol={currencySymbol} fractionDigits={0} className="text-[10px] text-slate-500 font-medium" />
                                                 <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-lg text-[10px] border border-slate-200 dark:border-slate-600">
                                                    {percent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </ExpandableCard>

            {/* Market News */}
            <ExpandableCard className="h-[400px] rounded-[2.5rem]" delay={400}>
                {({ isExpanded }) => (
                     <MarketNews isExpanded={isExpanded} portfolio={portfolio} />
                )}
            </ExpandableCard>
         </div>

         {/* Column 2: Volume Signals */}
         <div className="lg:col-span-1 h-full max-h-[904px]">
             <ExpandableCard className="h-full p-6 rounded-[2.5rem]" delay={400}>
                {({ isExpanded }) => (
                     <RecommendationFeed 
                        coins={coins} 
                        currencySymbol={currencySymbol} 
                        onTrade={onTrade}
                        isExpanded={isExpanded}
                     />
                )}
             </ExpandableCard>
         </div>

         {/* Column 3: Performance Chart - Enhanced Visuals */}
         <div className="lg:col-span-1 h-full max-h-[904px]">
             <ExpandableCard className="h-full p-8 flex flex-col rounded-[2.5rem]" delay={500}>
                {({ isExpanded }) => (
                    <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-indigo-500" /> Performance
                            </h3>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${timeRange === '7D' || timeRange === '24H' ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${timeRange === '7D' || timeRange === '24H' ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                </span>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                                    {timeRange === '7D' || timeRange === '24H' ? 'Live Data Stream' : 'Historical View'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Time Range Selector */}
                        <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                             {(['24H', '7D', '1M', '1Y'] as const).map(range => (
                                 <button 
                                    key={range} 
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                                        timeRange === range 
                                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                 >
                                     {range}
                                 </button>
                             ))}
                        </div>
                    </div>
                    
                    <div className="flex items-baseline justify-between mb-4">
                        <div>
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Period Change</span>
                            <div className={`text-2xl font-black flex items-center mt-1 ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                                {isPositive ? <ArrowUpRight className="w-5 h-5 mr-1" /> : <ArrowDownRight className="w-5 h-5 mr-1" />}
                                {Math.abs(changePercent).toFixed(2)}%
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${
                            isPositive 
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                        }`}>
                            {isPositive ? `+${currencySymbol}${changeValue.toLocaleString(undefined, {maximumFractionDigits: 0})}` : `-${currencySymbol}${Math.abs(changeValue).toLocaleString(undefined, {maximumFractionDigits: 0})}`}
                        </div>
                    </div>

                    <div className="flex-1 min-h-0 w-full relative">
                        {/* Gradient Background behind chart */}
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent dark:from-emerald-500/10 rounded-2xl pointer-events-none"></div>

                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.4}/>
                                        <stop offset="60%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" vertical={false} horizontal={true} />
                                <ReferenceLine y={startValue} stroke="rgba(148, 163, 184, 0.5)" strokeDasharray="4 4" label={{ value: 'Start', position: 'insideLeft', fontSize: 10, fill: 'gray' }} />
                                <XAxis 
                                    dataKey="dayLabel" 
                                    stroke="rgba(148, 163, 184, 0.4)" 
                                    tick={{fontSize: 9, fill: 'rgba(148, 163, 184, 0.6)', fontWeight: 600}} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                    interval="preserveStartEnd"
                                    minTickGap={30}
                                />
                                <YAxis 
                                    hide={!isExpanded}
                                    stroke="rgba(148, 163, 184, 0.4)" 
                                    tick={{fontSize: 10, fill: 'rgba(148, 163, 184, 0.6)', fontWeight: 600}} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `${(value/1000).toFixed(0)}k`} 
                                    dx={-10}
                                    domain={['auto', 'auto']}
                                    width={40}
                                />
                                <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(148, 163, 184, 0.4)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke={isPositive ? "#10b981" : "#ef4444"} 
                                    strokeWidth={3} 
                                    fill="url(#colorValue)" 
                                    animationDuration={1500}
                                    animationEasing="cubic-bezier(0.4, 0, 0.2, 1)"
                                    activeDot={{ r: 6, strokeWidth: 0, fill: isPositive ? "#10b981" : "#ef4444", stroke: "#fff" }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    </>
                )}
             </ExpandableCard>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;