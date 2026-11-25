/**
 * Le design system s'appelait « forma » jusqu'à la 1.4.1 : ses réglages étaient enregistrés sous
 * des clés `forma-*` (thèmes sauvegardés, thème actif, saisons, position des notifications,
 * faire-part). Cette migration, lancée une fois au démarrage de la vitrine, les recopie sous
 * `design-system-*` quand la nouvelle clé n'existe pas encore, puis retire l'ancienne.
 */
export function migrateLegacyStorage() {
  try {
    const legacy = Object.keys(localStorage).filter(key => key.startsWith('forma-'));
    for (const key of legacy) {
      const next = `design-system-${key.slice('forma-'.length)}`;
      const value = localStorage.getItem(key);
      if (value !== null && localStorage.getItem(next) === null) localStorage.setItem(next, value);
      localStorage.removeItem(key);
    }
  } catch {
    // Stockage indisponible (navigation privée stricte) : rien à migrer.
  }
}
