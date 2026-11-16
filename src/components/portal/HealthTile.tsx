import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui';
import {
  Skeleton,
  StatusMeter,
  Tile,
  TileHead,
  TileLabel,
  statusTones,
  type BentoSpan,
  type ServiceStatus,
} from '@/components/dashboard';

export type HealthState = 'ok' | 'loading' | 'unreachable';
export type HealthService = { name: string; status: ServiceStatus; statusHref?: string };

/**
 * Composition métier : synthèse de l'état des services.
 * « unreachable » signifie que la sonde elle-même ne répond pas : on ne
 * prétend alors ni que tout va bien, ni que tout est en panne.
 */
export function HealthTile({
  services,
  state = 'ok',
  checkedAt,
  onRecheck,
  probeName = 'Gatus',
  span = 4,
}: {
  services: HealthService[];
  state?: HealthState;
  checkedAt?: string;
  onRecheck?: () => void;
  probeName?: string;
  span?: BentoSpan;
}) {
  const reachable = services.filter(service => service.status !== 'vpn');
  const up = reachable.filter(service => service.status === 'up').length;
  const issues = reachable.filter(service => service.status === 'slow' || service.status === 'down');
  const meterItems =
    state === 'ok'
      ? services
      : services.map(service => ({
          ...service,
          status: (service.status === 'vpn' ? 'vpn' : 'unknown') as ServiceStatus,
        }));
  return (
    <Tile span={span} aria-busy={state === 'loading'}>
      <TileHead>
        <TileLabel>État des services</TileLabel>
        {onRecheck && (
          <button
            type="button"
            className="icon-button"
            onClick={onRecheck}
            aria-label="Revérifier l'état des services"
            title="Revérifier"
          >
            <RefreshCw size={16} aria-hidden="true" />
          </button>
        )}
      </TileHead>
      {state === 'loading' && (
        <div className="health-tile-body">
          <Skeleton width="45%" height={30} />
          <p className="health-tile-text">Interrogation de {probeName}…</p>
        </div>
      )}
      {state === 'unreachable' && (
        <div className="health-tile-body">
          <p className="health-tile-title tone-warning">État inconnu</p>
          <p className="health-tile-text">
            {probeName} ne répond pas. Les services marchent peut-être : ouvrez-les normalement.
          </p>
        </div>
      )}
      {state === 'ok' && (
        <div className="health-tile-body">
          <p className="health-tile-count">
            <span className={issues.length ? 'tone-warning' : undefined}>
              {up} / {reachable.length}
            </span>
            <span className="health-tile-text">en ligne</span>
          </p>
          {issues.map(service => {
            const label = `${service.name} ${service.status === 'down' ? 'hors ligne' : 'lent'}`;
            return service.statusHref ? (
              <a
                key={service.name}
                href={service.statusHref}
                target="_blank"
                rel="noopener noreferrer"
                className="health-tile-issue"
              >
                <Badge tone={statusTones[service.status]} dot>
                  {label} →
                </Badge>
              </a>
            ) : (
              <Badge key={service.name} tone={statusTones[service.status]} dot>
                {label}
              </Badge>
            );
          })}
        </div>
      )}
      <StatusMeter items={meterItems} checkedAt={checkedAt} pending={state === 'loading'} />
    </Tile>
  );
}
