import React, { useState, useEffect, useRef } from 'react';
import { CoinData, PortfolioItem } from '../types';
import { X, Check, ArrowUpRight, ArrowDownLeft, Wallet, RefreshCw, Calculator, Globe, AlertTriangle } from 'lucide-react';
import { CURRENCY_CONFIG, EXCHANGE_RATES } from '../constants';
import CryptoCoin from './CryptoCoin';
import PriceTicker from './PriceTicker';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: CoinData[];
  portfolioItems: PortfolioItem[];
  onTrade: (type: 'BUY' | 'SELL', coinId: string, amount: number, priceInUsd: number) => void;
  initialCoinId?: string;
  initialMode?: 'BUY' | 'SELL';
  globalCurrencyCode: string;
  userBalance: number; 
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ 
  isOpen, 
  onClose, 
  coins, 
  portfolioItems,
  onTrade,
  initialCoinId,
  initialMode = 'BUY',
  globalCurrencyCode,
  userBalance
}) => {
  const [mode, setMode] = useState<'BUY' | 'SELL'>(initialMode);
  const [selectedCoinId, setSelectedCoinId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [useMarketPrice, setUseMarketPrice] = useState(true);
  
  const [transactionCurrency, setTransactionCurrency] = useState<string>(globalCurrencyCode);
  const [isSuccess, setIsSuccess] = useState(false);

  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
        setMode(initialMode);
        setSelectedCoinId(initialCoinId || (coins.length > 0 ? coins[0].id : ''));
        setAmount('');
        setCustomPrice('');
        setUseMarketPrice(true);
        setTransactionCurrency(globalCurrencyCode);
        setIsSuccess(false);
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialCoinId, initialMode, globalCurrencyCode]); 

  useEffect(() => {
    if (isOpen && !selectedCoinId && coins.length > 0) {
        setSelectedCoinId(coins[0].id);
    }
  }, [coins, isOpen, selectedCoinId]);

  const selectedCoin = coins.find(c => c.id === selectedCoinId);
  const currentHolding = portfolioItems.find(p => p.coinId === selectedCoinId);
  
  const globalRate = EXCHANGE_RATES[globalCurrencyCode] || 1;
  const transactionRate = EXCHANGE_RATES[transactionCurrency] || 1;
  const transactionSymbol = CURRENCY_CONFIG[transactionCurrency]?.symbol || '$';

  const coinPriceGlobal = selectedCoin?.current_price || 0;
  const coinPriceUSD = coinPriceGlobal / globalRate;
  const coinPriceTransaction = coinPriceUSD * transactionRate;

  const displayPrice = useMarketPrice ? coinPriceTransaction : (parseFloat(customPrice) || 0);
  const totalValue = (parseFloat(amount) || 0) * displayPrice;
  
  const totalValueUSD = totalValue / transactionRate;

  const insufficientFunds = mode === 'BUY' && totalValueUSD > userBalance;
  const insufficientHoldings = mode === 'SELL' && currentHolding && parseFloat(amount) > currentHolding.amount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (insufficientFunds) return;

    if (selectedCoinId && amount && displayPrice > 0) {
        setIsSuccess(true);
        
        const finalPriceInUsd = displayPrice / transactionRate;

        setTimeout(() => {
            onTrade(mode, selectedCoinId, parseFloat(amount), finalPriceInUsd);
            onClose();
        }, 1500);
    }
  };

  const handleMaxClick = () => {
    if (mode === 'SELL' && currentHolding) {
        setAmount(currentHolding.amount.toString());
    } else if (mode === 'BUY') {
        const maxAmount = (userBalance * transactionRate) / displayPrice;
        // Avoid practically infinite numbers if price is 0 (though unlikely)
        setAmount(maxAmount && isFinite(maxAmount) ? maxAmount.toFixed(6) : '0');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative">
        
        {/* Success Overlay */}
        {isSuccess && (
            <div className="absolute inset-0 z-20 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center animate-in fade-in duration-300 backdrop-blur-md">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                    <CryptoCoin 
                        symbol={selectedCoin?.symbol || 'GENERIC'} 
                        size={100} 
                        animation="success" 
                    />
                </div>
                <h3 className="text-3xl font-black mt-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                    Success!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium animate-in slide-in-from-bottom-4 duration-500 delay-200">
                    Transaction processed instantly.
                </p>
            </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Transaction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Update your portfolio holdings</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/30">
            {/* Buy/Sell Toggles */}
            <div className="flex p-6 gap-4">
                <button 
                    onClick={() => setMode('BUY')}
                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 border ${
                        mode === 'BUY' 
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30 scale-[1.02]' 
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:scale-[1.01]'
                    }`}
                >
                    <ArrowDownLeft className="w-5 h-5 mr-2" /> Buy
                </button>
                <button 
                    onClick={() => setMode('SELL')}
                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 border ${
                        mode === 'SELL' 
                        ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30 scale-[1.02]' 
                        : 'bg-white/50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:scale-[1.01]'
                    }`}
                >
                    <ArrowUpRight className="w-5 h-5 mr-2" /> Sell
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-6">
            
            {/* Asset Selection */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-2">Select Asset</label>
                <div className="relative group">
                    <div className="absolute left-4 top-4 pointer-events-none z-10">
                        {selectedCoin && (
                            <img src={selectedCoin.image} alt="icon" className="w-6 h-6 rounded-full shadow-sm" />
                        )}
                    </div>
                    <select 
                        value={selectedCoinId}
                        onChange={(e) => setSelectedCoinId(e.target.value)}
                        className="w-full bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-4 pl-12 pr-10 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer hover:bg-white/80 dark:hover:bg-slate-800/80 backdrop-blur-sm shadow-sm"
                    >
                        {coins.map(coin => (
                            <option key={coin.id} value={coin.id} className="bg-white dark:bg-slate-900">
                                {coin.name} ({coin.symbol.toUpperCase()})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-5 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
            </div>

            {/* Price Input & Currency Selector */}
            <div className="bg-slate-50/60 dark:bg-slate-800/30 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-700/30 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price per Coin</label>
                    <button 
                        type="button"
                        onClick={() => setUseMarketPrice(!useMarketPrice)}
                        className="text-xs flex items-center text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors"
                    >
                        {useMarketPrice ? (
                            <>
                                <RefreshCw className="w-3 h-3 mr-1" /> Custom Price
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-3 h-3 mr-1" /> Market Price
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex gap-3">
                    {/* Currency Selector */}
                    <div className="relative w-1/3">
                        <div className="absolute left-3 top-4 text-slate-400 pointer-events-none">
                            <Globe className="w-4 h-4" />
                        </div>
                        <select
                            value={transactionCurrency}
                            onChange={(e) => setTransactionCurrency(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-9 pr-8 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {Object.keys(CURRENCY_CONFIG).map((code) => (
                                <option key={code} value={code} className="bg-white dark:bg-slate-900">
                                    {code.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-2 top-4.5 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>

                    {/* Amount Input */}
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-4 text-slate-400 font-bold">{transactionSymbol}</span>
                        <input 
                            type="number" 
                            step="any"
                            value={useMarketPrice ? displayPrice : customPrice}
                            onChange={(e) => {
                                setCustomPrice(e.target.value);
                                setUseMarketPrice(false);
                            }}
                            disabled={useMarketPrice}
                            className={`w-full bg-white dark:bg-slate-900 border ${useMarketPrice ? 'border-slate-200 dark:border-slate-700 text-slate-500' : 'border-indigo-500 text-slate-900 dark:text-white ring-2 ring-indigo-500/20'} rounded-2xl py-3.5 pl-8 pr-4 font-bold focus:outline-none transition-all shadow-sm tabular-nums`}
                        />
                    </div>
                </div>
                
                {useMarketPrice && (
                    <div className="flex items-center text-xs text-emerald-500 font-bold px-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                        Live {transactionCurrency.toUpperCase()} Market Rate
                    </div>
                )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
                 <div className="flex justify-between items-center px-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</label>
                    <div className="flex items-center space-x-2">
                        {mode === 'SELL' && currentHolding && (
                            <div className="text-xs text-slate-500 font-medium">
                                Available: <span className="font-mono font-bold text-slate-900 dark:text-white tabular-nums">{currentHolding.amount} {selectedCoin?.symbol.toUpperCase()}</span>
                            </div>
                        )}
                         {mode === 'BUY' && (
                            <div className="text-xs text-slate-500 font-medium">
                                Wallet: <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    <PriceTicker value={userBalance * transactionRate} currencySymbol={transactionSymbol} />
                                </span>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 <div className="relative">
                    <input 
                        type="number" 
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-5 pl-5 pr-20 font-black text-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner tabular-nums"
                        autoFocus
                    />
                    <div className="absolute right-3 top-3 bottom-3 flex items-center space-x-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl px-3 border border-slate-200 dark:border-slate-600">
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{selectedCoin?.symbol.toUpperCase()}</span>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1"></div>
                        <button 
                        type="button"
                        onClick={handleMaxClick}
                        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:text-indigo-700 transition-colors"
                        >
                        MAX
                        </button>
                    </div>
                 </div>
                 {insufficientFunds && (
                    <div className="text-xs text-red-500 flex items-center animate-pulse px-1 font-bold">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Insufficient funds in wallet
                    </div>
                 )}
            </div>

            {/* Total Summary */}
            <div className={`rounded-2xl p-6 border backdrop-blur-md transition-all duration-300 ${mode === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center justify-between mb-1 overflow-hidden">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide shrink-0 mr-4">Estimated Total</span>
                    <span className={`text-2xl sm:text-3xl font-black tracking-tight truncate tabular-nums ${mode === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} title={`${transactionSymbol}${totalValue.toLocaleString()}`}>
                        {transactionSymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex items-center justify-end text-xs opacity-60 font-medium">
                    <Wallet className="w-3 h-3 mr-1" />
                    {mode === 'BUY' ? 'Spending from Wallet' : 'Adding to Wallet'}
                </div>
            </div>

            <button 
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0 || insufficientFunds || insufficientHoldings}
                className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                    mode === 'BUY' 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/30' 
                    : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 shadow-red-500/30'
                }`}
            >
                {mode === 'BUY' ? <Check className="w-6 h-6 mr-2" /> : <Calculator className="w-6 h-6 mr-2" />}
                {mode === 'BUY' ? 'Confirm Purchase' : 'Confirm Sale'}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddAssetModal;