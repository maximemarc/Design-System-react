import { useRef, useState } from 'react';
import { FolderOpen, Home, Inbox, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import {
  Breadcrumb,
  Checkbox,
  Divider,
  EmptyState,
  Kbd,
  KbdShortcut,
  Notification,
  ProgressBar,
  RadioGroup,
  ScrollArea,
  ScrollProgress,
  Spinner,
  type NotificationTone,
} from '@/components/lab/primitives';

const channels = [
  { id: 'email', label: 'Courriel' },
  { id: 'push', label: 'Notifications mobiles' },
  { id: 'sms', label: 'SMS' },
];

export function CheckboxDemo() {
  const [selected, setSelected] = useState<string[]>(['email']);
  const [terms, setTerms] = useState(false);
  const all = selected.length === channels.length;
  const some = selected.length > 0 && !all;
  return (
    <div className="lab-stack">
      <Checkbox
        label="Tous les canaux"
        description="Coche ou décoche l’ensemble des canaux ci-dessous."
        checked={all}
        indeterminate={some}
        onChange={() => setSelected(all ? [] : channels.map(channel => channel.id))}
      />
      <div className="lab-stack" style={{ paddingLeft: 28, gap: 8 }}>
        {channels.map(channel => (
          <Checkbox
            key={channel.id}
            label={channel.label}
            checked={selected.includes(channel.id)}
            onChange={checked =>
              setSelected(previous =>
                checked ? [...previous, channel.id] : previous.filter(item => item !== channel.id),
              )
            }
          />
        ))}
      </div>
      <Divider />
      <Checkbox
        label="J’accepte les conditions d’utilisation"
        checked={terms}
        onChange={setTerms}
        error={terms ? undefined : 'Obligatoire pour continuer.'}
      />
      <Checkbox label="Option indisponible" checked={false} onChange={() => undefined} disabled />
    </div>
  );
}

export function RadioGroupDemo({ notify }: { notify: Notify }) {
  const [plan, setPlan] = useState('pro');
  const [frequency, setFrequency] = useState('mensuel');
  return (
    <div className="lab-stack">
      <RadioGroup
        label="Formule"
        variant="cards"
        value={plan}
        onChange={value => {
          setPlan(value);
          notify(`Formule « ${value} » choisie.`);
        }}
        options={[
          { value: 'essentiel', label: 'Essentiel', description: '3 projets, 1 membre' },
          { value: 'pro', label: 'Pro', description: 'Projets illimités' },
          { value: 'entreprise', label: 'Entreprise', description: 'Sur devis', disabled: true },
        ]}
      />
      <RadioGroup
        label="Facturation"
        value={frequency}
        onChange={setFrequency}
        options={[
          { value: 'mensuel', label: 'Mensuelle' },
          { value: 'annuel', label: 'Annuelle', description: 'Deux mois offerts' },
        ]}
      />
    </div>
  );
}

const path = [
  { label: 'Accueil', href: '#accueil', icon: <Home size={13} aria-hidden="true" /> },
  { label: 'Projets', href: '#projets' },
  { label: 'forma.', href: '#forma' },
  { label: 'Composants', href: '#composants' },
  { label: 'Saisie', href: '#saisie' },
  { label: 'Case à cocher' },
];

export function BreadcrumbDemo({ notify }: { notify: Notify }) {
  const onNavigate = (item: { label: string }) =>
    notify(`Navigation vers « ${item.label} » (démonstration).`);
  return (
    <div className="lab-stack">
      <Breadcrumb items={path.slice(0, 3)} onNavigate={onNavigate} />
      <Breadcrumb items={path} maxItems={3} onNavigate={onNavigate} label="Fil d'Ariane tronqué" />
      <Breadcrumb
        items={path.slice(1, 4)}
        separator={<span>/</span>}
        onNavigate={onNavigate}
        label="Fil d'Ariane avec barres obliques"
      />
    </div>
  );
}

export function DividerDemo() {
  return (
    <div className="lab-stack">
      <p className="lab-hint">Paramètres du compte</p>
      <Divider />
      <Divider label="ou" />
      <Divider label="Section avancée" align="start" />
      <div className="pr-demo-inline">
        <span>Brouillon</span>
        <Divider orientation="vertical" />
        <span>Modifié il y a 2 min</span>
        <Divider orientation="vertical" />
        <span>3 relecteurs</span>
      </div>
    </div>
  );
}

export function KbdDemo() {
  return (
    <dl className="pr-demo-shortcuts">
      <div>
        <dt>Palette de commandes</dt>
        <dd>
          <KbdShortcut keys={['Ctrl', 'K']} label="Contrôle plus K" />
        </dd>
      </div>
      <div>
        <dt>Tout sélectionner</dt>
        <dd>
          <KbdShortcut keys={['⌘', 'Maj', 'A']} size="sm" label="Commande, Majuscule, A" />
        </dd>
      </div>
      <div>
        <dt>Fermer</dt>
        <dd>
          <Kbd>Échap</Kbd>
        </dd>
      </div>
      <div>
        <dt>Naviguer</dt>
        <dd>
          <KbdShortcut keys={['↑', '↓']} joiner={null} label="Flèches haut et bas" />
        </dd>
      </div>
      <div>
        <dt>Valider</dt>
        <dd>
          <Kbd size="lg">Entrée</Kbd>
        </dd>
      </div>
    </dl>
  );
}

export function SpinnerDemo() {
  return (
    <div className="lab-stack">
      <div className="lab-row" style={{ gap: 20 }}>
        <Spinner variant="ring" />
        <Spinner variant="dots" />
        <Spinner variant="bars" />
        <Spinner variant="pulse" />
      </div>
      <div className="lab-row" style={{ gap: 20 }}>
        <Spinner size="xs" />
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </div>
      <div className="lab-row">
        <Button disabled aria-busy="true">
          <Spinner size="sm" tone="current" label="Enregistrement en cours" />
          Enregistrement…
        </Button>
      </div>
    </div>
  );
}

const tones = [
  { tone: 'accent', label: 'Accent' },
  { tone: 'success', label: 'Succès' },
  { tone: 'warning', label: 'Avertissement' },
  { tone: 'danger', label: 'Danger' },
] as const;

export function ProgressBarDemo() {
  const [value, setValue] = useState(45);
  const tone = value >= 100 ? 'success' : value < 20 ? 'danger' : value < 50 ? 'warning' : 'accent';
  return (
    <div className="lab-stack">
      <ProgressBar label="Téléversement" value={value} tone={tone} showValue />
      <div className="lab-row">
        <Button
          variant="secondary"
          size="small"
          onClick={() => setValue(previous => Math.max(0, previous - 15))}
        >
          −15 %
        </Button>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setValue(previous => Math.min(100, previous + 15))}
        >
          +15 %
        </Button>
      </div>
      <ProgressBar label="Analyse en cours" showValue size="sm" />
      {tones.map(item => (
        <ProgressBar
          key={item.tone}
          label={`Ton ${item.label.toLocaleLowerCase('fr')}`}
          value={70}
          tone={item.tone}
          size="sm"
        />
      ))}
    </div>
  );
}

const logEntries = Array.from({ length: 24 }, (_, index) => ({
  id: index,
  label: ['Déploiement', 'Sauvegarde', 'Synchronisation', 'Vérification'][index % 4] ?? 'Tâche',
  time: `${String(8 + Math.floor(index / 4)).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')}`,
}));

export function ScrollAreaDemo() {
  return (
    <div className="lab-stack">
      <ScrollArea label="Journal des tâches" maxHeight={180}>
        <ul className="pr-demo-log">
          {logEntries.map(entry => (
            <li key={entry.id}>
              <span>
                {entry.label} n° {entry.id + 1}
              </span>
              <time>{entry.time}</time>
            </li>
          ))}
        </ul>
      </ScrollArea>
      <p className="lab-hint">Focalisez la zone puis utilisez les flèches ou Page suivante.</p>
    </div>
  );
}

export function EmptyStateDemo({ notify }: { notify: Notify }) {
  const [filtered, setFiltered] = useState(false);
  return filtered ? (
    <EmptyState
      size="sm"
      icon={<FolderOpen size={18} />}
      title="Aucun résultat"
      description="Aucun projet ne correspond à ces filtres."
      action={
        <Button variant="ghost" size="small" onClick={() => setFiltered(false)}>
          Effacer les filtres
        </Button>
      }
    />
  ) : (
    <EmptyState
      icon={<Inbox size={22} />}
      title="Aucun message"
      description="Les messages de votre équipe apparaîtront ici."
      action={
        <div className="lab-row">
          <Button size="small" onClick={() => notify('Nouveau message (démonstration).')}>
            <Plus size={14} /> Écrire
          </Button>
          <Button variant="secondary" size="small" onClick={() => setFiltered(true)}>
            Variante filtrée
          </Button>
        </div>
      }
    />
  );
}

type DemoNotification = {
  id: string;
  tone: NotificationTone;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
};

const initialNotifications: DemoNotification[] = [
  {
    id: 'a',
    tone: 'info',
    title: 'Nouvelle version disponible',
    description: 'forma. 2.4 apporte les primitives de saisie.',
    timestamp: 'il y a 2 min',
    read: false,
  },
  {
    id: 'b',
    tone: 'success',
    title: 'Export terminé',
    description: 'Le thème a été exporté en CSS.',
    timestamp: 'il y a 1 h',
    read: false,
  },
  {
    id: 'c',
    tone: 'warning',
    title: 'Quota presque atteint',
    description: '92 % de l’espace utilisé.',
    timestamp: 'hier',
    read: true,
  },
  {
    id: 'd',
    tone: 'danger',
    title: 'Échec de synchronisation',
    description: 'Le serveur distant ne répond pas.',
    timestamp: 'hier',
    read: true,
  },
];

export function NotificationDemo({ notify }: { notify: Notify }) {
  const [items, setItems] = useState(initialNotifications);
  const update = (id: string, change: Partial<DemoNotification> | null) =>
    setItems(previous =>
      change === null
        ? previous.filter(item => item.id !== id)
        : previous.map(item => (item.id === id ? { ...item, ...change } : item)),
    );
  if (!items.length) {
    return (
      <EmptyState
        size="sm"
        icon={<Inbox size={18} />}
        title="Tout est lu"
        action={
          <Button variant="secondary" size="small" onClick={() => setItems(initialNotifications)}>
            <RotateCcw size={14} /> Réinitialiser
          </Button>
        }
      />
    );
  }
  return (
    <div className="lab-stack" style={{ gap: 8 }}>
      {items.map(item => (
        <Notification
          key={item.id}
          tone={item.tone}
          title={item.title}
          description={item.description}
          timestamp={item.timestamp}
          read={item.read}
          onRead={() => update(item.id, { read: true })}
          onDismiss={() => update(item.id, null)}
          actions={
            item.tone === 'danger' ? (
              <Button
                size="small"
                variant="secondary"
                onClick={() => notify('Nouvelle tentative lancée.', 'warning')}
              >
                Réessayer
              </Button>
            ) : undefined
          }
        />
      ))}
    </div>
  );
}

const sections = [
  [
    'Des jetons avant tout',
    'Chaque couleur, arrondi et durée est une variable partagée par tous les composants.',
  ],
  [
    'Un thème, deux modes',
    'Le mode sombre redéfinit les mêmes jetons : aucun composant ne connaît le thème actif.',
  ],
  [
    'Accessible par défaut',
    'Rôles ARIA, focus visible et navigation au clavier sont pensés dès la conception.',
  ],
  ['Mouvement maîtrisé', 'Les animations respectent la préférence système et le réglage de la vitrine.'],
  [
    'Composer sans friction',
    'Des primitives simples s’assemblent en écrans complets sans surcharge de style.',
  ],
] as const;

export function ScrollProgressDemo() {
  const articleRef = useRef<HTMLDivElement>(null);
  return (
    <div className="pr-demo-reading">
      <div className="pr-demo-reading-head">
        <ScrollProgress target={articleRef} label="Progression de lecture de l’article" />
        <ScrollProgress target={articleRef} variant="circular" size={36} showValue label="Pourcentage lu" />
      </div>
      <div
        ref={articleRef}
        className="pr-demo-article"
        tabIndex={0}
        role="region"
        aria-label="Article de démonstration"
      >
        {sections.map(([title, text]) => (
          <section key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
            <p>{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
