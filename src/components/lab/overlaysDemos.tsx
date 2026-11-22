import { useState } from 'react';
import {
  Archive,
  Calendar,
  Copy,
  Download,
  House,
  Mail,
  Music,
  Pencil,
  Scissors,
  Search,
  Settings,
  Share2,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { AlertDialog, ContextMenu, Dropdown, HoverCard } from '@/components/lab/overlays';
import {
  CodeBlock,
  Dock,
  Terminal,
  TreeView,
  type CodeLanguage,
  type TerminalLine,
  type TreeNode,
} from '@/components/lab/tools';

export function DropdownDemo({ notify }: { notify: Notify }) {
  const [grid, setGrid] = useState(true);
  const chosen = (label: string) => () => notify(`« ${label} » choisi.`);
  return (
    <div className="lab-row">
      <Dropdown
        label="Actions"
        groups={[
          {
            id: 'fichier',
            label: 'Fichier',
            items: [
              {
                id: 'renommer',
                label: 'Renommer',
                icon: <Pencil size={14} />,
                shortcut: 'F2',
                onSelect: chosen('Renommer'),
              },
              {
                id: 'dupliquer',
                label: 'Dupliquer',
                icon: <Copy size={14} />,
                shortcut: 'Ctrl+D',
                onSelect: chosen('Dupliquer'),
              },
              {
                id: 'archiver',
                label: 'Archiver',
                icon: <Archive size={14} />,
                description: 'Indisponible pour un brouillon',
                disabled: true,
              },
            ],
          },
          {
            id: 'affichage',
            label: 'Affichage',
            items: [
              {
                id: 'grille',
                label: 'Afficher la grille',
                checked: grid,
                onSelect: () => {
                  setGrid(!grid);
                  notify(grid ? 'Grille masquée.' : 'Grille affichée.');
                },
              },
            ],
          },
          {
            id: 'danger',
            items: [
              {
                id: 'supprimer',
                label: 'Supprimer',
                icon: <Trash2 size={14} />,
                shortcut: 'Suppr',
                destructive: true,
                onSelect: () => notify('« Supprimer » choisi (démonstration).', 'warning'),
              },
            ],
          },
        ]}
      />
      <span className="lab-hint">Flèches, Début/Fin, Échap.</span>
    </div>
  );
}

export function ContextMenuDemo({ notify }: { notify: Notify }) {
  const chosen = (label: string) => () => notify(`« ${label} » choisi.`);
  return (
    <ContextMenu
      zoneLabel="Zone de démonstration du menu contextuel"
      groups={[
        {
          id: 'edition',
          items: [
            {
              id: 'couper',
              label: 'Couper',
              icon: <Scissors size={14} />,
              shortcut: 'Ctrl+X',
              onSelect: chosen('Couper'),
            },
            {
              id: 'copier',
              label: 'Copier',
              icon: <Copy size={14} />,
              shortcut: 'Ctrl+C',
              onSelect: chosen('Copier'),
            },
            { id: 'coller', label: 'Coller', shortcut: 'Ctrl+V', disabled: true },
          ],
        },
        {
          id: 'partage',
          items: [
            { id: 'partager', label: 'Partager…', icon: <Share2 size={14} />, onSelect: chosen('Partager') },
            {
              id: 'telecharger',
              label: 'Télécharger',
              icon: <Download size={14} />,
              onSelect: chosen('Télécharger'),
            },
          ],
        },
        {
          id: 'danger',
          items: [
            {
              id: 'supprimer',
              label: 'Supprimer',
              icon: <Trash2 size={14} />,
              destructive: true,
              onSelect: () => notify('« Supprimer » choisi (démonstration).', 'warning'),
            },
          ],
        },
      ]}
    >
      <strong>Clic droit ici</strong>
      <span>ou focus puis Maj+F10</span>
    </ContextMenu>
  );
}

export function HoverCardDemo({ notify }: { notify: Notify }) {
  return (
    <p className="ov-demo-text">
      Thème publié par{' '}
      <HoverCard
        trigger={
          <button type="button" className="ov-link">
            @marie.leroy
          </button>
        }
      >
        <span className="ov-profile">
          <span className="ov-profile-head">
            <span className="avatar" aria-hidden="true">
              ML
            </span>
            <span>
              <strong>Marie Leroy</strong>
              <small>Designer système · Lyon</small>
            </span>
          </span>
          <span className="ov-profile-bio">Maintient la palette Sauge et les jetons de mouvement.</span>
          <span className="ov-profile-foot">
            <span>
              <strong>12</strong> thèmes · <strong>248</strong> abonnés
            </span>
            <Button
              size="small"
              onClick={() => notify('Vous suivez Marie Leroy (démonstration).', 'success')}
            >
              Suivre
            </Button>
          </span>
        </span>
      </HoverCard>{' '}
      hier à 18 h.
    </p>
  );
}

export function AlertDialogDemo({ notify }: { notify: Notify }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" className="ov-danger-trigger" onClick={() => setOpen(true)}>
        <Trash2 size={15} />
        Supprimer le projet
      </Button>
      <AlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Supprimer « forma-demo » ?"
        description="Le projet, ses thèmes et son historique seront effacés définitivement. Cette action est irréversible."
        confirmText="forma-demo"
        confirmLabel="Supprimer le projet"
        onConfirm={async () => {
          await new Promise(resolve => window.setTimeout(resolve, 700));
          setOpen(false);
          notify('Projet supprimé (démonstration).', 'warning');
        }}
      />
    </>
  );
}

const files: TreeNode[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx', meta: '2 Ko' },
          { id: 'dialog', label: 'Dialog.tsx', meta: '4 Ko' },
          { id: 'menu', label: 'Menu.tsx', meta: '3 Ko' },
        ],
      },
      { id: 'styles', label: 'styles', children: [{ id: 'tokens', label: 'tokens.css', meta: '1 Ko' }] },
      { id: 'main', label: 'main.tsx', meta: '1 Ko' },
    ],
  },
  { id: 'public', label: 'public', children: [{ id: 'favicon', label: 'favicon.svg' }] },
  { id: 'lock', label: 'package-lock.json', meta: 'verrouillé', disabled: true },
  { id: 'package', label: 'package.json', meta: '1 Ko' },
];

export function TreeViewDemo() {
  const [selected, setSelected] = useState<string | null>('dialog');
  const [path, setPath] = useState('src/components/Dialog.tsx');
  return (
    <div className="lab-stack">
      <TreeView
        label="Fichiers du projet"
        nodes={files}
        selected={selected}
        defaultExpanded={['src', 'components']}
        onSelect={node => {
          setSelected(node.id);
          setPath(node.label);
        }}
      />
      <p className="lab-hint" aria-live="polite">
        Sélection : {path} · flèches, Début/Fin, * pour tout déplier
      </p>
    </div>
  );
}

const samples: Record<'ts' | 'css' | 'bash', { title: string; code: string; highlight: number[] }> = {
  ts: {
    title: 'useTheme.ts',
    highlight: [4],
    code: `// Lit le thème enregistré, avec repli
export function useTheme(fallback: Theme = 'clair') {
  const [theme, setTheme] = useState<Theme>(fallback);
  const sombre = theme === 'sombre' && motion > 0.5;
  return { theme, sombre, setTheme };
}`,
  },
  css: {
    title: 'tokens.css',
    highlight: [3],
    code: `/* Jetons de base */
.app {
  --accent: #477b60;
  --radius: 14px;
}
.carte:hover {
  box-shadow: 0 12px 25px var(--ombre) !important;
}`,
  },
  bash: {
    title: 'deploiement.sh',
    highlight: [],
    code: `# Construit puis publie la vitrine
npm ci && npm run build
export TAG="v$(date +%Y%m%d)"
docker build -t forma:$TAG . --push`,
  },
};

export function CodeBlockDemo() {
  const [language, setLanguage] = useState<'ts' | 'css' | 'bash'>('ts');
  const sample = samples[language];
  const names: Record<typeof language, string> = { ts: 'TypeScript', css: 'CSS', bash: 'Bash' };
  return (
    <div className="lab-stack">
      <div className="ov-segment" role="group" aria-label="Langage de l’exemple">
        {(Object.keys(samples) as (typeof language)[]).map(key => (
          <button key={key} type="button" aria-pressed={key === language} onClick={() => setLanguage(key)}>
            {names[key]}
          </button>
        ))}
      </div>
      <CodeBlock
        code={sample.code}
        language={language satisfies CodeLanguage}
        title={sample.title}
        highlight={sample.highlight}
      />
    </div>
  );
}

const session: TerminalLine[] = [
  { kind: 'command', text: 'npm create forma@latest mon-theme' },
  { kind: 'info', text: 'Création du projet dans ./mon-theme…' },
  { kind: 'success', text: '42 jetons générés' },
  { kind: 'command', text: 'npm run build' },
  { kind: 'output', text: 'vite v7 · transformation de 128 modules' },
  { kind: 'error', text: 'Contraste insuffisant : --muted sur --bg (3,9:1)' },
  { kind: 'success', text: 'Build terminé en 1,8 s' },
];

export function TerminalDemo() {
  return <Terminal title="mon-theme — bash" lines={session} />;
}

export function DockDemo({ notify }: { notify: Notify }) {
  const open = (label: string) => () => notify(`« ${label} » ouvert.`);
  return (
    <div className="ov-dock-stage">
      <Dock
        label="Applications"
        items={[
          {
            id: 'accueil',
            label: 'Accueil',
            icon: <House size={20} />,
            active: true,
            onSelect: open('Accueil'),
          },
          { id: 'recherche', label: 'Recherche', icon: <Search size={20} />, onSelect: open('Recherche') },
          {
            id: 'courrier',
            label: 'Courrier',
            icon: <Mail size={20} />,
            badge: 3,
            active: true,
            onSelect: open('Courrier'),
          },
          { id: 'agenda', label: 'Agenda', icon: <Calendar size={20} />, onSelect: open('Agenda') },
          { id: 'musique', label: 'Musique', icon: <Music size={20} />, onSelect: open('Musique') },
          { id: 'reglages', label: 'Réglages', icon: <Settings size={20} />, onSelect: open('Réglages') },
        ]}
      />
    </div>
  );
}
