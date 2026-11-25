import { useEffect, useState } from 'react';
import { backgroundIcons, seasons, type BackgroundIcon, type Season } from '@/components/seasons';

const storageKey = 'design-system-season-preferences';
type Preferences = { season: Season; motifs: boolean; backgroundIcon: BackgroundIcon };
const defaults: Preferences = { season: 'original', motifs: true, backgroundIcon: 'auto' };

export function useSeasonPreferences() {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
      if (!saved || typeof saved !== 'object') return defaults;
      const value = saved as Record<string, unknown>;
      return {
        season: seasons.find(item => item.id === value.season)?.id ?? defaults.season,
        motifs: typeof value.motifs === 'boolean' ? value.motifs : defaults.motifs,
        backgroundIcon:
          value.backgroundIcon === 'auto'
            ? 'auto'
            : (backgroundIcons.find(item => item.id === value.backgroundIcon)?.id ?? 'auto'),
      };
    } catch {
      return defaults;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
      console.warn('Les préférences saisonnières ne peuvent pas être mémorisées dans ce navigateur.');
    }
  }, [preferences]);
  return { preferences, setPreferences };
}
