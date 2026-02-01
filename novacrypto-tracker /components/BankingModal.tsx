import React, { useState, useEffect } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Landmark, Wallet, Check, Download, CreditCard, Building2, Smartphone, FileText } from 'lucide-react';
import { CURRENCY_CONFIG, EXCHANGE_RATES } from '../constants';
import PriceTicker from './PriceTicker';
import { UserProfile } from '../types';
import { playSuccessSound } from '../services/soundService';

interface BankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onTransaction: (type: 'DEPOSIT' | 'WITHDRAW', amount: number, transactionId: string) => void;
  currencyCode: string;
  user: UserProfile | null;
}

const BankingModal: React.FC<BankingModalProps> = ({ 
  isOpen, 
  onClose, 
  currentBalance, 
  onTransaction, 
  currencyCode,
  user
}) => {
  const [step, setStep] = useState<'INPUT' | 'PROCESSING' | 'SUCCESS'>('INPUT');
  const [mode, setMode] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [amount, setAmount] = useState<string>('');
  
  const [currentTxId, setCurrentTxId] = useState('');
  const [currentTxDate, setCurrentTxDate] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('INPUT');
      setMode('DEPOSIT');
      setAmount('');
      setCurrentTxId('');
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const exchangeRate = EXCHANGE_RATES[currencyCode] || 1;
  const currencySymbol = CURRENCY_CONFIG[currencyCode]?.symbol || '$';
  
  const displayBalance = currentBalance * exchangeRate;

  const amountNum = parseFloat(amount);
  const amountInUsd = isNaN(amountNum) ? 0 : amountNum / exchangeRate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountNum > 0) {
      if (mode === 'WITHDRAW' && amountInUsd > currentBalance) return;
      
      setStep('PROCESSING');
      
      const txId = `tx-${Date.now()}`;
      const date = Date.now();
      setCurrentTxId(txId);
      setCurrentTxDate(date);

      setTimeout(() => {
        onTransaction(mode, amountInUsd, txId); 
        playSuccessSound(); // Play success chime
        setStep('SUCCESS');
      }, 1500);
    }
  };

  const handleDownloadReceipt = () => {
      const receiptContent = `
NOVA CRYPTO BANKING RECEIPT
---------------------------
Transaction ID : ${currentTxId}
Date           : ${new Date(currentTxDate).toLocaleString()}
Transaction    : ${mode}
Status         : SUCCESS
---------------------------
Amount         : ${currencySymbol}${amountNum.toFixed(2)} (${currencyCode.toUpperCase()})
---------------------------
USER DETAILS
Name           : ${user.name}
Account No     : ${user.accountNumber}
IFSC Code      : ${user.ifsc}
Mobile         : ${user.mobile}
---------------------------
Thank you for banking with NovaCrypto.
      `;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Receipt_${currentTxId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const setPercent = (pct: number) => {
    const val = displayBalance * pct;
    setAmount(val.toFixed(2));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all duration-300">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative">
        
        {/* Success View */}
        {step === 'SUCCESS' && (
            <div className="absolute inset-0 z-20 bg-white/95 dark:bg-slate-900/95 flex flex-col items-center justify-center animate-in fade-in duration-300 p-8 backdrop-blur-md">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 border border-emerald-500/20">
                    <Check className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Transaction Successful!</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-center font-medium">
                    {mode === 'DEPOSIT' ? 'Funds have been added to your wallet.' : 'Withdrawal has been processed to your bank.'}
                </p>

                <div className="w-full space-y-3">
                    <button 
                        onClick={handleDownloadReceipt}
                        className="w-full py-4 rounded-xl font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center"
                    >
                        <Download className="w-5 h-5 mr-2" /> Download Receipt
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        )}

        {/* Processing Overlay */}
        {step === 'PROCESSING' && (
            <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center">
                 <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full"></div>
                    <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin relative z-10"></div>
                 </div>
                 <p className="font-bold text-slate-700 dark:text-slate-200 mt-6 animate-pulse">Processing Request...</p>
            </div>
        )}

        {/* Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex justify-between items-center bg-white/50 dark:bg-slate-900/50 sticky top-0 z-10">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
                <Landmark className="w-6 h-6 mr-2 text-indigo-500" />
                Wallet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage your cash balance</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors backdrop-blur-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-slate-50/30 dark:to-slate-900/30">
            
            {/* Account Details Card (Glass) */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-5 mb-6 border border-white/40 dark:border-white/5 relative overflow-hidden shadow-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Landmark className="w-32 h-32" />
                </div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Linked Bank Account</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 relative z-10">
                    <div>
                        <span className="text-[10px] text-slate-500 block flex items-center font-bold mb-1"><CreditCard className="w-3 h-3 mr-1"/> Account No</span>
                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 block truncate bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50" title={user.accountNumber}>
                            {user.accountNumber?.replace(/(\d{4})/g, '$1 ').trim()}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 block flex items-center font-bold mb-1"><Building2 className="w-3 h-3 mr-1"/> IFSC Code</span>
                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 block bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">{user.ifsc}</span>
                    </div>
                    <div className="col-span-2">
                        <span className="text-[10px] text-slate-500 block flex items-center font-bold mb-1"><Smartphone className="w-3 h-3 mr-1"/> Mobile</span>
                        <span className="text-sm font-mono font-bold text-slate-700 dark:text-slate-200 block bg-slate-100/50 dark:bg-black/20 p-1.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50">{user.mobile}</span>
                    </div>
                </div>
            </div>

            {/* Balance Display */}
            <div className="flex justify-between items-center mb-6 px-1">
                 <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Available Balance</span>
                 <div className="text-xl font-black text-slate-900 dark:text-white break-words text-right max-w-[200px]">
                     <PriceTicker value={currentBalance} currencySymbol={currencySymbol} />
                 </div>
            </div>

            {/* Toggle */}
            <div className="flex bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl mb-8 backdrop-blur-sm">
                <button
                    onClick={() => setMode('DEPOSIT')}
                    className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${
                        mode === 'DEPOSIT' 
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <ArrowDownCircle className="w-4 h-4 mr-2" /> Deposit
                </button>
                <button
                    onClick={() => setMode('WITHDRAW')}
                    className={`flex-1 flex items-center justify-center py-3 rounded-xl text-sm font-bold transition-all ${
                        mode === 'WITHDRAW' 
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                    <ArrowUpCircle className="w-4 h-4 mr-2" /> Withdraw
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                        Amount ({currencyCode.toUpperCase()})
                    </label>
                    <div className="relative">
                        <span className="absolute left-5 top-4 text-slate-400 font-bold text-lg">{currencySymbol}</span>
                        <input 
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="any"
                            autoFocus
                            className="w-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl py-4 pl-10 pr-4 font-black text-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 shadow-inner tabular-nums"
                        />
                    </div>
                    {mode === 'WITHDRAW' && (
                        <div className="flex gap-2 mt-2 px-1">
                            {[0.25, 0.5, 1].map(pct => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setPercent(pct)}
                                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
                                >
                                    {pct * 100}%
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button 
                    type="submit"
                    disabled={!amountNum || amountNum <= 0 || (mode === 'WITHDRAW' && amountInUsd > currentBalance)}
                    className={`w-full py-5 rounded-2xl font-bold text-lg text-white shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        mode === 'DEPOSIT'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/20'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 shadow-indigo-500/20'
                    }`}
                >
                    {mode === 'DEPOSIT' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default BankingModal;