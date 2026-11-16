import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { Skeleton, Tile, TileHead, TileLabel, type BentoSpan } from '@/components/dashboard';

export type NetworkState = 'home' | 'away' | 'checking';

const copy = {
  home: { title: 'À la maison', text: 'Réseau privé joignable : tous les services sont ouverts.' },
  away: { title: 'Dehors, sans VPN', text: 'Seuls les services publiés sur Internet répondent.' },
} as const;

/** Composition métier : indique si le réseau privé est joignable depuis cet appareil. */
export function NetworkTile({
  state,
  onRecheck,
  helpHref = '#aide-vpn',
  vpnName = 'NetBird',
  span = 4,
}: {
  state: NetworkState;
  onRecheck?: () => void;
  helpHref?: string;
  vpnName?: string;
  span?: BentoSpan;
}) {
  const tone = state === 'home' ? 'success' : state === 'away' ? 'warning' : 'default';
  const labelTone = state === 'home' ? 'success' : state === 'away' ? 'warning' : 'muted';
  const Icon = state === 'away' ? ShieldAlert : ShieldCheck;
  return (
    <Tile tone={tone} span={span} aria-busy={state === 'checking'}>
      <TileHead>
        <TileLabel tone={labelTone}>Réseau</TileLabel>
        <Icon size={20} className={`tone-${labelTone}`} aria-hidden="true" />
      </TileHead>
      {state === 'checking' ? (
        <div className="network-tile-body">
          <Skeleton width="60%" height={24} />
          <p className="network-tile-text">Vérification du réseau…</p>
        </div>
      ) : (
        <div className="network-tile-body">
          <p className="network-tile-title">
            {state === 'away' ? `Dehors, sans ${vpnName}` : copy.home.title}
          </p>
          <p className={`network-tile-text tone-${labelTone}`}>{copy[state].text}</p>
        </div>
      )}
      {state === 'away' && (
        <div className="network-tile-actions">
          <a className="button button-primary button-small" href={helpHref}>
            Activer {vpnName}
          </a>
          {onRecheck && (
            <Button variant="secondary" size="small" onClick={onRecheck}>
              Revérifier
            </Button>
          )}
        </div>
      )}
    </Tile>
  );
}
