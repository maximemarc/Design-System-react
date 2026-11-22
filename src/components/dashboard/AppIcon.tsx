import { type LucideIcon } from 'lucide-react';
import { monogram } from './types';

const sizes = {
  xs: { box: 28, glyph: 18 },
  sm: { box: 34, glyph: 20 },
  md: { box: 48, glyph: 28 },
  lg: { box: 56, glyph: 34 },
  xl: { box: 72, glyph: 44 },
} as const;

export type AppIconSize = keyof typeof sizes;

/**
 * Icône d'application : une image (logo du service), sinon une icône Lucide,
 * sinon les initiales du libellé. Décorative par défaut, car le nom est affiché à côté.
 */
export function AppIcon({
  label,
  src,
  icon: Icon,
  size = 'md',
  locked = false,
  round = false,
  decorative = true,
}: {
  label: string;
  src?: string;
  icon?: LucideIcon;
  size?: AppIconSize;
  locked?: boolean;
  round?: boolean;
  decorative?: boolean;
}) {
  const { box, glyph } = sizes[size];
  return (
    <span
      className={`app-icon ${locked ? 'is-locked' : ''} ${round ? 'is-round' : ''}`}
      style={{ width: box, height: box, fontSize: Math.round(box * 0.32) }}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': label })}
    >
      {src ? (
        <img src={src} alt="" width={glyph} height={glyph} />
      ) : Icon ? (
        <Icon size={Math.round(glyph * 0.85)} strokeWidth={1.8} />
      ) : (
        monogram(label)
      )}
    </span>
  );
}
