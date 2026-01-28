import React, { useState, useRef, useEffect } from 'react';
import { PortfolioItem, ChatMessage, CoinData, AIAnalysisResult } from '../types';
import { GoogleGenAI } from "@google/genai";
import { BrainCircuit, Send, Loader2, Bot, User, Sparkles, Activity, AlertTriangle, TrendingUp, TrendingDown, Target, ShieldAlert } from 'lucide-react';
import { analyzePortfolio } from '../services/geminiService';

interface AIAssistantProps {
  portfolio: PortfolioItem[];
  marketData: CoinData[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ portfolio, marketData }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis'>('chat');
  
  // Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm Nova. I can chat about market trends or perform a deep-dive analysis of your portfolio health, risk exposure, and diversification. What would you like to do?",
      timestamp: Date.now()
    }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Deep Analysis State
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        System: You are Nova, a helpful crypto assistant.
        User Input: "${userMsg.text}"
        Context: The user has ${portfolio.length} assets.
        Keep answers short and conversational.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      const responseText = response.text || "I'm having trouble connecting right now.";

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  const runDeepAnalysis = async () => {
    setActiveTab('analysis');
    setIsAnalysisLoading(true);
    const result = await analyzePortfolio(portfolio);
    setAnalysisResult(result);
    setIsAnalysisLoading(false);
  };

  // Helper for Heatmap Colors
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]';
      case 'MEDIUM': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)]';
      case 'HIGH': return 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]';
      case 'EXTREME': return 'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] max-w-6xl mx-auto bg-white/40 dark:bg-slate-900/40 rounded-[2rem] border border-white/40 dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
      {/* Glass Header with Tabs */}
      <div className="p-5 border-b border-white/20 dark:border-white/10 flex items-center justify-between bg-white/30 dark:bg-slate-900/30">
        <div className="flex items-center">
             <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-4 shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center">
                    Nova AI Analyst
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20 backdrop-blur-sm tracking-wide">ONLINE</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Powered by Gemini 3 Flash</p>
            </div>
        </div>
        
        <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-white/10 dark:border-white/5 backdrop-blur-md">
            <button 
                onClick={() => setActiveTab('chat')}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'chat' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                Chat
            </button>
            <button 
                onClick={runDeepAnalysis}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center ${activeTab === 'analysis' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Activity className="w-3.5 h-3.5 mr-2" /> Deep Analysis
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        
        {/* === CHAT TAB === */}
        {activeTab === 'chat' && (
            <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/10 dark:bg-slate-900/10 custom-scrollbar">
                    {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mx-3 shadow-md border border-white/10 ${
                                msg.role === 'user' 
                                ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                                : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                            }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                            </div>
                            <div className={`p-5 rounded-3xl shadow-lg backdrop-blur-md text-sm leading-relaxed border ${
                                msg.role === 'user'
                                ? 'bg-white/80 dark:bg-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tr-sm border-white/20 dark:border-white/5'
                                : 'bg-white/60 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 rounded-tl-sm border-white/20 dark:border-white/5'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    </div>
                    ))}
                    {isChatLoading && (
                        <div className="flex justify-start ml-16">
                             <div className="p-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-3xl rounded-tl-sm border border-white/20 dark:border-white/5 shadow-sm flex items-center space-x-3">
                                 <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Nova is processing...</span>
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                {/* Input */}
                <div className="p-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-t border-white/20 dark:border-white/10">
                    <form onSubmit={handleSend} className="relative">
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your portfolio..."
                            className="w-full bg-white/60 dark:bg-slate-800/60 border border-white/30 dark:border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            disabled={isChatLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isChatLoading}
                            className="absolute right-3 top-3 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* === DEEP ANALYSIS TAB === */}
        {activeTab === 'analysis' && (
            <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                {isAnalysisLoading ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white animate-pulse">Running Deep Portfolio Simulation...</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Calculating risk vectors and rebalancing scenarios</p>
                    </div>
                ) : analysisResult ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        
                        {/* Summary Card (Glass) */}
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/30 dark:border-white/5 shadow-xl">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center">
                                <Sparkles className="w-5 h-5 text-amber-500 mr-2" /> Executive Summary
                            </h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">{analysisResult.summary}</p>
                            <div className="mt-5 flex items-center space-x-3">
                                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Market Sentiment</span>
                                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                                    analysisResult.marketSentiment === 'BULLISH' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                                    analysisResult.marketSentiment === 'BEARISH' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20'
                                }`}>
                                    {analysisResult.marketSentiment}
                                </span>
                            </div>
                        </div>

                        {/* Scores Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Health Score */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/30 dark:border-white/5 shadow-xl relative overflow-hidden group">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Portfolio Health</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{analysisResult.healthScore}</span>
                                    <div className={`h-20 w-20 rounded-full border-8 flex items-center justify-center shadow-inner ${
                                        analysisResult.healthScore > 70 ? 'border-emerald-500/20 text-emerald-500' : 
                                        analysisResult.healthScore > 40 ? 'border-amber-500/20 text-amber-500' : 'border-red-500/20 text-red-500'
                                    }`}>
                                        <Activity className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-3 mt-6 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${
                                        analysisResult.healthScore > 70 ? 'bg-emerald-500' : 
                                        analysisResult.healthScore > 40 ? 'bg-amber-500' : 'bg-red-500'
                                    }`} style={{ width: `${analysisResult.healthScore}%` }}></div>
                                </div>
                            </div>

                            {/* Diversification Score */}
                            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/30 dark:border-white/5 shadow-xl">
                                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4">Diversification Score</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{analysisResult.diversificationScore}</span>
                                    <div className="h-20 w-20 rounded-full border-8 border-indigo-500/20 text-indigo-500 flex items-center justify-center shadow-inner">
                                        <Target className="w-8 h-8" />
                                    </div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-3 mt-6 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${analysisResult.diversificationScore}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Heatmap */}
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/30 dark:border-white/5 shadow-xl">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <ShieldAlert className="w-5 h-5 text-red-500 mr-2" /> Risk Heat Map
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {analysisResult.riskHeatmap.map((item, idx) => (
                                    <div key={idx} className="group relative bg-white/50 dark:bg-slate-700/30 rounded-2xl p-5 border border-white/40 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-700/50 transition-all hover:-translate-y-1 shadow-sm">
                                        <div className={`absolute top-0 left-0 w-full h-1.5 rounded-t-2xl ${getRiskColor(item.riskLevel)}`}></div>
                                        <h4 className="font-bold text-slate-900 dark:text-white mt-2 text-sm">{item.asset}</h4>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 inline-block ${
                                            item.riskLevel === 'LOW' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' :
                                            item.riskLevel === 'MEDIUM' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400' :
                                            'bg-red-500/10 text-red-700 dark:text-red-400'
                                        }`}>{item.riskLevel} RISK</span>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2 font-medium">
                                            {item.reason}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Smart Rebalancing Suggestions */}
                        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/30 dark:border-white/5 shadow-xl">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                                <Target className="w-5 h-5 text-indigo-500 mr-2" /> "What If" Rebalancing Simulation
                            </h3>
                            <div className="space-y-3">
                                {analysisResult.rebalanceSuggestions.length > 0 ? (
                                    analysisResult.rebalanceSuggestions.map((sugg, idx) => (
                                        <div key={idx} className="flex items-start p-4 bg-white/50 dark:bg-slate-700/30 rounded-2xl border border-white/40 dark:border-white/5 transition-all hover:bg-white/80 dark:hover:bg-slate-700/50">
                                            <div className={`mt-0.5 p-2 rounded-lg mr-4 backdrop-blur-md shadow-sm ${
                                                sugg.action === 'BUY' ? 'bg-emerald-100 text-emerald-600' :
                                                sugg.action === 'SELL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                            }`}>
                                                {sugg.action === 'BUY' ? <TrendingUp className="w-5 h-5" /> : 
                                                 sugg.action === 'SELL' ? <TrendingDown className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {sugg.action} {sugg.asset}
                                                </h4>
                                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">{sugg.reason}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center p-8 text-slate-500">
                                        <p>Your portfolio is perfectly balanced. No actions recommended.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="bg-indigo-500/10 p-8 rounded-full mb-6 border border-indigo-500/20 backdrop-blur-sm">
                            <BrainCircuit className="w-20 h-20 text-indigo-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Deep Portfolio Intelligence</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-lg mb-10 text-lg">
                            Let Nova analyze your holdings to generate a health score, visualize risk heatmaps, and provide smart "what-if" rebalancing scenarios.
                        </p>
                        <button 
                            onClick={runDeepAnalysis}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-2xl shadow-[0_10px_40px_-10px_rgba(79,70,229,0.5)] transition-all transform hover:scale-105 active:scale-95 flex items-center text-lg backdrop-blur-md"
                        >
                            <Sparkles className="w-5 h-5 mr-3" /> Start Analysis
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;