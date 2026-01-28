import React from 'react';
import { Bitcoin } from 'lucide-react';

export type CoinAnimation = 'float' | 'spin' | 'pulse' | 'flip-load' | 'shake' | 'success' | 'none';
export type CoinSymbol = 'BTC' | 'ETH' | 'SOL' | 'GENERIC' | string;

interface CryptoCoinProps {
  symbol?: CoinSymbol;
  image?: string;
  size?: number; // pixel size
  animation?: CoinAnimation;
  className?: string;
  interactive?: boolean; // Enable hover effects
}

const CryptoCoin: React.FC<CryptoCoinProps> = ({ 
  symbol = 'GENERIC', 
  image,
  size = 48, 
  animation = 'float',
  className = '',
  interactive = false
}) => {
  
  // Normalize symbol for theme matching
  const safeSymbol = symbol?.toUpperCase() || 'GENERIC';

  const getThemeClass = () => {
    if (safeSymbol === 'BTC' || safeSymbol === 'BITCOIN') return 'coin-btc';
    if (safeSymbol === 'ETH' || safeSymbol === 'ETHEREUM') return 'coin-eth';
    if (safeSymbol === 'SOL' || safeSymbol === 'SOLANA') return 'coin-sol';
    return 'coin-generic';
  };

  const getAnimationClass = () => {
    switch (animation) {
      case 'float': return 'anim-float';
      case 'spin': return 'anim-spin';
      case 'pulse': return 'anim-pulse';
      case 'flip-load': return 'anim-flip-load';
      case 'shake': return 'anim-shake';
      case 'success': return 'anim-success';
      default: return '';
    }
  };

  const renderContent = () => {
    if (image) {
        // Use the image if provided (from API)
        return <img src={image} alt={symbol} className="w-full h-full object-cover rounded-full" style={{ padding: '0' }} />;
    }

    // Fallback icons for manual usage
    switch (safeSymbol) {
      case 'BTC': return <Bitcoin size={size * 0.5} strokeWidth={2.5} />;
      case 'ETH': return <span style={{ fontSize: size * 0.5, fontWeight: 800 }}>Ξ</span>;
      case 'SOL': return <span style={{ fontSize: size * 0.4, letterSpacing: -1, fontWeight: 800 }}>◎</span>;
      default: return <span style={{ fontSize: size * 0.5, fontWeight: 800 }}>$</span>;
    }
  };

  return (
    <div 
      className={`coin-scene ${className}`} 
      style={{ width: size, height: size }}
    >
      <div className={`coin-object ${getThemeClass()} ${getAnimationClass()} ${interactive ? 'hover-flip' : ''}`}>
        {/* Front Face */}
        <div className="coin-face coin-face-front">
          {renderContent()}
        </div>
        {/* Back Face (visible on spin/flip) */}
        <div className="coin-face coin-face-back">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CryptoCoin;