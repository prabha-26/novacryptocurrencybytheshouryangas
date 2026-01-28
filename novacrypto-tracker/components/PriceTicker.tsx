import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface PriceTickerProps {
  value: number;
  currencySymbol: string;
  className?: string;
  showArrow?: boolean;
  fractionDigits?: number;
}

const PriceTicker: React.FC<PriceTickerProps> = ({ 
  value, 
  currencySymbol, 
  className = "", 
  showArrow = false,
  fractionDigits = 2 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [direction, setDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      const diff = value - prevValueRef.current;
      setDirection(diff > 0 ? 'up' : 'down');
      setDisplayValue(value);
      prevValueRef.current = value;

      const timeout = setTimeout(() => {
        setDirection('neutral');
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [value]);

  const colorClass = direction === 'up' 
    ? 'text-emerald-500 dark:text-emerald-400' 
    : direction === 'down' 
      ? 'text-red-500 dark:text-red-400' 
      : 'text-slate-900 dark:text-white';

  const appliedClass = direction === 'neutral' ? className : `${className} ${colorClass} transition-colors duration-300`;

  return (
    <span className={`inline-flex flex-wrap items-center tabular-nums tracking-tight break-all ${appliedClass}`}>
      {showArrow && direction === 'up' && <ArrowUp className="w-3 h-3 mr-0.5 animate-bounce flex-shrink-0" />}
      {showArrow && direction === 'down' && <ArrowDown className="w-3 h-3 mr-0.5 animate-bounce flex-shrink-0" />}
      <span>
        {currencySymbol}{displayValue.toLocaleString(undefined, { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })}
      </span>
    </span>
  );
};

export default PriceTicker;