import { X, type LucideIcon } from 'lucide-react';
import { Button } from '../ui';
import { AppIcon } from './AppIcon';

/** Raccourci épinglé. En mode édition, il devient un bouton de retrait. */
export function FavoriteChip({
  name,
  href,
  src,
  icon,
  editing = false,
  onRemove,
}: {
  name: string;
  href: string;
  src?: string;
  icon?: LucideIcon;
  editing?: boolean;
  onRemove?: () => void;
}) {
  if (editing) {
    return (
      <button
        type="button"
        className="favorite-chip is-editing"
        onClick={onRemove}
        aria-label={`Retirer ${name} des épinglés`}
      >
        {name}
        <X size={14} aria-hidden="true" />
      </button>
    );
  }
  return (
    <a className="favorite-chip" href={href} target="_blank" rel="noopener noreferrer">
      <AppIcon label={name} src={src} icon={icon} size="xs" round />
      {name}
    </a>
  );
}

/** Utilisateur connecté, avec son rôle et la déconnexion. */
export function UserChip({
  name,
  role,
  signOutHref,
  onSignOut,
}: {
  name: string;
  role?: string;
  signOutHref?: string;
  onSignOut?: () => void;
}) {
  return (
    <div className="user-chip">
      <span className="user-chip-avatar" aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
      <span className="user-chip-text">
        <span className="user-chip-name">{name}</span>
        {role && <span className="user-chip-role">{role}</span>}
      </span>
      {signOutHref ? (
        <a className="button button-ghost button-small user-chip-action" href={signOutHref}>
          Se déconnecter
        </a>
      ) : onSignOut ? (
        <Button variant="ghost" size="small" className="user-chip-action" onClick={onSignOut}>
          Se déconnecter
        </Button>
      ) : null}
    </div>
  );
}
