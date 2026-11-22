import '@/components/templates/workspace.css';
import { useEffect, useState, type KeyboardEvent } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  Command as CommandIcon,
  Copy,
  Download,
  FileText,
  Folder,
  FolderOpen,
  FolderTree,
  History,
  Keyboard,
  PencilLine,
  RotateCcw,
  Rocket,
  Search,
  Settings,
  Trash2,
  Users,
} from 'lucide-react';
import { Badge, Button, Switch, type BadgeTone } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { Callout } from '@/components/dashboard/Callout';
import { Accordion, Timeline, type TimelineEntry } from '@/components/lab/disclosure';
import { Rating } from '@/components/lab/inputs';
import { AlertDialog, ContextMenu, type MenuGroup } from '@/components/lab/overlays';
import { Divider, EmptyState, KbdShortcut, ScrollArea } from '@/components/lab/primitives';
import { CodeBlock, TreeView, type TreeNode } from '@/components/lab/tools';
import { CommandPalette, type Command } from '@/components/lab/workflow';
import '@/components/lab/lab.css';

/* ─── G · Gestionnaire de fichiers ───────────────────────────────────── */

const fileTree: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'Button', label: 'Button.tsx', meta: '2 ko' },
          { id: 'Input', label: 'Input.tsx', meta: '3 ko' },
          { id: 'Modal', label: 'Modal.tsx', meta: '4 ko' },
          { id: 'Card', label: 'Card.tsx', meta: '1 ko' },
        ],
      },
      {
        id: 'pages',
        label: 'pages',
        children: [
          { id: 'Home', label: 'Home.tsx', meta: '5 ko' },
          { id: 'Dashboard', label: 'Dashboard.tsx', meta: '8 ko' },
          { id: 'Settings', label: 'Settings.tsx', meta: '6 ko' },
        ],
      },
      { id: 'App', label: 'App.tsx', meta: '2 ko' },
      { id: 'main', label: 'main.tsx', meta: '1 ko' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon', label: 'favicon.ico', meta: '15 ko' },
      { id: 'logo', label: 'logo.svg', meta: '3 ko' },
    ],
  },
  { id: 'package', label: 'package.json', meta: '1 ko' },
  { id: 'tsconfig', label: 'tsconfig.json', meta: '1 ko' },
];

const modifiedAt: Record<string, string> = {
  Button: 'il y a 2 h',
  Input: 'hier',
  Modal: 'il y a 3 j',
  Dashboard: 'il y a 20 min',
  App: 'ce matin',
};

const jsonFiles: Record<string, string> = {
  package: `{
  "name": "forma-demo",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build"
  }
}`,
  tsconfig: `{
  "compilerOptions": {
    "target": "ES2022",
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}`,
};

/** Retire les nœuds supprimés, à toute profondeur. */
function prune(nodes: TreeNode[], removed: string[]): TreeNode[] {
  return nodes
    .filter(node => !removed.includes(node.id))
    .map(node => (node.children ? { ...node, children: prune(node.children, removed) } : node));
}

/** Nœud et chemin complet depuis la racine. */
function locate(nodes: TreeNode[], id: string, parent = ''): { node: TreeNode; path: string } | null {
  for (const node of nodes) {
    const path = parent ? `${parent}/${node.label}` : node.label;
    if (node.id === id) return { node, path };
    const found = node.children ? locate(node.children, id, path) : null;
    if (found) return found;
  }
  return null;
}

function countFiles(nodes: TreeNode[]): number {
  return nodes.reduce((total, node) => total + (node.children ? countFiles(node.children) : 1), 0);
}

function sampleComponent(label: string, path: string) {
  const name = label.replace(/\.tsx$/, '');
  return `import { type ReactNode } from 'react';
// ${path}

export function ${name}({ children }: { children?: ReactNode }) {
  return <div className="${name.toLowerCase()}">{children}</div>;
}`;
}

export function FileManagerTemplate({ notify }: { notify: Notify }) {
  const [removed, setRemoved] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('Button');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [pendingDelete, setPendingDelete] = useState<TreeNode | null>(null);
  const tree = prune(fileTree, removed);
  const selection = selectedId ? locate(tree, selectedId) : null;
  const isFolder = Boolean(selection?.node.children);

  const copyPath = async () => {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(selection.path);
      notify(`Chemin copié : ${selection.path}`);
    } catch {
      notify('Copie refusée par le navigateur.', 'warning');
    }
  };
  const rename = () => {
    if (selection) notify(`Renommage de « ${selection.node.label} » : démonstration, rien n’est modifié.`);
  };
  const remove = () => {
    if (!pendingDelete) return;
    setRemoved(previous => [...previous, pendingDelete.id]);
    setSelectedId(null);
    setPendingDelete(null);
    notify(`« ${pendingDelete.label} » a été retiré de l’arborescence (démonstration).`, 'warning');
  };
  const restore = () => {
    setRemoved([]);
    setSelectedId('Button');
    notify('Arborescence restaurée.');
  };

  const menu: MenuGroup[] = [
    {
      id: 'file',
      label: selection ? selection.node.label : 'Aucune sélection',
      items: [
        {
          id: 'copy-path',
          label: 'Copier le chemin',
          icon: <Copy size={14} />,
          disabled: !selection,
          onSelect: () => void copyPath(),
        },
        {
          id: 'rename',
          label: 'Renommer',
          icon: <PencilLine size={14} />,
          shortcut: 'F2',
          disabled: !selection,
          onSelect: rename,
        },
      ],
    },
    {
      id: 'transfer',
      items: [
        {
          id: 'download',
          label: 'Télécharger',
          icon: <Download size={14} />,
          disabled: !selection || isFolder,
          onSelect: () => {
            if (selection) notify(`Téléchargement de « ${selection.node.label} » simulé.`);
          },
        },
      ],
    },
    {
      id: 'danger',
      items: [
        {
          id: 'delete',
          label: 'Supprimer',
          icon: <Trash2 size={14} />,
          shortcut: 'Suppr',
          destructive: true,
          disabled: !selection,
          onSelect: () => setPendingDelete(selection?.node ?? null),
        },
      ],
    },
  ];

  // Raccourcis limités à l'arborescence : F2 renomme, Suppr supprime.
  const onExplorerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement) || !event.target.closest('[role="tree"]')) return;
    if (event.key === 'F2') {
      event.preventDefault();
      rename();
    }
    if (event.key === 'Delete' && selection) {
      event.preventDefault();
      setPendingDelete(selection.node);
    }
  };

  const renderPreview = () => {
    if (!selection) {
      return (
        <EmptyState
          icon={<FolderOpen size={22} />}
          title="Aucun fichier sélectionné"
          description="Choisissez un fichier dans l’explorateur pour afficher son aperçu."
          size="sm"
          action={
            removed.length ? (
              <Button variant="secondary" size="small" onClick={restore}>
                <RotateCcw size={14} />
                Restaurer l’arborescence
              </Button>
            ) : (
              <Button variant="secondary" size="small" onClick={() => setSelectedId('App')}>
                <FileText size={14} />
                Ouvrir App.tsx
              </Button>
            )
          }
        />
      );
    }
    const { node, path } = selection;
    if (node.children) {
      const files = countFiles(node.children);
      return (
        <EmptyState
          icon={<Folder size={22} />}
          title={`Dossier « ${node.label} »`}
          description={
            files
              ? `${files} fichier(s). Dépliez le dossier et choisissez un fichier pour l’afficher.`
              : 'Ce dossier est vide.'
          }
          size="sm"
        />
      );
    }
    const extension = node.label.split('.').pop() ?? '';
    const rating = ratings[node.id] ?? 0;
    return (
      <div className="tpl-w-file">
        <div className="tpl-w-file-meta">
          <div className="lab-row">
            <Badge tone="accent">{extension.toUpperCase()}</Badge>
            {extension === 'tsx' && <Badge>React</Badge>}
            {node.meta && <Badge>{node.meta}</Badge>}
          </div>
          <small>Modifié {modifiedAt[node.id] ?? 'la semaine dernière'}</small>
        </div>
        {extension === 'tsx' ? (
          <CodeBlock code={sampleComponent(node.label, path)} language="tsx" title={node.label} />
        ) : jsonFiles[node.id] ? (
          <pre className="tpl-w-raw" tabIndex={0} aria-label={`Contenu de ${node.label}`}>
            {jsonFiles[node.id]}
          </pre>
        ) : (
          <EmptyState
            icon={<FileText size={22} />}
            title="Aperçu indisponible"
            description="Les fichiers image ne sont pas prévisualisés dans cette démonstration."
            size="sm"
          />
        )}
        <div className="tpl-w-file-rating">
          <Rating
            label="Noter ce fichier"
            value={rating}
            onChange={value => {
              setRatings(previous => ({ ...previous, [node.id]: value }));
              notify(`Note de ${value}/5 enregistrée pour ${node.label} (démonstration).`);
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <article className="specimen lab-example tpl-w-wide">
      <div className="specimen-label">
        G <span>Gestionnaire de fichiers</span>
        <FolderTree size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Explorateur du projet.</h3>
          <p>Arborescence au clavier, menu contextuel (clic droit, touche Menu ou Maj+F10) et aperçu.</p>
        </div>
        {removed.length > 0 && (
          <Button variant="secondary" size="small" onClick={restore}>
            <RotateCcw size={14} />
            Restaurer
          </Button>
        )}
      </div>
      <div className="tpl-w-files">
        <div className="tpl-w-explorer" onKeyDown={onExplorerKeyDown}>
          <div className="tpl-w-pane-head">
            <Folder size={13} aria-hidden="true" />
            <span>Explorateur</span>
          </div>
          <ContextMenu groups={menu} zoneLabel="Explorateur de fichiers" label="Actions sur le fichier">
            <ScrollArea label="Arborescence du projet" maxHeight={300}>
              <TreeView
                nodes={tree}
                label="Fichiers du projet"
                selected={selectedId}
                onSelect={node => setSelectedId(node.id)}
                defaultExpanded={['src', 'components', 'pages']}
              />
            </ScrollArea>
          </ContextMenu>
        </div>
        <section className="tpl-w-preview" aria-label="Aperçu du fichier">
          {selection && (
            <div className="tpl-w-pane-head tpl-w-path">
              <FileText size={13} aria-hidden="true" />
              <code>{selection.path}</code>
              <button
                type="button"
                className="icon-button tpl-w-copy"
                aria-label="Copier le chemin"
                onClick={() => void copyPath()}
              >
                <Copy size={14} />
              </button>
            </div>
          )}
          <div className="tpl-w-preview-body">{renderPreview()}</div>
        </section>
      </div>
      <AlertDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title={`Supprimer « ${pendingDelete?.label ?? ''} » ?`}
        description="Démonstration : l’élément est seulement retiré de l’arborescence affichée."
      />
    </article>
  );
}

/* ─── H · Centre de commandes ────────────────────────────────────────── */

const shortcutGroups = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'P'], description: 'Ouverture rapide' },
      { keys: ['⌘', 'Maj', 'P'], description: 'Palette de commandes' },
      { keys: ['⌘', 'Tab'], description: 'Changer d’onglet' },
      { keys: ['⌘', 'B'], description: 'Afficher la barre latérale' },
    ],
  },
  {
    label: 'Édition',
    shortcuts: [
      { keys: ['⌘', 'Z'], description: 'Annuler' },
      { keys: ['⌘', 'Maj', 'Z'], description: 'Rétablir' },
      { keys: ['⌘', 'D'], description: 'Dupliquer la ligne' },
      { keys: ['⌘', '/'], description: 'Commenter' },
    ],
  },
  {
    label: 'Affichage',
    shortcuts: [
      { keys: ['⌘', '\\'], description: 'Scinder l’éditeur' },
      { keys: ['⌘', '='], description: 'Zoom avant' },
      { keys: ['⌘', '-'], description: 'Zoom arrière' },
      { keys: ['Échap'], description: 'Fermer le panneau' },
    ],
  },
];

export function CommandCenterTemplate({ notify }: { notify: Notify }) {
  const [open, setOpen] = useState(false);
  const [shortcutEnabled, setShortcutEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState<string | null>(null);

  // Alt+Maj+P (⌥⇧P sur Mac) : n'empiète ni sur ⌘/Ctrl+K (recherche de l'app) ni sur ⌘/Ctrl+J (tableau de projet).
  useEffect(() => {
    if (!shortcutEnabled) return;
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (!event.altKey || !event.shiftKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.code !== 'KeyP') return;
      event.preventDefault();
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shortcutEnabled]);

  const command = (id: string, label: string, group: string, icon: Command['icon'], shortcut?: string) => ({
    id,
    label,
    group,
    icon,
    shortcut,
    run: () => {
      setLastCommand(label);
      notify(`Commande « ${label} » exécutée (démonstration).`);
    },
  });
  const commands: Command[] = [
    command('new-file', 'Nouveau fichier', 'Fichier', <FileText size={15} />, '⌘ N'),
    command('open-folder', 'Ouvrir un dossier', 'Fichier', <Folder size={15} />, '⌘ O'),
    command('search', 'Rechercher dans les fichiers', 'Fichier', <Search size={15} />, '⌘ P'),
    command('settings', 'Ouvrir les réglages', 'Application', <Settings size={15} />, '⌘ ,'),
    command('users', 'Gérer les membres', 'Application', <Users size={15} />),
    command('notifications', 'Préférences de notification', 'Application', <Bell size={15} />),
    command('export', 'Exporter en ZIP', 'Actions', <Download size={15} />, '⌘ Maj E'),
  ];

  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        H <span>Centre de commandes</span>
        <Keyboard size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Tout au clavier.</h3>
          <p>Une palette de commandes et l’aide-mémoire des raccourcis de l’éditeur.</p>
        </div>
      </div>
      <div className="tpl-w-launcher">
        <div className="tpl-w-launcher-text">
          <strong>Palette de commandes</strong>
          <p>
            <KbdShortcut keys={['Alt', 'Maj', 'P']} size="sm" label="Alt Maj P" /> pour l’ouvrir (⌥⇧P sur
            Mac), flèches pour naviguer, Entrée pour lancer, Échap pour fermer.
          </p>
          {lastCommand && (
            <p className="tpl-w-last" aria-live="polite">
              <CheckCircle2 size={13} aria-hidden="true" /> Dernière commande : {lastCommand}
            </p>
          )}
        </div>
        <div className="tpl-w-launcher-actions">
          <label className="tpl-w-switch">
            <Switch
              checked={shortcutEnabled}
              onChange={setShortcutEnabled}
              label="Raccourci global Alt+Maj+P"
            />
            <span aria-hidden="true">Raccourci</span>
          </label>
          <Button variant="secondary" size="small" onClick={() => setOpen(true)}>
            <CommandIcon size={14} />
            Ouvrir la palette
          </Button>
        </div>
      </div>
      <div className="tpl-w-shortcuts">
        {shortcutGroups.map(group => (
          <section key={group.label} className="tpl-w-shortcut-group" aria-label={group.label}>
            <h4>{group.label}</h4>
            <dl>
              {group.shortcuts.map(shortcut => (
                <div key={shortcut.description}>
                  <dt>{shortcut.description}</dt>
                  <dd>
                    <KbdShortcut keys={shortcut.keys} size="sm" label={shortcut.keys.join(' ')} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <p className="lab-hint">Sous Windows et Linux, ⌘ correspond à Ctrl.</p>
      <CommandPalette open={open} onClose={() => setOpen(false)} commands={commands} />
    </article>
  );
}

/* ─── I · Fil d'activité ─────────────────────────────────────────────── */

type ActivityStatus = 'done' | 'active' | 'pending';
type Activity = { id: string; title: string; description: string; time: string; status: ActivityStatus };

const initialActivity: Activity[] = [
  {
    id: 'a1',
    title: 'Mise en production',
    description: 'v2.4.1 déployée avec succès en production.',
    time: 'Il y a 2 min',
    status: 'done',
  },
  {
    id: 'a2',
    title: 'Chaîne d’intégration réussie',
    description: '247 tests passés, artefact de build publié.',
    time: 'Il y a 8 min',
    status: 'done',
  },
  {
    id: 'a3',
    title: 'Revue de code approuvée',
    description: 'Relue par Alex et Jordan, 3 suggestions appliquées.',
    time: 'Il y a 1 h',
    status: 'done',
  },
  {
    id: 'a4',
    title: 'Demande de fusion ouverte',
    description: 'En attente de relecture pour feature/onboarding-flow.',
    time: 'Il y a 3 h',
    status: 'active',
  },
  {
    id: 'a5',
    title: 'Revue de design',
    description: 'Prévue demain avec l’équipe design.',
    time: 'Demain',
    status: 'pending',
  },
];

const statusTone: Record<ActivityStatus, TimelineEntry['tone']> = {
  done: 'success',
  active: 'accent',
  pending: 'neutral',
};
const filters: { id: ActivityStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'Tout' },
  { id: 'done', label: 'Terminé' },
  { id: 'active', label: 'En cours' },
  { id: 'pending', label: 'À venir' },
];
const team: { name: string; role: string; presence: 'online' | 'away' | 'offline' }[] = [
  { name: 'Jordan Lee', role: 'Responsable technique', presence: 'online' },
  { name: 'Sam Rivera', role: 'Front-end', presence: 'away' },
  { name: 'Morgan Park', role: 'Qualité', presence: 'offline' },
];
const presence: Record<(typeof team)[number]['presence'], { label: string; task: string; tone: BadgeTone }> =
  {
    online: { label: 'En ligne', task: 'Terminé', tone: 'success' },
    away: { label: 'Absent', task: 'En cours', tone: 'warning' },
    offline: { label: 'Hors ligne', task: 'En attente', tone: 'neutral' },
  };
const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('');
const clock = () => new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' });

export function ActivityFeedTemplate({ notify }: { notify: Notify }) {
  const [activity, setActivity] = useState(initialActivity);
  const [filter, setFilter] = useState<ActivityStatus | 'all'>('all');
  const [runs, setRuns] = useState(0);
  const [feedback, setFeedback] = useState(0);
  const visible = activity.filter(item => filter === 'all' || item.status === filter);
  const redeploy = () => {
    const run = runs + 1;
    setRuns(run);
    setActivity(previous => [
      {
        id: `run-${run}`,
        title: 'Déploiement relancé',
        description: `Exécution n° ${run} de la chaîne de déploiement (simulation).`,
        time: clock(),
        status: 'active',
      },
      ...previous,
    ]);
    setFilter('all');
    notify('Déploiement relancé (démonstration).');
  };
  const reset = () => {
    setActivity(initialActivity);
    setRuns(0);
    setFilter('all');
    notify('Fil d’activité réinitialisé.');
  };

  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        I <span>Fil d’activité</span>
        <History size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Version 2.4.1 en ligne.</h3>
          <p>Chronologie du déploiement, notes de version et avancement de l’équipe.</p>
        </div>
        <div className="lab-row">
          {runs > 0 && (
            <Button variant="ghost" size="small" onClick={reset}>
              <RotateCcw size={14} />
              Réinitialiser
            </Button>
          )}
          <Button size="small" onClick={redeploy}>
            <Rocket size={14} />
            Relancer
          </Button>
        </div>
      </div>
      <div className="tpl-w-feed">
        <section className="tpl-w-feed-main" aria-labelledby="tpl-w-feed-title">
          <div className="tpl-w-feed-head">
            <Clock size={14} aria-hidden="true" />
            <strong id="tpl-w-feed-title">Activité récente</strong>
            <Badge tone="accent">{activity.length} événements</Badge>
          </div>
          <div className="tpl-w-filters" role="group" aria-label="Filtrer par état">
            {filters.map(option => {
              const count =
                option.id === 'all'
                  ? activity.length
                  : activity.filter(item => item.status === option.id).length;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={filter === option.id ? 'selected' : ''}
                  aria-pressed={filter === option.id}
                  onClick={() => setFilter(option.id)}
                >
                  {option.label} <span>{count}</span>
                </button>
              );
            })}
          </div>
          <div aria-live="polite">
            <Timeline
              items={visible.map(item => ({
                id: item.id,
                title: item.title,
                description: item.description,
                time: item.time,
                tone: statusTone[item.status],
              }))}
              emptyLabel="Aucun événement pour ce filtre."
            />
          </div>
        </section>
        <div className="tpl-w-feed-side">
          <Callout title="Notes de version v2.4.1">
            <p>Performances améliorées, trois corrections et un nouveau parcours d’accueil.</p>
          </Callout>
          <Accordion
            items={[
              {
                id: 'new',
                title: 'Nouveautés',
                content: 'Parcours d’accueil en quatre étapes, export ZIP depuis la palette de commandes.',
              },
              {
                id: 'perf',
                title: 'Performances',
                content: 'Chargement initial réduit de 18 %, listes virtualisées dans l’explorateur.',
              },
              {
                id: 'fix',
                title: 'Corrections',
                content: 'Focus restauré après fermeture des menus, dates en français, dépassement à 390 px.',
              },
            ]}
          />
          <section className="tpl-w-card" aria-label="Avis de revue">
            <div className="tpl-w-person">
              <span className="tpl-w-avatar" aria-hidden="true">
                AC
              </span>
              <div>
                <strong>Alex Chen</strong>
                <small>Ingénieur principal · à l’instant</small>
              </div>
              <Badge tone="success">Approuvé</Badge>
            </div>
            <blockquote>
              « Excellent travail sur la refonte. La nouvelle architecture des composants est bien plus claire
              et les gains de performance sont nets. »
            </blockquote>
            <Divider />
            {feedback ? (
              <p className="tpl-w-thanks" role="status">
                <CheckCircle2 size={14} aria-hidden="true" /> Merci pour votre retour ({feedback}/5).
              </p>
            ) : (
              <Rating
                label="Cet avis vous a-t-il aidé ?"
                value={feedback}
                onChange={value => {
                  setFeedback(value);
                  notify(`Merci pour votre note de ${value}/5 (démonstration).`);
                }}
              />
            )}
          </section>
          <section className="tpl-w-card" aria-labelledby="tpl-w-team-title">
            <h4 id="tpl-w-team-title">Équipe</h4>
            <ul className="tpl-w-team">
              {team.map(member => (
                <li key={member.name} className="tpl-w-person">
                  <span className={`tpl-w-avatar presence-${member.presence}`}>
                    <span aria-hidden="true">{initials(member.name)}</span>
                    <span className="pr-sr-only">{presence[member.presence].label}</span>
                  </span>
                  <div>
                    <strong>{member.name}</strong>
                    <small>{member.role}</small>
                  </div>
                  <Badge tone={presence[member.presence].tone}>{presence[member.presence].task}</Badge>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </article>
  );
}
