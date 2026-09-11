import { Flame } from 'lucide-react';

export interface StreakCardProps {
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
  today?: string;
  className?: string;
}

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}

export function StreakCard({ streak, today, className = '' }: StreakCardProps) {
  const todayStr = today ?? getTodayKey();
  const isActiveToday = streak.lastActiveDate === todayStr;

  const currentDaysCopy = `${streak.current} ${streak.current === 1 ? 'day' : 'days'}`;
  const longestDaysCopy = `Longest: ${streak.longest} ${streak.longest === 1 ? 'day' : 'days'}`;

  const statusCopy = isActiveToday
    ? 'Active today'
    : streak.current > 0
    ? 'Practice today to keep your streak'
    : 'Start your streak';

  return (
    <article className={`streak-card ${isActiveToday ? 'is-active' : 'is-idle'} ${className}`}>
      <div className="streak-card-visual">
        <div
          data-testid="streak-flame"
          className={`streak-flame-icon ${isActiveToday ? 'streak-active' : 'streak-inactive'}`}
        >
          <Flame size={28} aria-hidden="true" />
        </div>
      </div>

      <div className="streak-card-content">
        <span className="streak-eyebrow">Daily Streak</span>
        <div className="streak-counts">
          <strong className="streak-current-count">{currentDaysCopy}</strong>
          <small className="streak-longest-count">{longestDaysCopy}</small>
        </div>
        <p className="streak-status-copy">{statusCopy}</p>
      </div>
    </article>
  );
}
