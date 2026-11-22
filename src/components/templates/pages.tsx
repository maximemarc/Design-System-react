import '@/components/templates/pages.css';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {
  Activity,
  ArrowRight,
  Bell,
  Blocks,
  Bookmark,
  ChartNoAxesCombined,
  Check,
  Copy,
  Cpu,
  CreditCard,
  Database,
  Download,
  Eye,
  FileText,
  FlaskConical,
  Globe,
  Layers,
  Leaf,
  Lightbulb,
  Mail,
  MessageSquareText,
  Newspaper,
  Orbit,
  Palette,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Sun,
  Table2,
  Target,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button, Switch, type BadgeTone } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { createId } from '@/components/createId';
import { Callout } from '@/components/dashboard';
import { NumberTicker, SpotlightCard } from '@/components/lab/display';
import { ProgressBar, ScrollProgress } from '@/components/lab/primitives';
import { CodeBlock } from '@/components/lab/tools';
import { Tooltip } from '@/components/lab/disclosure';
import { Marquee } from '@/components/lab/backgrounds';
import { TextGradient } from '@/components/lab/textEffects';

const euro = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const formatChange = (change: number) =>
  `${change >= 0 ? '+' : '−'}${Math.abs(change).toLocaleString('fr-FR')} %`;

/* ================================================================== */
/* J · Page d'accueil SaaS                                             */
/* ================================================================== */

type Tone = 'accent' | 'success' | 'warning' | 'danger';

/* Noms et marques inventés pour la démonstration. */
const saasLogos: { name: string; icon: LucideIcon }[] = [
  { name: 'Nébuleuse', icon: Orbit },
  { name: 'Brique & Code', icon: Blocks },
  { name: 'Atelier Coloris', icon: Palette },
  { name: 'Datafjord', icon: Database },
  { name: 'Héliotrope', icon: Sun },
  { name: 'Quartzine', icon: Activity },
  { name: 'Granit Labs', icon: FlaskConical },
  { name: 'Ébène Studio', icon: Leaf },
];

const saasFeatures: { icon: LucideIcon; title: string; description: string; tone: Tone }[] = [
  {
    icon: Zap,
    title: 'Ultra rapide',
    description: 'Réponses sous 100 ms grâce à une infrastructure déployée au plus près des utilisateurs.',
    tone: 'warning',
  },
  {
    icon: ShieldCheck,
    title: 'Sécurité de niveau entreprise',
    description: 'Authentification unique, rôles fins et chiffrement de bout en bout dès l’installation.',
    tone: 'success',
  },
  {
    icon: Globe,
    title: 'Portée mondiale',
    description: 'Plus de 30 régions, bascule automatique et 99,99 % de disponibilité garantie.',
    tone: 'accent',
  },
  {
    icon: Cpu,
    title: 'Assisté par l’IA',
    description: 'Détection d’anomalies, prévisions et automatisations intégrées au produit.',
    tone: 'accent',
  },
  {
    icon: Database,
    title: 'Toutes vos données',
    description: 'Bases SQL, stockage objet et plus de 150 connecteurs branchés en quelques minutes.',
    tone: 'danger',
  },
  {
    icon: Target,
    title: 'Analyses incluses',
    description: 'Tableaux de bord en temps réel, rapports personnalisés et export dans chaque offre.',
    tone: 'success',
  },
];

const saasPlans = [
  {
    id: 'decouverte',
    name: 'Découverte',
    monthly: 0,
    description: 'Idéal pour les projets personnels',
    features: ['5 projets', '1 Go de stockage', 'Entraide de la communauté', 'Accès à l’API'],
    cta: 'Commencer gratuitement',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    monthly: 29,
    description: 'Pour les équipes en croissance',
    features: [
      'Projets illimités',
      '50 Go de stockage',
      'Assistance prioritaire',
      'Domaines personnalisés',
      'Analyses avancées',
      'Travail en équipe',
    ],
    cta: 'Essayer 14 jours',
    highlight: true,
  },
  {
    id: 'entreprise',
    name: 'Entreprise',
    monthly: 99,
    description: 'Pour les usages critiques',
    features: [
      'Tout le contenu de Pro',
      'Stockage illimité',
      'Interlocuteur dédié',
      'Engagement de service',
      'Authentification unique SAML',
      'Journaux d’audit',
    ],
    cta: 'Contacter l’équipe',
    highlight: false,
  },
];

const annualDiscount = 0.2;

export function SaasLandingTemplate({ notify }: { notify: Notify }) {
  const [annual, setAnnual] = useState(true);
  const titleId = useId();
  const featuresId = useId();
  const pricingId = useId();
  return (
    <article className="specimen lab-example tpl-p-wide" aria-labelledby={titleId}>
      <div className="specimen-label">
        J <span>Page d’accueil SaaS</span>
        <Rocket size={17} />
      </div>

      <header className="tpl-p-hero">
        <Badge tone="accent">
          <Sparkles size={12} aria-hidden="true" />
          Nouveau : assistant IA en bêta
        </Badge>
        <h3 id={titleId}>
          Construisez <TextGradient>plus vite</TextGradient>, livrez en toute{' '}
          <TextGradient>confiance</TextGradient>.
        </h3>
        <p>
          La plateforme fictive adoptée par plus de 12 000 équipes pour concevoir, déployer et faire grandir
          leurs applications.
        </p>
        <div className="lab-row">
          <Button onClick={() => notify('Compte de démonstration : aucune inscription n’est enregistrée.')}>
            Commencer gratuitement
            <ArrowRight size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="secondary"
            onClick={() => notify('La vidéo de démonstration n’existe pas : c’est un modèle.')}
          >
            <Eye size={15} aria-hidden="true" />
            Voir la démo
          </Button>
        </div>
        <p className="tpl-p-muted">Sans carte bancaire · Offre gratuite sans limite de durée</p>
      </header>

      <div className="tpl-p-logos">
        <p>Ils nous font confiance</p>
        <Marquee label="Clients de référence (noms fictifs)" speed={30} gap={32}>
          {saasLogos.map(({ name, icon: Icon }) => (
            <span key={name} className="tpl-p-logo">
              <Icon size={16} aria-hidden="true" />
              {name}
            </span>
          ))}
        </Marquee>
      </div>

      <section className="tpl-p-section" aria-labelledby={featuresId}>
        <h4 id={featuresId}>Tout ce qu’il faut pour livrer</h4>
        <ul className="tpl-p-features">
          {saasFeatures.map(({ icon: Icon, title, description, tone }) => (
            <li key={title}>
              <SpotlightCard>
                <div className="tpl-p-feature">
                  <span className="tpl-p-feature-icon" data-tone={tone} aria-hidden="true">
                    <Icon size={18} />
                  </span>
                  <h5>{title}</h5>
                  <p>{description}</p>
                </div>
              </SpotlightCard>
            </li>
          ))}
        </ul>
      </section>

      <section className="tpl-p-section" aria-labelledby={pricingId}>
        <div className="tpl-p-section-head">
          <h4 id={pricingId}>Des tarifs simples et transparents</h4>
          <div className="tpl-p-billing">
            <span className={annual ? '' : 'is-current'} aria-hidden="true">
              Mensuel
            </span>
            <Switch checked={annual} onChange={setAnnual} label="Facturation annuelle" />
            <span className={annual ? 'is-current' : ''} aria-hidden="true">
              Annuel
            </span>
            <Badge tone="success">−20 %</Badge>
          </div>
        </div>
        <p className="tpl-p-sr" aria-live="polite">
          {annual ? 'Tarifs annuels affichés, 20 % d’économie.' : 'Tarifs mensuels affichés.'}
        </p>
        <ul className="tpl-p-plans">
          {saasPlans.map(plan => {
            const perMonth = annual ? Math.round(plan.monthly * (1 - annualDiscount)) : plan.monthly;
            const note =
              plan.monthly === 0
                ? 'Gratuit, sans limite de durée'
                : annual
                  ? `soit ${euro.format(perMonth * 12)} HT facturés une fois par an`
                  : 'Sans engagement, résiliable à tout moment';
            return (
              <li key={plan.id} className={`tpl-p-plan ${plan.highlight ? 'is-highlight' : ''}`}>
                <div className="tpl-p-plan-head">
                  {plan.highlight && <Badge tone="accent">Le plus choisi</Badge>}
                  <h5>{plan.name}</h5>
                  <p className="tpl-p-muted">{plan.description}</p>
                </div>
                <p className="tpl-p-price">
                  <strong>{euro.format(perMonth)}</strong>
                  <span>HT / mois</span>
                  <small>{note}</small>
                </p>
                <ul className="tpl-p-checks" aria-label={`Inclus dans l’offre ${plan.name}`}>
                  {plan.features.map(feature => (
                    <li key={feature}>
                      <Check size={13} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={plan.highlight ? 'primary' : 'secondary'}
                  onClick={() =>
                    notify(
                      `Offre ${plan.name} (${annual ? 'annuelle' : 'mensuelle'}) choisie. Démonstration : aucun paiement demandé.`,
                    )
                  }
                >
                  {plan.cta}
                </Button>
              </li>
            );
          })}
        </ul>
        <p className="tpl-p-muted">Prix fictifs, hors taxes, donnés à titre d’exemple.</p>
      </section>
    </article>
  );
}

/* ================================================================== */
/* K · Tableau de bord analytique                                      */
/* ================================================================== */

type PeriodId = '7j' | '30j' | '12m';
type ChartBar = { short: string; full: string; value: number };

const periods: { id: PeriodId; label: string; long: string; previous: string }[] = [
  { id: '7j', label: '7 j', long: '7 derniers jours', previous: 'vs 7 j préc.' },
  { id: '30j', label: '30 j', long: '30 derniers jours', previous: 'vs 30 j préc.' },
  { id: '12m', label: '12 mois', long: '12 derniers mois', previous: 'vs année préc.' },
];

const bars = (labels: [string, string, number][]): ChartBar[] =>
  labels.map(([short, full, value]) => ({ short, full, value }));

const periodData: Record<
  PeriodId,
  { bars: ChartBar[]; kpis: number[]; changes: number[]; pageScale: number }
> = {
  '7j': {
    bars: bars([
      ['lun.', 'lundi 16 novembre', 1420],
      ['mar.', 'mardi 17 novembre', 1610],
      ['mer.', 'mercredi 18 novembre', 1580],
      ['jeu.', 'jeudi 19 novembre', 1890],
      ['ven.', 'vendredi 20 novembre', 2050],
      ['sam.', 'samedi 21 novembre', 1290],
      ['dim.', 'dimanche 22 novembre', 1400],
    ]),
    kpis: [11240, 2184, 3.42, 31],
    changes: [6.1, 2.4, 0.3, -9],
    pageScale: 0.24,
  },
  '30j': {
    bars: bars([
      ['24 oct.', 'du 24 au 26 octobre', 4120],
      ['27 oct.', 'du 27 au 29 octobre', 4560],
      ['30 oct.', 'du 30 octobre au 1er novembre', 4380],
      ['2 nov.', 'du 2 au 4 novembre', 5010],
      ['5 nov.', 'du 5 au 7 novembre', 4790],
      ['8 nov.', 'du 8 au 10 novembre', 5240],
      ['11 nov.', 'du 11 au 13 novembre', 4630],
      ['14 nov.', 'du 14 au 16 novembre', 5480],
      ['17 nov.', 'du 17 au 19 novembre', 4975],
      ['20 nov.', 'du 20 au 22 novembre', 5110],
    ]),
    kpis: [48295, 8421, 3.61, 124],
    changes: [12.5, 4.2, -0.8, -14],
    pageScale: 1,
  },
  '12m': {
    bars: bars([
      ['déc.', 'décembre 2025', 38200],
      ['janv.', 'janvier 2026', 35400],
      ['févr.', 'février 2026', 39800],
      ['mars', 'mars 2026', 41200],
      ['avr.', 'avril 2026', 43900],
      ['mai', 'mai 2026', 42100],
      ['juin', 'juin 2026', 44800],
      ['juil.', 'juillet 2026', 40300],
      ['août', 'août 2026', 45600],
      ['sept.', 'septembre 2026', 47100],
      ['oct.', 'octobre 2026', 46200],
      ['nov.', 'novembre 2026', 48295],
    ]),
    kpis: [512895, 41730, 3.48, 1382],
    changes: [18.3, 22.7, 0.4, -6.2],
    pageScale: 10.6,
  },
};

const kpiDefinitions: {
  id: string;
  label: string;
  icon: LucideIcon;
  better: 'up' | 'down';
  format: (value: number) => string;
}[] = [
  {
    id: 'revenue',
    label: 'Chiffre d’affaires',
    icon: CreditCard,
    better: 'up',
    format: value => euro.format(value),
  },
  {
    id: 'users',
    label: 'Utilisateurs actifs',
    icon: Users,
    better: 'up',
    format: value => Math.round(value).toLocaleString('fr-FR'),
  },
  {
    id: 'conversion',
    label: 'Taux de conversion',
    icon: Target,
    better: 'up',
    format: value =>
      `${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`,
  },
  {
    id: 'tickets',
    label: 'Tickets ouverts',
    icon: Bell,
    better: 'down',
    format: value => Math.round(value).toLocaleString('fr-FR'),
  },
];

const topPages = [
  { path: '/tableau-de-bord', views: 24312 },
  { path: '/tarifs', views: 18741 },
  { path: '/docs/api', views: 12008 },
  { path: '/blog', views: 7421 },
  { path: '/nouveautes', views: 4890 },
];

const activityItems: {
  id: string;
  title: string;
  message: string;
  time: string;
  tag: string;
  tone: BadgeTone;
}[] = [
  {
    id: 'a1',
    title: 'Nouvelle souscription Entreprise',
    message: 'Nébuleuse passe à l’offre Entreprise.',
    time: 'il y a 2 min',
    tag: 'Vente',
    tone: 'success',
  },
  {
    id: 'a2',
    title: 'Paiement refusé',
    message: 'Carte refusée pour l’abonnement Pro n° 8841.',
    time: 'il y a 15 min',
    tag: 'Facturation',
    tone: 'danger',
  },
  {
    id: 'a3',
    title: 'Déploiement réussi',
    message: 'Version 2.4.1 en production.',
    time: 'il y a 1 h',
    tag: 'Technique',
    tone: 'accent',
  },
  {
    id: 'a4',
    title: 'Nouveau ticket',
    message: 'Ticket n° 2241 : « Limite de débit de l’API ».',
    time: 'il y a 2 h',
    tag: 'Support',
    tone: 'warning',
  },
];

/** Histogramme navigable au clavier (flèches, Début, Fin), doublé d'un tableau de données. */
function RevenueChart({
  data,
  periodLong,
  change,
}: {
  data: ChartBar[];
  periodLong: string;
  change: number;
}) {
  const [active, setActive] = useState(data.length - 1);
  const [showTable, setShowTable] = useState(false);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const titleId = useId();
  const captionId = useId();
  const tableId = useId();
  const values = data.map(bar => bar.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const total = values.reduce((sum, value) => sum + value, 0);
  const maxBar = data[values.indexOf(max)];
  const minBar = data[values.indexOf(min)];
  const current = data[active] ?? data[data.length - 1];
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = data.length - 1;
    let next = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowUp') next = Math.min(last, index + 1);
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') next = Math.max(0, index - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    buttons.current[next]?.focus();
  };
  return (
    <figure className="tpl-p-chart tpl-p-section" aria-labelledby={titleId}>
      <div className="tpl-p-section-head">
        <h4 id={titleId}>Chiffre d’affaires</h4>
        <div className="lab-row">
          <Badge tone={change >= 0 ? 'success' : 'danger'}>{formatChange(change)}</Badge>
          <Button
            variant="secondary"
            size="small"
            aria-expanded={showTable}
            aria-controls={tableId}
            onClick={() => setShowTable(!showTable)}
          >
            <Table2 size={14} aria-hidden="true" />
            {showTable ? 'Masquer les données' : 'Voir les données'}
          </Button>
        </div>
      </div>
      <p className="tpl-p-chart-readout">
        <strong>{euro.format(current.value)}</strong> · {current.full}
      </p>
      <div
        className="tpl-p-bars"
        role="group"
        aria-label={`Histogramme du chiffre d’affaires, ${periodLong}`}
        aria-describedby={captionId}
      >
        {data.map((bar, index) => (
          <button
            key={bar.full}
            ref={element => {
              buttons.current[index] = element;
            }}
            type="button"
            className={`tpl-p-bar${index === active ? ' is-active' : ''}${data.length > 8 && index % 2 === 1 ? ' is-minor' : ''}`}
            tabIndex={index === active ? 0 : -1}
            aria-current={index === active ? 'true' : undefined}
            aria-label={`${bar.full} : ${euro.format(bar.value)}`}
            onClick={() => setActive(index)}
            onKeyDown={event => onKeyDown(event, index)}
          >
            <span className="tpl-p-bar-track" aria-hidden="true">
              <span className="tpl-p-bar-fill" style={{ height: `${(bar.value / max) * 100}%` }} />
            </span>
            <span className="tpl-p-bar-label" aria-hidden="true">
              {bar.short}
            </span>
          </button>
        ))}
      </div>
      <div className="tpl-p-table-wrap" id={tableId} hidden={!showTable}>
        <table className="tpl-p-table">
          <caption>Chiffre d’affaires HT, {periodLong}</caption>
          <thead>
            <tr>
              <th scope="col">Période</th>
              <th scope="col">Montant</th>
            </tr>
          </thead>
          <tbody>
            {data.map(bar => (
              <tr key={bar.full}>
                <th scope="row">{bar.full}</th>
                <td>{euro.format(bar.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="tpl-p-muted" id={captionId}>
        Total de {euro.format(total)} sur les {periodLong}. Maximum : {maxBar.full} ({euro.format(max)}) ;
        minimum : {minBar.full} ({euro.format(min)}). Parcourez les barres avec les flèches du clavier.
      </figcaption>
    </figure>
  );
}

export function AnalyticsTemplate({ notify }: { notify: Notify }) {
  const [period, setPeriod] = useState<PeriodId>('30j');
  const [read, setRead] = useState<string[]>(['a3', 'a4']);
  const pagesId = useId();
  const activityId = useId();
  const info = periods.find(item => item.id === period) ?? periods[1];
  const data = periodData[period];
  const pages = topPages.map(page => ({ ...page, views: Math.round(page.views * data.pageScale) }));
  const maxViews = Math.max(...pages.map(page => page.views));
  const unread = activityItems.filter(item => !read.includes(item.id)).length;
  return (
    <article className="specimen lab-example tpl-p-wide">
      <div className="specimen-label">
        K <span>Tableau de bord analytique</span>
        <ChartNoAxesCombined size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Vue d’ensemble.</h3>
          <p>
            {info.long[0].toUpperCase() + info.long.slice(1)} · mis à jour il y a 2 min · données fictives
          </p>
        </div>
        <div className="lab-row">
          <div className="tpl-p-periods" role="group" aria-label="Période">
            {periods.map(item => (
              <button
                key={item.id}
                type="button"
                aria-pressed={item.id === period}
                aria-label={item.long}
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={() =>
              notify(`Export CSV des ${info.long} préparé (démonstration : aucun fichier créé).`)
            }
          >
            <Download size={14} aria-hidden="true" />
            Exporter
          </Button>
        </div>
      </div>

      <ul className="tpl-p-kpis" aria-label={`Indicateurs clés, ${info.long}`}>
        {kpiDefinitions.map(({ id, label, icon: Icon, better, format }, index) => {
          const change = data.changes[index];
          const good = change >= 0 === (better === 'up');
          const Trend = change >= 0 ? TrendingUp : TrendingDown;
          return (
            <li key={id}>
              <SpotlightCard>
                <small className="tpl-p-kpi-label">
                  {label}
                  <Icon size={15} aria-hidden="true" />
                </small>
                <strong className="tpl-p-kpi-value">
                  <NumberTicker value={data.kpis[index]} format={format} />
                </strong>
                <span className={`tpl-p-trend ${good ? 'is-good' : 'is-bad'}`}>
                  <Trend size={13} aria-hidden="true" />
                  {formatChange(change)}
                  <span>{info.previous}</span>
                  <span className="tpl-p-sr">
                    {good ? ' (évolution favorable)' : ' (évolution défavorable)'}
                  </span>
                </span>
              </SpotlightCard>
            </li>
          );
        })}
      </ul>

      <div className="tpl-p-analytics-grid">
        <div className="tpl-p-panel">
          <RevenueChart key={period} data={data.bars} periodLong={info.long} change={data.changes[0]} />
        </div>
        <section className="tpl-p-panel" aria-labelledby={pagesId}>
          <h4 id={pagesId}>Pages les plus vues</h4>
          <ol className="tpl-p-toppages">
            {pages.map(page => (
              <li key={page.path}>
                <ProgressBar
                  label={page.path}
                  value={(page.views / maxViews) * 100}
                  size="sm"
                  showValue
                  valueText={`${page.views.toLocaleString('fr-FR')} vues`}
                />
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="tpl-p-panel" aria-labelledby={activityId}>
        <div className="tpl-p-section-head">
          <h4 id={activityId}>
            Activité récente {unread > 0 && <Badge tone="accent">{unread} non lue(s)</Badge>}
          </h4>
          <Button
            variant="ghost"
            size="small"
            disabled={unread === 0}
            onClick={() => {
              setRead(activityItems.map(item => item.id));
              notify('Toutes les notifications sont marquées comme lues.');
            }}
          >
            <Check size={14} aria-hidden="true" />
            Tout marquer comme lu
          </Button>
        </div>
        <ul className="tpl-p-activity">
          {activityItems.map(item => {
            const isUnread = !read.includes(item.id);
            return (
              <li key={item.id} className={isUnread ? 'is-unread' : ''}>
                <span className="tpl-p-activity-dot" aria-hidden="true" />
                <div>
                  <strong>
                    {isUnread && <span className="tpl-p-sr">Non lu : </span>}
                    {item.title}
                  </strong>
                  <p>{item.message}</p>
                </div>
                <div className="tpl-p-activity-side">
                  <Badge tone={item.tone}>{item.tag}</Badge>
                  <span>{item.time}</span>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="small"
                      aria-label={`Marquer « ${item.title} » comme lu`}
                      onClick={() => setRead(previous => [...previous, item.id])}
                    >
                      Marquer comme lu
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}

/* ================================================================== */
/* L · Article de blog                                                 */
/* ================================================================== */

const blogToc: { id: string; label: string; depth: 1 | 2 }[] = [
  { id: 'introduction', label: 'Introduction', depth: 1 },
  { id: 'probleme', label: 'Le problème des styles improvisés', depth: 1 },
  { id: 'architecture', label: 'Une architecture par jetons', depth: 1 },
  { id: 'semantique', label: 'Jetons sémantiques ou primitifs', depth: 2 },
  { id: 'mise-en-oeuvre', label: 'Mise en œuvre', depth: 1 },
  { id: 'tests', label: 'Tester son système', depth: 2 },
  { id: 'conclusion', label: 'Conclusion', depth: 1 },
];

const blogTags = ['Design system', 'Jetons', 'Accessibilité', 'Composants'];

const blogRelated = [
  { title: 'Concevoir des palettes de couleurs accessibles', read: '5 min', tag: 'Design' },
  { title: 'Bonnes pratiques pour l’API des composants', read: '8 min', tag: 'Ingénierie' },
  { title: 'Un mode sombre avec des variables CSS', read: '6 min', tag: 'CSS' },
];

const blogShare: { label: string; icon: LucideIcon }[] = [
  { label: 'Copier le lien', icon: Copy },
  { label: 'E-mail', icon: Mail },
  { label: 'Message', icon: MessageSquareText },
  { label: 'Imprimer', icon: FileText },
];

type BlogComment = {
  id: string;
  author: string;
  initials: string;
  date: string;
  dateTime: string;
  text: string;
};

const initialComments: BlogComment[] = [
  {
    id: 'c1',
    author: 'Hugo Lemaire',
    initials: 'HL',
    date: '19 mars 2026',
    dateTime: '2026-03-19',
    text: 'Très clair sur la différence entre jetons primitifs et sémantiques. Merci !',
  },
  {
    id: 'c2',
    author: 'Inès Morel',
    initials: 'IM',
    date: '20 mars 2026',
    dateTime: '2026-03-20',
    text: 'Avez-vous un exemple de vérification automatique des contrastes en intégration continue ?',
  },
];

const tokensCode = `
:root {
  /* Jetons primitifs : des valeurs brutes */
  --vert-600: #477b60;
  --gris-050: #fafbf9;
  /* Jetons sémantiques : une intention */
  --accent: var(--vert-600);
  --bg: var(--gris-050);
}

.button-primary {
  background: var(--accent);
  color: var(--on-accent);
}
`;

const componentCode = `
type ButtonProps = { children: ReactNode; variant?: 'primary' | 'secondary' };

export function Button({ children, variant = 'primary' }: ButtonProps) {
  return <button className={\`button button-\${variant}\`}>{children}</button>;
}
`;

function TocHeading({ baseId, id, children }: { baseId: string; id: string; children?: ReactNode }) {
  const entry = blogToc.find(item => item.id === id);
  const Tag = entry?.depth === 2 ? 'h5' : 'h4';
  return (
    <Tag id={`${baseId}-${id}`} data-toc={id} tabIndex={-1}>
      {entry?.label}
      {children}
    </Tag>
  );
}

export function BlogArticleTemplate({ notify }: { notify: Notify }) {
  const [activeSection, setActiveSection] = useState(blogToc[0].id);
  const [bookmarked, setBookmarked] = useState(false);
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState('');
  const readerRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const titleId = useId();
  const commentsId = useId();
  const commentFieldId = useId();
  const relatedId = useId();
  const tocTitleId = useId();
  const authorTitleId = useId();
  const shareTitleId = useId();

  // Suit la section lue : le rappel de l'observateur est asynchrone, jamais pendant l'effet lui-même.
  useEffect(() => {
    const container = readerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;
    const headings = Array.from(container.querySelectorAll<HTMLElement>('[data-toc]'));
    const observer = new IntersectionObserver(
      entries => {
        const first = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]?.target;
        if (first instanceof HTMLElement && first.dataset.toc) setActiveSection(first.dataset.toc);
      },
      { root: container, rootMargin: '0px 0px -65% 0px', threshold: 0 },
    );
    headings.forEach(heading => observer.observe(heading));
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    const container = readerRef.current;
    const target = container?.querySelector<HTMLElement>(`[data-toc="${id}"]`);
    if (!container || !target) return;
    const reduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !!document.querySelector('.app.no-motion');
    container.scrollTo({ top: Math.max(0, target.offsetTop - 8), behavior: reduced ? 'auto' : 'smooth' });
    target.focus({ preventScroll: true });
    setActiveSection(id);
  };

  const postComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setComments(previous => [
      ...previous,
      {
        id: createId(),
        author: 'Vous',
        initials: 'V',
        date: now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        dateTime: now.toISOString().slice(0, 10),
        text,
      },
    ]);
    setDraft('');
    notify('Commentaire publié (démonstration : rien n’est envoyé).');
  };

  const commentCount = 36 + comments.length;

  return (
    <article className="specimen lab-example tpl-p-wide" aria-labelledby={titleId}>
      <div className="specimen-label">
        L <span>Article de blog</span>
        <Newspaper size={17} />
      </div>

      <header className="tpl-p-article-head">
        <div className="lab-row">
          {blogTags.map(tag => (
            <Badge key={tag} tone="accent">
              {tag}
            </Badge>
          ))}
        </div>
        <h3 id={titleId}>Bâtir un design system prêt pour la production</h3>
        <p className="tpl-p-lede">
          Plongée dans le thème par jetons, l’architecture des composants et les règles d’accessibilité qui
          tiennent sur de grandes applications.
        </p>
        <div className="tpl-p-byline">
          <div className="tpl-p-author">
            <span className="tpl-p-avatar" aria-hidden="true">
              CD
            </span>
            <div>
              <strong>Camille Dubois</strong>
              <small>
                <time dateTime="2026-03-18">18 mars 2026</time> · 12 min de lecture
              </small>
            </div>
          </div>
          <div className="lab-row">
            <Button
              variant="secondary"
              size="small"
              className="tpl-p-toggle"
              aria-pressed={bookmarked}
              onClick={() => {
                const next = !bookmarked;
                setBookmarked(next);
                notify(next ? 'Article ajouté à vos lectures.' : 'Article retiré de vos lectures.');
              }}
            >
              <Bookmark size={14} aria-hidden="true" />
              {bookmarked ? 'Enregistré' : 'Enregistrer'}
            </Button>
            <Tooltip label="Copie le lien de l’article">
              <Button
                variant="secondary"
                size="small"
                onClick={() => notify('Lien de l’article copié (démonstration).')}
              >
                <Copy size={14} aria-hidden="true" />
                Partager
              </Button>
            </Tooltip>
          </div>
        </div>
      </header>

      <div className="tpl-p-blog-layout">
        <div className="tpl-p-reading">
          <ScrollProgress target={readerRef} label="Progression de lecture de l’article" />
          <div
            ref={readerRef}
            className="tpl-p-reader"
            tabIndex={0}
            role="region"
            aria-label="Contenu de l’article"
          >
            <div className="tpl-p-cover" aria-hidden="true">
              <Layers size={30} />
            </div>

            <section>
              <TocHeading baseId={baseId} id="introduction" />
              <p>
                Les design systems ne sont plus de simples guides de style : ce sont de véritables plateformes
                d’ingénierie. Voyons comment bâtir un système fondé sur des jetons, capable de suivre
                plusieurs produits et plusieurs équipes.
              </p>
              <Callout title="Ce que vous allez apprendre" icon={Lightbulb}>
                L’architecture des jetons, les conventions d’API des composants, un thème accessible et
                l’intégration des jetons à la chaîne de livraison.
              </Callout>
            </section>

            <section>
              <TocHeading baseId={baseId} id="probleme" />
              <p>
                Quand chaque équipe choisit ses couleurs et ses espacements au fil de l’eau, l’interface
                dérive : trois gris presque identiques, des boutons aux arrondis différents, un mode sombre
                impossible à maintenir. Chaque refonte devient une chasse au trésor dans des centaines de
                fichiers.
              </p>
            </section>

            <section>
              <TocHeading baseId={baseId} id="architecture" />
              <p>
                L’idée clé : les jetons sont la source unique de vérité entre les outils de conception et le
                code de production. Bien posés, un changement de thème se propage partout, instantanément.
              </p>
              <blockquote className="tpl-p-quote">
                <p>
                  « La meilleure bibliothèque de composants est celle que votre équipe utilise vraiment. »
                </p>
                <footer>— Léa Fontaine, responsable design (citation fictive)</footer>
              </blockquote>
            </section>

            <section>
              <TocHeading baseId={baseId} id="semantique" />
              <p>
                Commencez par les jetons sémantiques avant d’introduire des jetons propres aux composants. Un
                jeton primitif comme <code>--vert-600</code> dit peu de chose ; un jeton sémantique comme{' '}
                <code>--accent</code> dit à quoi il sert.
              </p>
              <CodeBlock code={tokensCode} language="css" title="jetons.css" highlight={[6, 7]} />
            </section>

            <section>
              <TocHeading baseId={baseId} id="mise-en-oeuvre" />
              <p>
                Exposez les jetons en propriétés CSS personnalisées, puis consommez-les dans les composants.
                Le mode sombre se résume alors à redéfinir quelques valeurs sur un sélecteur parent, sans
                toucher aux composants.
              </p>
              <CodeBlock code={componentCode} language="tsx" title="Button.tsx" />
            </section>

            <section>
              <TocHeading baseId={baseId} id="tests" />
              <p>
                Automatisez les vérifications : contraste de chaque paire de jetons, captures visuelles des
                composants dans chaque thème et règles de lint qui interdisent les couleurs codées en dur.
              </p>
            </section>

            <section>
              <TocHeading baseId={baseId} id="conclusion" />
              <p>
                Un design system réussi est celui que l’équipe adopte. Des jetons clairs, des composants
                sobres et des tests automatiques suffisent à le rendre fiable, et agréable à faire évoluer.
              </p>
            </section>

            <div className="tpl-p-reactions">
              <Button
                variant="secondary"
                className="tpl-p-toggle"
                aria-pressed={liked}
                onClick={() => setLiked(!liked)}
              >
                <ThumbsUp size={15} aria-hidden="true" />
                Utile · {(241 + (liked ? 1 : 0)).toLocaleString('fr-FR')}
              </Button>
              <p className="tpl-p-muted">
                <span>
                  <Eye size={13} aria-hidden="true" /> 12 400 lectures
                </span>
                <span>
                  <MessageSquareText size={13} aria-hidden="true" /> {commentCount} commentaires
                </span>
              </p>
            </div>

            <section aria-labelledby={commentsId}>
              <h4 id={commentsId}>Commentaires ({commentCount})</h4>
              <ul className="tpl-p-comments">
                {comments.map(comment => (
                  <li key={comment.id}>
                    <span className="tpl-p-avatar" aria-hidden="true">
                      {comment.initials}
                    </span>
                    <div>
                      <strong>{comment.author}</strong>
                      <time dateTime={comment.dateTime}>{comment.date}</time>
                      <p>{comment.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <form className="tpl-p-comment-form" onSubmit={postComment}>
                <label className="field-label" htmlFor={commentFieldId}>
                  Laisser un commentaire
                </label>
                <textarea
                  id={commentFieldId}
                  className="tpl-p-textarea"
                  rows={3}
                  maxLength={500}
                  placeholder="Partagez votre avis…"
                  value={draft}
                  onChange={event => setDraft(event.target.value)}
                />
                <div className="lab-row">
                  <Button type="submit" size="small" disabled={!draft.trim()}>
                    <Send size={14} aria-hidden="true" />
                    Publier
                  </Button>
                </div>
              </form>
            </section>

            <section aria-labelledby={relatedId}>
              <h4 id={relatedId}>Articles liés</h4>
              <ul className="tpl-p-related">
                {blogRelated.map(item => (
                  <li key={item.title}>
                    <button
                      type="button"
                      onClick={() => notify(`Ouverture de « ${item.title} » (démonstration).`)}
                    >
                      <span className="tpl-p-related-title">
                        <Badge>{item.tag}</Badge>
                        <span>{item.title}</span>
                      </span>
                      <span className="tpl-p-related-meta">
                        {item.read} de lecture
                        <ArrowRight size={13} aria-hidden="true" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <aside className="tpl-p-aside" aria-label="Autour de l’article">
          <nav className="tpl-p-panel" aria-labelledby={tocTitleId}>
            <h4 id={tocTitleId} className="tpl-p-aside-title">
              Sommaire
            </h4>
            <ol className="tpl-p-toc">
              {blogToc.map(item => (
                <li key={item.id}>
                  <a
                    href={`#${baseId}-${item.id}`}
                    className={item.depth === 2 ? 'is-sub' : undefined}
                    aria-current={activeSection === item.id ? 'location' : undefined}
                    onClick={event => {
                      event.preventDefault();
                      goTo(item.id);
                    }}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <section className="tpl-p-panel tpl-p-author-card" aria-labelledby={authorTitleId}>
            <span className="tpl-p-avatar is-large" aria-hidden="true">
              CD
            </span>
            <div>
              <h4 id={authorTitleId}>Camille Dubois</h4>
              <p className="tpl-p-muted">
                Ingénieure front, elle écrit sur les design systems, l’accessibilité et l’outillage.
              </p>
            </div>
            <Button
              variant="secondary"
              size="small"
              className="tpl-p-toggle"
              aria-pressed={following}
              onClick={() => {
                const next = !following;
                setFollowing(next);
                notify(next ? 'Vous suivez Camille Dubois.' : 'Vous ne suivez plus Camille Dubois.');
              }}
            >
              {following ? 'Suivie' : 'Suivre'}
            </Button>
          </section>

          <section className="tpl-p-panel" aria-labelledby={shareTitleId}>
            <h4 id={shareTitleId} className="tpl-p-aside-title">
              Partager l’article
            </h4>
            <div className="tpl-p-share">
              {blogShare.map(({ label, icon: Icon }) => (
                <Button
                  key={label}
                  variant="secondary"
                  size="small"
                  onClick={() => notify(`Partage « ${label} » (démonstration).`)}
                >
                  <Icon size={13} aria-hidden="true" />
                  {label}
                </Button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}
