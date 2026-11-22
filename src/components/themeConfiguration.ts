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

export { accentContrast } from '@/lib/theme';
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
