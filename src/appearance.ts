export type ThemeName = 'light' | 'dark' | 'eye-comfort' | 'ocean' | 'high-contrast';

export interface AppearanceSettings {
  theme: ThemeName;
  primaryColor: string;
  secondaryColor: string;
  liquidGlass: boolean;
}

export const themePresets: ReadonlyArray<AppearanceSettings & { label: string; description: string }> = [
  { theme: 'light', label: 'Light', description: 'Bright and clean', primaryColor: '#7c3aed', secondaryColor: '#059669', liquidGlass: true },
  { theme: 'dark', label: 'Night', description: 'Deep, low-glare surfaces', primaryColor: '#a78bfa', secondaryColor: '#34d399', liquidGlass: true },
  { theme: 'eye-comfort', label: 'Eye Comfort', description: 'Warm paper tones', primaryColor: '#8b5e34', secondaryColor: '#477a5b', liquidGlass: true },
  { theme: 'ocean', label: 'Ocean', description: 'Cool blue focus', primaryColor: '#38bdf8', secondaryColor: '#2dd4bf', liquidGlass: true },
  { theme: 'high-contrast', label: 'High Contrast', description: 'Maximum separation', primaryColor: '#ffd400', secondaryColor: '#00e5ff', liquidGlass: true },
];

const themes = new Set<ThemeName>(themePresets.map(preset => preset.theme));
export const isHexColor = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

export function normalizeAppearanceSettings(value: unknown): AppearanceSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Appearance settings are invalid.');
  const input = value as Record<string, unknown>;
  if (!themes.has(input.theme as ThemeName)) throw new Error('Theme is invalid.');
  const preset = themePresets.find(candidate => candidate.theme === input.theme)!;
  const primaryColor = input.primaryColor ?? preset.primaryColor;
  const secondaryColor = input.secondaryColor ?? preset.secondaryColor;
  if (!isHexColor(primaryColor) || !isHexColor(secondaryColor)) throw new Error('Custom colors must use six-digit hex colors.');
  if (input.liquidGlass !== undefined && typeof input.liquidGlass !== 'boolean') throw new Error('Liquid Glass setting is invalid.');
  return { theme: preset.theme, primaryColor: primaryColor.toLowerCase(), secondaryColor: secondaryColor.toLowerCase(), liquidGlass: input.liquidGlass ?? preset.liquidGlass };
}

export function accentContrast(hex: string): '#0b1020' | '#ffffff' {
  if (!isHexColor(hex)) throw new Error('Accent color is invalid.');
  const [r, g, b] = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return .2126 * r + .7152 * g + .0722 * b > .42 ? '#0b1020' : '#ffffff';
}

export function presetFor(theme: ThemeName) {
  return themePresets.find(preset => preset.theme === theme)!;
}
