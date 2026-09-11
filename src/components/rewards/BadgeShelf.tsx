import { Lock, ShieldCheck } from 'lucide-react';
import { courseCatalog } from '../../learning/catalog';

export interface BadgeShelfProps {
  earnedBadges: string[];
  className?: string;
}

interface BadgeItem {
  id: string;
  title: string;
  description: string;
  courseTitle?: string;
}

function resolveKnownBadges(): BadgeItem[] {
  const items: BadgeItem[] = [];
  const seenIds = new Set<string>();

  for (const [, course] of courseCatalog.courses) {
    for (const mission of course.missions) {
      if (mission.kind === 'checkpoint' && mission.checkpoint?.badgeId) {
        const id = mission.checkpoint.badgeId;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          items.push({
            id,
            title: `${course.title} Checkpoint`,
            description: mission.summary || `Complete all starter missions and the checkpoint in ${course.title}.`,
            courseTitle: course.title,
          });
        }
      }
    }
  }

  return items;
}

function formatBadgeTitle(badgeId: string): string {
  if (badgeId.startsWith('checkpoint:')) {
    const courseId = badgeId.replace('checkpoint:', '');
    const course = courseCatalog.courses.get(courseId);
    if (course) return `${course.title} Checkpoint`;
  }
  if (badgeId.endsWith('-starter')) {
    const courseId = badgeId.replace('-starter', '');
    const course = courseCatalog.courses.get(courseId);
    if (course) return `${course.title} Checkpoint`;
  }
  if (badgeId.endsWith('-badge')) {
    const base = badgeId.replace('-badge', '');
    const course = courseCatalog.courses.get(base);
    if (course) return `${course.title} Checkpoint`;
  }

  return badgeId
    .split(/[-_:]/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') + ' Checkpoint';
}

export function BadgeShelf({ earnedBadges, className = '' }: BadgeShelfProps) {
  const earnedSet = new Set(earnedBadges);
  const knownBadges = resolveKnownBadges();

  // Also include any earned badges that might not be in the starter catalog (e.g. test badges)
  const allBadges: BadgeItem[] = [...knownBadges];
  for (const earnedId of earnedBadges) {
    if (!allBadges.some(b => b.id === earnedId)) {
      allBadges.push({
        id: earnedId,
        title: formatBadgeTitle(earnedId),
        description: `Achieved checkpoint mastery for ${earnedId}.`,
      });
    }
  }

  const count = earnedBadges.length;
  const countCopy = `${count} ${count === 1 ? 'badge' : 'badges'} earned`;

  return (
    <section className={`badge-shelf-section ${className}`} aria-labelledby="badge-shelf-heading">
      <div className="badge-shelf-header">
        <h2 id="badge-shelf-heading">Checkpoint Badges</h2>
        <span className="badge-shelf-count">{countCopy}</span>
      </div>

      {count === 0 && (
        <p className="badge-shelf-empty-hint">
          Complete checkpoints in any course to earn badges.
        </p>
      )}

      <div className="badge-shelf-grid">
        {allBadges.map(badge => {
          const isEarned = earnedSet.has(badge.id);
          return (
            <article
              key={badge.id}
              className={`badge-card ${isEarned ? 'is-earned' : 'is-locked'}`}
              aria-label={`${badge.title} ${isEarned ? 'Earned' : 'Locked'}`}
              data-earned={isEarned}
            >
              <div className="badge-icon-wrapper" aria-hidden="true">
                {isEarned ? (
                  <ShieldCheck size={28} className="badge-icon badge-icon-earned" />
                ) : (
                  <Lock size={24} className="badge-icon badge-icon-locked" />
                )}
              </div>

              <div className="badge-info">
                <strong className="badge-title">{badge.title}</strong>
                <span className={`badge-status-tag ${isEarned ? 'tag-earned' : 'tag-locked'}`}>
                  {isEarned ? 'Earned' : 'Locked'}
                </span>
                <p className="badge-description">{badge.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
