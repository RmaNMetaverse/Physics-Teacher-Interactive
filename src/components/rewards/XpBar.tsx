import { Trophy } from 'lucide-react';

export interface XpBarProps {
  totalXp: number;
  className?: string;
}

export function XpBar({ totalXp, className = '' }: XpBarProps) {
  const safeXp = Math.max(0, Math.floor(totalXp));
  const level = Math.floor(safeXp / 500) + 1;
  const currentLevelXp = safeXp % 500;
  const percent = Math.min(100, Math.round((currentLevelXp / 500) * 100));

  return (
    <div className={`xp-bar-widget ${className}`}>
      <div className="xp-bar-header">
        <div className="xp-level-badge">
          <Trophy size={18} aria-hidden="true" />
          <strong>Level {level}</strong>
        </div>
        <div className="xp-counts">
          <span className="xp-current-progress">{currentLevelXp} / 500 XP</span>
          <span className="xp-total-copy">({safeXp.toLocaleString()} XP total)</span>
        </div>
      </div>

      <progress
        className="xp-progress-bar"
        value={currentLevelXp}
        max={500}
        aria-valuenow={currentLevelXp}
        aria-valuemin={0}
        aria-valuemax={500}
        aria-label={`Progress to Level ${level + 1}`}
      >
        {percent}%
      </progress>
    </div>
  );
}
