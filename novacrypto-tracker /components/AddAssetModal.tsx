import React, { useState, useEffect, useRef } from 'react';
import { CoinData, PortfolioItem } from '../types';
import { X, Check, ArrowUpRight, ArrowDownLeft, Wallet, RefreshCw, Calculator, Globe, AlertTriangle } from 'lucide-react';
import { CURRENCY_CONFIG, EXCHANGE_RATES } from '../constants';
import CryptoCoin from './CryptoCoin';
import PriceTicker from './PriceTicker';
import { playCoinSound } from '../services/soundService';

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
        // Trigger Sound Effect
        playCoinSound();
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
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/40 dark:border-white/10 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] relative ring-1 ring-white/10">
        
        {/* Success Overlay */}
        {isSuccess && (
            <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center animate-in fade-in duration-300 backdrop-blur-3xl">
                <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 blur-[80px] opacity-20 rounded-full animate-pulse"></div>
                    <CryptoCoin 
                        symbol={selectedCoin?.symbol || 'GENERIC'} 
                        size={120} 
                        animation="success" 
                    />
                </div>
                <h3 className="text-4xl font-black mt-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 animate-in slide-in-from-bottom-4 duration-500 delay-100 tracking-tight">
                    Success!
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium animate-in slide-in-from-bottom-4 duration-500 delay-200">
                    Transaction processed instantly.
                </p>
            </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10 backdrop-blur-md">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Transaction</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">Update Portfolio</p>
          </div>
          <button onClick={onClose} className="p-3 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 hover:rotate-90 duration-300">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50">
            {/* Buy/Sell Toggles */}
            <div className="flex p-6 gap-4">
                <button 
                    onClick={() => setMode('BUY')}
                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 border shadow-sm active:scale-95 ${
                        mode === 'BUY' 
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-transparent shadow-emerald-500/20 shadow-lg scale-[1.02]' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                    <ArrowDownLeft className="w-5 h-5 mr-2" /> Buy
                </button>
                <button 
                    onClick={() => setMode('SELL')}
                    className={`flex-1 py-4 px-4 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 border shadow-sm active:scale-95 ${
                        mode === 'SELL' 
                        ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-transparent shadow-red-500/20 shadow-lg scale-[1.02]' 
                        : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                >
                    <ArrowUpRight className="w-5 h-5 mr-2" /> Sell
                </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-8 space-y-8">
            
            {/* Asset Selection */}
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Select Asset</label>
                <div className="relative group">
                    <div className="absolute left-4 top-4 pointer-events-none z-10 transition-transform group-hover:scale-110 duration-200">
                        {selectedCoin && (
                            <img src={selectedCoin.image} alt="icon" className="w-8 h-8 rounded-full shadow-md" />
                        )}
                    </div>
                    <select 
                        value={selectedCoinId}
                        onChange={(e) => setSelectedCoinId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl py-5 pl-14 pr-10 font-bold focus:outline-none focus:ring-0 focus:border-indigo-500 transition-all appearance-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 shadow-sm"
                    >
                        {coins.map(coin => (
                            <option key={coin.id} value={coin.id} className="bg-white dark:bg-slate-900">
                                {coin.name} ({coin.symbol.toUpperCase()})
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-5 top-6 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
            </div>

            {/* Price Input & Currency Selector */}
            <div className="bg-slate-50/80 dark:bg-slate-800/40 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Price per Coin</label>
                    <button 
                        type="button"
                        onClick={() => setUseMarketPrice(!useMarketPrice)}
                        className="text-[10px] flex items-center text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-colors uppercase tracking-wide bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg border border-indigo-500/10"
                    >
                        {useMarketPrice ? (
                            <>
                                <RefreshCw className="w-3 h-3 mr-1.5" /> Market Price
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-3 h-3 mr-1.5" /> Custom Price
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex gap-3">
                    {/* Currency Selector */}
                    <div className="relative w-1/3">
                        <div className="absolute left-4 top-4 text-slate-400 pointer-events-none">
                            <Globe className="w-4 h-4" />
                        </div>
                        <select
                            value={transactionCurrency}
                            onChange={(e) => setTransactionCurrency(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl py-3.5 pl-10 pr-8 font-bold text-sm focus:outline-none focus:border-indigo-500 appearance-none cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {Object.keys(CURRENCY_CONFIG).map((code) => (
                                <option key={code} value={code} className="bg-white dark:bg-slate-900">
                                    {code.toUpperCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-5 pointer-events-none text-slate-400 text-xs">▼</div>
                    </div>

                    {/* Amount Input */}
                    <div className="relative flex-1">
                        <span className="absolute left-4 top-4 text-slate-400 font-bold text-sm">{transactionSymbol}</span>
                        <input 
                            type="number" 
                            step="any"
                            value={useMarketPrice ? displayPrice : customPrice}
                            onChange={(e) => {
                                setCustomPrice(e.target.value);
                                setUseMarketPrice(false);
                            }}
                            disabled={useMarketPrice}
                            className={`w-full bg-white dark:bg-slate-900 border-2 ${useMarketPrice ? 'border-slate-100 dark:border-slate-700/50 text-slate-500' : 'border-indigo-500 text-slate-900 dark:text-white shadow-[0_0_0_4px_rgba(99,102,241,0.1)]'} rounded-2xl py-3.5 pl-8 pr-4 font-bold focus:outline-none transition-all shadow-sm tabular-nums`}
                        />
                    </div>
                </div>
                
                {useMarketPrice && (
                    <div className="flex items-center text-[10px] text-emerald-500 font-black px-1 uppercase tracking-wide">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></div>
                        Live {transactionCurrency.toUpperCase()} Market Rate
                    </div>
                )}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
                 <div className="flex justify-between items-center px-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Quantity</label>
                    <div className="flex items-center space-x-2">
                        {mode === 'SELL' && currentHolding && (
                            <div className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                Available: <span className="font-mono text-slate-900 dark:text-white tabular-nums">{currentHolding.amount} {selectedCoin?.symbol.toUpperCase()}</span>
                            </div>
                        )}
                         {mode === 'BUY' && (
                            <div className="text-[10px] text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                                Wallet: <span className="font-mono text-slate-900 dark:text-white">
                                    <PriceTicker value={userBalance * transactionRate} currencySymbol={transactionSymbol} />
                                </span>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 <div className="relative group">
                    <input 
                        type="number" 
                        step="any"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 text-slate-900 dark:text-white rounded-2xl py-6 pl-6 pr-24 font-black text-3xl focus:outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700 shadow-inner tabular-nums"
                        autoFocus
                    />
                    <div className="absolute right-3 top-3 bottom-3 flex items-center space-x-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 border border-slate-200 dark:border-slate-600">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400">{selectedCoin?.symbol.toUpperCase()}</span>
                        <div className="w-px h-4 bg-slate-300 dark:bg-slate-500 mx-1"></div>
                        <button 
                        type="button"
                        onClick={handleMaxClick}
                        className="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:text-indigo-700 transition-colors uppercase tracking-wider"
                        >
                        MAX
                        </button>
                    </div>
                 </div>
                 {insufficientFunds && (
                    <div className="text-xs text-red-500 flex items-center animate-pulse px-2 font-bold bg-red-50 dark:bg-red-900/10 py-2 rounded-xl border border-red-500/10">
                        <AlertTriangle className="w-3.5 h-3.5 mr-2" /> Insufficient funds in wallet
                    </div>
                 )}
            </div>

            {/* Total Summary */}
            <div className={`rounded-2xl p-6 border-2 backdrop-blur-md transition-all duration-300 ${mode === 'BUY' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-red-500/5 border-red-500/10'}`}>
                <div className="flex items-center justify-between mb-1 overflow-hidden">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest shrink-0 mr-4">Estimated Total</span>
                    <span className={`text-3xl font-black tracking-tight truncate tabular-nums ${mode === 'BUY' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} title={`${transactionSymbol}${totalValue.toLocaleString()}`}>
                        {transactionSymbol}{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex items-center justify-end text-[10px] opacity-60 font-bold uppercase tracking-wide">
                    <Wallet className="w-3 h-3 mr-1.5" />
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