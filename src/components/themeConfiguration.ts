import { backgroundIcons, seasons, type BackgroundIcon, type Season } from '@/components/seasons';
import { type ToastPosition } from '@/components/useToasts';

export type ThemeConfiguration = {
  accent: string;
  accentName: string;
  radius: number;
  dark: boolean;
  motion: boolean;
  density: 'Compact' | 'Confort';
  season: Season;
  motifs: boolean;
  backgroundIcon: BackgroundIcon;
  toastPosition: ToastPosition;
};
export type SavedTheme = { id: string; name: string; configuration: ThemeConfiguration };
export const activeThemeStorageKey = 'forma-active-theme';
export function readActiveTheme(): ThemeConfiguration | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(activeThemeStorageKey) ?? 'null');
    return isThemeConfiguration(value) ? value : null;
  } catch {
    return null;
  }
}

export function accentContrast(color: string) {
  const rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
  const linear = rgb.map(channel =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return {
    onAccent: luminance > 0.179 ? '#172019' : '#ffffff',
    lightInk: luminance > 0.183 ? '#405047' : color,
    darkInk: luminance < 0.24 ? '#cde5d5' : color,
  };
}
const toastPositions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export function isThemeConfiguration(value: unknown): value is ThemeConfiguration {
  if (!value || typeof value !== 'object') return false;
  const theme = value as Record<string, unknown>;
  return (
    typeof theme.accent === 'string' &&
    /^#[0-9a-f]{6}$/i.test(theme.accent) &&
    typeof theme.accentName === 'string' &&
    theme.accentName.length <= 60 &&
    typeof theme.radius === 'number' &&
    Number.isInteger(theme.radius) &&
    theme.radius >= 0 &&
    theme.radius <= 24 &&
    typeof theme.dark === 'boolean' &&
    typeof theme.motion === 'boolean' &&
    typeof theme.motifs === 'boolean' &&
    (theme.density === 'Compact' || theme.density === 'Confort') &&
    seasons.some(item => item.id === theme.season) &&
    (theme.backgroundIcon === 'auto' || backgroundIcons.some(item => item.id === theme.backgroundIcon)) &&
    typeof theme.toastPosition === 'string' &&
    toastPositions.includes(theme.toastPosition)
  );
}
