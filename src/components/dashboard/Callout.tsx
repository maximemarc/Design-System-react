import { type ReactNode } from 'react';
import { X, type LucideIcon } from 'lucide-react';

/** Encadré de conseil ou d'alerte, masquable. */
export function Callout({
  title,
  children,
  tone = 'accent',
  icon: Icon,
  onDismiss,
}: {
  title: string;
  children?: ReactNode;
  tone?: 'accent' | 'success' | 'warning' | 'danger';
  icon?: LucideIcon;
  onDismiss?: () => void;
}) {
  return (
    <div
      className={`callout callout-${tone}`}
      role={tone === 'warning' || tone === 'danger' ? 'status' : undefined}
    >
      {Icon && <Icon size={20} className="callout-icon" aria-hidden="true" />}
      <div className="callout-body">
        <p className="callout-title">{title}</p>
        {children && <div className="callout-text">{children}</div>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="icon-button callout-dismiss"
          onClick={onDismiss}
          aria-label="Masquer"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
