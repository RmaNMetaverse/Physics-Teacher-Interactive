import { useEffect, useRef } from 'react';
import { Layers3, X, Zap } from 'lucide-react';
import type { FontName, ThemeName } from '../../appearance';
import type { LearnerProgressV2 } from '../../progress/types';

export interface AppearancePopoverProps {
  isOpen: boolean;
  onClose: () => void;
  settings: LearnerProgressV2['settings'];
  onUpdateSettings: (settings: Partial<LearnerProgressV2['settings']>) => void;
}

interface ThemeOption {
  id: ThemeName;
  label: string;
  description: string;
  previewPrimary: string;
  previewSecondary: string;
}

const THEME_OPTIONS: readonly ThemeOption[] = [
  { id: 'dark', label: 'Dark', description: 'Deep, low-glare surfaces', previewPrimary: '#a78bfa', previewSecondary: '#34d399' },
  { id: 'light', label: 'Light', description: 'Bright and clean', previewPrimary: '#7c3aed', previewSecondary: '#059669' },
  { id: 'eye-comfort', label: 'Eye Comfort', description: 'Warm paper tones', previewPrimary: '#8b5e34', previewSecondary: '#477a5b' },
  { id: 'ocean', label: 'Ocean', description: 'Cool blue focus', previewPrimary: '#38bdf8', previewSecondary: '#2dd4bf' },
  { id: 'high-contrast', label: 'High Contrast', description: 'Maximum separation', previewPrimary: '#ffd400', previewSecondary: '#00e5ff' },
];

const FONT_OPTIONS: ReadonlyArray<{ id: FontName; label: string; description: string }> = [
  { id: 'modern-sans', label: 'Modern Sans', description: 'Space Grotesk for clear, everyday reading' },
  { id: 'technical-mono', label: 'Technical Mono', description: 'JetBrains Mono for a precise lab-console feel' },
  { id: 'retro-computer', label: 'Retro Computer', description: 'IBM Plex Mono for a softer vintage-computer character' },
];

export function AppearancePopover({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: AppearancePopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLiquidGlass = settings.liquidGlass ?? true;
  const isReducedMotion = settings.reducedMotion ?? false;

  return (
    <div
      ref={popoverRef}
      className="appearance-popover liquid-glass-surface"
      role="dialog"
      aria-label="Appearance settings"
      aria-modal="true"
    >
      <div className="appearance-popover-header">
        <h2 className="appearance-popover-title">Appearance & Display</h2>
        <button
          type="button"
          className="appearance-popover-close"
          aria-label="Close appearance settings"
          onClick={onClose}
        >
          <X size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="appearance-popover-section">
        <span className="appearance-popover-section-title">Theme</span>
        <div className="appearance-popover-themes" role="group" aria-label="Theme options">
          {THEME_OPTIONS.map(theme => {
            const isSelected = settings.theme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                data-theme={theme.id}
                aria-pressed={isSelected}
                className={`appearance-theme-chip ${isSelected ? 'is-active' : ''}`}
                onClick={() => onUpdateSettings({ theme: theme.id })}
              >
                <span
                  className="appearance-theme-swatch"
                  style={
                    {
                      '--swatch-primary': theme.previewPrimary,
                      '--swatch-secondary': theme.previewSecondary,
                    } as React.CSSProperties
                  }
                  aria-hidden="true"
                />
                <span className="appearance-theme-label">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="appearance-popover-section">
        <span className="appearance-popover-section-title">Type</span>
        <div className="appearance-font-options" role="group" aria-label="Font options">
          {FONT_OPTIONS.map(font => {
            const selected = (settings.font ?? 'modern-sans') === font.id;
            return (
              <button
                key={font.id}
                type="button"
                aria-pressed={selected}
                className={`appearance-font-choice appearance-font-${font.id} ${selected ? 'is-active' : ''}`}
                onClick={() => onUpdateSettings({ font: font.id })}
              >
                <span className="appearance-font-choice-label">{font.label}</span>
                <span className="appearance-font-choice-description">{font.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="appearance-popover-section">
        <span className="appearance-popover-section-title">Visual Effects</span>
        <div className="appearance-popover-toggles">
          <div className="appearance-toggle-row">
            <div className="appearance-toggle-info">
              <span className="appearance-toggle-label">Liquid Glass</span>
              <span className="appearance-toggle-desc">Translucent materials & specular highlights</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isLiquidGlass}
              aria-label="Liquid Glass"
              className={`toggle-switch ${isLiquidGlass ? 'is-checked' : ''}`}
              onClick={() => onUpdateSettings({ liquidGlass: !isLiquidGlass })}
            >
              <Layers3 size={16} aria-hidden="true" />
              <span>{isLiquidGlass ? 'On' : 'Off'}</span>
            </button>
          </div>

          <div className="appearance-toggle-row">
            <div className="appearance-toggle-info">
              <span className="appearance-toggle-label">Reduced Motion</span>
              <span className="appearance-toggle-desc">Minimize animations and transitions</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isReducedMotion}
              aria-label="Reduced motion"
              className={`toggle-switch ${isReducedMotion ? 'is-checked' : ''}`}
              onClick={() => onUpdateSettings({ reducedMotion: !isReducedMotion })}
            >
              <Zap size={16} aria-hidden="true" />
              <span>{isReducedMotion ? 'On' : 'Off'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="appearance-popover-footer">
        <a
          href="#/progress"
          className="appearance-more-settings"
          onClick={onClose}
        >
          More Settings
        </a>
      </div>
    </div>
  );
}
