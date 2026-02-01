import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, X } from 'lucide-react';

interface ExpandableCardProps {
  children: React.ReactNode | ((args: { isExpanded: boolean }) => React.ReactNode);
  className?: string;
  delay?: number;
}

const ExpandableCard: React.FC<ExpandableCardProps> = ({ children, className = '', delay = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  // Lock body scroll when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const content = typeof children === 'function' ? children({ isExpanded }) : children;

  return (
    <>
      {/* Normal State - Premium Glass Pane */}
      <div 
        className={`relative group bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl backdrop-saturate-150 border border-white/40 dark:border-white/5 rounded-[2.5rem] shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-backwards hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-white/60 dark:hover:border-white/10 ${className}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="absolute top-5 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={toggleExpand}
            className="p-2.5 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 transition-all shadow-sm hover:scale-110 active:scale-95"
            title="Expand View"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <div className="h-full w-full overflow-hidden rounded-[2.5rem]">
            {/* When not expanded, we still render the content, but usually the 'isExpanded' prop passed to children (if function) is false */}
            {typeof children === 'function' ? children({ isExpanded: false }) : children}
        </div>
      </div>

      {/* Expanded State Overlay */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setIsExpanded(false)} />
            
            <div className="relative w-full h-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[3rem] shadow-2xl overflow-hidden animate-expand-card flex flex-col ring-1 ring-white/10">
                {/* Header Controls */}
                <div className="absolute top-6 right-6 z-20 flex items-center space-x-2">
                    <button 
                        onClick={() => setIsExpanded(false)}
                        className="p-4 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors border border-slate-200 dark:border-slate-700 shadow-lg hover:scale-105 active:scale-95"
                        title="Close Full Screen"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content Container - Forces children to adapt to full size */}
                <div className="flex-1 w-full h-full p-8 lg:p-12 overflow-y-auto custom-scrollbar">
                    {/* Render content with isExpanded = true */}
                    {typeof children === 'function' ? children({ isExpanded: true }) : children}
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default ExpandableCard;