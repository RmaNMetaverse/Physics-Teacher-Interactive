import { useEffect, useRef, useState } from 'react';

export interface CelebrationProps {
  active?: boolean;
  celebrationsEnabled?: boolean;
  reducedMotionEnabled?: boolean;
  soundEnabled?: boolean;
  durationMs?: number;
  onComplete?: () => void;
  className?: string;
}

function checkSystemReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function playSynthesizedSound(): void {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  try {
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio contexts may be blocked by autoplay policies
  }
}

export function Celebration({
  active = true,
  celebrationsEnabled = true,
  reducedMotionEnabled = false,
  soundEnabled = false,
  durationMs = 1200,
  onComplete,
  className = '',
}: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const soundPlayedRef = useRef(false);

  const isMotionReduced = reducedMotionEnabled || checkSystemReducedMotion();
  const isAllowed = active && celebrationsEnabled && !isMotionReduced;

  useEffect(() => {
    if (!active) {
      setIsVisible(false);
      return;
    }

    if (!isAllowed) {
      setIsVisible(false);
      onComplete?.();
      return;
    }

    setIsVisible(true);

    if (soundEnabled && !soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playSynthesizedSound();
    }

    const timer = window.setTimeout(() => {
      setIsVisible(false);
      onComplete?.();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [active, isAllowed, soundEnabled, durationMs, onComplete]);

  if (!isAllowed || !isVisible) {
    return null;
  }

  return (
    <div
      className={`celebration-container ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Celebration! Achievement completed!</span>
      <div
        data-testid="celebration-burst"
        className="celebration-burst"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 200 200"
          className="celebration-burst-svg"
          width="200"
          height="200"
        >
          {/* Central spark */}
          <circle cx="100" cy="100" r="14" className="celebration-core" fill="#f59e0b" />
          {/* Radial particles */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x2 = 100 + Math.cos(rad) * 60;
            const y2 = 100 + Math.sin(rad) * 60;
            const dotX = 100 + Math.cos(rad) * 75;
            const dotY = 100 + Math.sin(rad) * 75;
            return (
              <g key={i} className="celebration-ray-group">
                <line
                  x1="100"
                  y1="100"
                  x2={x2}
                  y2={y2}
                  stroke="#38bdf8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="celebration-ray"
                />
                <circle
                  cx={dotX}
                  cy={dotY}
                  r="4"
                  fill="#ec4899"
                  className="celebration-dot"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
