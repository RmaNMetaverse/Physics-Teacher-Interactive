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
