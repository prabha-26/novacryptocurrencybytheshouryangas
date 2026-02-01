import React, { useState, useEffect, useMemo, useRef } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PortfolioTable from './components/PortfolioTable';
import AIAssistant from './components/AIAssistant';
import TransactionHistory from './components/TransactionHistory';
import AddAssetModal from './components/AddAssetModal';
import BankingModal from './components/BankingModal'; // Import the new modal
import LoginPage from './components/LoginPage';
import { ViewState, Asset, CoinData, PortfolioItem, PortfolioStats, Transaction, UserProfile } from './types';
import { fetchMarketData, subscribeToLivePrices } from './services/cryptoService';
import { saveUserData, persistSession, clearSession, restoreSession, updateUserProfile } from './services/authService';
import { Plus } from 'lucide-react';
import { CURRENCY_CONFIG, EXCHANGE_RATES } from './constants';

const App: React.FC = () => {
  // --- Initialization ---
  const initialSession = useMemo(() => restoreSession(), []);

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(initialSession?.profile || null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialSession);

  // App State - Persisted View
  const [view, setViewInternal] = useState<ViewState>(() => {
      if (typeof window !== 'undefined') {
          return (localStorage.getItem('novacrypto_last_view') as ViewState) || 'dashboard';
      }
      return 'dashboard';
  });

  const setView = (newView: ViewState) => {
      setViewInternal(newView);
      localStorage.setItem('novacrypto_last_view', newView);
  };

  // App State - Persisted Currency
  const [currency, setCurrencyInternal] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('novacrypto_currency') || 'usd';
      }
      return 'usd';
  });

  const setCurrency = (newCurrency: string) => {
      setCurrencyInternal(newCurrency);
      localStorage.setItem('novacrypto_currency', newCurrency);
  };

  const [coins, setCoins] = useState<CoinData[]>([]);
  const [assets, setAssets] = useState<Asset[]>(initialSession?.assets || []);
  const [transactions, setTransactions] = useState<Transaction[]>(initialSession?.transactions || []);
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBankingModalOpen, setIsBankingModalOpen] = useState(false);
  const [modalInitialCoin, setModalInitialCoin] = useState<string | undefined>(undefined);
  const [modalInitialMode, setModalInitialMode] = useState<'BUY' | 'SELL'>('BUY');
  
  const [marketLoading, setMarketLoading] = useState(true);

  // Derived Currency Symbol
  const currencySymbol = CURRENCY_CONFIG[currency]?.symbol || '$';
  
  // Exchange Rate (USD Base to Current)
  const exchangeRate = useMemo(() => EXCHANGE_RATES[currency] || 1, [currency]);
  
  // Converted Fiat Balance
  const convertedFiatBalance = (user?.fiatBalance || 0) * exchangeRate;

  // 1. Initial Data Fetch (HTTP) - Gets Metadata + Snapshot
  useEffect(() => {
    const loadMarketData = async () => {
      setMarketLoading(true);
      const data = await fetchMarketData(currency);
      setCoins(data);
      setMarketLoading(false);
    };

    loadMarketData();
    // Fallback refresh every 60 seconds (Full Sync) to get new coins/metadata
    const interval = setInterval(loadMarketData, 60000); 

    return () => clearInterval(interval);
  }, [currency]);

  // 2. Real-Time WebSocket Subscription (Effective on Wire)
  useEffect(() => {
    if (coins.length === 0) return;

    // Connect to Binance WebSocket
    const unsubscribe = subscribeToLivePrices(coins, currency, (updatedPrices) => {
        setCoins(prevCoins => prevCoins.map(coin => {
            if (updatedPrices[coin.id]) {
                const newPrice = updatedPrices[coin.id];
                // Only update if price actually changed to avoid unnecessary re-renders
                if (Math.abs(coin.current_price - newPrice) > 0.000001) {
                    // Update price change percentage roughly based on the stream data vs open
                    // (Note: Binance miniTicker provides 24h change, but for this demo 
                    // we stick to updating the current price to keep the UI snappy)
                    return {
                        ...coin,
                        current_price: newPrice,
                    };
                }
            }
            return coin;
        }));
    });

    return () => {
        unsubscribe();
    };
  }, [coins.length, currency]); // Re-subscribe if coin list or currency changes

  // Save User Data on Change
  useEffect(() => {
    if (user && isAuthenticated) {
        saveUserData(user.email, assets, transactions, user.fiatBalance);
    }
  }, [assets, transactions, user, isAuthenticated]);

  // Calculate Portfolio Data
  const portfolioItems: PortfolioItem[] = useMemo(() => {
    if (coins.length === 0) return [];

    return assets.map(asset => {
      const coinData = coins.find(c => c.id === asset.coinId);
      
      if (!coinData) {
          return null;
      }
      
      const currentValue = asset.amount * coinData.current_price;
      // Convert stored USD avgBuyPrice to current currency
      const currentAvgBuyPrice = asset.avgBuyPrice * exchangeRate;
      const totalCost = asset.amount * currentAvgBuyPrice;
      const profit = currentValue - totalCost;
      const profitPercentage = totalCost === 0 ? 0 : (profit / totalCost) * 100;

      return {
        ...asset,
        coinData,
        currentValue,
        totalCost,
        avgBuyPrice: currentAvgBuyPrice, // Override with display value
        profit,
        profitPercentage
      };
    }).filter(Boolean) as PortfolioItem[]; // Filter out nulls
  }, [assets, coins, exchangeRate]);

  const portfolioStats: PortfolioStats = useMemo(() => {
    const totalBalance = portfolioItems.reduce((acc, item) => acc + item.currentValue, 0);
    const totalInvested = portfolioItems.reduce((acc, item) => acc + item.totalCost, 0);
    const totalProfit = totalBalance - totalInvested;
    const totalProfitPercentage = totalInvested === 0 ? 0 : (totalProfit / totalInvested) * 100;

    let bestPerformer: PortfolioItem | null = null;
    let worstPerformer: PortfolioItem | null = null;

    if (portfolioItems.length > 0) {
        bestPerformer = portfolioItems.reduce((prev, current) => (prev.profitPercentage > current.profitPercentage) ? prev : current);
        worstPerformer = portfolioItems.reduce((prev, current) => (prev.profitPercentage < current.profitPercentage) ? prev : current);
    }

    return {
      totalBalance,
      totalInvested,
      totalProfit,
      totalProfitPercentage,
      bestPerformer,
      worstPerformer
    };
  }, [portfolioItems]);

  // Handlers
  const handleLogin = (loggedInUser: UserProfile, userAssets: Asset[], userTransactions: Transaction[]) => {
    setUser(loggedInUser);
    setAssets(userAssets);
    setTransactions(userTransactions);
    setIsAuthenticated(true);
    persistSession(loggedInUser.email); // Persist session for refresh
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setAssets([]);
    setTransactions([]);
    clearSession(); // Clear session storage
    localStorage.removeItem('novacrypto_last_view');
    setViewInternal('dashboard');
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    await new Promise(resolve => setTimeout(resolve, 800));
    const updatedUser = updateUserProfile(user.email, updates);
    setUser(updatedUser);
  };

  const openTradeModal = (type: 'BUY' | 'SELL' = 'BUY', coinId?: string) => {
    setModalInitialMode(type);
    setModalInitialCoin(coinId);
    setIsAddModalOpen(true);
  };

  const handleBankingTransaction = (type: 'DEPOSIT' | 'WITHDRAW', amount: number, transactionId?: string) => {
    if (!user) return;

    // Update Balance
    const newBalance = type === 'DEPOSIT' 
        ? user.fiatBalance + amount 
        : user.fiatBalance - amount;
    
    setUser({ ...user, fiatBalance: newBalance });

    // Record Transaction
    const newTransaction: Transaction = {
        id: transactionId || `tx-${Date.now()}`,
        type,
        amount,
        totalValue: amount,
        date: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleTrade = (type: 'BUY' | 'SELL', coinId: string, amount: number, priceInUsd: number) => {
    if (!user) return;

    const coin = coins.find(c => c.id === coinId);
    const existingAsset = assets.find(a => a.coinId === coinId);
    const tradeValueUSD = amount * priceInUsd;

    // Update Wallet Balance
    let newBalance = user.fiatBalance;
    if (type === 'BUY') {
        newBalance -= tradeValueUSD;
    } else {
        newBalance += tradeValueUSD;
    }
    setUser({ ...user, fiatBalance: newBalance });
    
    // Create Transaction Record
    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`,
        type: type === 'BUY' ? 'ADD' : 'REMOVE',
        coinId,
        coinName: coin?.name || 'Unknown',
        coinSymbol: coin?.symbol || '???',
        amount,
        pricePerCoin: priceInUsd, // Store in USD
        totalValue: tradeValueUSD, // Store in USD
        date: Date.now()
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update Asset State
    setAssets(prev => {
        if (type === 'BUY') {
            if (existingAsset) {
                // Calculate Weighted Average Buy Price (All in USD)
                const totalCost = (existingAsset.amount * existingAsset.avgBuyPrice) + (amount * priceInUsd);
                const totalAmount = existingAsset.amount + amount;
                const newAvgPrice = totalCost / totalAmount;

                return prev.map(a => a.coinId === coinId ? { ...a, amount: totalAmount, avgBuyPrice: newAvgPrice } : a);
            } else {
                // New Asset
                const newAsset: Asset = {
                    id: Date.now().toString(),
                    coinId,
                    amount,
                    avgBuyPrice: priceInUsd
                };
                return [...prev, newAsset];
            }
        } else {
            // SELL Logic
            if (!existingAsset) return prev; 

            const newAmount = existingAsset.amount - amount;
            if (newAmount <= 0.0000001) {
                // Remove asset if balance is 0
                return prev.filter(a => a.coinId !== coinId);
            } else {
                return prev.map(a => a.coinId === coinId ? { ...a, amount: newAmount } : a);
            }
        }
    });
  };

  const handleDeleteAsset = (id: string) => {
    const assetToDelete = assets.find(a => a.id === id);
    if (assetToDelete && user) {
        // Log as a full sell, return money to wallet
        const coin = coins.find(c => c.id === assetToDelete.coinId);
        // Let's use current market price if available, otherwise buy price
        const currentPrice = coin?.current_price || assetToDelete.avgBuyPrice;
        const totalValue = assetToDelete.amount * currentPrice;

        const newBalance = user.fiatBalance + totalValue;
        setUser({ ...user, fiatBalance: newBalance });

        const newTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'REMOVE',
            coinId: assetToDelete.coinId,
            coinName: coin?.name || 'Unknown',
            coinSymbol: coin?.symbol || '???',
            amount: assetToDelete.amount,
            pricePerCoin: currentPrice, 
            totalValue: totalValue,
            date: Date.now()
        };
        setTransactions(prev => [newTransaction, ...prev]);
        setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // If authenticated, show app
  return (
    <Layout 
      currentView={view} 
      setView={setView} 
      onLogout={handleLogout} 
      currency={currency} 
      setCurrency={setCurrency}
      user={user}
      onUpdateProfile={handleUpdateProfile}
    >
      <div className="pb-24">
        
        {view === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        Market Overview
                        <span className="ml-3 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 uppercase tracking-wider flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></div>
                            WebSocket Live
                        </span>
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {marketLoading ? `Connecting to ${currency.toUpperCase()} market...` : `Real-time streaming via Binance in ${currency.toUpperCase()}`}
                    </p>
                </div>
                <button 
                    onClick={() => openTradeModal('BUY')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                </button>
            </div>
            <Dashboard 
                stats={portfolioStats} 
                portfolio={portfolioItems} 
                currencySymbol={currencySymbol} 
                user={user}
                onOpenBanking={() => setIsBankingModalOpen(true)}
                convertedFiatBalance={convertedFiatBalance}
                coins={coins}
                onTrade={(type, coinId) => openTradeModal(type, coinId)}
            />
          </div>
        )}

        {view === 'portfolio' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Assets</h2>
                <button 
                    onClick={() => openTradeModal('BUY')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                </button>
            </div>
            <PortfolioTable 
                items={portfolioItems} 
                onDelete={handleDeleteAsset} 
                onTrade={openTradeModal}
                currencySymbol={currencySymbol}
                convertedFiatBalance={convertedFiatBalance}
                onOpenBanking={() => setIsBankingModalOpen(true)}
            />
          </div>
        )}

        {view === 'transactions' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white">History</h2>
                 <button 
                    onClick={() => openTradeModal('BUY')}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    New Trade
                </button>
             </div>
             <TransactionHistory 
                transactions={transactions} 
                coins={coins} 
                currencySymbol={currencySymbol} 
                exchangeRate={exchangeRate}
             />
           </div>
        )}

        {view === 'analysis' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <AIAssistant portfolio={portfolioItems} marketData={coins} />
           </div>
        )}

        <AddAssetModal 
            isOpen={isAddModalOpen} 
            onClose={() => setIsAddModalOpen(false)}
            coins={coins}
            portfolioItems={portfolioItems}
            onTrade={handleTrade}
            initialCoinId={modalInitialCoin}
            initialMode={modalInitialMode}
            globalCurrencyCode={currency}
            userBalance={user?.fiatBalance || 0}
        />

        <BankingModal
            isOpen={isBankingModalOpen}
            onClose={() => setIsBankingModalOpen(false)}
            currentBalance={user?.fiatBalance || 0}
            onTransaction={handleBankingTransaction}
            currencyCode={currency}
            user={user}
        />
      </div>
    </Layout>
  );
};

export default App;