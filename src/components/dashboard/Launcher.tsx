import { type LucideIcon } from 'lucide-react';
import { AppIcon } from '@/components/dashboard/AppIcon';
import { isNoteworthy, statusLabels, statusTones, type ServiceStatus } from '@/components/dashboard/types';

export type LauncherItem = {
  id: string;
  name: string;
  href: string;
  src?: string;
  icon?: LucideIcon;
  description?: string;
  status?: ServiceStatus;
};

/**
 * Grille d'icônes façon écran d'accueil. L'état est écrit sous l'icône
 * (lisible au doigt). Un élément « vpn » n'est pas cliquable.
 */
export function Launcher({ items, label }: { items: LauncherItem[]; label?: string }) {
  return (
    <ul className="launcher" aria-label={label}>
      {items.map(item => {
        const locked = item.status === 'vpn';
        const body = (
          <>
            <AppIcon label={item.name} src={item.src} icon={item.icon} size="md" locked={locked} />
            <span className="launcher-name">{item.name}</span>
            {isNoteworthy(item.status) && (
              <span className={`launcher-status tone-${statusTones[item.status]}`}>
                {statusLabels[item.status]}
              </span>
            )}
          </>
        );
        return (
          <li key={item.id}>
            {locked ? (
              <div className="launcher-item is-locked">{body}</div>
            ) : (
              <a
                className="launcher-item"
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={item.description}
              >
                {body}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
