import { type CSSProperties } from 'react';

/** Bloc de chargement. Décoratif : annoncer le chargement par un texte à côté. */
export function Skeleton({
  width = '100%',
  height = 16,
  radius,
}: {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  radius?: CSSProperties['borderRadius'];
}) {
  return <span className="skeleton" style={{ width, height, borderRadius: radius }} aria-hidden="true" />;
}
