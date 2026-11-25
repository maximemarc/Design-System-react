/**
 * @maximemarc/design-system — point d'entrée du paquet.
 *
 * Usage :
 *   import '@maximemarc/design-system/design-system.css';
 *   import { Button, Badge, designSystemStyle } from '@maximemarc/design-system';
 *   <div className="design-system dark" style={designSystemStyle({ dark: true })}>…</div>
 *
 * Les modules ci-dessous sont ceux de la vitrine, publiés tels quels : la
 * vitrine reste la démonstration vivante de ce que le paquet contient.
 */
import './tokens.css';
import './core.css';

export { accentContrast, defaultAccent, designSystemStyle, type DesignSystemStyleOptions } from './theme';

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
  type BreadcrumbItem,
  type KbdSize,
  type NotificationTone,
  type ProgressTone,
  type RadioOption,
  type SpinnerSize,
  type SpinnerVariant,
} from '../components/lab/primitives';

export {
  AlertDialog,
  ContextMenu,
  Dropdown,
  HoverCard,
  type AlertTone,
  type MenuGroup,
  type MenuItem,
} from '../components/lab/overlays';

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
