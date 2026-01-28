import React, { useState, useEffect } from 'react';
import CryptoCoin, { CoinSymbol, CoinAnimation } from './CryptoCoin';
import { Wallet, BrainCircuit, History, Clock, Bot, Binary, LineChart } from 'lucide-react';

interface BackgroundParticlesProps {
  density?: 'low' | 'medium' | 'high';
  className?: string;
  variant?: 'dashboard' | 'portfolio' | 'transactions' | 'analysis';
}

// Helper to render lucide icons as floating particles
const IconParticle: React.FC<{ icon: any, size: number, className?: string }> = ({ icon: Icon, size, className }) => (
  <div className={className} style={{ width: size, height: size }}>
    <Icon size={size} className="text-slate-400 dark:text-slate-600 opacity-20" />
  </div>
);

const BackgroundParticles: React.FC<BackgroundParticlesProps> = ({ density = 'medium', className = '', variant = 'dashboard' }) => {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Determine particle count based on density
    const count = density === 'high' ? 50 : density === 'medium' ? 25 : 12;
    
    // Define available symbols/icons based on variant
    const getParticleType = () => {
      const rand = Math.random();
      
      if (variant === 'portfolio') {
        if (rand > 0.7) return 'WALLET';
        if (rand > 0.5) return 'CHART';
      } else if (variant === 'transactions') {
        if (rand > 0.7) return 'HISTORY';
        if (rand > 0.5) return 'CLOCK';
      } else if (variant === 'analysis') {
        if (rand > 0.7) return 'BRAIN';
        if (rand > 0.5) return 'BOT';
        if (rand > 0.3) return 'BINARY';
      }
      
      // Default / Dashboard mix
      const symbols: CoinSymbol[] = ['BTC', 'ETH', 'SOL', 'GENERIC'];
      return symbols[Math.floor(Math.random() * symbols.length)];
    };

    const animations: CoinAnimation[] = ['spin', 'float', 'pulse'];

    const newParticles = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100, // 0-100%
      delay: Math.random() * 20, // 0-20s delay
      duration: Math.random() * 20 + 15, // 15-35s duration
      size: Math.random() * 40 + 20, // 20-60px size
      type: getParticleType(),
      animation: animations[Math.floor(Math.random() * animations.length)],
      drift: Math.random() * 100 - 50, // -50 to 50px drift
      opacity: Math.random() * 0.4 + 0.1 // 0.1 - 0.5 opacity
    }));
    
    setParticles(newParticles);
  }, [density, variant]);

  const renderParticleContent = (p: any) => {
    switch (p.type) {
      case 'WALLET': return <IconParticle icon={Wallet} size={p.size} />;
      case 'HISTORY': return <IconParticle icon={History} size={p.size} />;
      case 'CLOCK': return <IconParticle icon={Clock} size={p.size} />;
      case 'BRAIN': return <IconParticle icon={BrainCircuit} size={p.size} />;
      case 'BOT': return <IconParticle icon={Bot} size={p.size} />;
      case 'BINARY': return <IconParticle icon={Binary} size={p.size} />;
      case 'CHART': return <IconParticle icon={LineChart} size={p.size} />;
      default: return (
        <CryptoCoin 
           symbol={p.type} 
           size={p.size} 
           animation={p.animation} 
           interactive={false}
        />
      );
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle-float"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `-${p.delay}s`,
            // @ts-ignore - CSS variables
            '--drift': `${p.drift}px`,
            '--target-opacity': p.opacity,
            opacity: 0
          }}
        >
          {renderParticleContent(p)}
        </div>
      ))}
    </div>
  );
};

export default React.memo(BackgroundParticles);