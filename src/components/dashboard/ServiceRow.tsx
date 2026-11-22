import { type ReactNode } from 'react';
import { Star, type LucideIcon } from 'lucide-react';
import { Badge, type BadgeTone } from '../ui';
import { AppIcon } from './AppIcon';
import { TileLink } from './Tile';
import { isNoteworthy, statusLabels, statusTones, type ServiceStatus } from './types';

export function StarToggle({
  name,
  pinned,
  onToggle,
}: {
  name: string;
  pinned: boolean;
  onToggle: () => void;
}) {
  const label = `${pinned ? 'Désépingler' : 'Épingler'} ${name}`;
  return (
    <button
      type="button"
      className="star-toggle"
      aria-pressed={pinned}
      aria-label={label}
      title={label}
      onClick={onToggle}
    >
      <Star size={17} fill={pinned ? 'currentColor' : 'none'} aria-hidden="true" />
    </button>
  );
}

export function ServiceList({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <ul className="service-list" aria-label={label}>
      {children}
    </ul>
  );
}

export type ServiceRowProps = {
  name: string;
  href: string;
  host?: string;
  description?: string;
  src?: string;
  icon?: LucideIcon;
  status?: ServiceStatus;
  access?: { label: string; tone?: BadgeTone };
  pinned?: boolean;
  onTogglePin?: () => void;
};

/** Ligne dense pour les listes complètes. Toute la ligne est cliquable, sauf si le service est derrière le VPN. */
export function ServiceRow({
  name,
  href,
  host,
  description,
  src,
  icon,
  status,
  access,
  pinned = false,
  onTogglePin,
}: ServiceRowProps) {
  const locked = status === 'vpn';
  return (
    <li className={`service-row ${locked ? 'is-locked' : 'is-interactive'}`}>
      {onTogglePin ? <StarToggle name={name} pinned={pinned} onToggle={onTogglePin} /> : <span />}
      <div className="service-row-main">
        <AppIcon label={name} src={src} icon={icon} size="sm" locked={locked} />
        {locked ? (
          <span className="service-row-name">{name}</span>
        ) : (
          <TileLink href={href} className="service-row-name">
            {name}
          </TileLink>
        )}
        {isNoteworthy(status) && <Badge tone={statusTones[status]}>{statusLabels[status]}</Badge>}
      </div>
      <span className="service-row-host">{host}</span>
      <span className="service-row-description">{description}</span>
      {access ? <Badge tone={access.tone ?? 'neutral'}>{access.label}</Badge> : <span />}
    </li>
  );
}
