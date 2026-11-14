import { useState, type ComponentType } from 'react';
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

export type LabCategory = 'Navigation' | 'Saisie' | 'Affichage' | 'Flux de travail';
export type LabEntry = {
  id: string;
  name: string;
  category: LabCategory;
  description: string;
  code: string;
  Demo: ComponentType<{ notify: Notify }>;
};

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
export const sampleSlides = [
  { id: 'a', title: 'Composer', description: 'Assemblez des briques cohérentes.', tone: '#477b60' },
  { id: 'b', title: 'Ajuster', description: 'Chaque jeton se règle en direct.', tone: '#2676b8' },
  { id: 'c', title: 'Livrer', description: 'Exportez un thème prêt à l’emploi.', tone: '#b35435' },
];

function AccordionDemo() {
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
function TabsDemo() {
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
function TooltipDemo() {
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
function DrawerDemo({ notify }: { notify: Notify }) {
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
function StepperDemo() {
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
function TimelineDemo() {
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
function RatingDemo() {
  const [value, setValue] = useState(4);
  return <Rating label="Votre avis" value={value} onChange={setValue} />;
}
function TagDemo() {
  const [tags, setTags] = useState(['Design', 'React']);
  return <TagInput label="Compétences" tags={tags} onChange={setTags} />;
}
function RangeDemo() {
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
function OtpDemo() {
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
function ComboboxDemo() {
  const [city, setCity] = useState('Lyon');
  return <Combobox label="Ville" options={cities} value={city} onChange={setCity} />;
}
function ColorDemo() {
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
function StrengthDemo() {
  const [password, setPassword] = useState('Forma');
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
function CopyDemo() {
  return <CopyField label="Clé publique de démonstration" value="forma_demo_7Hq2-KX9w" />;
}
function RingDemo() {
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
function SkeletonDemo() {
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
function TickerDemo() {
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
function SpotlightDemo() {
  return (
    <SpotlightCard>
      <strong>Survolez cette carte</strong>
      <p>Un halo suit le pointeur pour guider l’attention.</p>
    </SpotlightCard>
  );
}
function CarouselDemo() {
  return <Carousel label="Étapes forma" slides={sampleSlides} />;
}
function CompareDemo() {
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
          <span>Thème forma appliqué</span>
        </div>
      }
    />
  );
}
function KanbanDemo() {
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
function CommandDemo({ notify }: { notify: Notify }) {
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

export const labCatalog: LabEntry[] = [
  {
    id: 'accordion',
    name: 'Accordéon',
    category: 'Navigation',
    description: 'Sections repliables, simples ou multiples.',
    Demo: AccordionDemo,
    code: `<Accordion multiple items={[{ id: 'a', title: 'Question', content: 'Réponse' }]} />`,
  },
  {
    id: 'tabs',
    name: 'Onglets animés',
    category: 'Navigation',
    description: 'Indicateur fluide et flèches du clavier.',
    Demo: TabsDemo,
    code: `<AnimatedTabs label="Vue" tabs={[{ id: 'a', label: 'Aperçu', content: <Resume /> }]} />`,
  },
  {
    id: 'tooltip',
    name: 'Infobulle',
    category: 'Navigation',
    description: 'Au survol et au focus, fermée par Échap.',
    Demo: TooltipDemo,
    code: `<Tooltip label="Partager"><button>…</button></Tooltip>`,
  },
  {
    id: 'drawer',
    name: 'Panneau latéral',
    category: 'Navigation',
    description: 'Fenêtre glissante accessible.',
    Demo: DrawerDemo,
    code: `<Drawer open={open} onClose={close} title="Filtres">…</Drawer>`,
  },
  {
    id: 'stepper',
    name: 'Étapes',
    category: 'Navigation',
    description: 'Progression d’un parcours en plusieurs temps.',
    Demo: StepperDemo,
    code: `<Stepper steps={['Compte', 'Profil']} current={1} />`,
  },
  {
    id: 'timeline',
    name: 'Chronologie',
    category: 'Affichage',
    description: 'Historique d’activité avec tonalités.',
    Demo: TimelineDemo,
    code: `<Timeline items={[{ id: '1', title: 'Publié', time: '09:42', tone: 'success' }]} />`,
  },
  {
    id: 'rating',
    name: 'Notation',
    category: 'Saisie',
    description: 'Étoiles avec aperçu au survol.',
    Demo: RatingDemo,
    code: `<Rating label="Votre avis" value={note} onChange={setNote} />`,
  },
  {
    id: 'tags',
    name: 'Étiquettes',
    category: 'Saisie',
    description: 'Ajout au clavier, doublons refusés.',
    Demo: TagDemo,
    code: `<TagInput label="Compétences" tags={tags} onChange={setTags} max={8} />`,
  },
  {
    id: 'range',
    name: 'Curseur de valeur',
    category: 'Saisie',
    description: 'Piste remplie et valeur formatée.',
    Demo: RangeDemo,
    code: `<RangeSlider label="Budget" min={0} max={5000} value={v} onChange={setV} format={n => n + ' €'} />`,
  },
  {
    id: 'otp',
    name: 'Code à usage unique',
    category: 'Saisie',
    description: 'Saut automatique et collage du code.',
    Demo: OtpDemo,
    code: `<OtpInput label="Code" length={6} value={code} onChange={setCode} />`,
  },
  {
    id: 'combobox',
    name: 'Liste à recherche',
    category: 'Saisie',
    description: 'Filtrage instantané et navigation clavier.',
    Demo: ComboboxDemo,
    code: `<Combobox label="Ville" options={villes} value={ville} onChange={setVille} />`,
  },
  {
    id: 'color',
    name: 'Sélecteur de couleur',
    category: 'Saisie',
    description: 'Nuancier, couleur libre et code validé.',
    Demo: ColorDemo,
    code: `<ColorPicker label="Marque" value={color} onChange={setColor} />`,
  },
  {
    id: 'strength',
    name: 'Robustesse du mot de passe',
    category: 'Saisie',
    description: 'Critères expliqués en direct.',
    Demo: StrengthDemo,
    code: `<PasswordStrength value={password} />`,
  },
  {
    id: 'copy',
    name: 'Champ à copier',
    category: 'Saisie',
    description: 'Copie en un clic avec retour visible.',
    Demo: CopyDemo,
    code: `<CopyField label="Clé" value="forma_demo" />`,
  },
  {
    id: 'ring',
    name: 'Anneau de progression',
    category: 'Affichage',
    description: 'Pourcentage circulaire animé.',
    Demo: RingDemo,
    code: `<ProgressRing value={68} label="Complété" />`,
  },
  {
    id: 'skeleton',
    name: 'Squelette de chargement',
    category: 'Affichage',
    description: 'Silhouette scintillante en attendant.',
    Demo: SkeletonDemo,
    code: `{loading ? <Skeleton lines={3} /> : <Contenu />}`,
  },
  {
    id: 'ticker',
    name: 'Compteur animé',
    category: 'Affichage',
    description: 'Les chiffres glissent vers leur valeur.',
    Demo: TickerDemo,
    code: `<NumberTicker value={12480} />`,
  },
  {
    id: 'spotlight',
    name: 'Carte projecteur',
    category: 'Affichage',
    description: 'Halo lumineux qui suit le pointeur.',
    Demo: SpotlightDemo,
    code: `<SpotlightCard>…</SpotlightCard>`,
  },
  {
    id: 'carousel',
    name: 'Carrousel',
    category: 'Affichage',
    description: 'Glisser, flèches et points de navigation.',
    Demo: CarouselDemo,
    code: `<Carousel label="Galerie" slides={slides} />`,
  },
  {
    id: 'compare',
    name: 'Comparateur avant/après',
    category: 'Affichage',
    description: 'Séparateur déplaçable entre deux états.',
    Demo: CompareDemo,
    code: `<CompareSlider label="Comparer" before={<Avant />} after={<Apres />} />`,
  },
  {
    id: 'kanban',
    name: 'Tableau Kanban',
    category: 'Flux de travail',
    description: 'Glisser-déposer et boutons de déplacement.',
    Demo: KanbanDemo,
    code: `<KanbanBoard columns={colonnes} cards={cartes} onMove={deplacer} />`,
  },
  {
    id: 'command',
    name: 'Palette de commandes',
    category: 'Flux de travail',
    description: 'Recherche d’actions au clavier.',
    Demo: CommandDemo,
    code: `<CommandPalette open={open} onClose={close} commands={commandes} />`,
  },
];
