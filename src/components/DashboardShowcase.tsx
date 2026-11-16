import { useState } from 'react';
import {
  Activity,
  Clapperboard,
  Download,
  Film,
  Gamepad2,
  Gauge,
  GitBranch,
  HardDrive,
  House,
  KeyRound,
  Search,
  Smartphone,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import {
  AppIcon,
  BentoGrid,
  Callout,
  FavoriteChip,
  Launcher,
  ServiceList,
  ServiceRow,
  StatTile,
  TabBar,
  Tile,
  TileHead,
  TileLabel,
  TileLink,
  UserChip,
  type ServiceStatus,
} from '@/components/dashboard';
import { HealthTile, NetworkTile, type NetworkState } from '@/components/portal';
import { type Notify } from '@/components/useToasts';
import '@/components/dashboard-showcase.css';

type Probe = 'ok' | 'incident' | 'loading' | 'unreachable';
type DemoService = {
  id: string;
  name: string;
  host: string;
  description: string;
  icon: LucideIcon;
  access: 'internet' | 'lan';
  auth: string;
};

// Données de démonstration : aucun service réel n'est contacté.
const services: DemoService[] = [
  {
    id: 'films',
    name: 'Films et séries',
    host: 'films',
    description: 'Médiathèque familiale',
    icon: Film,
    access: 'internet',
    auth: 'Compte',
  },
  {
    id: 'demandes',
    name: 'Demandes',
    host: 'demandes',
    description: 'Proposer un film ou une série',
    icon: Clapperboard,
    access: 'internet',
    auth: 'Compte',
  },
  {
    id: 'compte',
    name: 'Mon compte',
    host: 'id',
    description: 'Passkeys et connexion',
    icon: KeyRound,
    access: 'internet',
    auth: 'Passkey',
  },
  {
    id: 'maison',
    name: 'La maison',
    host: 'maison',
    description: 'Lumières, chauffage, volets',
    icon: House,
    access: 'lan',
    auth: 'Identifiant',
  },
  {
    id: 'jeux',
    name: 'Serveur de jeu',
    host: 'jeux',
    description: 'Console du serveur',
    icon: Gamepad2,
    access: 'lan',
    auth: 'SSO admins',
  },
  {
    id: 'statut',
    name: 'Statut',
    host: 'statut',
    description: 'Sondes des services',
    icon: Activity,
    access: 'lan',
    auth: 'Libre',
  },
  {
    id: 'metriques',
    name: 'Métriques',
    host: 'metriques',
    description: 'Tableaux de bord et journaux',
    icon: Gauge,
    access: 'lan',
    auth: 'SSO',
  },
  {
    id: 'deploiements',
    name: 'Déploiements',
    host: 'gitops',
    description: 'Synchronisation GitOps',
    icon: GitBranch,
    access: 'lan',
    auth: 'SSO admins',
  },
  {
    id: 'stockage',
    name: 'Stockage',
    host: 'nas',
    description: 'Sauvegardes et partages',
    icon: HardDrive,
    access: 'lan',
    auth: 'SSO + 2e connexion',
  },
  {
    id: 'telechargements',
    name: 'Téléchargements',
    host: 'downloads',
    description: 'File de téléchargement',
    icon: Download,
    access: 'lan',
    auth: 'SSO admins',
  },
];

const segment = <T extends string>(value: T, current: T, onPick: (value: T) => void, label: string) => (
  <button
    key={value}
    type="button"
    className={current === value ? 'selected' : ''}
    aria-pressed={current === value}
    onClick={() => onPick(value)}
  >
    {label}
  </button>
);

export default function DashboardShowcase({ notify }: { notify: Notify }) {
  const [network, setNetwork] = useState<NetworkState>('home');
  const [probe, setProbe] = useState<Probe>('ok');
  const [pinned, setPinned] = useState<string[]>(['films', 'maison', 'metriques']);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState('accueil');
  const [tip, setTip] = useState(true);

  const statusOf = (service: DemoService): ServiceStatus => {
    if (network === 'away' && service.access === 'lan') return 'vpn';
    if (network === 'checking' || probe === 'loading' || probe === 'unreachable') return 'unknown';
    if (probe === 'incident' && service.id === 'telechargements') return 'down';
    if (probe === 'incident' && service.id === 'metriques') return 'slow';
    return 'up';
  };
  const togglePin = (id: string) =>
    setPinned(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]));
  const recheck = () => notify('Vérification relancée (démonstration).');
  const href = 'https://example.com/';
  const lan = services.filter(service => service.access === 'lan');
  const stat = (id: string) => statusOf(services.find(service => service.id === id)!);
  const statState = (id: string) => {
    const status = stat(id);
    return status === 'vpn' ? 'locked' : status === 'down' ? 'down' : status === 'unknown' ? 'loading' : 'ok';
  };

  return (
    <div className="dashboard-showcase">
      <div className="dashboard-controls">
        <div>
          <span className="field-label">Réseau simulé</span>
          <div className="segmented" role="group" aria-label="Réseau simulé">
            {segment<NetworkState>('home', network, setNetwork, 'À la maison')}
            {segment<NetworkState>('away', network, setNetwork, 'Dehors')}
            {segment<NetworkState>('checking', network, setNetwork, 'Vérification')}
          </div>
        </div>
        <div>
          <span className="field-label">Sonde simulée</span>
          <div className="segmented" role="group" aria-label="Sonde simulée">
            {segment<Probe>('ok', probe, setProbe, 'Normal')}
            {segment<Probe>('incident', probe, setProbe, 'Incident')}
            {segment<Probe>('loading', probe, setProbe, 'Chargement')}
            {segment<Probe>('unreachable', probe, setProbe, 'Injoignable')}
          </div>
        </div>
        <Badge tone="accent">Démonstration : états et chiffres simulés</Badge>
      </div>

      <BentoGrid>
        <Tile span={8} rows={2}>
          <TileHead>
            <span className="eyebrow">
              <span />
              Tableau de bord
            </span>
            <UserChip name="Alex" role="Admin" onSignOut={() => notify('Déconnexion simulée.')} />
          </TileHead>
          <h3 className="dashboard-hero-title">
            Bonsoir <span>Alex.</span>
          </h3>
          <label className="input-wrap dashboard-search">
            <Search size={18} aria-hidden="true" />
            <span className="dashboard-sr">Rechercher un service</span>
            <input type="search" placeholder="Chercher un service…" />
            <kbd aria-hidden="true">/</kbd>
          </label>
          <div className="dashboard-pins">
            <span className="dashboard-pins-label">Épinglés</span>
            {pinned.map(id => {
              const service = services.find(item => item.id === id)!;
              return (
                <FavoriteChip
                  key={id}
                  name={service.name}
                  href={href}
                  icon={service.icon}
                  editing={editing}
                  onRemove={() => togglePin(id)}
                />
              );
            })}
            {pinned.length === 0 && <span className="dashboard-pins-label">Aucun pour l'instant.</span>}
            <Button variant="ghost" size="small" aria-pressed={editing} onClick={() => setEditing(!editing)}>
              {editing ? 'Terminé' : 'Modifier'}
            </Button>
          </div>
        </Tile>

        <NetworkTile state={network} onRecheck={recheck} />
        <HealthTile
          services={services.map(service => ({
            name: service.name,
            status: statusOf(service),
            statusHref: href,
          }))}
          state={
            network === 'checking' || probe === 'loading'
              ? 'loading'
              : probe === 'unreachable'
                ? 'unreachable'
                : 'ok'
          }
          checkedAt={probe === 'loading' ? 'Vérification…' : 'Vérifié il y a 20 s'}
          onRecheck={recheck}
        />

        <Tile tone="feature" span={5} rows={2} interactive>
          <TileHead>
            <AppIcon label="Films et séries" icon={Film} size="xl" />
            <Badge tone="success" dot>
              Partout
            </Badge>
          </TileHead>
          <div className="dashboard-feature">
            <span className="eyebrow">
              <span />
              Regarder
            </span>
            <TileLink href={href}>
              <h3>Films et séries</h3>
            </TileLink>
            <p>Sur ordinateur, TV et mobile.</p>
          </div>
          <Callout title="Sur la TV" icon={Smartphone}>
            Ouvrez l'application et tapez le code affiché.
          </Callout>
        </Tile>

        {services.slice(1, 5).map(service => {
          const status = statusOf(service);
          const locked = status === 'vpn';
          return (
            <Tile
              key={service.id}
              span={service.id === 'maison' ? 4 : 3}
              tone={locked ? 'locked' : 'default'}
              interactive={!locked}
            >
              <TileHead>
                <AppIcon label={service.name} icon={service.icon} locked={locked} />
                {locked && <Badge tone="warning">VPN requis</Badge>}
              </TileHead>
              <div>
                {locked ? (
                  <p className="dashboard-tile-title is-muted">{service.name}</p>
                ) : (
                  <TileLink href={href} className="dashboard-tile-title">
                    {service.name}
                  </TileLink>
                )}
                <p className="dashboard-tile-text">{service.description}</p>
              </div>
            </Tile>
          );
        })}
      </BentoGrid>

      <BentoGrid compact>
        <StatTile
          label="Lectures"
          icon={Film}
          value="2"
          caption="en cours (exemple)"
          state={statState('films')}
        />
        <StatTile
          label="Stockage"
          icon={HardDrive}
          value="3,1 To"
          caption="libres (exemple)"
          state={statState('stockage')}
          lockedCaption="VPN requis"
        />
        <StatTile
          label="Téléchargements"
          icon={Download}
          value="4,2 Mo/s"
          caption="en cours (exemple)"
          state={statState('telechargements')}
          lockedCaption="VPN requis"
        />
        <StatTile
          label="Métriques"
          icon={Gauge}
          value="12 ms"
          caption="latence moyenne (exemple)"
          state={statState('metriques')}
          lockedCaption="VPN requis"
        />
      </BentoGrid>

      <BentoGrid>
        <Tile span={6} rows={2} className="dashboard-launcher-tile">
          <TileHead>
            <TileLabel>Réseau local</TileLabel>
            <Badge tone={network === 'away' ? 'warning' : 'neutral'}>
              {network === 'away' ? 'VPN requis' : `${lan.length} services`}
            </Badge>
          </TileHead>
          <Launcher
            label="Services du réseau local"
            items={lan.map(service => ({
              id: service.id,
              name: service.name,
              href,
              icon: service.icon,
              description: service.description,
              status: statusOf(service),
            }))}
          />
        </Tile>
        <Tile span={6} rows={2} className="dashboard-phone-tile">
          <TileHead>
            <TileLabel>Navigation mobile</TileLabel>
            <Badge>TabBar</Badge>
          </TileHead>
          {tip ? (
            <Callout title="Ajouter à l'écran d'accueil" icon={Smartphone} onDismiss={() => setTip(false)}>
              Partager, puis « Sur l'écran d'accueil ».
            </Callout>
          ) : (
            <Button variant="secondary" size="small" onClick={() => setTip(true)}>
              Réafficher le conseil
            </Button>
          )}
          <p className="dashboard-tile-text">Onglet courant : {tab}</p>
          <TabBar
            current={tab}
            onChange={setTab}
            label="Exemple de navigation mobile"
            items={[
              { id: 'accueil', label: 'Accueil', icon: House },
              { id: 'chercher', label: 'Chercher', icon: Search },
              { id: 'epingles', label: 'Épinglés', icon: Star },
              { id: 'etat', label: 'État', icon: Activity },
            ]}
          />
        </Tile>
      </BentoGrid>

      <ServiceList label="Tous les services">
        {services.map(service => (
          <ServiceRow
            key={service.id}
            name={service.name}
            href={href}
            host={service.host}
            description={service.description}
            icon={service.icon}
            status={statusOf(service)}
            access={{ label: service.auth, tone: service.auth.includes('+') ? 'warning' : 'accent' }}
            pinned={pinned.includes(service.id)}
            onTogglePin={() => togglePin(service.id)}
          />
        ))}
      </ServiceList>
    </div>
  );
}
