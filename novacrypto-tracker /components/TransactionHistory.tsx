import React from 'react';
import { Transaction, CoinData } from '../types';
import { ArrowDownLeft, ArrowUpRight, Clock, Download, FileText, Coins, Landmark, ArrowDown, ArrowUp } from 'lucide-react';
import CryptoCoin from './CryptoCoin';

interface TransactionHistoryProps {
  transactions: Transaction[];
  coins: CoinData[];
  currencySymbol: string;
  exchangeRate?: number;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, coins, currencySymbol, exchangeRate = 1 }) => {
  
  const getCoinImage = (coinId?: string) => {
    if (!coinId) return undefined;
    const coin = coins.find(c => c.id === coinId);
    return coin?.image;
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    // Define Headers
    const headers = ['Date', 'Time', 'Type', 'Asset Name', 'Symbol', 'Amount', `Price (${currencySymbol})`, `Total Value (${currencySymbol})`];
    
    // Format Rows
    const rows = transactions.map(tx => {
      const dateObj = new Date(tx.date);
      const convertedPrice = (tx.pricePerCoin || 0) * exchangeRate;
      const convertedTotal = tx.totalValue * exchangeRate;
      
      let typeLabel = 'BUY';
      if (tx.type === 'REMOVE') typeLabel = 'SELL';
      if (tx.type === 'DEPOSIT') typeLabel = 'DEPOSIT';
      if (tx.type === 'WITHDRAW') typeLabel = 'WITHDRAW';

      return [
        dateObj.toLocaleDateString(),
        dateObj.toLocaleTimeString(),
        typeLabel,
        `"${tx.coinName || 'USD'}"`,
        (tx.coinSymbol || 'USD').toUpperCase(),
        tx.amount.toString(),
        convertedPrice.toFixed(2),
        convertedTotal.toFixed(2)
      ].join(',');
    });

    // Combine and Create Blob
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Trigger Download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `novacrypto_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeIcon = (type: string) => {
      switch(type) {
          case 'ADD': return <ArrowDownLeft className="w-3.5 h-3.5 mr-1.5" />;
          case 'REMOVE': return <ArrowUpRight className="w-3.5 h-3.5 mr-1.5" />;
          case 'DEPOSIT': return <ArrowDown className="w-3.5 h-3.5 mr-1.5" />;
          case 'WITHDRAW': return <ArrowUp className="w-3.5 h-3.5 mr-1.5" />;
          default: return null;
      }
  };

  const getTypeStyle = (type: string) => {
      switch(type) {
          case 'ADD': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
          case 'DEPOSIT': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
          case 'REMOVE': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
          case 'WITHDRAW': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
          default: return '';
      }
  };

  const getTypeLabel = (type: string) => {
      switch(type) {
          case 'ADD': return 'Buy';
          case 'REMOVE': return 'Sell';
          case 'DEPOSIT': return 'Deposit';
          case 'WITHDRAW': return 'Withdraw';
          default: return type;
      }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl transition-colors animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-white/20 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-slate-950/30 backdrop-blur-md">
            <div className="text-sm text-slate-500 dark:text-slate-400 font-bold flex items-center uppercase tracking-widest">
                <FileText className="w-4 h-4 mr-2 text-indigo-500" />
                {transactions.length} Records found
            </div>
            <button 
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export CSV</span>
            </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/50 dark:bg-black/20 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/20 dark:border-white/5">
                <th className="p-6 pl-8">Type</th>
                <th className="p-6">Asset Details</th>
                <th className="p-6 text-right">Amount</th>
                <th className="p-6 text-right">Price / Coin</th>
                <th className="p-6 text-right">Total Value</th>
                <th className="p-6 text-right pr-8">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-slate-200/50 dark:divide-slate-800/50 text-sm">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-20 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center w-full">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-100 dark:border-slate-800">
                        <Clock className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-lg font-bold mb-1">No transactions yet</p>
                    <p className="text-sm font-medium opacity-60">Add assets or funds to your portfolio to see history here.</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => {
                  const isBanking = tx.type === 'DEPOSIT' || tx.type === 'WITHDRAW';
                  const coinImage = getCoinImage(tx.coinId);
                  const displayPrice = (tx.pricePerCoin || 0) * exchangeRate;
                  const displayTotal = tx.totalValue * exchangeRate;
                  
                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 fill-mode-backwards group"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="p-6 pl-8">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide border backdrop-blur-md ${getTypeStyle(tx.type)}`}>
                          {getTypeIcon(tx.type)}
                          {getTypeLabel(tx.type)}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center">
                            {isBanking ? (
                                <div className="w-10 h-10 rounded-full mr-4 bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 backdrop-blur-md shadow-sm">
                                    <Landmark className="w-5 h-5" />
                                </div>
                            ) : coinImage ? (
                                <CryptoCoin 
                                    image={coinImage} 
                                    symbol={tx.coinSymbol}
                                    size={40}
                                    interactive
                                    className="mr-4 group-hover:scale-110 transition-transform duration-300"
                                    animation="none"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full mr-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                    <Coins className="w-5 h-5" />
                                </div>
                            )}
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{isBanking ? (tx.type === 'DEPOSIT' ? 'Fiat Deposit' : 'Fiat Withdrawal') : tx.coinName}</div>
                                <div className="text-slate-500 dark:text-slate-500 text-[10px] font-black tracking-widest">{isBanking ? 'USD' : tx.coinSymbol?.toUpperCase()}</div>
                            </div>
                        </div>
                      </td>
                      <td className="p-6 text-right text-slate-700 dark:text-slate-300 font-mono font-medium">
                        {isBanking ? '-' : `${tx.amount.toLocaleString()} ${tx.coinSymbol?.toUpperCase()}`}
                      </td>
                      <td className="p-6 text-right text-slate-500 dark:text-slate-500 font-mono text-xs font-bold">
                         {isBanking ? '-' : `${currencySymbol}${displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                      </td>
                      <td className="p-6 text-right font-black text-slate-900 dark:text-white font-mono text-base tracking-tight">
                        {currencySymbol}{displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-6 text-right pr-8">
                        <div className="flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{new Date(tx.date).toLocaleDateString()}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-medium mt-0.5">{new Date(tx.date).toLocaleTimeString()}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;