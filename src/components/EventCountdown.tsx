import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Sparkle } from 'lucide-react';
import { Button, Modal } from '@/components/ui';
import { DatePicker } from '@/components/DatePicker';
import { type WeddingSettings } from '@/components/useWeddingSettings';
import '@/components/themes.css';
import '@/components/interactive.css';
import '@/components/countdown.css';

const localDateString = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export default function EventCountdown({
  settings,
  setSettings,
}: {
  settings: WeddingSettings;
  setSettings: Dispatch<SetStateAction<WeddingSettings>>;
}) {
  const [draft, setDraft] = useState(settings);
  const [editing, setEditing] = useState(false);
  const [timeInput, setTimeInput] = useState(settings.date.slice(11, 16));
  const [syncedDate, setSyncedDate] = useState(settings.date);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  // Resynchronise le champ heure quand la date change ailleurs, pendant le rendu
  // plutôt que dans un effet (évite un rendu en cascade).
  if (syncedDate !== settings.date) {
    setSyncedDate(settings.date);
    setTimeInput(settings.date.slice(11, 16));
  }
  const target = new Date(settings.date);
  const remaining = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  const values = [
    Math.floor(remaining / 86400),
    Math.floor(remaining / 3600) % 24,
    Math.floor(remaining / 60) % 60,
    remaining % 60,
  ];
  const updateDate = (date: Date | null) => {
    if (!date) return;
    setSettings(previous => ({
      ...previous,
      date: `${localDateString(date)}T${previous.date.slice(11, 16)}`,
    }));
    setNow(Date.now());
  };
  const updateTime = (time: string) => {
    setTimeInput(time);
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return;
    setSettings(previous => ({ ...previous, date: `${previous.date.slice(0, 10)}T${time}` }));
    setNow(Date.now());
  };
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return (
    <article className="specimen countdown-specimen">
      <div className="specimen-label">
        13 <span>Événement & compte à rebours</span>
        <Button
          variant="ghost"
          size="small"
          onClick={() => {
            setDraft(settings);
            setEditing(true);
          }}
        >
          Personnaliser
        </Button>
      </div>
      <div className="countdown-picker-controls">
        <DatePicker label="Date de votre événement" value={target} onChange={updateDate} allowClear={false} />
        <div className="countdown-time-field">
          <label className="field-label" htmlFor="countdown-time">
            Heure de l’événement
          </label>
          <input
            id="countdown-time"
            type="time"
            step="60"
            required
            value={timeInput}
            aria-invalid={!timeInput}
            aria-describedby="countdown-time-help"
            onChange={event => updateTime(event.target.value)}
          />
        </div>
        <p id="countdown-time-help" className="countdown-picker-help">
          {timeInput
            ? `Actualisation immédiate · Fuseau horaire : ${timezone}.`
            : 'Choisissez une heure valide. Le compteur conserve la dernière heure choisie.'}
        </p>
      </div>
      <div className="wedding-preview">
        <span className="wedding-eyebrow">
          <Sparkle size={18} />
          Nous nous marions !<Sparkle size={18} />
        </span>
        <h2>
          {settings.first} <span>&</span> {settings.second}
        </h2>
        <p>
          {new Intl.DateTimeFormat('fr', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }).format(target)}{' '}
          à {new Intl.DateTimeFormat('fr', { hour: '2-digit', minute: '2-digit' }).format(target)}
        </p>
        {remaining ? (
          <div className="countdown-values" aria-label="Temps restant avant l’événement">
            {['Jours', 'Heures', 'Minutes', 'Secondes'].map((label, index) => (
              <div key={label}>
                <strong>{String(values[index]).padStart(2, '0')}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="countdown-finished">Le grand jour est arrivé !</div>
        )}
      </div>
      <p className="demo-note">
        Modèle inspiré de votre image. Choisissez une date et une heure pour actualiser le compteur. Les
        prénoms, la date et l’heure sont mémorisés dans ce navigateur.
      </p>
      <Modal open={editing} onClose={() => setEditing(false)} title="Votre événement">
        <form
          className="dialog-form"
          onSubmit={event => {
            event.preventDefault();
            if (
              !draft.first.trim() ||
              !draft.second.trim() ||
              !Number.isFinite(new Date(draft.date).getTime())
            )
              return;
            setSettings({ ...draft, first: draft.first.trim(), second: draft.second.trim() });
            setNow(Date.now());
            setEditing(false);
          }}
        >
          <label htmlFor="event-first">Premier prénom</label>
          <input
            id="event-first"
            required
            pattern=".*\S.*"
            maxLength={40}
            value={draft.first}
            onChange={event => setDraft({ ...draft, first: event.target.value })}
          />
          <label htmlFor="event-second">Second prénom</label>
          <input
            id="event-second"
            required
            pattern=".*\S.*"
            maxLength={40}
            value={draft.second}
            onChange={event => setDraft({ ...draft, second: event.target.value })}
          />
          <label htmlFor="event-date">Date et heure</label>
          <input
            id="event-date"
            type="datetime-local"
            required
            value={draft.date}
            onChange={event => setDraft({ ...draft, date: event.target.value })}
          />
          <div className="dialog-footer">
            <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
              Annuler
            </Button>
            <Button type="submit">Mettre à jour l’aperçu</Button>
          </div>
        </form>
      </Modal>
    </article>
  );
}
