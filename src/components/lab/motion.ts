import { useEffect, useState, type RefObject } from 'react';

/**
 * Indique si un élément peut s'animer : faux si le système demande moins d'animations
 * ou si l'élément se trouve sous `.no-motion` (réglage « Animations » de la vitrine).
 * À utiliser pour toute animation pilotée en JavaScript (requestAnimationFrame, minuteries).
 */
export function useMotionAllowed(ref: RefObject<Element | null>) {
  const [allowed, setAllowed] = useState(true);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setAllowed(!media.matches && !ref.current?.closest('.no-motion'));
    update();
    media.addEventListener('change', update);
    const app = ref.current?.closest('.app');
    const observer = app ? new MutationObserver(update) : null;
    if (app && observer) observer.observe(app, { attributes: true, attributeFilter: ['class'] });
    return () => {
      media.removeEventListener('change', update);
      observer?.disconnect();
    };
  }, [ref]);
  return allowed;
}
