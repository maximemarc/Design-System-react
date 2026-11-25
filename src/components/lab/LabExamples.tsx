import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Command as CommandIcon,
  Heart,
  KanbanSquare,
  MessageSquareText,
  Palette,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Undo2,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import {
  Accordion,
  Drawer,
  Stepper,
  Timeline,
  Tooltip,
  type TimelineEntry,
} from '@/components/lab/disclosure';
import {
  ColorPicker,
  CopyField,
  OtpInput,
  PasswordStrength,
  RangeSlider,
  Rating,
  TagInput,
} from '@/components/lab/inputs';
import { passwordScore } from '@/components/lab/password';
import { Carousel, NumberTicker, ProgressRing, SpotlightCard } from '@/components/lab/display';
import { CommandPalette, KanbanBoard, type KanbanCard } from '@/components/lab/workflow';
import { AuthTemplate, ContactTemplate, SettingsTemplate } from '@/components/templates/forms';
import {
  ActivityFeedTemplate,
  CommandCenterTemplate,
  FileManagerTemplate,
} from '@/components/templates/workspace';
import { AnalyticsTemplate, BlogArticleTemplate, SaasLandingTemplate } from '@/components/templates/pages';
import '@/components/lab/lab.css';

const onboardingSteps = ['Compte', 'Vérification', 'Préférences', 'Prêt'];

function OnboardingExample({ notify }: { notify: Notify }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [color, setColor] = useState('#477b60');
  const [size, setSize] = useState(8);
  const [interests, setInterests] = useState<string[]>(['Design']);
  const canContinue = [
    name.trim().length > 1 && passwordScore(password) >= 3,
    code.length === 6,
    interests.length > 0,
    true,
  ][step];
  const restart = () => {
    setStep(0);
    setName('');
    setPassword('');
    setCode('');
    setInterests(['Design']);
  };
  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        A <span>Parcours d’inscription</span>
        <ShieldCheck size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Bienvenue dans votre espace.</h3>
          <p>Étapes, robustesse, code et préférences réunis dans un seul parcours.</p>
        </div>
        <ProgressRing size={84} value={(step / (onboardingSteps.length - 1)) * 100} label="Profil" />
      </div>
      <Stepper steps={onboardingSteps} current={step} />
      <form
        className="lab-example-body"
        onSubmit={event => {
          event.preventDefault();
          if (!canContinue) return;
          if (step === 2) notify(`Espace prêt pour ${name.trim()}. Démonstration : aucun compte créé.`);
          setStep(step + 1);
        }}
      >
        {step === 0 && (
          <div className="lab-split">
            <div className="lab-stack">
              <label className="field-label" htmlFor="onboard-name">
                Nom complet
              </label>
              <div className="input-wrap">
                <input
                  id="onboard-name"
                  value={name}
                  maxLength={60}
                  autoComplete="off"
                  onChange={event => setName(event.target.value)}
                  placeholder="Camille Martin"
                />
              </div>
              <label className="field-label" htmlFor="onboard-password">
                Mot de passe d’exemple
              </label>
              <div className="input-wrap">
                <input
                  id="onboard-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                />
              </div>
            </div>
            <PasswordStrength value={password} />
          </div>
        )}
        {step === 1 && (
          <div className="lab-stack">
            <OtpInput label="Saisissez n’importe quel code à 6 chiffres" value={code} onChange={setCode} />
            <p className="lab-hint">Démonstration : aucun code n’est réellement envoyé.</p>
          </div>
        )}
        {step === 2 && (
          <div className="lab-split">
            <div className="lab-stack">
              <TagInput label="Centres d’intérêt" tags={interests} onChange={setInterests} max={5} />
              <RangeSlider
                label="Taille de l’équipe"
                min={1}
                max={50}
                value={size}
                onChange={setSize}
                format={value => `${value} pers.`}
              />
            </div>
            <ColorPicker label="Couleur de l’espace" value={color} onChange={setColor} />
          </div>
        )}
        {step === 3 && (
          <div className="lab-success" style={{ borderColor: color }}>
            <CheckCircle2 size={28} style={{ color }} />
            <div>
              <strong>Tout est prêt, {name.trim()} !</strong>
              <p>
                {size} personne(s) · {interests.join(', ')}
              </p>
            </div>
          </div>
        )}
        <div className="lab-example-actions">
          {step > 0 && step < 3 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              Retour
            </Button>
          )}
          {step < 3 ? (
            <Button type="submit" disabled={!canContinue}>
              {step === 2 ? 'Terminer' : 'Continuer'}
            </Button>
          ) : (
            <Button variant="secondary" onClick={restart}>
              <RotateCcw size={15} />
              Recommencer
            </Button>
          )}
        </div>
        {step === 0 && !canContinue && (
          <p className="lab-hint">Indiquez un nom et un mot de passe d’au moins niveau « Bon ».</p>
        )}
      </form>
    </article>
  );
}

const columns = [
  { id: 'todo', title: 'À faire' },
  { id: 'doing', title: 'En cours' },
  { id: 'done', title: 'Terminé' },
];
const initialCards: KanbanCard[] = [
  { id: 'k1', title: 'Palette automnale', columnId: 'todo', tag: 'Design' },
  { id: 'k2', title: 'Page de tarifs', columnId: 'todo', tag: 'Produit' },
  { id: 'k3', title: 'Tableau des membres', columnId: 'doing', tag: 'Dev' },
  { id: 'k4', title: 'Guide des jetons', columnId: 'done', tag: 'Docs' },
];
const clock = () => new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });

function ProjectExample({ notify }: { notify: Notify }) {
  const [cards, setCards] = useState(initialCards);
  const [history, setHistory] = useState<TimelineEntry[]>([]);
  const [palette, setPalette] = useState(false);
  const [counter, setCounter] = useState(1);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
        event.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const log = (title: string, description: string, tone: TimelineEntry['tone'] = 'accent') =>
    setHistory(previous =>
      [
        { id: `${Date.now()}-${previous.length}`, title, time: clock(), description, tone },
        ...previous,
      ].slice(0, 5),
    );
  const move = (cardId: string, columnId: string) => {
    const card = cards.find(item => item.id === cardId);
    const column = columns.find(item => item.id === columnId);
    if (!card || !column) return;
    setCards(previous => previous.map(item => (item.id === cardId ? { ...item, columnId } : item)));
    log(card.title, `Déplacée vers « ${column.title} »`, columnId === 'done' ? 'success' : 'accent');
  };
  const addCard = () => {
    const title = `Nouvelle tâche ${counter}`;
    setCards(previous => [...previous, { id: `new-${counter}`, title, columnId: 'todo', tag: 'Idée' }]);
    setCounter(counter + 1);
    log(title, 'Ajoutée à « À faire »', 'neutral');
  };
  const done = cards.filter(card => card.columnId === 'done').length;
  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        B <span>Tableau de projet</span>
        <KanbanSquare size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Sprint « Automne ».</h3>
          <p>Kanban, compteurs animés, chronologie et palette de commandes connectés.</p>
        </div>
        <div className="lab-row">
          <Button variant="secondary" size="small" onClick={() => setPalette(true)}>
            <CommandIcon size={14} />
            Commandes <kbd className="lab-kbd">⌘ J</kbd>
          </Button>
          <Button size="small" onClick={addCard}>
            <Plus size={14} />
            Tâche
          </Button>
        </div>
      </div>
      <div className="lab-stats">
        <SpotlightCard>
          <small>Tâches</small>
          <strong>
            <NumberTicker value={cards.length} />
          </strong>
        </SpotlightCard>
        <SpotlightCard>
          <small>Terminées</small>
          <strong>
            <NumberTicker value={done} />
          </strong>
        </SpotlightCard>
        <SpotlightCard>
          <small>Avancement</small>
          <strong>
            <NumberTicker value={cards.length ? (done / cards.length) * 100 : 0} /> %
          </strong>
        </SpotlightCard>
      </div>
      <div className="lab-project-layout">
        <KanbanBoard columns={columns} cards={cards} onMove={move} />
        <div className="lab-activity">
          <strong>Activité récente</strong>
          <Timeline items={history} emptyLabel="Déplacez une carte pour voir l’historique." />
        </div>
      </div>
      <CommandPalette
        open={palette}
        onClose={() => setPalette(false)}
        commands={[
          { id: 'add', label: 'Ajouter une tâche', group: 'Tableau', icon: <Plus size={15} />, run: addCard },
          {
            id: 'finish',
            label: 'Tout marquer comme terminé',
            group: 'Tableau',
            icon: <CheckCircle2 size={15} />,
            run: () => {
              setCards(previous => previous.map(card => ({ ...card, columnId: 'done' })));
              log('Toutes les tâches', 'Marquées comme terminées', 'success');
            },
          },
          {
            id: 'reset',
            label: 'Réinitialiser le tableau',
            group: 'Tableau',
            icon: <Undo2 size={15} />,
            run: () => {
              setCards(initialCards);
              setHistory([]);
              notify('Tableau réinitialisé.');
            },
          },
          {
            id: 'theme',
            label: 'Ouvrir la personnalisation',
            group: 'Navigation',
            icon: <Palette size={15} />,
            run: () => notify('Le panneau « À votre image » se trouve à droite de l’écran.'),
          },
        ]}
      />
    </article>
  );
}

const productSlides = [
  { id: 'p1', title: 'Lampe Halo', description: 'Verre soufflé, lumière chaude.', tone: '#b35435' },
  { id: 'p2', title: 'Variante Sauge', description: 'Teinte mate, finition douce.', tone: '#477b60' },
  { id: 'p3', title: 'Variante Nuit', description: 'Noir profond, laiton brossé.', tone: '#2f2f2f' },
];

function ProductExample({ notify }: { notify: Notify }) {
  const [rating, setRating] = useState(0);
  const [favorite, setFavorite] = useState(false);
  const [reviews, setReviews] = useState(false);
  const [quantity, setQuantity] = useState(1);
  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        C <span>Fiche produit</span>
        <ShoppingBag size={17} />
      </div>
      <div className="lab-product">
        <Carousel label="Photos du produit" slides={productSlides} />
        <div className="lab-stack">
          <div className="lab-product-head">
            <div>
              <Badge tone="accent">
                <Sparkles size={12} />
                Nouveauté
              </Badge>
              <h3>Lampe Halo</h3>
            </div>
            <Tooltip align="end" label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
              <button
                type="button"
                className={`icon-button lab-favorite ${favorite ? 'active' : ''}`}
                aria-pressed={favorite}
                aria-label="Favori"
                onClick={() => setFavorite(!favorite)}
              >
                <Heart size={18} />
              </button>
            </Tooltip>
          </div>
          <p className="lab-price">
            {(89 * quantity).toLocaleString('fr')} € <span>· {quantity} article(s)</span>
          </p>
          <RangeSlider label="Quantité" min={1} max={10} value={quantity} onChange={setQuantity} />
          <Rating
            label="Notez ce produit"
            value={rating}
            onChange={value => {
              setRating(value);
              notify(`Merci pour votre note de ${value}/5 (démonstration).`);
            }}
          />
          <CopyField label="Code de bienvenue" value="DESIGN-SYSTEM-BIENVENUE" />
          <div className="lab-row">
            <Button onClick={() => notify('Ajouté au panier de démonstration : aucun paiement demandé.')}>
              <ShoppingBag size={15} />
              Ajouter au panier
            </Button>
            <Button variant="secondary" onClick={() => setReviews(true)}>
              <MessageSquareText size={15} />
              Avis (3)
            </Button>
          </div>
          <Accordion
            items={[
              { id: 'dims', title: 'Dimensions', content: 'Hauteur 32 cm · Diamètre 18 cm · Câble 1,8 m.' },
              {
                id: 'ship',
                title: 'Livraison & retours',
                content: 'Exemple : livraison en 3 à 5 jours, retours gratuits sous 30 jours.',
              },
            ]}
          />
        </div>
      </div>
      <Drawer open={reviews} onClose={() => setReviews(false)} title="Avis clients">
        <Timeline
          items={[
            {
              id: 'r1',
              title: 'Julie · 5/5',
              time: 'Il y a 2 j',
              description: 'Une lumière très douce, parfaite le soir.',
              tone: 'success',
            },
            {
              id: 'r2',
              title: 'Marc · 4/5',
              time: 'Il y a 1 sem.',
              description: 'Belle finition, câble un peu court.',
            },
            {
              id: 'r3',
              title: 'Inès · 5/5',
              time: 'Il y a 3 sem.',
              description: 'Emballage soigné.',
              tone: 'success',
            },
          ]}
        />
        <p className="lab-hint">Avis fictifs de démonstration.</p>
      </Drawer>
    </article>
  );
}

export default function LabExamples({
  notify,
  withTemplates = false,
}: {
  notify: Notify;
  withTemplates?: boolean;
}) {
  return (
    <section className="lab-section" aria-labelledby="lab-examples-title">
      <div className="lab-header">
        <div>
          <span className="eyebrow">
            <Sparkles size={13} /> Exemples
          </span>
          <h2 id="lab-examples-title">Des composants aux écrans complets.</h2>
          <p>
            {withTemplates
              ? 'Douze compositions réelles, du formulaire à la page complète, qui assemblent les pièces du laboratoire. Aucune donnée n’est envoyée.'
              : 'Trois compositions réelles qui assemblent les pièces du laboratoire. Retrouvez-en neuf autres dans Modèles. Aucune donnée n’est envoyée.'}
          </p>
        </div>
      </div>
      <div className="lab-examples">
        <OnboardingExample notify={notify} />
        <ProjectExample notify={notify} />
        <ProductExample notify={notify} />
        {withTemplates && (
          <>
            <ContactTemplate notify={notify} />
            <SettingsTemplate notify={notify} />
            <AuthTemplate notify={notify} />
            <FileManagerTemplate notify={notify} />
            <CommandCenterTemplate notify={notify} />
            <ActivityFeedTemplate notify={notify} />
            <SaasLandingTemplate notify={notify} />
            <AnalyticsTemplate notify={notify} />
            <BlogArticleTemplate notify={notify} />
          </>
        )}
      </div>
    </section>
  );
}
