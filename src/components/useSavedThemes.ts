import { useState } from 'react';
import { isThemeConfiguration, type SavedTheme } from '@/components/themeConfiguration';

const storageKey = 'forma-saved-themes';
export function useSavedThemes() {
  const [savedThemes, setSavedThemes] = useState<SavedTheme[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]');
      if (!Array.isArray(stored)) return [];
      return stored
        .filter(
          (item): item is SavedTheme =>
            item &&
            typeof item === 'object' &&
            typeof item.id === 'string' &&
            typeof item.name === 'string' &&
            item.name.length <= 60 &&
            isThemeConfiguration(item.configuration),
        )
        .slice(0, 20);
    } catch {
      return [];
    }
  });
  const [storageError, setStorageError] = useState('');
  const saveThemes = (next: SavedTheme[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSavedThemes(next);
      setStorageError('');
      return true;
    } catch {
      setStorageError(
        'Votre navigateur ne permet pas cette sauvegarde. Exportez votre configuration pour la conserver.',
      );
      return false;
    }
  };
  return { savedThemes, saveThemes, storageError };
}
