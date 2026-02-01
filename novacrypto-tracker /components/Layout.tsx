import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, BrainCircuit, Activity, LogOut, Moon, Sun, History, Globe, User, Sparkles } from 'lucide-react';
import { ViewState, UserProfile } from '../types';
import BackgroundParticles from './BackgroundParticles';
import { CURRENCY_CONFIG } from '../constants';
import ProfileModal from './ProfileModal';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
  currency: string;
  setCurrency: (currency: string) => void;
  user: UserProfile | null;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
}

// Curated sets of high-quality background images for each view
const BACKGROUND_SETS: Record<ViewState, string[]> = {
  dashboard: [
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2832&auto=format&fit=crop', // Abstract 3D Shapes
    'https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=2560&auto=format&fit=crop', // Digital Abstract
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', // Liquid Gradient
    'https://images.unsplash.com/photo-1620641788421-7f1c91ade639?q=80&w=2672&auto=format&fit=crop'  // Glassy Shapes
  ],
  portfolio: [
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop', // 3D Coins
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2555&auto=format&fit=crop', // Gold Bitcoin
    'https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=2832&auto=format&fit=crop', // Purple Abstract
    'https://images.unsplash.com/photo-1605792657660-596af9009e82?q=80&w=2560&auto=format&fit=crop'  // Gold Bullion/Vault
  ],
  transactions: [
    'https://images.unsplash.com/photo-1639815188546-c43c240ff4df?q=80&w=2832&auto=format&fit=crop', // Blockchain
    'https://images.unsplash.com/photo-1639322537231-2f206e06af84?q=80&w=2832&auto=format&fit=crop', // Data Blocks
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2560&auto=format&fit=crop', // Data streams
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2560&auto=format&fit=crop'  // Globe Network
  ],
  analysis: [
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2832&auto=format&fit=crop', // AI Chip
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop', // Neural Network
    'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=2560&auto=format&fit=crop', // Artificial Intelligence glowing
    'https://images.unsplash.com/photo-1617791160505-6f00504e3caf?q=80&w=2560&auto=format&fit=crop'  // Cyber
  ]
};

const Layout: React.FC<LayoutProps> = ({ 
  currentView, 
  setView, 
  onLogout, 
  children, 
  currency, 
  setCurrency,
  user,
  onUpdateProfile
}) => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);

  // Preload images for smoother transitions
  useEffect(() => {
    const images = BACKGROUND_SETS[currentView] || [];
    images.forEach(src => {
        const img = new Image();
        img.src = src;
    });
  }, [currentView]);

  // Cycle background images every 30 seconds for a slow, subtle shift
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Background Image Logic
  const getBackgroundImage = () => {
    const images = BACKGROUND_SETS[currentView] || BACKGROUND_SETS.dashboard;
    return images[bgIndex % images.length];
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-500 relative font-sans selection:bg-emerald-500/30">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0 opacity-15 dark:opacity-25 transition-all duration-[2000ms] ease-in-out bg-cover bg-center bg-no-repeat pointer-events-none transform scale-105"
        style={{ backgroundImage: `url(${getBackgroundImage()})` }}
      />
      
      {/* Gradient Overlay for Readability - Premium Soft Light */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-50/90 via-white/80 to-slate-100/90 dark:from-slate-950/95 dark:via-slate-900/90 dark:to-indigo-950/95 pointer-events-none mix-blend-overlay" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-950/50 pointer-events-none" />

      {/* Dynamic Background Particles based on View */}
      <BackgroundParticles 
        density="low" 
        className="opacity-30 dark:opacity-40 z-0" 
        variant={currentView}
      />

      {/* Premium Glass Sidebar */}
      <aside className="w-20 lg:w-72 flex-shrink-0 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl backdrop-saturate-150 border-r border-white/20 dark:border-white/5 flex flex-col items-center lg:items-stretch transition-all duration-300 z-30 shadow-[4px_0_24px_-4px_rgba(0,0,0,0.05)]">
        <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-dashed border-slate-200/50 dark:border-slate-800/50">
          <div className="relative group cursor-default">
             <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
             <div className="relative z-10 flex items-center">
                 <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
                    <Activity className="h-6 w-6 text-white" />
                 </div>
                 <div className="hidden lg:block ml-3">
                    <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white leading-none">NovaCrypto</h1>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">Pro Tracker</span>
                 </div>
             </div>
          </div>
        </div>

        <nav className="flex-1 py-8 space-y-2 px-4 overflow-y-auto custom-scrollbar">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'portfolio', label: 'Portfolio', icon: Wallet },
            { id: 'transactions', label: 'History', icon: History },
            { id: 'analysis', label: 'AI Analyst', icon: BrainCircuit }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                currentView === item.id 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-700 dark:text-emerald-400 font-bold shadow-sm border border-emerald-500/10' 
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full transition-all duration-300 ${currentView === item.id ? 'opacity-100' : 'opacity-0 -translate-x-full'}`} />
              
              <item.icon className={`h-5 w-5 relative z-10 transition-transform duration-300 ${currentView === item.id ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`} />
              <span className="hidden lg:block ml-3 relative z-10 text-sm tracking-wide">{item.label}</span>
              
              {currentView === item.id && (
                  <Sparkles className="hidden lg:block absolute right-3 w-4 h-4 text-emerald-500/50 animate-pulse" />
              )}
            </button>
          ))}
        </nav>

        {/* Developer Badge */}
        <div className="hidden lg:flex px-8 pb-4 items-center justify-center opacity-60 hover:opacity-100 transition-opacity">
            <div className="text-[10px] font-bold tracking-wide text-slate-400 dark:text-slate-500 flex items-center">
                <span>Developed by </span>
                <span className="shouryangas-signature ml-1">The Shouryangas</span>
            </div>
        </div>

        <div className="p-6 border-t border-dashed border-slate-200/50 dark:border-slate-800/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center p-3.5 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-500/10 rounded-2xl transition-all justify-center lg:justify-start group border border-transparent hover:border-red-500/10"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block ml-3 font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
        
        {/* Premium Glass Header */}
        <header className="h-24 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl backdrop-saturate-150 border-b border-white/20 dark:border-white/5 flex items-center justify-between px-6 lg:px-10 z-20 transition-all duration-300 sticky top-0 shadow-sm">
          <div>
              <h1 className="text-2xl font-black capitalize text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400 drop-shadow-sm tracking-tight">
                {currentView === 'analysis' ? 'AI Chat Analyst' : currentView === 'transactions' ? 'Transaction History' : currentView}
              </h1>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                  {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
          </div>
          
          <div className="flex items-center space-x-4 lg:space-x-6">
             <button 
                onClick={() => setIsDark(!isDark)}
                className="p-2.5 rounded-full text-slate-500 hover:text-amber-500 hover:bg-amber-500/10 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-400/10 transition-all border border-transparent hover:border-amber-500/20 active:scale-95"
                aria-label="Toggle Dark Mode"
             >
                {isDark ? <Sun className="w-5 h-5 fill-amber-400/20" /> : <Moon className="w-5 h-5 fill-indigo-500/20" />}
             </button>

             <div className="hidden md:flex items-center px-4 py-1.5 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]">
                <span className="relative flex h-2 w-2 mr-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 tracking-widest">MARKET LIVE</span>
             </div>
             
             {/* Premium Currency Selector */}
             <div className="relative group hidden sm:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                </div>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="pl-9 pr-8 py-2.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 appearance-none cursor-pointer hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all shadow-sm"
                >
                  {Object.keys(CURRENCY_CONFIG).map((code) => (
                    <option key={code} value={code} className="bg-white dark:bg-slate-900">
                      {code.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] text-slate-400">▼</span>
                </div>
             </div>

             {/* Premium Profile Button */}
             {user && (
                 <button 
                    onClick={() => setIsProfileOpen(true)}
                    className="flex items-center pl-4 pr-1.5 py-1.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-700/80 backdrop-blur-md rounded-full border border-slate-200/60 dark:border-slate-700/60 transition-all group shadow-sm hover:shadow-lg hover:shadow-indigo-500/10"
                 >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:block max-w-[100px] truncate mr-3">
                        {user.name}
                    </span>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-[2px] shadow-md group-hover:scale-105 transition-transform">
                         <div className="w-full h-full rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                             {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                             ) : (
                                <User className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                             )}
                         </div>
                    </div>
                 </button>
             )}
          </div>
        </header>
        
        {/* Content Area with slight fade at top */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative custom-scrollbar scroll-smooth">
           <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-slate-50/30 dark:from-slate-950/30 to-transparent pointer-events-none z-10"></div>
           {children}
           
           {/* Bottom Spacing */}
           <div className="h-10"></div>
        </div>

        {user && onUpdateProfile && (
            <ProfileModal 
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
                user={user}
                onUpdate={onUpdateProfile}
            />
        )}
      </main>
    </div>
  );
};

export default Layout;