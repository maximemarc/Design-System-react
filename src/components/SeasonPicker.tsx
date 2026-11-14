import { backgroundIcons, seasons, type BackgroundIcon, type Season } from '@/components/seasons';
import { Switch } from '@/components/ui';
import '@/components/seasons.css';
import '@/components/celebrations.css';

export function SeasonPicker({
  season,
  onChange,
  motifs,
  onMotifsChange,
  backgroundIcon,
  onIconChange,
}: {
  season: Season;
  onChange: (season: Season) => void;
  motifs: boolean;
  onMotifsChange: (value: boolean) => void;
  backgroundIcon: BackgroundIcon;
  onIconChange: (value: BackgroundIcon) => void;
}) {
  const current = seasons.find(item => item.id === season)!;
  return (
    <section className="season-picker" aria-label="Ambiance saisonnière">
      <div className="season-picker-heading">
        <strong>Ambiance saisonnière</strong>
        <span>{current.name}</span>
      </div>
      <div className="season-options">
        {seasons.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            className={season === id ? 'selected' : ''}
            aria-pressed={season === id}
            onClick={() => onChange(id)}
          >
            <Icon size={21} aria-hidden="true" />
            <span>{name}</span>
          </button>
        ))}
      </div>
      <p>{current.description}</p>
      <div className="season-motifs-control">
        <span>Symboles en arrière-plan</span>
        <Switch checked={motifs} onChange={onMotifsChange} label="Afficher les symboles saisonniers" />
      </div>
      <label className="background-icon-label" htmlFor="background-icon">
        Votre symbole de fond
      </label>
      <select
        id="background-icon"
        className="background-icon-select"
        value={backgroundIcon}
        onChange={event => onIconChange(event.target.value as BackgroundIcon)}
      >
        <option value="auto">Symbole du thème</option>
        {backgroundIcons.map(item => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <div className="background-icon-grid">
        {backgroundIcons.map(({ id, name, icon: Icon }) => (
          <button
            key={id}
            aria-label={name}
            title={name}
            aria-pressed={backgroundIcon === id}
            className={backgroundIcon === id ? 'selected' : ''}
            onClick={() => onIconChange(id)}
          >
            <Icon size={20} />
          </button>
        ))}
      </div>
    </section>
  );
}

export function SeasonalBackground({
  season,
  visible,
  backgroundIcon,
}: {
  season: Season;
  visible: boolean;
  backgroundIcon: BackgroundIcon;
}) {
  const current = seasons.find(item => item.id === season)!;
  if ((season === 'original' && backgroundIcon === 'auto') || !visible) return null;
  const Icon = backgroundIcons.find(item => item.id === backgroundIcon)?.icon ?? current.icon;
  return (
    <div className="seasonal-background" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <Icon key={index} size="1em" className={`season-symbol season-symbol-${index}`} />
      ))}
    </div>
  );
}
