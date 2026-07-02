import React from 'react';

interface AgentAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isAnalyzing?: boolean;
}

/**
 * Cute 3D-style robot avatar — white/lavender round body,
 * dark purple visor eyes, small antenna, thin arms with round hands,
 * tiny legs. Animated: gentle float + visor glow when analyzing.
 */
export function AgentAvatar({ size = 'md', className = '', isAnalyzing = false }: AgentAvatarProps) {
  const sizeMap = { sm: 'w-7 h-7', md: 'w-10 h-10', lg: 'w-16 h-16' };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      <svg
        viewBox="0 0 200 260"
        className="w-full h-full drop-shadow-md"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ filter: 'drop-shadow(0 2px 6px rgba(139,92,246,0.2))' }}
      >
        <defs>
          {/* Body gradient — white to soft lavender */}
          <linearGradient id="agBodyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f8f7ff" />
            <stop offset="50%" stopColor="#ede9fe" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>

          {/* Head gradient — lighter top */}
          <radialGradient id="agHeadGrad" cx="45%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f3f0ff" />
            <stop offset="100%" stopColor="#ddd6fe" />
          </radialGradient>

          {/* Visor gradient — dark purple */}
          <linearGradient id="agVisorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4c1d95" />
            <stop offset="50%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#2e1065" />
          </linearGradient>

          {/* Visor shine */}
          <linearGradient id="agVisorShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0.25" />
            <stop offset="60%" stopColor="white" stopOpacity="0.15" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Hand gradient */}
          <radialGradient id="agHandGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#f5f3ff" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </radialGradient>
        </defs>

        {/* ═══════ Gentle floating animation wrapper ═══════ */}
        <g>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 0,-4; 0,0"
            dur={isAnalyzing ? "1.2s" : "3s"}
            repeatCount="indefinite"
          />

          {/* ── Antenna stem ── */}
          <line x1="100" y1="28" x2="100" y2="8" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
          {/* Antenna ball */}
          <circle cx="100" cy="6" r="5" fill="#a78bfa">
            <animate attributeName="fill" values="#a78bfa;#7c3aed;#a78bfa" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* ── Head (large rounded shape) ── */}
          <ellipse cx="100" cy="72" rx="58" ry="52" fill="url(#agHeadGrad)" stroke="#d8d0f0" strokeWidth="1.5" />

          {/* Head highlight / shine */}
          <ellipse cx="82" cy="48" rx="22" ry="12" fill="white" opacity="0.45" />

          {/* ── Visor (dark purple curved band across face) ── */}
          <rect x="52" y="62" width="96" height="28" rx="14" fill="url(#agVisorGrad)" />
          {/* Visor reflection shine */}
          <rect x="52" y="62" width="96" height="14" rx="14" fill="url(#agVisorShine)" />

          {/* Eyes inside visor — two soft glowing dots */}
          <circle cx="78" cy="76" r="6" fill="#c084fc" opacity="0.9">
            {isAnalyzing && (
              <animate attributeName="r" values="6;4;6" dur="0.8s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="78" cy="74" r="2.5" fill="white" opacity="0.6" />

          <circle cx="122" cy="76" r="6" fill="#c084fc" opacity="0.9">
            {isAnalyzing && (
              <animate attributeName="r" values="6;4;6" dur="0.8s" repeatCount="indefinite" />
            )}
          </circle>
          <circle cx="122" cy="74" r="2.5" fill="white" opacity="0.6" />

          {/* ── Body (egg/capsule shape) ── */}
          <ellipse cx="100" cy="158" rx="38" ry="42" fill="url(#agBodyGrad)" stroke="#d8d0f0" strokeWidth="1.5" />
          {/* Body center accent stripe */}
          <ellipse cx="100" cy="148" rx="8" ry="18" fill="#c4b5fd" opacity="0.3" />
          {/* Body highlight */}
          <ellipse cx="88" cy="140" rx="14" ry="10" fill="white" opacity="0.3" />

          {/* ── Left arm + hand ── */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={isAnalyzing ? "0 62 145; -12 62 145; 0 62 145" : "0 62 145; -5 62 145; 0 62 145"}
              dur={isAnalyzing ? "0.6s" : "2.5s"}
              repeatCount="indefinite"
            />
            {/* Arm */}
            <line x1="64" y1="145" x2="38" y2="175" stroke="#d8d0f0" strokeWidth="4" strokeLinecap="round" />
            {/* Hand */}
            <circle cx="36" cy="178" r="7" fill="url(#agHandGrad)" stroke="#d8d0f0" strokeWidth="1" />
          </g>

          {/* ── Right arm + hand ── */}
          <g>
            <animateTransform
              attributeName="transform"
              type="rotate"
              values={isAnalyzing ? "0 138 145; 12 138 145; 0 138 145" : "0 138 145; 5 138 145; 0 138 145"}
              dur={isAnalyzing ? "0.6s" : "2.5s"}
              repeatCount="indefinite"
            />
            {/* Arm */}
            <line x1="136" y1="145" x2="162" y2="175" stroke="#d8d0f0" strokeWidth="4" strokeLinecap="round" />
            {/* Hand */}
            <circle cx="164" cy="178" r="7" fill="url(#agHandGrad)" stroke="#d8d0f0" strokeWidth="1" />
          </g>

          {/* ── Left leg ── */}
          <line x1="85" y1="196" x2="78" y2="225" stroke="#d8d0f0" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="76" cy="228" rx="8" ry="5" fill="url(#agHandGrad)" stroke="#d8d0f0" strokeWidth="1" />

          {/* ── Right leg ── */}
          <line x1="115" y1="196" x2="122" y2="225" stroke="#d8d0f0" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="124" cy="228" rx="8" ry="5" fill="url(#agHandGrad)" stroke="#d8d0f0" strokeWidth="1" />

        </g>
      </svg>
    </div>
  );
}
