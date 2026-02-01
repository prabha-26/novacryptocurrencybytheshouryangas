import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Rocket, KeyRound, AlertCircle, Eye, EyeOff, TrendingUp, UserCircle, HelpCircle, Sprout, ShieldCheck, Activity, BrainCircuit, X, Smartphone, CreditCard, Building2, FileBadge, Search, Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import { loginUser, registerUser, recoverPassword } from '../services/authService';
import { Asset, Transaction, UserProfile } from '../types';
import CryptoCoin from './CryptoCoin';
import BackgroundParticles from './BackgroundParticles';
import PenguinAvatar from './PenguinAvatar';

interface LoginPageProps {
  onLogin: (user: UserProfile, assets: Asset[], transactions: Transaction[]) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [isForgot, setIsForgot] = useState(false); // New State for Forgot Password
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  
  // Track active field
  const [activePasswordField, setActivePasswordField] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Banking Form States
  const [mobile, setMobile] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [panCard, setPanCard] = useState('');

  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Recovery State
  const [recoveredPassword, setRecoveredPassword] = useState<string | null>(null);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate Network Delay + Process
    setTimeout(() => {
        try {
            if (isSignup) {
                if (password !== confirmPassword) throw new Error("Passwords do not match");
                if (password.length < 6) throw new Error("Password must be at least 6 characters");
                
                // Banking Validation
                if (!mobile || !accountNumber || !ifsc || !panCard) throw new Error("All details are required");
                if (mobile.length !== 10) throw new Error("Mobile number must be 10 digits");
                
                // IFSC Validation - Limited to 6 chars
                if (ifsc.length !== 6) throw new Error("IFSC must be exactly 6 characters");

                // Regex for PAN: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)
                const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                if (!panRegex.test(panCard)) throw new Error("Invalid PAN Format (e.g., ABCDE1234F)");

                if (accountNumber.length < 9) throw new Error("Invalid Account Number (min 9 digits)");

                const newUser = registerUser(name, email, password, mobile, accountNumber, ifsc, panCard);
                finishLogin(newUser, [], []);
            } else {
                const { profile, assets, transactions } = loginUser(email, password);
                finishLogin(profile, assets, transactions);
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed");
            setIsLoading(false);
        }
    }, 2500); 
  };

  const handleRecovery = (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);
      setRecoveredPassword(null);

      setTimeout(() => {
          try {
              const pass = recoverPassword(email, mobile, accountNumber);
              setRecoveredPassword(pass);
          } catch (err: any) {
              setError(err.message || "Verification failed");
          } finally {
              setIsLoading(false);
          }
      }, 2000);
  };

  const finishLogin = (user: UserProfile, assets: Asset[], transactions: Transaction[]) => {
    setIsSuccess(true);
    setIsSignup(prev => !prev); // Trigger flip animation
    
    setTimeout(() => {
        onLogin(user, assets, transactions);
    }, 1500); 
  };

  const toggleMode = () => {
    if (isLoading) return;
    setIsSignup(!isSignup);
    resetForm();
  };

  const toggleForgot = () => {
      setIsForgot(!isForgot);
      setError(null);
      setRecoveredPassword(null);
      // Keep email if typed, reset others
      setMobile('');
      setAccountNumber('');
  };

  const resetForm = () => {
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setMobile('');
    setAccountNumber('');
    setIfsc('');
    setPanCard('');
    setIsSuccess(false);
    setIsForgot(false);
    setRecoveredPassword(null);
    // Reset visibility
    setShowPassword(false);
    setShowConfirmPassword(false);
    setActivePasswordField(null);
  };

  const SuccessView = () => (
    <div className="flex flex-col items-center justify-center h-full w-full animate-in zoom-in duration-700">
        <div className="mb-6">
            <CryptoCoin symbol="SOL" size={140} animation="success" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-3 animate-in fade-in slide-in-from-bottom-2 delay-200">Access Granted</h2>
        <p className="text-emerald-400/80 font-medium text-lg animate-in fade-in slide-in-from-bottom-2 delay-300">Entering Secure Vault...</p>
    </div>
  );

  // LOGIC: Panda faces back if typing in a hidden password field
  const shouldLookBack = () => {
    // If not focused on a password field, face front
    if (!activePasswordField) return false;

    // Login Password
    if (activePasswordField === 'login') {
        if (showPassword) return false; // Peek mode (Eye open) -> Face user
        return password.length > 0; // Turn around only if typing and hidden
    }

    // Signup Password
    if (activePasswordField === 'signup') {
        if (showPassword) return false;
        return password.length > 0;
    }

    // Signup Confirm
    if (activePasswordField === 'signup-confirm') {
        if (showConfirmPassword) return false;
        return confirmPassword.length > 0;
    }

    return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden relative font-sans selection:bg-amber-500/30">
        
        {/* === Atmospheric Background with High Density Flying Crypto Particles === */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Deep Space Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950"></div>
            
            {/* Reusable High Density Particles */}
            <BackgroundParticles density="high" />
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        </div>

        {/* === Info Modal === */}
        {showInfo && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-slate-900/90 border border-white/10 rounded-[2rem] max-w-lg w-full p-8 shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-500">
                    <button onClick={() => setShowInfo(false)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-slate-400 hover:text-white" />
                    </button>
                    
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Nova Crypto</h2>
                            <p className="text-amber-400 font-medium text-sm">Next-Gen Portfolio Tracker</p>
                        </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed mb-8">
                        Experience a professional-grade cryptocurrency tracker featuring real-time market data simulation, interactive performance visualization, and our exclusive AI-driven analyst, Nova.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-start p-4 bg-white/5 rounded-2xl border border-white/5">
                            <Activity className="w-6 h-6 text-emerald-400 mr-4 mt-0.5" />
                            <div>
                                <h4 className="text-white font-bold text-sm">Real-Time Analytics</h4>
                                <p className="text-slate-400 text-xs mt-1">Live price updates and instant portfolio valuation adjustments.</p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-white/5 rounded-2xl border border-white/5">
                            <BrainCircuit className="w-6 h-6 text-purple-400 mr-4 mt-0.5" />
                            <div>
                                <h4 className="text-white font-bold text-sm">AI Powered Insights</h4>
                                <p className="text-slate-400 text-xs mt-1">Integrated Gemini AI to analyze risks and suggest rebalancing strategies.</p>
                            </div>
                        </div>
                        <div className="flex items-start p-4 bg-white/5 rounded-2xl border border-white/5">
                            <ShieldCheck className="w-6 h-6 text-blue-400 mr-4 mt-0.5" />
                            <div>
                                <h4 className="text-white font-bold text-sm">Secure & Private</h4>
                                <p className="text-slate-400 text-xs mt-1">Your data is stored locally in your browser. We never track you.</p>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setShowInfo(false)} className="w-full mt-8 py-3.5 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        )}

        {/* === Rocket/Growth Loader Overlay === */}
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none overflow-hidden">
                {isForgot ? (
                     <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <Search className="w-24 h-24 text-cyan-400 animate-bounce" />
                        <p className="mt-4 text-xl font-bold text-cyan-400 animate-pulse tracking-wide">
                            Verifying Records...
                        </p>
                    </div>
                ) : isSignup ? (
                    // === GROWTH ANIMATION FOR SIGNUP ===
                    <div className="flex flex-col items-center justify-center animate-in fade-in duration-500">
                        <div className="relative w-40 h-40">
                             {/* Growing Graph */}
                             <TrendingUp className="w-full h-full text-emerald-400 absolute inset-0 anim-grow-icon drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]" strokeWidth={1.5} />
                             {/* Sprouting Plant */}
                             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 anim-sprout">
                                <Sprout className="w-16 h-16 text-lime-400 fill-lime-400/20 drop-shadow-[0_0_20px_rgba(163,230,53,0.8)]" />
                             </div>
                        </div>
                        <p className="mt-8 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-lime-300 animate-pulse tracking-wide">
                            Cultivating your portfolio...
                        </p>
                    </div>
                ) : (
                    // === ROCKET ANIMATION FOR LOGIN ===
                    <div className="rocket-launch-wrapper">
                        {/* Rocket Icon */}
                        <Rocket className="w-24 h-24 text-amber-500 fill-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)] z-10" />
                        {/* Fire Trail */}
                        <div className="absolute top-[60%] left-[20%] w-6 h-48 bg-gradient-to-t from-transparent via-orange-500 to-amber-400 blur-[8px] opacity-90 transform -rotate-[135deg] origin-top"></div>
                    </div>
                )}
            </div>
        )}

        {/* === 3D Scene Container === */}
        <div className="scene relative z-10 w-[500px] h-[720px] md:w-[600px] md:h-[820px] perspective-container animate-in zoom-in-95 duration-700">
            
            {/* The Login Card Object */}
            <div 
                className={`w-full h-full relative transition-all duration-1000 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] transform-style-3d ${isSignup ? 'rotate-y-180' : ''}`}
            >
                {/* ================= FRONT FACE (LOGIN & FORGOT) ================= */}
                <div className="absolute inset-0 backface-hidden">
                    <div className={`w-full h-full rounded-[3rem] p-[3px] shadow-[0_0_100px_-20px_rgba(245,158,11,0.5)] transition-all duration-500 ${isForgot ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 shadow-cyan-500/30' : 'bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700'}`}>
                        <div className="w-full h-full rounded-[2.9rem] bg-slate-900/95 backdrop-blur-xl border-[6px] border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-[2.9rem]"></div>
                            
                            <div className="w-[80%] h-full flex flex-col items-center justify-center relative z-10 py-10">
                                {isSuccess && isSignup ? ( 
                                     <SuccessView />
                                ) : (
                                    <>
                                        {/* --- LOGO AREA --- */}
                                        <div className={`mb-8 transform hover:scale-105 transition-transform duration-500 ${isLoading ? 'anim-spin' : 'anim-float'}`}>
                                            <div className={`w-[140px] h-[140px] rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)] border-[6px] border-white/10 relative overflow-hidden p-2 ${isForgot ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                                {isForgot ? (
                                                    <div className="relative w-full h-full flex items-center justify-center">
                                                        <Search className="w-20 h-20 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                                                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 animate-bounce">
                                                            <KeyRound className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                    </div>
                                                ) : activePasswordField === 'login' ? (
                                                    <PenguinAvatar 
                                                        isLookingBack={shouldLookBack()} 
                                                        variant="login"
                                                        hasSunglasses={!showPassword} 
                                                    />
                                                ) : (
                                                    <TrendingUp className="w-20 h-20 text-white drop-shadow-md relative z-10" strokeWidth={2.5} />
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* --- FORGOT PASSWORD VIEW --- */}
                                        {isForgot ? (
                                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight text-center">Recover Access</h2>
                                                <p className="text-slate-400 text-sm mb-8 font-medium text-center opacity-80">Verify your identity to retrieve password</p>

                                                {!recoveredPassword ? (
                                                    <form onSubmit={handleRecovery} className="w-full space-y-4">
                                                        <div className="relative group">
                                                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                            <input 
                                                                type="email" 
                                                                placeholder="Registered Email"
                                                                value={email}
                                                                onChange={(e) => setEmail(e.target.value)}
                                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-base text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="relative group">
                                                            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                            <input 
                                                                type="text" 
                                                                placeholder="Account ID (User ID)"
                                                                value={accountNumber}
                                                                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-base text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="relative group">
                                                            <Smartphone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                                                            <input 
                                                                type="text" 
                                                                placeholder="Mobile Number"
                                                                value={mobile}
                                                                maxLength={10}
                                                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-base text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                                required
                                                            />
                                                        </div>

                                                        {error && (
                                                            <div className="text-red-400 text-sm flex items-center justify-center bg-red-500/10 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                                <AlertCircle className="w-4 h-4 mr-2" /> {error}
                                                            </div>
                                                        )}

                                                        <button 
                                                            type="submit"
                                                            disabled={isLoading}
                                                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-cyan-500/20 flex items-center justify-center mt-4 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-cyan-500/40 text-lg"
                                                        >
                                                            {isLoading ? (
                                                                <span className="flex items-center text-white/80">Verifying...</span>
                                                            ) : (
                                                                <>Verify Identity <ArrowRight className="w-5 h-5 ml-2" /></>
                                                            )}
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <div className="w-full animate-in zoom-in duration-500">
                                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center mb-6 backdrop-blur-md relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                                <KeyRound className="w-24 h-24 text-emerald-500" />
                                                            </div>
                                                            <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">Password Retrieved</p>
                                                            <div className="flex items-center justify-center space-x-2 bg-slate-900/50 p-3 rounded-xl border border-white/5">
                                                                <code className="text-2xl font-mono text-white tracking-widest">{recoveredPassword}</code>
                                                            </div>
                                                            <p className="text-slate-400 text-xs mt-3">Please login immediately and consider updating your credentials.</p>
                                                        </div>
                                                        <button 
                                                            onClick={toggleForgot}
                                                            className="w-full py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg"
                                                        >
                                                            Back to Login
                                                        </button>
                                                    </div>
                                                )}

                                                {!recoveredPassword && (
                                                    <button 
                                                        onClick={toggleForgot}
                                                        className="mt-6 text-slate-400 hover:text-white text-sm transition-colors flex items-center mx-auto"
                                                    >
                                                        <ArrowLeft className="w-4 h-4 mr-2" /> Return to Login
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            /* --- NORMAL LOGIN VIEW --- */
                                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight text-center">Nova Crypto</h2>
                                                <p className="text-slate-400 text-base mb-8 font-medium text-center opacity-80">Secure Portfolio Tracker</p>

                                                <form onSubmit={handleAuth} className="w-full space-y-5">
                                                    <div className="relative group">
                                                        <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                                                        <input 
                                                            type="email" 
                                                            placeholder="Email Address"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-base text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                            required
                                                        />
                                                    </div>
                                                    <div 
                                                        className="relative group"
                                                        onMouseEnter={() => setActivePasswordField('login')}
                                                        onMouseLeave={() => {
                                                            const activeEl = document.activeElement;
                                                            if (activeEl?.getAttribute('name') !== 'password-login') {
                                                                setActivePasswordField(null);
                                                            }
                                                        }}
                                                    >
                                                        <KeyRound className={`absolute left-4 top-4 w-5 h-5 transition-colors ${activePasswordField === 'login' ? 'text-amber-400' : 'text-slate-500'}`} />
                                                        <input 
                                                            name="password-login"
                                                            type={showPassword ? "text" : "password"}
                                                            placeholder="Password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            onFocus={() => setActivePasswordField('login')}
                                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-base text-white focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                            required
                                                        />
                                                        <button
                                                            type="button"
                                                            onMouseDown={(e) => e.preventDefault()} 
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90 transform"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                    
                                                    {error && (
                                                        <div className="text-red-400 text-sm flex items-center justify-center bg-red-500/10 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                            <AlertCircle className="w-4 h-4 mr-2" /> {error}
                                                        </div>
                                                    )}

                                                    <button 
                                                        type="button"
                                                        onClick={toggleForgot}
                                                        className="text-xs font-bold text-slate-500 hover:text-amber-400 transition-colors w-full text-right pr-2"
                                                    >
                                                        Forgot Password?
                                                    </button>

                                                    <button 
                                                        type="submit"
                                                        disabled={isLoading}
                                                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-900 font-bold py-4 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-amber-500/20 flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-amber-500/40 text-lg"
                                                    >
                                                        {isLoading ? (
                                                            <span className="flex items-center text-slate-900/80">Verifying...</span>
                                                        ) : (
                                                            <>Login <ArrowRight className="w-6 h-6 ml-2" /></>
                                                        )}
                                                    </button>
                                                </form>

                                                <div className="mt-8 text-center flex flex-col items-center">
                                                    <p className="text-slate-500 text-sm mb-2">New to NovaCrypto?</p>
                                                    <button 
                                                        onClick={toggleMode}
                                                        className="text-amber-400 hover:text-amber-300 text-base font-semibold transition-colors flex items-center mx-auto group mb-3"
                                                    >
                                                        Create Account
                                                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= BACK FACE (SIGNUP) ================= */}
                <div className="absolute inset-0 backface-hidden rotate-y-180">
                    <div className="w-full h-full rounded-[3rem] p-[3px] bg-gradient-to-br from-indigo-300 via-slate-400 to-indigo-600 shadow-[0_0_100px_-20px_rgba(99,102,241,0.5)]">
                        <div className="w-full h-full rounded-[2.9rem] bg-slate-900/95 backdrop-blur-xl border-[6px] border-slate-800/80 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-bl from-white/10 to-transparent pointer-events-none rounded-[2.9rem]"></div>

                            <div className="w-[85%] h-full flex flex-col items-center justify-center relative z-10 py-6">
                                {isSuccess && !isSignup ? ( // Logic flip
                                    <SuccessView />
                                ) : (
                                    <>
                                         {/* --- LOGO AREA FOR SIGNUP --- */}
                                        <div className={`mb-4 transform hover:scale-105 transition-transform duration-500 ${isLoading ? 'anim-spin' : 'anim-float'}`}>
                                             <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] border-[6px] border-white/10 relative overflow-hidden p-1">
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
                                                {activePasswordField === 'signup' || activePasswordField === 'signup-confirm' ? (
                                                    <PenguinAvatar 
                                                        isLookingBack={shouldLookBack()} 
                                                        variant="signup"
                                                        hasSunglasses={activePasswordField === 'signup-confirm' ? !showConfirmPassword : !showPassword} 
                                                    />
                                                ) : (
                                                    <UserCircle className="w-12 h-12 text-white drop-shadow-md relative z-10" strokeWidth={2} />
                                                )}
                                             </div>
                                        </div>
                                        
                                        <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Create Identity</h2>

                                        <form onSubmit={handleAuth} className="w-full space-y-3">
                                            <div className="relative group">
                                                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Full Name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                    required
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input 
                                                    type="email" 
                                                    placeholder="Email Address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="relative group">
                                                    <Smartphone className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="Mobile (10 digits)"
                                                        value={mobile}
                                                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                                        maxLength={10}
                                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-2 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                        required
                                                    />
                                                </div>
                                                <div className="relative group">
                                                    <Building2 className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                    <input 
                                                        type="text" 
                                                        placeholder="IFSC Code (6 chars)"
                                                        value={ifsc}
                                                        onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 6))}
                                                        maxLength={6}
                                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-2 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 uppercase"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="relative group">
                                                <CreditCard className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    placeholder="Account Number"
                                                    value={accountNumber}
                                                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 18))}
                                                    maxLength={18}
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                    required
                                                />
                                            </div>

                                            <div className="relative group">
                                                <FileBadge className="absolute left-4 top-3.5 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                                <input 
                                                    type="text" 
                                                    placeholder="PAN Number (e.g. ABCDE1234F)"
                                                    value={panCard}
                                                    onChange={(e) => setPanCard(e.target.value.toUpperCase().slice(0, 10))}
                                                    maxLength={10}
                                                    className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600 uppercase"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div 
                                                    className="relative group"
                                                    onMouseEnter={() => setActivePasswordField('signup')}
                                                    onMouseLeave={() => {
                                                        const activeEl = document.activeElement;
                                                        if (activeEl?.getAttribute('name') !== 'password-signup') {
                                                            setActivePasswordField(null);
                                                        }
                                                    }}
                                                >
                                                    <Lock className={`absolute left-4 top-3.5 w-4 h-4 transition-colors ${activePasswordField === 'signup' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                                    <input 
                                                        name="password-signup"
                                                        type={showPassword ? "text" : "password"} 
                                                        placeholder="Password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        onFocus={() => setActivePasswordField('signup')}
                                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-8 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-2 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90 transform"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div 
                                                    className="relative group"
                                                    onMouseEnter={() => setActivePasswordField('signup-confirm')}
                                                    onMouseLeave={() => {
                                                        const activeEl = document.activeElement;
                                                        if (activeEl?.getAttribute('name') !== 'confirm-password-signup') {
                                                            setActivePasswordField(null);
                                                        }
                                                    }}
                                                >
                                                    <KeyRound className={`absolute left-4 top-3.5 w-4 h-4 transition-colors ${activePasswordField === 'signup-confirm' ? 'text-indigo-400' : 'text-slate-500'}`} />
                                                    <input 
                                                        name="confirm-password-signup"
                                                        type={showConfirmPassword ? "text" : "password"} 
                                                        placeholder="Confirm"
                                                        value={confirmPassword}
                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                        onFocus={() => setActivePasswordField('signup-confirm')}
                                                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl py-3 pl-11 pr-8 text-sm text-white focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 focus:outline-none transition-all placeholder:text-slate-600"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-2 top-3.5 text-slate-500 hover:text-white transition-colors cursor-pointer active:scale-90 transform"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="text-red-400 text-xs flex items-center justify-center bg-red-500/10 p-2.5 rounded-xl animate-in fade-in slide-in-from-top-2">
                                                    <AlertCircle className="w-3.5 h-3.5 mr-1.5" /> {error}
                                                </div>
                                            )}

                                            <button 
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all transform active:scale-[0.98] shadow-lg shadow-indigo-500/20 flex items-center justify-center mt-2 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-indigo-500/40 group text-base"
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center">Minting...</span>
                                                ) : (
                                                    <>Register <Rocket className="w-5 h-5 ml-2 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" /></>
                                                )}
                                            </button>
                                        </form>

                                        <div className="mt-6 text-center flex flex-col items-center">
                                            <button 
                                                onClick={toggleMode}
                                                className="text-slate-400 hover:text-white text-sm transition-colors flex items-center mx-auto mb-4"
                                            >
                                                Already have an account? Log In
                                            </button>

                                            <button 
                                                onClick={() => setShowInfo(true)}
                                                className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
                                            >
                                                <HelpCircle className="w-3 h-3 mr-1.5" /> What is NovaCrypto?
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Footer Signature */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
            <div className="bg-slate-900/40 backdrop-blur-md px-6 py-2.5 rounded-full border border-slate-800/50 shadow-2xl">
                <p className="text-sm font-bold tracking-wide">
                <span className="text-slate-400 mr-2 font-medium">Developed by</span>
                <span className="shouryangas-signature">The Shouryangas</span>
                </p>
            </div>
        </div>
        
        <style>{`
            .perspective-container {
                perspective: 1200px;
            }
            .transform-style-3d {
                transform-style: preserve-3d;
            }
            .backface-hidden {
                backface-visibility: hidden;
                -webkit-backface-visibility: hidden;
            }
            .rotate-y-180 {
                transform: rotateY(180deg);
            }
        `}</style>
    </div>
  );
}

export default LoginPage;