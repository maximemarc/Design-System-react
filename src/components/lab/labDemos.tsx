import { useState } from 'react';
import { Info, Moon, Palette, Plus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { Accordion, AnimatedTabs, Drawer, Stepper, Timeline, Tooltip } from '@/components/lab/disclosure';
import {
  ColorPicker,
  Combobox,
  CopyField,
  OtpInput,
  PasswordStrength,
  RangeSlider,
  Rating,
  TagInput,
} from '@/components/lab/inputs';
import {
  Carousel,
  CompareSlider,
  NumberTicker,
  ProgressRing,
  Skeleton,
  SpotlightCard,
} from '@/components/lab/display';
import { CommandPalette, KanbanBoard, type KanbanCard } from '@/components/lab/workflow';

const cities = [
  'Paris',
  'Lyon',
  'Marseille',
  'Bordeaux',
  'Lille',
  'Nantes',
  'Strasbourg',
  'Toulouse',
  'Nice',
  'Rennes',
];
const sampleSlides = [
  { id: 'a', title: 'Composer', description: 'Assemblez des briques cohérentes.', tone: '#477b60' },
  { id: 'b', title: 'Ajuster', description: 'Chaque jeton se règle en direct.', tone: '#2676b8' },
  { id: 'c', title: 'Livrer', description: 'Exportez un thème prêt à l’emploi.', tone: '#b35435' },
];

export function AccordionDemo() {
  return (
    <Accordion
      defaultOpen={['a']}
      items={[
        {
          id: 'a',
          title: 'Qu’est-ce qu’un jeton ?',
          content: 'Une valeur nommée (couleur, arrondi, durée) partagée par tous les composants.',
        },
        {
          id: 'b',
          title: 'Puis-je changer la police ?',
          content: 'Oui, remplacez la variable de typographie dans votre feuille de style.',
        },
        {
          id: 'c',
          title: 'Le mode sombre est-il inclus ?',
          content: 'Chaque composant lit les couleurs du thème actif.',
        },
      ]}
    />
  );
}
export function TabsDemo() {
  return (
    <AnimatedTabs
      label="Vue du projet"
      tabs={[
        { id: 'apercu', label: 'Aperçu', content: 'Résumé du projet et indicateurs clés.' },
        { id: 'activite', label: 'Activité', content: '12 modifications cette semaine.' },
        { id: 'reglages', label: 'Réglages', content: 'Gérez l’accès et les notifications.' },
      ]}
    />
  );
}
export function TooltipDemo() {
  return (
    <div className="lab-row">
      <Tooltip label="Partager ce document">
        <button type="button" className="icon-button" aria-label="Partager">
          <Share2 size={17} />
        </button>
      </Tooltip>
      <Tooltip label="Basculer en mode sombre">
        <button type="button" className="icon-button" aria-label="Mode sombre">
          <Moon size={17} />
        </button>
      </Tooltip>
      <Tooltip label="Les infobulles apparaissent aussi au clavier">
        <button type="button" className="icon-button" aria-label="Informations">
          <Info size={17} />
        </button>
      </Tooltip>
    </div>
  );
}
export function DrawerDemo({ notify }: { notify: Notify }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Ouvrir le panneau
      </Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filtres avancés">
        <p className="modal-copy">Un panneau latéral pour les réglages secondaires, sans quitter la page.</p>
        <Button
          onClick={() => {
            setOpen(false);
            notify('Filtres appliqués (démonstration).');
          }}
        >
          Appliquer
        </Button>
      </Drawer>
    </>
  );
}
export function StepperDemo() {
  const [step, setStep] = useState(1);
  const steps = ['Compte', 'Profil', 'Équipe', 'Terminé'];
  return (
    <div className="lab-stack">
      <Stepper steps={steps} current={step} />
      <div className="lab-row">
        <Button size="small" variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
          Retour
        </Button>
        <Button size="small" disabled={step === steps.length - 1} onClick={() => setStep(step + 1)}>
          Suivant
        </Button>
      </div>
    </div>
  );
}
export function TimelineDemo() {
  return (
    <Timeline
      items={[
        {
          id: '1',
          title: 'Thème publié',
          time: '09:42',
          description: 'Version 1.2 partagée avec l’équipe.',
          tone: 'success',
        },
        { id: '2', title: 'Couleur modifiée', time: 'Hier', description: 'Accent Sauge → Océan.' },
        { id: '3', title: 'Projet créé', time: 'Lun.', tone: 'neutral' },
      ]}
    />
  );
}
export function RatingDemo() {
  const [value, setValue] = useState(4);
  return <Rating label="Votre avis" value={value} onChange={setValue} />;
}
export function TagDemo() {
  const [tags, setTags] = useState(['Design', 'React']);
  return <TagInput label="Compétences" tags={tags} onChange={setTags} />;
}
export function RangeDemo() {
  const [value, setValue] = useState(1200);
  return (
    <RangeSlider
      label="Budget mensuel"
      min={0}
      max={5000}
      step={50}
      value={value}
      onChange={setValue}
      format={number => `${number.toLocaleString('fr')} €`}
    />
  );
}
export function OtpDemo() {
  const [code, setCode] = useState('');
  return (
    <div className="lab-stack">
      <OtpInput label="Code de vérification" value={code} onChange={setCode} />
      <p className="lab-hint" aria-live="polite">
        {code.length === 6 ? `Code complet : ${code} (démonstration)` : 'Collez ou saisissez 6 chiffres.'}
      </p>
    </div>
  );
}
export function ComboboxDemo() {
  const [city, setCity] = useState('Lyon');
  return <Combobox label="Ville" options={cities} value={city} onChange={setCity} />;
}
export function ColorDemo() {
  const [color, setColor] = useState('#2676b8');
  return (
    <div className="lab-stack">
      <ColorPicker label="Couleur de marque" value={color} onChange={setColor} />
      <span className="lab-color-preview" style={{ background: color }}>
        Aperçu
      </span>
    </div>
  );
}
export function StrengthDemo() {
  const [password, setPassword] = useState('Design system');
  return (
    <div className="lab-stack">
      <label className="field-label" htmlFor="lab-password">
        Mot de passe d’exemple
      </label>
      <div className="input-wrap">
        <input
          id="lab-password"
          type="text"
          autoComplete="off"
          value={password}
          onChange={event => setPassword(event.target.value)}
        />
      </div>
      <PasswordStrength value={password} />
    </div>
  );
}
export function CopyDemo() {
  return <CopyField label="Clé publique de démonstration" value="design-system_demo_7Hq2-KX9w" />;
}
export function RingDemo() {
  const [value, setValue] = useState(68);
  return (
    <div className="lab-row">
      <ProgressRing value={value} label="Complété" />
      <div className="lab-stack">
        <Button size="small" variant="secondary" onClick={() => setValue(Math.max(0, value - 10))}>
          −10 %
        </Button>
        <Button size="small" onClick={() => setValue(Math.min(100, value + 10))}>
          +10 %
        </Button>
      </div>
    </div>
  );
}
export function SkeletonDemo() {
  const [loading, setLoading] = useState(true);
  return (
    <div className="lab-stack">
      {loading ? (
        <Skeleton />
      ) : (
        <div className="lab-loaded">
          <span className="avatar">ML</span>
          <div>
            <strong>Marie Leroy</strong>
            <p>Contenu chargé.</p>
          </div>
        </div>
      )}
      <Button size="small" variant="secondary" onClick={() => setLoading(!loading)}>
        {loading ? 'Afficher le contenu' : 'Revenir au chargement'}
      </Button>
    </div>
  );
}
export function TickerDemo() {
  const [value, setValue] = useState(12480);
  return (
    <div className="lab-stack">
      <span className="lab-big-number">
        <NumberTicker value={value} /> €
      </span>
      <Button
        size="small"
        variant="secondary"
        onClick={() => setValue(Math.round(5000 + Math.random() * 40000))}
      >
        Nouvelle valeur
      </Button>
    </div>
  );
}
export function SpotlightDemo() {
  return (
    <SpotlightCard>
      <strong>Survolez cette carte</strong>
      <p>Un halo suit le pointeur pour guider l’attention.</p>
    </SpotlightCard>
  );
}
export function CarouselDemo() {
  return <Carousel label="Étapes design-system" slides={sampleSlides} />;
}
export function CompareDemo() {
  return (
    <CompareSlider
      label="Comparer avant et après"
      before={
        <div className="lab-compare-sample before">
          <strong>Avant</strong>
          <span>Interface brute</span>
        </div>
      }
      after={
        <div className="lab-compare-sample after">
          <strong>Après</strong>
          <span>Thème design-system appliqué</span>
        </div>
      }
    />
  );
}
export function KanbanDemo() {
  const [cards, setCards] = useState<KanbanCard[]>([
    { id: '1', title: 'Audit des couleurs', columnId: 'todo', tag: 'Design' },
    { id: '2', title: 'Composant tableau', columnId: 'doing', tag: 'Dev' },
    { id: '3', title: 'Guide d’usage', columnId: 'done' },
  ]);
  return (
    <KanbanBoard
      columns={[
        { id: 'todo', title: 'À faire' },
        { id: 'doing', title: 'En cours' },
        { id: 'done', title: 'Terminé' },
      ]}
      cards={cards}
      onMove={(cardId, columnId) =>
        setCards(previous => previous.map(card => (card.id === cardId ? { ...card, columnId } : card)))
      }
    />
  );
}
export function CommandDemo({ notify }: { notify: Notify }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Ouvrir la palette
      </Button>
      <CommandPalette
        open={open}
        onClose={() => setOpen(false)}
        commands={[
          {
            id: 'new',
            label: 'Nouveau projet',
            group: 'Actions',
            icon: <Plus size={15} />,
            run: () => notify('Commande « Nouveau projet » exécutée.'),
          },
          {
            id: 'theme',
            label: 'Changer de thème',
            group: 'Actions',
            icon: <Palette size={15} />,
            run: () => notify('Commande « Changer de thème » exécutée.'),
          },
          {
            id: 'share',
            label: 'Partager le lien',
            group: 'Partage',
            icon: <Share2 size={15} />,
            run: () => notify('Commande « Partager » exécutée (démonstration).'),
          },
        ]}
      />
    </>
  );
}
