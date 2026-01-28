import React from 'react';
import { PortfolioStats, PortfolioItem, UserProfile } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, Landmark, Layers, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import CryptoCoin from './CryptoCoin';
import PriceTicker from './PriceTicker';

interface DashboardProps {
  stats: PortfolioStats;
  portfolio: PortfolioItem[];
  currencySymbol: string;
  user: UserProfile | null;
  onOpenBanking: () => void;
  convertedFiatBalance: number;
}

const COLORS = ['#64748b', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

const Dashboard: React.FC<DashboardProps> = ({ stats, portfolio, currencySymbol, user, onOpenBanking, convertedFiatBalance }) => {
  
  const cryptoData = portfolio.map(item => ({
    name: item.coinData.name,
    value: item.currentValue
  })).sort((a, b) => b.value - a.value);

  const allocationData = [
    { name: 'Cash (Fiat)', value: convertedFiatBalance },
    ...cryptoData
  ];

  const netWorth = stats.totalBalance + convertedFiatBalance;
  const cryptoAllocation = netWorth > 0 ? (stats.totalBalance / netWorth) * 100 : 0;

  const historicalData = [
    { day: 'Mon', value: netWorth * 0.92 },
    { day: 'Tue', value: netWorth * 0.94 },
    { day: 'Wed', value: netWorth * 0.91 },
    { day: 'Thu', value: netWorth * 0.95 },
    { day: 'Fri', value: netWorth * 0.98 },
    { day: 'Sat', value: netWorth * 0.99 },
    { day: 'Sun', value: netWorth },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-3 rounded-xl shadow-2xl text-xs animate-in fade-in zoom-in-95 duration-200">
          <p className="font-bold text-slate-900 dark:text-white mb-1">{`${payload[0].name}`}</p>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <p className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">{`${currencySymbol}${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}</p>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 pl-4">
             {((payload[0].value / netWorth) * 100).toFixed(1)}% of Portfolio
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Net Worth Card (Premium Glass Gradient) */}
        <div className="relative overflow-hidden group rounded-[2rem] p-[1px] bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: '0ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 dark:from-indigo-950/80 dark:to-slate-950/80 backdrop-blur-md rounded-[2rem]"></div>
          
          <div className="relative z-10 p-8 h-full flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
               <Layers className="w-24 h-24 text-white" />
            </div>
            
            <div>
                <div className="flex items-center space-x-2 mb-3">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                        <Layers className="w-4 h-4 text-indigo-300" />
                    </div>
                    <p className="text-indigo-200 text-sm font-semibold tracking-wide">NET WORTH</p>
                </div>
                <h3 className="text-2xl lg:text-3xl font-black tracking-tight text-white drop-shadow-lg mb-2 break-all" title={`${currencySymbol}${netWorth.toLocaleString()}`}>
                    <PriceTicker value={netWorth} currencySymbol={currencySymbol} className="text-white dark:text-white" />
                </h3>
                
                {/* PnL Display for Net Worth */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold backdrop-blur-md border shadow-sm ${
                        stats.totalProfit >= 0 
                        ? 'bg-emerald-500/20 text-emerald-50 border-emerald-500/30' 
                        : 'bg-red-500/20 text-red-50 border-red-500/30'
                    }`}>
                        {stats.totalProfit >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        <span className="mr-1">{stats.totalProfit >= 0 ? '+' : ''}</span>
                        <PriceTicker value={Math.abs(stats.totalProfit)} currencySymbol={currencySymbol} />
                        <span className="ml-1 opacity-90">({stats.totalProfitPercentage.toFixed(2)}%)</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto">
                <div className="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full" style={{ width: `${cryptoAllocation}%` }}></div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    <span>Crypto {cryptoAllocation.toFixed(0)}%</span>
                    <span>Cash {(100 - cryptoAllocation).toFixed(0)}%</span>
                </div>
            </div>
          </div>
        </div>

        {/* Wallet Card (Frosted Glass) */}
        <div className="relative rounded-[2rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-800/50 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: '100ms' }}>
          <div className="p-8 h-full flex flex-col justify-between">
              <div className="absolute top-6 right-6 p-2 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                 <Landmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              
              <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center">
                    <Wallet className="w-3.5 h-3.5 mr-2 opacity-70" /> Wallet
                  </p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight break-all">
                    <PriceTicker value={convertedFiatBalance} currencySymbol={currencySymbol} />
                  </h3>
              </div>
              
              <button 
                onClick={onOpenBanking}
                className="mt-6 w-full py-3 rounded-xl bg-slate-900/5 dark:bg-white/5 hover:bg-slate-900/10 dark:hover:bg-white/10 border border-slate-900/5 dark:border-white/5 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center group"
              >
                Manage Funds <ArrowUpRight className="w-3 h-3 ml-2 opacity-50 group-hover:translate-x-1 transition-transform" />
              </button>
          </div>
        </div>

        {/* Crypto Holdings Card (Frosted Glass) */}
        <div className="relative rounded-[2rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-800/50 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: '200ms' }}>
          <div className="p-8 h-full flex flex-col justify-between">
              <div className="absolute top-6 right-6">
                 <CryptoCoin symbol="BTC" animation="float" size={48} />
              </div>
              
              <div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Crypto Holdings</p>
                  <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 break-all">
                    <PriceTicker value={stats.totalBalance} currencySymbol={currencySymbol} />
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                      <div className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        stats.totalProfit >= 0 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {stats.totalProfit >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                        <span className="mr-1">{stats.totalProfit >= 0 ? '+' : ''}</span>
                        <PriceTicker value={Math.abs(stats.totalProfit)} currencySymbol={currencySymbol} className="mr-1" />
                        <span>({stats.totalProfitPercentage.toFixed(2)}%)</span>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* Top Performer Card (Frosted Glass) */}
        <div className="relative rounded-[2rem] bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 shadow-xl transition-all hover:bg-white/50 dark:hover:bg-slate-800/50 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards" style={{ animationDelay: '300ms' }}>
           <div className="p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">Top Asset</p>
                    <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                    </div>
                </div>

                {stats.bestPerformer ? (
                    <div>
                         <div className="flex items-center space-x-3 mb-3">
                             <CryptoCoin 
                                image={stats.bestPerformer.coinData.image} 
                                symbol={stats.bestPerformer.coinData.symbol}
                                size={40}
                                interactive
                                animation="none"
                            />
                            <div className="min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight truncate">{stats.bestPerformer.coinData.name}</h3>
                                <span className="text-[10px] font-black text-slate-400 tracking-widest">{stats.bestPerformer.coinData.symbol.toUpperCase()}</span>
                            </div>
                         </div>
                         <p className="text-3xl font-black text-emerald-500 dark:text-emerald-400 flex items-center tracking-tight truncate">
                            +{stats.bestPerformer.profitPercentage.toFixed(2)}%
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-20 text-slate-400 text-xs">No Data</div>
                )}
           </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
         
         {/* Allocation Chart (Glass) */}
         <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[2rem] lg:col-span-1 flex flex-col shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards" style={{ animationDelay: '400ms' }}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6">Allocation</h3>
            <div className="flex-1 min-h-0 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={allocationData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={6}
                            dataKey="value"
                            stroke="none"
                        >
                            {allocationData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-white/20 dark:stroke-slate-900/50 stroke-2 hover:opacity-80 transition-opacity" />
                            ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="text-center">
                         <span className="text-xs text-slate-400 font-bold block">TOTAL</span>
                         <span className="text-slate-900 dark:text-white font-black">{portfolio.length + (convertedFiatBalance > 0 ? 1 : 0)} Assets</span>
                     </div>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {allocationData.slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center px-2 py-1 bg-white/10 dark:bg-black/10 rounded-md border border-white/10">
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[80px]">{item.name}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* History Chart (Glass) */}
         <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 p-8 rounded-[2rem] lg:col-span-2 flex flex-col shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-8 duration-1000 fill-mode-backwards" style={{ animationDelay: '500ms' }}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Performance (7D)</h3>
                <div className="flex space-x-2">
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">+4.2%</span>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historicalData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" vertical={false} />
                        <XAxis 
                            dataKey="day" 
                            stroke="rgba(148, 163, 184, 0.5)" 
                            tick={{fontSize: 10, fill: 'rgba(148, 163, 184, 0.8)', fontWeight: 600}} 
                            tickLine={false} 
                            axisLine={false} 
                            dy={10}
                        />
                        <YAxis 
                            stroke="rgba(148, 163, 184, 0.5)" 
                            tick={{fontSize: 10, fill: 'rgba(148, 163, 184, 0.8)', fontWeight: 600}} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={(value) => `${currencySymbol}${value/1000}k`} 
                            dx={-10}
                        />
                        <RechartsTooltip content={<CustomTooltip />} />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 4, fill: '#fff' }} 
                            animationDuration={1500}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;