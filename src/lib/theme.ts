import { type CSSProperties } from 'react';

/** Accent par défaut de design-system. : la sauge. */
export const defaultAccent = '#477b60';

/**
 * Couleurs dérivées d'un accent : texte posé sur l'accent, et encre de
 * l'accent sur fond clair ou sombre, assez contrastées pour être lues.
 */
export function accentContrast(color: string) {
  const rgb = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
  const linear = rgb.map(channel =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
  return {
    onAccent: luminance > 0.179 ? '#172019' : '#ffffff',
    lightInk: luminance > 0.183 ? '#405047' : color,
    darkInk: luminance < 0.24 ? '#cde5d5' : color,
  };
}

export type DesignSystemStyleOptions = {
  /** Couleur d'accent, en #rrggbb. */
  accent?: string;
  dark?: boolean;
  /** Rayon des conteneurs, en pixels. */
  radius?: number;
  /** false coupe les transitions (--motion-duration à 0). */
  motion?: boolean;
  density?: 'Compact' | 'Confort';
};

/**
 * Variables CSS d'un thème, à poser en style sur la racine `.design-system` :
 * `<div className={`design-system ${dark ? 'dark' : ''}`} style={designSystemStyle({ dark })}>`.
 */
export function designSystemStyle({
  accent = defaultAccent,
  dark = false,
  radius = 12,
  motion = true,
  density = 'Confort',
}: DesignSystemStyleOptions = {}): CSSProperties {
  const contrast = accentContrast(accent);
  return {
    '--accent': accent,
    '--on-accent': contrast.onAccent,
    '--accent-ink': dark ? contrast.darkInk : contrast.lightInk,
    '--radius': `${radius}px`,
    '--motion-duration': motion ? '220ms' : '0ms',
    '--card-padding': density === 'Compact' ? '20px' : '24px',
  } as CSSProperties;
}
