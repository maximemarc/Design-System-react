import { type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
import { type BentoSpan } from './types';

/** Grille de 12 colonnes qui comble les trous ; s'empile sur mobile. */
export function BentoGrid({
  children,
  compact = false,
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement> & { compact?: boolean }) {
  return (
    <div className={`bento ${compact ? 'bento-compact' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
}

export type TileTone = 'default' | 'feature' | 'success' | 'warning' | 'locked' | 'ghost';

/**
 * Tuile de la grille. Pour la rendre cliquable en entier, placer un TileLink
 * dans son contenu et passer `interactive`.
 */
export function Tile({
  tone = 'default',
  span = 4,
  rows = 1,
  interactive = false,
  className = '',
  children,
  ...props
}: HTMLAttributes<HTMLElement> & {
  tone?: TileTone;
  span?: BentoSpan;
  rows?: 1 | 2;
  interactive?: boolean;
}) {
  return (
    <section
      className={`tile tile-${tone} tile-span-${span} ${rows === 2 ? 'tile-rows-2' : ''} ${
        interactive ? 'tile-interactive' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </section>
  );
}

/** Lien dont la zone cliquable couvre toute la tuile (ou la ligne) parente. */
export function TileLink({
  external = true,
  className = '',
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { external?: boolean }) {
  return (
    <a
      className={`tile-link ${className}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
}

export function TileLabel({
  children,
  tone = 'muted',
}: {
  children: ReactNode;
  tone?: 'muted' | 'accent' | 'success' | 'warning';
}) {
  return <span className={`tile-label tile-label-${tone}`}>{children}</span>;
}

export function TileHead({ children }: { children: ReactNode }) {
  return <div className="tile-head">{children}</div>;
}
