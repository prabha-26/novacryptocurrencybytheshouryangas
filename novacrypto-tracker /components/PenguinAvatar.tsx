import React, { useEffect, useRef, useState } from 'react';

interface PenguinAvatarProps {
  isLookingBack: boolean;
  hasSunglasses?: boolean;
  className?: string;
  variant?: 'login' | 'signup';
}

const PenguinAvatar: React.FC<PenguinAvatarProps> = ({ isLookingBack, hasSunglasses = true, className = '' }) => {
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [headTilt, setHeadTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Calculate distance from center
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      
      const angle = Math.atan2(dy, dx);
      // Max movement radius for pupil (eye radius ~3.5, pupil ~1.5 => ~2px movement)
      // Dampen the movement distance relative to screen position for eyes
      const maxRadius = 2.5; 
      const distance = Math.min(maxRadius, Math.hypot(dx, dy) / 15);

      // Head Tilt Calculations (Max ~15 degrees)
      // We normalize based on window size to get a feel of "looking at screen location"
      const tiltLimit = 15;
      const tiltX = Math.max(-tiltLimit, Math.min(tiltLimit, (dy / window.innerHeight) * 30)); // Look Up/Down
      const tiltY = Math.max(-tiltLimit, Math.min(tiltLimit, (dx / window.innerWidth) * 30));  // Look Left/Right

      if (!isLookingBack) {
          setPupilPos({
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance
          });
          setHeadTilt({ x: -tiltX, y: tiltY });
      } else {
          // If looking back, reset tracking or invert? 
          // Resetting feels more natural for the "hiding" state
          setPupilPos({ x: 0, y: 0 });
          setHeadTilt({ x: 0, y: 0 });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isLookingBack]);

  return (
    <div className={`relative w-full h-full flex items-center justify-center ${className}`} style={{ perspective: '800px' }}>
      <div 
        ref={containerRef}
        className="w-full h-full relative transition-transform duration-700 ease-in-out"
        style={{ 
            transformStyle: 'preserve-3d',
            transform: isLookingBack ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* ================= FRONT FACE ================= */}
        <div 
            className="absolute inset-0 transition-transform duration-100 ease-out" 
            style={{ 
                backfaceVisibility: 'hidden', 
                WebkitBackfaceVisibility: 'hidden',
                // Apply head tilt only when facing front
                transform: `rotateX(${headTilt.x}deg) rotateY(${headTilt.y}deg)` 
            }}
        >
            <svg
                viewBox="0 0 120 120"
                className="w-full h-full drop-shadow-xl"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                <linearGradient id="pandaFace" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f3f4f6" />
                </linearGradient>
                <filter id="glassesShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="2" stdDeviation="1" floodOpacity="0.3" />
                </filter>
                <linearGradient id="shadesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                </defs>

                {/* Ears */}
                <circle cx="25" cy="35" r="13" fill="#111827" />
                <circle cx="95" cy="35" r="13" fill="#111827" />

                {/* Head */}
                <circle cx="60" cy="65" r="42" fill="url(#pandaFace)" />

                {/* Eye Patches */}
                <ellipse cx="42" cy="58" rx="13" ry="10" fill="#111827" transform="rotate(-15, 42, 58)" />
                <ellipse cx="78" cy="58" rx="13" ry="10" fill="#111827" transform="rotate(15, 78, 58)" />

                {/* Eyes (Visible behind clear glasses or if shades are off) */}
                {/* Apply Pupil Tracking Position */}
                <g>
                    <circle cx="44" cy="56" r="3.5" fill="white" />
                    <circle cx={45 + pupilPos.x} cy={55 + pupilPos.y} r="1.5" fill="#111827" />
                    
                    <circle cx="76" cy="56" r="3.5" fill="white" />
                    <circle cx={75 + pupilPos.x} cy={55 + pupilPos.y} r="1.5" fill="#111827" />
                </g>

                {/* Eyewear Container */}
                <g filter="url(#glassesShadow)">
                    {hasSunglasses ? (
                        <>
                            {/* Dark Shades */}
                            {/* Left Lens */}
                            <circle cx="42" cy="58" r="15" fill="url(#shadesGradient)" stroke="#F59E0B" strokeWidth="2.5" />
                            {/* Right Lens */}
                            <circle cx="78" cy="58" r="15" fill="url(#shadesGradient)" stroke="#F59E0B" strokeWidth="2.5" />
                            
                            {/* Lens Glare/Reflection */}
                            <path d="M35 52 Q 40 48 45 52" stroke="white" strokeWidth="2" opacity="0.2" fill="none" strokeLinecap="round" />
                            <path d="M71 52 Q 76 48 81 52" stroke="white" strokeWidth="2" opacity="0.2" fill="none" strokeLinecap="round" />
                        </>
                    ) : (
                        <>
                            {/* Clear Spectacles */}
                            {/* Left Lens */}
                            <circle cx="42" cy="58" r="14" stroke="#F59E0B" strokeWidth="2.5" fill="white" fillOpacity="0.1" />
                            {/* Right Lens */}
                            <circle cx="78" cy="58" r="14" stroke="#F59E0B" strokeWidth="2.5" fill="white" fillOpacity="0.1" />
                        </>
                    )}

                    {/* Bridge */}
                    <path d="M57 58 Q 60 55 63 58" stroke="#F59E0B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    
                    {/* Arms */}
                    <path d="M27 58 L 15 52" stroke="#F59E0B" strokeWidth="2" fill="none" />
                    <path d="M93 58 L 105 52" stroke="#F59E0B" strokeWidth="2" fill="none" />
                </g>
                
                {/* Nose/Muzzle */}
                <ellipse cx="60" cy="74" rx="5" ry="3.5" fill="#111827" />
                <path d="M56 78 Q 60 82 64 78" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                
                {/* Cheeks */}
                <circle cx="35" cy="72" r="4" fill="#fecaca" opacity="0.4" />
                <circle cx="85" cy="72" r="4" fill="#fecaca" opacity="0.4" />
            </svg>
        </div>

        {/* ================= BACK FACE ================= */}
        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
             <svg
                viewBox="0 0 120 120"
                className="w-full h-full drop-shadow-xl"
                xmlns="http://www.w3.org/2000/svg"
            >
                 <defs>
                    <linearGradient id="pandaBack" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#e5e7eb" />
                    </linearGradient>
                </defs>

                {/* Ears (Visible from back) */}
                <circle cx="25" cy="35" r="13" fill="#111827" />
                <circle cx="95" cy="35" r="13" fill="#111827" />

                {/* Head (Back) */}
                <circle cx="60" cy="65" r="42" fill="url(#pandaBack)" />
                
                {/* Back Markings / Shoulders */}
                <path d="M 18 65 Q 60 40 102 65 L 102 100 Q 60 110 18 100 Z" fill="#1f2937" />
                
                {/* Small Tail */}
                <circle cx="60" cy="95" r="8" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1" />
            </svg>
        </div>
      </div>
    </div>
  );
};

export default PenguinAvatar;