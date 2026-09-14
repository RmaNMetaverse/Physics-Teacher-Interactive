import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { accentContrast, normalizeAppearanceSettings } from '../src/appearance';

describe('appearance settings', () => {
  it('upgrades saved settings from the original dark and light theme shape', () => {
    expect(normalizeAppearanceSettings({ theme: 'dark', sound: true, reducedMotion: false, celebrations: true }))
      .toMatchObject({ theme: 'dark', primaryColor: '#a78bfa', secondaryColor: '#34d399', liquidGlass: true });
  });

  it('accepts all presets and strict six-digit custom colors', () => {
    expect(normalizeAppearanceSettings({ theme: 'eye-comfort', primaryColor: '#7c3aed', secondaryColor: '#059669', liquidGlass: false })).toMatchObject({ theme: 'eye-comfort', liquidGlass: false });
    expect(() => normalizeAppearanceSettings({ theme: 'ocean', primaryColor: 'red', secondaryColor: '#059669' })).toThrow(/color/i);
  });

  it('chooses readable dark or light text for custom primary colors', () => {
    expect(accentContrast('#f4d35e')).toBe('#0b1020');
    expect(accentContrast('#312e81')).toBe('#ffffff');
  });
});

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').trim();
  return [
    parseInt(clean.slice(0, 2), 16) / 255,
    parseInt(clean.slice(2, 4), 16) / 255,
    parseInt(clean.slice(4, 6), 16) / 255,
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(c =>
    c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('design tokens and WCAG contrast', () => {
  const tokensCss = readFileSync(resolve(__dirname, '../src/styles/tokens.css'), 'utf-8');

  it('defines Apple SF Pro font stack and squircle radii', () => {
    expect(tokensCss).toMatch(/-apple-system,\s*BlinkMacSystemFont,\s*"SF Pro Text",\s*"SF Pro Display"/);
    expect(tokensCss).toMatch(/--radius-sm:\s*8px;/);
    expect(tokensCss).toMatch(/--radius-md:\s*12px;/);
    expect(tokensCss).toMatch(/--radius-lg:\s*18px;/);
    expect(tokensCss).toMatch(/--radius-xl:\s*22px;/);
    expect(tokensCss).toMatch(/--radius-full:\s*9999px;/);
    expect(tokensCss).toMatch(/--font-tabular:\s*tabular-nums;/);
  });

  it('calibrates dark theme tokens with WCAG AA contrast against panel and background', () => {
    expect(tokensCss).toMatch(/--bg:\s*#090d16;/);
    expect(tokensCss).toMatch(/--panel:\s*#121824;/);
    expect(tokensCss).toMatch(/--raised:\s*#1c2436;/);
    expect(tokensCss).toMatch(/--sunken:\s*#060910;/);
    expect(tokensCss).toMatch(/--line:\s*#263249;/);
    expect(tokensCss).toMatch(/--line-subtle:\s*#192233;/);
    expect(tokensCss).toMatch(/--text:\s*#f5f8fc;/);
    expect(tokensCss).toMatch(/--muted:\s*#9bb0cb;/);
    expect(tokensCss).toMatch(/--text-subtle:\s*#8297b5;/);

    // WCAG AA requires at least 4.5:1 for normal text
    const mutedVsPanel = getContrastRatio('#9bb0cb', '#121824');
    const mutedVsBg = getContrastRatio('#9bb0cb', '#090d16');
    const subtleVsPanel = getContrastRatio('#8297b5', '#121824');
    const subtleVsBg = getContrastRatio('#8297b5', '#090d16');

    expect(mutedVsPanel).toBeGreaterThanOrEqual(4.5);
    expect(mutedVsBg).toBeGreaterThanOrEqual(4.5);
    expect(subtleVsPanel).toBeGreaterThanOrEqual(4.5);
    expect(subtleVsBg).toBeGreaterThanOrEqual(4.5);
  });

  it('calibrates light theme tokens with WCAG AA contrast against background and panel', () => {
    expect(tokensCss).toMatch(/--bg:\s*#f8fafc;/);
    expect(tokensCss).toMatch(/--panel:\s*#ffffff;/);
    expect(tokensCss).toMatch(/--raised:\s*#edf2f7;/);
    expect(tokensCss).toMatch(/--sunken:\s*#e2e8f0;/);
    expect(tokensCss).toMatch(/--line:\s*#d8e2ed;/);
    expect(tokensCss).toMatch(/--line-subtle:\s*#eef3f8;/);
    expect(tokensCss).toMatch(/--text:\s*#0f172a;/);
    expect(tokensCss).toMatch(/--muted:\s*#475569;/);
    expect(tokensCss).toMatch(/--text-subtle:\s*#5b6e87;/);

    // WCAG AA requires at least 4.5:1 for normal text
    const mutedVsBg = getContrastRatio('#475569', '#f8fafc');
    const mutedVsPanel = getContrastRatio('#475569', '#ffffff');
    const subtleVsBg = getContrastRatio('#5b6e87', '#f8fafc');
    const subtleVsPanel = getContrastRatio('#5b6e87', '#ffffff');

    expect(mutedVsBg).toBeGreaterThanOrEqual(4.5);
    expect(mutedVsPanel).toBeGreaterThanOrEqual(4.5);
    expect(subtleVsBg).toBeGreaterThanOrEqual(4.5);
    expect(subtleVsPanel).toBeGreaterThanOrEqual(4.5);
  });
});

describe('liquid glass layer discipline', () => {
  const appearanceCss = readFileSync(resolve(__dirname, '../src/styles/appearance.css'), 'utf-8');

  const contentCardClasses = [
    '.course-card',
    '.continue-hero',
    '.mission-player',
    '.mission-step',
    '.deep-dive-section',
    '.lab',
    '.xp-card',
    '.streak-card',
    '.mastery-section',
    '.badge-shelf-section',
    '.progress-settings-section',
    '.setting-card',
    '.progress-summary-cards article',
  ];

  it('does not apply backdrop-filter to content cards', () => {
    // Check that no content card selector is part of a backdrop-filter blur rule
    const blurBlocks = appearanceCss.split('}')
      .filter(block => /backdrop-filter:\s*blur/i.test(block));

    for (const block of blurBlocks) {
      for (const cardClass of contentCardClasses) {
        expect(block.includes(cardClass)).toBe(false);
      }
    }
  });

  it('restricts liquid glass strictly to floating functional controls and HUDs', () => {
    const floatingControls = [
      '.adventure-topbar',
      '.mobile-tab-bar',
      '.playback-hud',
      '.appearance-popover',
    ];

    for (const control of floatingControls) {
      expect(appearanceCss).toContain(control);
    }
    expect(appearanceCss).toContain('.liquid-glass-surface');
    expect(appearanceCss).toContain('.liquid-glass-hud');

    // Hairline specular highlight
    expect(appearanceCss).toMatch(/border:\s*1px solid rgba\(255,\s*255,\s*255,\s*0?\.12\);/);
    expect(appearanceCss).toMatch(/box-shadow:[^;]*inset 0 1px 0 rgba\(255,\s*255,\s*255,\s*0?\.18\)/);
  });

  it('enforces opaque fallback for high contrast and reduced transparency', () => {
    expect(appearanceCss).toMatch(/prefers-reduced-transparency:\s*reduce/);
    expect(appearanceCss).toMatch(/\[data-theme="high-contrast"\]/);
    expect(appearanceCss).toMatch(/backdrop-filter:\s*none/);
  });
});

