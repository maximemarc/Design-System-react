import { type LucideIcon } from 'lucide-react';
import { AppIcon } from './AppIcon';
import { Skeleton } from './Skeleton';
import { Tile } from './Tile';
import { type BentoSpan } from './types';

export type StatTileState = 'ok' | 'loading' | 'down' | 'locked';

/** Petit widget chiffré. Les états sans donnée restent explicites. */
export function StatTile({
  label,
  value,
  caption,
  state = 'ok',
  src,
  icon,
  span = 3,
  lockedCaption = 'Accès restreint',
}: {
  label: string;
  value: string;
  caption?: string;
  state?: StatTileState;
  src?: string;
  icon?: LucideIcon;
  span?: BentoSpan;
  lockedCaption?: string;
}) {
  return (
    <Tile
      tone={state === 'locked' ? 'locked' : 'default'}
      span={span}
      className="stat-tile"
      aria-busy={state === 'loading'}
    >
      <div className="stat-tile-head">
        <AppIcon label={label} src={src} icon={icon} size="sm" locked={state !== 'ok'} />
        <span>{label}</span>
      </div>
      <div>
        {state === 'loading' ? (
          <>
            <Skeleton width="60%" height={28} />
            <p className="stat-tile-caption">Chargement…</p>
          </>
        ) : (
          <>
            <p className={`stat-tile-value is-${state}`}>
              {state === 'locked' ? '—' : state === 'down' ? 'Hors ligne' : value}
            </p>
            <p className="stat-tile-caption">
              {state === 'locked' ? lockedCaption : state === 'down' ? 'Pas de données' : caption}
            </p>
          </>
        )}
      </div>
    </Tile>
  );
}
