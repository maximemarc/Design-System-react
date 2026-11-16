import { statusLabels, type ServiceStatus } from '@/components/dashboard/types';

const order: ServiceStatus[] = ['up', 'slow', 'down', 'unknown', 'vpn'];

/**
 * Une case par service. Forme et couleur changent ensemble : « hors ligne »
 * est une case vide cerclée, « VPN » une case en pointillés.
 */
export function StatusMeter({
  items,
  checkedAt,
  legend = false,
  pending = false,
}: {
  items: { name: string; status: ServiceStatus }[];
  checkedAt?: string;
  legend?: boolean;
  pending?: boolean;
}) {
  const counts = order
    .map(status => ({ status, count: items.filter(item => item.status === status).length }))
    .filter(entry => entry.count > 0);
  const summary = pending
    ? 'Vérification en cours'
    : counts.map(entry => `${entry.count} ${statusLabels[entry.status].toLowerCase()}`).join(', ');
  return (
    <div className="status-meter-wrap">
      <div className={`status-meter ${pending ? 'is-pending' : ''}`} role="img" aria-label={summary}>
        {items.map(item => (
          <span
            key={item.name}
            className={`status-cell is-${item.status}`}
            title={`${item.name} : ${statusLabels[item.status].toLowerCase()}`}
          />
        ))}
      </div>
      {legend && (
        <ul className="status-legend" aria-hidden="true">
          {order.map(status => (
            <li key={status}>
              <span className={`status-cell is-${status}`} />
              {statusLabels[status]}
            </li>
          ))}
        </ul>
      )}
      {checkedAt && <span className="status-meter-time">{checkedAt}</span>}
    </div>
  );
}
