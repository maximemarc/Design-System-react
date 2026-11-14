import { useEffect, useState } from 'react';
import { type Notification, type ToastPosition } from '@/components/useToasts';
import { AlertTriangle, CheckCircle2, CircleAlert, X } from 'lucide-react';
import '@/components/toast.css';

const labels = { success: 'Succès', warning: 'Attention', error: 'Erreur' };
const icons = { success: CheckCircle2, warning: AlertTriangle, error: CircleAlert };

function ToastItem({ notification, dismiss }: { notification: Notification; dismiss: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { id, message, tone } = notification;
  useEffect(() => {
    if (tone === 'error' || hovered || focused) return;
    const timer = window.setTimeout(() => dismiss(id), 6000);
    return () => window.clearTimeout(timer);
  }, [id, tone, dismiss, hovered, focused]);
  const Icon = icons[tone];
  return (
    <div
      className={`toast-item toast-${tone}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <Icon className="toast-tone-icon" size={20} />
      <div className="toast-message" role={tone === 'error' ? 'alert' : 'status'} aria-atomic="true">
        <strong>{labels[tone]}</strong>
        <p>{message}</p>
      </div>
      <button className="icon-button" aria-label={`Fermer : ${message}`} onClick={() => dismiss(id)}>
        <X size={17} />
      </button>
    </div>
  );
}

export function ToastViewport({
  notifications,
  dismiss,
  position = 'bottom-right',
}: {
  notifications: Notification[];
  dismiss: (id: string) => void;
  position?: ToastPosition;
}) {
  return (
    <section className={`toast-viewport toast-position-${position}`} aria-label="Notifications">
      {notifications.map(notification => (
        <ToastItem key={notification.id} notification={notification} dismiss={dismiss} />
      ))}
    </section>
  );
}
