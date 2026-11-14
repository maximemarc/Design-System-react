import { useState } from 'react';
import { CalendarDays, ChartNoAxesCombined, Check, Eye, EyeOff, Minus, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { DatePicker } from '@/components/DatePicker';
import { CustomChart } from '@/components/CustomChart';
import '@/components/interactive.css';

export default function InteractiveShowcase({ notify }: { notify: Notify }) {
  const [title, setTitle] = useState('Mon prochain projet');
  const [secret, setSecret] = useState('exemple-demo');
  const [visible, setVisible] = useState(false);
  const [quantity, setQuantity] = useState(3);
  const [priority, setPriority] = useState('Normale');
  const [date, setDate] = useState<Date | null>(null);
  return (
    <div className="interactive-gallery">
      <article className="specimen">
        <div className="specimen-label">
          11 <span>Champs & calendrier personnalisés</span>
          <CalendarDays size={17} />
        </div>
        <div className="advanced-heading">
          <div>
            <h3>Chaque détail sous contrôle.</h3>
            <p>Champs enrichis, boutons de sélection et calendrier.</p>
          </div>
        </div>
        <form
          className="custom-input-form"
          onSubmit={event => {
            event.preventDefault();
            notify(
              `Exemple validé : ${title.trim()}, ${quantity} participant(s), priorité ${priority.toLowerCase()}${date ? `, le ${date.toLocaleDateString('fr')}` : ''}. Aucune donnée enregistrée.`,
            );
          }}
        >
          <div>
            <label className="field-label" htmlFor="custom-title">
              Nom du projet
            </label>
            <div className="input-wrap">
              <Search size={16} />
              <input
                id="custom-title"
                value={title}
                required
                pattern=".*\S.*"
                maxLength={80}
                onChange={event => setTitle(event.target.value)}
              />
              <button type="button" onClick={() => setTitle('')} aria-label="Effacer le nom">
                ×
              </button>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="custom-secret">
              Texte confidentiel de démonstration
            </label>
            <div className="input-wrap">
              <input
                id="custom-secret"
                type={visible ? 'text' : 'password'}
                value={secret}
                autoComplete="off"
                maxLength={80}
                onChange={event => setSecret(event.target.value)}
              />
              <button
                type="button"
                aria-label={visible ? 'Masquer le texte' : 'Afficher le texte'}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
              >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="field-label" htmlFor="participant-count">
              Participants
            </label>
            <div className="quantity-control">
              <Button
                type="button"
                variant="secondary"
                size="small"
                aria-label="Retirer un participant"
                disabled={quantity === 1}
                onClick={() => setQuantity(quantity - 1)}
              >
                <Minus size={14} />
              </Button>
              <input
                id="participant-count"
                type="number"
                min="1"
                max="20"
                value={quantity}
                onChange={event => {
                  const value = Number(event.target.value);
                  if (Number.isInteger(value) && value >= 1 && value <= 20) setQuantity(value);
                }}
              />
              <Button
                type="button"
                variant="secondary"
                size="small"
                aria-label="Ajouter un participant"
                disabled={quantity === 20}
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus size={14} />
              </Button>
            </div>
          </div>
          <DatePicker value={date} onChange={setDate} label="Date de lancement" />
          <fieldset className="priority-field">
            <legend className="field-label">Priorité</legend>
            <div className="theme-options">
              {['Basse', 'Normale', 'Haute'].map(value => (
                <button
                  type="button"
                  key={value}
                  className={priority === value ? 'selected' : ''}
                  aria-pressed={priority === value}
                  onClick={() => setPriority(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="custom-submit">
            <Button type="submit">
              <Check size={15} />
              Tester la validation
            </Button>
          </div>
        </form>
        <p className="demo-note">Ces champs sont des exemples temporaires, pas un formulaire de compte.</p>
      </article>
      <article className="specimen">
        <div className="specimen-label">
          12 <span>Graphique sur mesure</span>
          <ChartNoAxesCombined size={17} />
        </div>
        <div className="advanced-heading">
          <div>
            <h3>Les chiffres prennent forme.</h3>
            <p>Changez de période, de représentation et explorez chaque valeur.</p>
          </div>
        </div>
        <CustomChart />
      </article>
    </div>
  );
}
