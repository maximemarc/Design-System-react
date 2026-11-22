/**
 * @maximemarc/forma — point d'entrée du paquet.
 *
 * Usage :
 *   import '@maximemarc/forma/forma.css';
 *   import { Button, Badge, formaStyle } from '@maximemarc/forma';
 *   <div className="forma dark" style={formaStyle({ dark: true })}>…</div>
 *
 * Les modules ci-dessous sont ceux de la vitrine, publiés tels quels : la
 * vitrine reste la démonstration vivante de ce que le paquet contient.
 */
import './tokens.css';
import './core.css';

export { accentContrast, defaultAccent, formaStyle, type FormaStyleOptions } from './theme';

export { Badge, Button, Modal, SectionHeading, Switch, type BadgeTone } from '../components/ui';

export {
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
  Spinner,
} from '../components/lab/primitives';

export { AlertDialog, ContextMenu, Dropdown, HoverCard } from '../components/lab/overlays';

export { useMotionAllowed } from '../components/lab/motion';

export {
  AppIcon,
  BentoGrid,
  Callout,
  FavoriteChip,
  Launcher,
  ServiceList,
  ServiceRow,
  Skeleton,
  StarToggle,
  StatTile,
  StatusMeter,
  TabBar,
  Tile,
  TileHead,
  TileLabel,
  TileLink,
  UserChip,
  isNoteworthy,
  monogram,
  statusLabels,
  statusTones,
  type AppIconSize,
  type BentoSpan,
  type LauncherItem,
  type ServiceRowProps,
  type ServiceStatus,
  type StatTileState,
  type TabBarItem,
  type TileTone,
} from '../components/dashboard';

export { ToastViewport } from '../components/Toast';
export {
  useToasts,
  type Notification as ToastNotification,
  type Notify,
  type ToastPosition,
  type ToastTone,
} from '../components/useToasts';
