export interface MasteryRingProps {
  completed?: number;
  total?: number;
  percent?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function MasteryRing({
  completed,
  total,
  percent,
  label,
  size = 72,
  strokeWidth = 6,
  className = '',
}: MasteryRingProps) {
  const hasCounts = total !== undefined && completed !== undefined;
  const pct = hasCounts
    ? total > 0
      ? Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
      : 0
    : Math.min(100, Math.max(0, percent ?? 0));

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (pct / 100) * circumference;

  const accessibleLabel = label ? `${label}: ${pct}% complete` : `${pct}% complete`;

  return (
    <div className={`mastery-ring-widget ${className}`}>
      <div className="mastery-ring-visual">
        <svg
          role="img"
          aria-label={accessibleLabel}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="mastery-ring-svg"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="mastery-ring-track"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
            className="mastery-ring-progress"
          />
        </svg>
        <span className="mastery-ring-percentage" aria-hidden="true">
          {pct}%
        </span>
      </div>

      {hasCounts && (
        <div className="mastery-ring-details">
          {label && <strong className="mastery-ring-label">{label}</strong>}
          <span className="mastery-ring-count">
            {completed} of {total} {total === 1 ? 'mission' : 'missions'} complete
          </span>
        </div>
      )}
    </div>
  );
}
