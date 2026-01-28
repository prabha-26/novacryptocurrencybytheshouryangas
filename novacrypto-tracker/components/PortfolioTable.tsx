import React from 'react';
import { PortfolioItem } from '../types';
import { Trash2, TrendingUp, TrendingDown, PlusCircle, MinusCircle, Landmark } from 'lucide-react';
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
    <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-[2rem] overflow-hidden shadow-xl transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/50 dark:bg-black/20 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-white/20 dark:border-white/5">
              <th className="p-5 pl-6">Asset</th>
              <th className="p-5 text-right">Price</th>
              <th className="p-5 text-right">Balance</th>
              <th className="p-5 text-right">Value</th>
              <th className="p-5 text-right">Avg. Buy</th>
              <th className="p-5 text-right">Profit / Loss</th>
              <th className="p-5 text-center pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/20 dark:divide-white/5 text-sm">
            {/* CASH ROW (Pinned Top) */}
             <tr className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors bg-white/20 dark:bg-white/5 font-medium">
                <td className="p-5 pl-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mr-4 text-slate-500 backdrop-blur-sm">
                         <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base">Wallet</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wide">CASH</div>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-right text-slate-500 dark:text-slate-400">1.00</td>
                <td className="p-5 text-right">
                  <div className="text-slate-600 dark:text-slate-200 font-mono">{currencySymbol}{convertedFiatBalance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </td>
                <td className="p-5 text-right text-slate-900 dark:text-white font-bold text-base">
                  <PriceTicker value={convertedFiatBalance} currencySymbol={currencySymbol} />
                </td>
                <td className="p-5 text-right text-slate-500 dark:text-slate-400">-</td>
                <td className="p-5 text-right text-slate-500 dark:text-slate-400">-</td>
                <td className="p-5 text-center pr-6">
                    <button 
                        onClick={onOpenBanking}
                        className="px-4 py-2 bg-slate-900/5 dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 border border-slate-900/5 dark:border-white/5 rounded-xl text-xs font-bold transition-all"
                    >
                        Manage
                    </button>
                </td>
             </tr>

            {items.length === 0 ? (
                <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-500">
                        <p className="mb-2">Your crypto portfolio is empty.</p>
                        <p className="text-xs opacity-70">Use your cash balance to buy assets.</p>
                    </td>
                </tr>
            ) : items.map((item, index) => (
              <tr 
                key={item.id} 
                className="hover:bg-white/40 dark:hover:bg-white/5 transition-colors group animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="p-5 pl-6">
                  <div className="flex items-center">
                    <CryptoCoin 
                        image={item.coinData.image} 
                        symbol={item.coinData.symbol} 
                        size={40} 
                        interactive 
                        className="mr-4" 
                        animation="none"
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-base">{item.coinData.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-wide">{item.coinData.symbol.toUpperCase()}</div>
                    </div>
                  </div>
                </td>
                <td className="p-5 text-right text-slate-700 dark:text-slate-300 font-medium">
                  <PriceTicker value={item.coinData.current_price} currencySymbol={currencySymbol} />
                </td>
                <td className="p-5 text-right">
                  <div className="text-slate-600 dark:text-slate-300 font-mono">{item.amount.toLocaleString()} {item.coinData.symbol.toUpperCase()}</div>
                </td>
                <td className="p-5 text-right text-slate-900 dark:text-white font-bold text-base">
                  <PriceTicker value={item.currentValue} currencySymbol={currencySymbol} />
                </td>
                <td className="p-5 text-right text-slate-500 dark:text-slate-400 font-mono text-xs">
                  {currencySymbol}{item.avgBuyPrice.toLocaleString()}
                </td>
                <td className="p-5 text-right">
                  <div className={`flex items-center justify-end font-bold ${item.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {item.profit >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-1.5" />}
                    {item.profitPercentage.toFixed(2)}%
                  </div>
                  <div className={`text-xs font-medium mt-0.5 ${item.profit >= 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'}`}>
                    {item.profit >= 0 ? '+' : ''}
                    <PriceTicker value={item.profit} currencySymbol={currencySymbol} fractionDigits={0} className={item.profit >= 0 ? 'text-emerald-600/70 dark:text-emerald-400/70' : 'text-red-600/70 dark:text-red-400/70'} />
                  </div>
                </td>
                <td className="p-5 text-center pr-6">
                   <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                            onClick={() => onTrade('BUY', item.coinId)}
                            title="Quick Buy"
                            className="p-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-lg transition-all backdrop-blur-md border border-emerald-500/20"
                        >
                            <PlusCircle className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => onTrade('SELL', item.coinId)}
                            title="Quick Sell"
                            className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-600 hover:text-white rounded-lg transition-all backdrop-blur-md border border-blue-500/20"
                        >
                            <MinusCircle className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-slate-300/50 dark:bg-slate-700/50 mx-2"></div>
                        <button 
                            onClick={() => onDelete(item.id)}
                            title="Delete Asset"
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
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