import React from 'react';
import { PortfolioItem } from '../types';
import { Trash2, TrendingUp, TrendingDown, PlusCircle, MinusCircle, Landmark, MoreHorizontal, ArrowRight } from 'lucide-react';
import CryptoCoin from './CryptoCoin';
import PriceTicker from './PriceTicker';

interface PortfolioTableProps {
  items: PortfolioItem[];
  onDelete: (id: string) => void;
  onTrade: (type: 'BUY' | 'SELL', coinId: string) => void;
  currencySymbol: string;
  convertedFiatBalance: number; 
  onOpenBanking: () => void; 
}

const PortfolioTable: React.FC<PortfolioTableProps> = ({ items, onDelete, onTrade, currencySymbol, convertedFiatBalance, onOpenBanking }) => {
  return (
    <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 dark:bg-black/20 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 dark:border-white/5 backdrop-blur-md">
              <th className="p-6 pl-8">Asset</th>
              <th className="p-6 text-right">Price</th>
              <th className="p-6 text-right">Balance</th>
              <th className="p-6 text-right">Value</th>
              <th className="p-6 text-right">Avg. Buy</th>
              <th className="p-6 text-right">P/L 24h</th>
              <th className="p-6 text-center pr-8">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-slate-200/50 dark:divide-slate-800/50 text-sm">
            {/* CASH ROW (Pinned Top) */}
             <tr className="bg-gradient-to-r from-slate-50/50 to-transparent dark:from-slate-800/20 transition-colors group">
                <td className="p-6 pl-8">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mr-5 text-slate-400 border border-slate-100 dark:border-slate-700 shadow-sm group-hover:scale-105 transition-transform">
                         <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-lg">Wallet</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px] font-bold tracking-widest uppercase">Available Cash</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right text-slate-400 dark:text-slate-500 font-mono">1.00</td>
                <td className="p-6 text-right">
                  <div className="text-slate-500 dark:text-slate-400 font-mono font-medium">{currencySymbol}{convertedFiatBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </td>
                <td className="p-6 text-right text-slate-900 dark:text-white font-black text-lg tracking-tight">
                  <PriceTicker value={convertedFiatBalance} currencySymbol={currencySymbol} />
                </td>
                <td className="p-6 text-right text-slate-400 dark:text-slate-600">-</td>
                <td className="p-6 text-right text-slate-400 dark:text-slate-600">-</td>
                <td className="p-6 text-center pr-8">
                    <button 
                        onClick={onOpenBanking}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 flex items-center justify-center mx-auto"
                    >
                        Manage Funds <ArrowRight className="w-3 h-3 ml-2" />
                    </button>
                </td>
             </tr>

            {items.length === 0 ? (
                <tr>
                    <td colSpan={7} className="p-20 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <PlusCircle className="w-8 h-8 opacity-30" />
                            </div>
                            <p className="font-bold text-lg mb-1">Portfolio Empty</p>
                            <p className="text-xs font-medium opacity-60">Use your cash balance to acquire digital assets.</p>
                        </div>
                    </td>
                </tr>
            ) : items.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards cursor-default relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Hover Glow Bar */}
                <td className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></td>

                <td className="p-6 pl-8">
                  <div className="flex items-center">
                    <CryptoCoin 
                        image={item.coinData.image} 
                        symbol={item.coinData.symbol} 
                        size={48} 
                        interactive 
                        className="mr-5 group-hover:scale-110 transition-transform duration-300" 
                        animation="none"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.coinData.name}</div>
                      <div className="text-slate-400 dark:text-slate-500 text-[10px] font-black tracking-widest">{item.coinData.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="p-6 text-right text-slate-600 dark:text-slate-300 font-medium">
                  <PriceTicker value={item.coinData.current_price} currencySymbol={currencySymbol} />
                </td>
                <td className="p-6 text-right">
                  <div className="text-slate-500 dark:text-slate-400 font-mono font-medium">{item.amount.toLocaleString()} <span className="text-[10px] text-slate-300 dark:text-slate-600 font-bold">{item.coinData.symbol.toUpperCase()}</span></div>
                </td>
                <td className="p-6 text-right text-slate-900 dark:text-white font-black text-lg tracking-tight">
                  <PriceTicker value={item.currentValue} currencySymbol={currencySymbol} />
                </td>
                <td className="p-6 text-right text-slate-400 dark:text-slate-500 font-mono text-xs font-medium">
                  {currencySymbol}{item.avgBuyPrice.toLocaleString()}
                </td>
                <td className="p-6 text-right">
                  <div className={`flex items-center justify-end font-bold text-base ${item.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.profit >= 0 ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                    {item.profitPercentage.toFixed(2)}%
                  </div>
                  <div className={`text-[10px] font-black mt-1 uppercase tracking-wide opacity-60 ${item.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.profit >= 0 ? '+' : ''}
                    <PriceTicker value={item.profit} currencySymbol={currencySymbol} fractionDigits={0} className={item.profit >= 0 ? 'text-emerald-500' : 'text-red-500'} />
                  </div>
                </td>
                <td className="p-6 text-center pr-8">
                   <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                        <button 
                            onClick={() => onTrade('BUY', item.coinId)}
                            title="Quick Buy"
                            className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-xl transition-all border border-emerald-500/20 shadow-sm hover:shadow-emerald-500/30 active:scale-95"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onTrade('SELL', item.coinId)}
                            title="Quick Sell"
                            className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-sm hover:shadow-blue-500/30 active:scale-95"
                        >
                            <MinusCircle className="w-4 h-4" />
                        </button>
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <button 
                            onClick={() => onDelete(item.id)}
                            title="Delete Asset"
                            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-95"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioTable;