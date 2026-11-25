import { useCallback, useRef, useState, type Dispatch, type SetStateAction } from 'react';

export type WeddingSettings = { first: string; second: string; date: string };
export type WeddingReply = { name: string; attending: boolean; guests: number };
const storageKey = 'design-system-wedding-settings';
// Données de démonstration : prénoms fictifs et date toujours située dans six mois environ.
function demoDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 182);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T15:00`;
}
const defaults: WeddingSettings = { first: 'Camille', second: 'Alex', date: demoDate() };

function validName(value: unknown, maximum: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maximum;
}

function readWeddingSettings(): { settings: WeddingSettings; reply: WeddingReply | null } {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (!stored || typeof stored !== 'object') return { settings: defaults, reply: null };
    const data = stored as Record<string, unknown>;
    const settings = data.settings as Partial<WeddingSettings> | null;
    const reply = data.reply as Partial<WeddingReply> | null;
    const validSettings =
      settings &&
      validName(settings.first, 40) &&
      validName(settings.second, 40) &&
      typeof settings.date === 'string' &&
      /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(settings.date) &&
      Number.isFinite(new Date(settings.date).getTime());
    const validReply =
      reply &&
      validName(reply.name, 60) &&
      typeof reply.attending === 'boolean' &&
      typeof reply.guests === 'number' &&
      Number.isInteger(reply.guests) &&
      (reply.attending ? reply.guests >= 1 && reply.guests <= 6 : reply.guests === 0);
    return {
      settings: validSettings ? (settings as WeddingSettings) : defaults,
      reply: validReply ? (reply as WeddingReply) : null,
    };
  } catch {
    return { settings: defaults, reply: null };
  }
}

const blockedMessage =
  'La sauvegarde du mariage est bloquée dans ce navigateur. Vos modifications restent disponibles pendant cette visite seulement.';

function persist(settings: WeddingSettings, reply: WeddingReply | null) {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ settings, reply }));
    return '';
  } catch {
    return blockedMessage;
  }
}

// Comme useSavedThemes : on enregistre au moment du changement, pas dans un effet.
export function useWeddingSettings() {
  const [state, setState] = useState(() => ({ ...readWeddingSettings(), storageError: '' }));
  const latest = useRef(state);
  const commit = useCallback((settings: WeddingSettings, reply: WeddingReply | null) => {
    const next = { settings, reply, storageError: persist(settings, reply) };
    latest.current = next;
    setState(next);
  }, []);
  const setSettings: Dispatch<SetStateAction<WeddingSettings>> = useCallback(
    action => {
      const current = latest.current;
      commit(typeof action === 'function' ? action(current.settings) : action, current.reply);
    },
    [commit],
  );
  const setReply: Dispatch<SetStateAction<WeddingReply | null>> = useCallback(
    action => {
      const current = latest.current;
      commit(current.settings, typeof action === 'function' ? action(current.reply) : action);
    },
    [commit],
  );
  return {
    settings: state.settings,
    setSettings,
    reply: state.reply,
    setReply,
    storageError: state.storageError,
  };
}
