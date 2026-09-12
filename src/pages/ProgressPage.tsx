import { useState, useId } from 'react';
import { Download, RefreshCw, Upload, Volume2, VolumeX, Sparkles, Zap, Palette, Layers3 } from 'lucide-react';
import { courseCatalog, courses } from '../learning/catalog';
import { createProgressV2, parseProgressV2, serializeProgressV2 } from '../progress/progress';
import type { LearnerProgressV2 } from '../progress/types';
import { XpBar } from '../components/rewards/XpBar';
import { StreakCard } from '../components/rewards/StreakCard';
import { MasteryRing } from '../components/rewards/MasteryRing';
import { BadgeShelf } from '../components/rewards/BadgeShelf';
import { presetFor, themePresets } from '../appearance';

export interface ProgressPageProps {
  progress: LearnerProgressV2;
  onProgressChange?: (next: LearnerProgressV2) => void;
}

export function ProgressPage({ progress, onProgressChange }: ProgressPageProps) {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputId = useId();

  const handleGoalChange = (goal: 1 | 3 | 5) => {
    onProgressChange?.({
      ...progress,
      dailyGoal: goal,
      savedAt: new Date().toISOString(),
    });
  };

  const updateSettings = (partialSettings: Partial<LearnerProgressV2['settings']>) => {
    onProgressChange?.({
      ...progress,
      settings: {
        ...progress.settings,
        ...partialSettings,
      },
      savedAt: new Date().toISOString(),
    });
  };

  const handleExport = () => {
    try {
      const json = serializeProgressV2(progress, courseCatalog);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'physics-teacher-progress.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Export failed gracefully
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = parseProgressV2(text, courseCatalog, new Date());
      onProgressChange?.(imported);
      setImportStatus({ type: 'success', message: 'Progress imported successfully.' });
    } catch (err) {
      setImportStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Invalid progress file format.',
      });
    } finally {
      // Reset input value so same file can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all learning progress? Your preferences and settings will be preserved.'
    );
    if (!confirmed) return;

    const fresh = createProgressV2(new Date());
    const resetProgress: LearnerProgressV2 = {
      ...fresh,
      settings: { ...progress.settings },
      savedAt: new Date().toISOString(),
    };

    onProgressChange?.(resetProgress);
    setImportStatus(null);
  };

  const completedCount = progress.completedMissions.length;
  const completedMissionsCopy = `${completedCount} ${completedCount === 1 ? 'mission completed' : 'missions completed'}`;

  // Resolve recent activity from xpLedger (newest first)
  const ledgerEntries = Object.entries(progress.xpLedger)
    .reverse()
    .map(([key, xp]) => {
      const [courseId, missionId] = key.split('/');
      const course = courseCatalog.courses.get(courseId);
      const mission = course?.missions.find(m => m.id === missionId);
      return {
        key,
        title: mission?.title ?? missionId,
        courseTitle: course?.title ?? courseId,
        xp,
      };
    });

  return (
    <div className="progress-page-container">
      <header className="progress-page-header">
        <p className="eyebrow">Your learning record</p>
        <h1>Progress</h1>
      </header>

      {/* Rewards & Level Dashboard */}
      <section className="progress-rewards-dashboard" aria-label="Level and Rewards">
        <XpBar totalXp={progress.totalXp} />

        <div className="progress-streak-and-goals">
          <StreakCard streak={progress.streak} />

          <div className="daily-goals-card">
            <span className="goal-eyebrow">Daily Learning Goal</span>
            <p className="goal-description">Choose your daily mission target:</p>
            <div className="goal-options" role="group" aria-label="Daily mission target">
              {([1, 3, 5] as const).map(goal => (
                <button
                  key={goal}
                  type="button"
                  aria-pressed={progress.dailyGoal === goal}
                  className={`goal-btn ${progress.dailyGoal === goal ? 'is-selected' : ''}`}
                  onClick={() => handleGoalChange(goal)}
                >
                  {goal} {goal === 1 ? 'mission' : 'missions'} / day
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Course Mastery Section */}
      <section className="progress-mastery-section" aria-labelledby="mastery-heading">
        <div className="mastery-section-header">
          <h2 id="mastery-heading">Course Mastery</h2>
          <span className="total-completed-missions">{completedMissionsCopy}</span>
        </div>

        <div className="mastery-rings-grid">
          {courses.map(course => {
            const completedInCourse = course.missions.filter(m =>
              progress.completedMissions.includes(`${course.id}/${m.id}`)
            ).length;

            return (
              <div key={course.id} className="course-mastery-item">
                <MasteryRing
                  completed={completedInCourse}
                  total={course.missions.length}
                  label={course.title}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Badges Shelf */}
      <BadgeShelf earnedBadges={progress.badges} />

      {/* Recent Activity from Validated Ledger Events */}
      <section className="progress-activity-section" aria-labelledby="recent-activity-heading">
        <h2 id="recent-activity-heading">Recent activity</h2>
        {ledgerEntries.length === 0 ? (
          <p className="empty-activity-copy">No activity recorded yet.</p>
        ) : (
          <ul className="activity-ledger-list">
            {ledgerEntries.map(entry => (
              <li key={entry.key} className="activity-ledger-item">
                <div className="activity-item-info">
                  <strong>{entry.title}</strong>
                  <small>{entry.courseTitle}</small>
                </div>
                <span className="activity-item-xp">+{entry.xp} XP</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Settings & Preferences */}
      <section className="progress-settings-section" aria-labelledby="settings-heading">
        <h2 id="settings-heading">Settings & Preferences</h2>

        <div className="settings-grid">
          <fieldset className="setting-card appearance-card">
            <legend><Palette size={17} aria-hidden="true" /> Color theme</legend>
            <p>Choose a preset designed for a different environment or reading need.</p>
            <div className="theme-preset-grid">
              {themePresets.map(preset => (
                <button
                  key={preset.theme}
                  type="button"
                  className="theme-preset"
                  aria-pressed={progress.settings.theme === preset.theme}
                  aria-label={preset.theme === 'light' ? 'Light mode' : `${preset.label} theme`}
                  onClick={() => updateSettings({ theme: preset.theme, primaryColor: preset.primaryColor, secondaryColor: preset.secondaryColor })}
                >
                  <span className="theme-preview" style={{ '--preview-primary': preset.primaryColor, '--preview-secondary': preset.secondaryColor } as React.CSSProperties} aria-hidden="true" />
                  <span><strong>{preset.label}</strong><small>{preset.description}</small></span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="setting-card custom-color-card">
            <div className="setting-info">
              <strong>Custom colors</strong>
              <small>Personalize actions and progress accents</small>
            </div>
            <div className="color-picker-grid">
              <label>Primary
                <span><input type="color" aria-label="Custom primary color" value={progress.settings.primaryColor ?? presetFor(progress.settings.theme).primaryColor} onChange={event => updateSettings({ primaryColor: event.target.value })} /><code>{progress.settings.primaryColor ?? presetFor(progress.settings.theme).primaryColor}</code></span>
              </label>
              <label>Secondary
                <span><input type="color" aria-label="Custom secondary color" value={progress.settings.secondaryColor ?? presetFor(progress.settings.theme).secondaryColor} onChange={event => updateSettings({ secondaryColor: event.target.value })} /><code>{progress.settings.secondaryColor ?? presetFor(progress.settings.theme).secondaryColor}</code></span>
              </label>
            </div>
            <button type="button" className="secondary-button setting-action-btn" onClick={() => {
              const preset = presetFor(progress.settings.theme);
              updateSettings({ primaryColor: preset.primaryColor, secondaryColor: preset.secondaryColor });
            }}>Reset theme colors</button>
          </div>

          <div className="setting-card">
            <div className="setting-info">
              <strong>Liquid Glass</strong>
              <small>Layer translucent, refractive-looking surfaces over any theme</small>
            </div>
            <button type="button" role="switch" aria-checked={progress.settings.liquidGlass ?? true} className={`toggle-switch ${(progress.settings.liquidGlass ?? true) ? 'is-checked' : ''}`} onClick={() => updateSettings({ liquidGlass: !(progress.settings.liquidGlass ?? true) })} aria-label="Liquid Glass">
              <Layers3 size={16} aria-hidden="true" />
              <span>{(progress.settings.liquidGlass ?? true) ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="setting-card">
            <div className="setting-info">
              <strong>Sound</strong>
              <small>Play restrained synthesized feedback</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.settings.sound}
              className={`toggle-switch ${progress.settings.sound ? 'is-checked' : ''}`}
              onClick={() => updateSettings({ sound: !progress.settings.sound })}
              aria-label="Sound"
            >
              {progress.settings.sound ? (
                <Volume2 size={16} aria-hidden="true" />
              ) : (
                <VolumeX size={16} aria-hidden="true" />
              )}
              <span>{progress.settings.sound ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="setting-card">
            <div className="setting-info">
              <strong>Reduced motion</strong>
              <small>Minimize animations and transitions</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.settings.reducedMotion}
              className={`toggle-switch ${progress.settings.reducedMotion ? 'is-checked' : ''}`}
              onClick={() =>
                updateSettings({ reducedMotion: !progress.settings.reducedMotion })
              }
              aria-label="Reduced motion"
            >
              <Zap size={16} aria-hidden="true" />
              <span>{progress.settings.reducedMotion ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>

          {/* Celebrations Toggle */}
          <div className="setting-card">
            <div className="setting-info">
              <strong>Celebrations</strong>
              <small>Display celebratory bursts on accomplishments</small>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.settings.celebrations}
              className={`toggle-switch ${progress.settings.celebrations ? 'is-checked' : ''}`}
              onClick={() =>
                updateSettings({ celebrations: !progress.settings.celebrations })
              }
              aria-label="Celebrations"
            >
              <Sparkles size={16} aria-hidden="true" />
              <span>{progress.settings.celebrations ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Data Management & Backup Controls */}
      <section className="progress-backup-section" aria-labelledby="backup-heading">
        <h2 id="backup-heading">Data & Backup</h2>
        <p className="backup-description">
          Export your progress file for personal backup, or import your learning record from another device.
        </p>

        {importStatus && (
          <div
            role={importStatus.type === 'error' ? 'alert' : 'status'}
            className={`backup-feedback feedback-${importStatus.type}`}
          >
            {importStatus.message}
          </div>
        )}

        <div className="backup-actions">
          <button
            type="button"
            className="secondary-button export-progress-btn"
            onClick={handleExport}
          >
            <Download size={16} aria-hidden="true" />
            Export progress
          </button>

          <div className="import-file-wrapper">
            <label htmlFor={fileInputId} className="secondary-button import-progress-label">
              <Upload size={16} aria-hidden="true" />
              Import progress
            </label>
            <input
              id={fileInputId}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImportFile}
            />
          </div>

          <button
            type="button"
            className="danger-button reset-progress-btn"
            onClick={handleReset}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Reset progress
          </button>
        </div>
      </section>
    </div>
  );
}
