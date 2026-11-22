import './textEffects.css';
import { useCallback, useEffect, useRef, useSyncExternalStore, type ReactNode } from 'react';
import { useMotionAllowed } from '@/components/lab/motion';

export type CursorVariant = 'point' | 'anneau' | 'trainee' | 'reticule';

const TRAIL_LENGTH = 8;
const INTERACTIVE = 'button, a, [role="button"], input, select, textarea, label';
const trailIndexes = Array.from({ length: TRAIL_LENGTH }, (_, index) => index);

function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Zone de démonstration où le curseur système est remplacé par un curseur personnalisé.
 * Limité à cette zone, jamais à toute la page ; inactif sur écran tactile et quand les animations sont réduites
 * (le curseur système est alors conservé).
 */
export function CustomCursorZone({
  variant = 'anneau',
  children,
  className = '',
}: {
  variant?: CursorVariant;
  children?: ReactNode;
  className?: string;
}) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const lineHRef = useRef<HTMLSpanElement>(null);
  const lineVRef = useRef<HTMLSpanElement>(null);
  const trailRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const allowed = useMotionAllowed(zoneRef);
  const finePointer = useMediaQuery('(hover: hover) and (pointer: fine)');
  const active = allowed && finePointer;

  useEffect(() => {
    const zone = zoneRef.current;
    if (!active || !zone) return;

    const target = { x: -100, y: -100 };
    const ring = { x: -100, y: -100 };
    const trail = trailIndexes.map(() => ({ x: -100, y: -100 }));
    let frame = 0;
    let running = false;

    const place = (element: HTMLElement | null | undefined, x: number, y: number) => {
      if (element) element.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    const tick = () => {
      const hovering = zone.hasAttribute('data-hover');
      const ease = hovering ? 0.25 : 0.15;
      ring.x += (target.x - ring.x) * ease;
      ring.y += (target.y - ring.y) * ease;
      place(dotRef.current, target.x, target.y);
      place(ringRef.current, ring.x, ring.y);
      if (lineHRef.current) lineHRef.current.style.transform = `translate3d(0, ${target.y}px, 0)`;
      if (lineVRef.current) lineVRef.current.style.transform = `translate3d(${target.x}px, 0, 0)`;
      let leader = target;
      trail.forEach((point, index) => {
        point.x += (leader.x - point.x) * 0.45;
        point.y += (leader.y - point.y) * 0.45;
        place(trailRefs.current[index], point.x, point.y);
        leader = point;
      });
      frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (running) return;
      running = true;
      frame = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = zone.getBoundingClientRect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      // Le curseur apparaît sous le pointeur, sans glisser depuis l'angle.
      ring.x = target.x;
      ring.y = target.y;
      trail.forEach(point => {
        point.x = target.x;
        point.y = target.y;
      });
      zone.setAttribute('data-inside', '');
      start();
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const box = zone.getBoundingClientRect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;
      const over = event.target instanceof Element && event.target.closest(INTERACTIVE) !== null;
      zone.toggleAttribute('data-hover', over);
      if (!zone.hasAttribute('data-inside')) zone.setAttribute('data-inside', '');
      start();
    };
    const onLeave = () => {
      zone.removeAttribute('data-inside');
      zone.removeAttribute('data-hover');
      stop();
    };

    zone.addEventListener('pointerenter', onEnter);
    zone.addEventListener('pointermove', onMove);
    zone.addEventListener('pointerleave', onLeave);
    return () => {
      stop();
      zone.removeEventListener('pointerenter', onEnter);
      zone.removeEventListener('pointermove', onMove);
      zone.removeEventListener('pointerleave', onLeave);
      zone.removeAttribute('data-inside');
      zone.removeAttribute('data-hover');
    };
  }, [active, variant]);

  return (
    <div ref={zoneRef} className={`tx-fx-cursor-zone ${className}`} data-active={active ? '' : undefined}>
      {children}
      {!finePointer && <span>Curseur personnalisé indisponible sur écran tactile.</span>}
      {finePointer && !allowed && <span>Animations réduites : le curseur système est conservé.</span>}
      {active && (
        <span className="tx-fx-cursor-layer" aria-hidden="true">
          {variant === 'reticule' && (
            <>
              <span ref={lineHRef} className="tx-fx-cursor-line-h" />
              <span ref={lineVRef} className="tx-fx-cursor-line-v" />
            </>
          )}
          {variant === 'trainee' &&
            trailIndexes.map(index => (
              <span
                key={index}
                ref={element => {
                  trailRefs.current[index] = element;
                }}
                className="tx-fx-cursor-trail"
                style={{
                  opacity: 0.55 * (1 - index / TRAIL_LENGTH),
                  scale: String(1 - index / (TRAIL_LENGTH + 2)),
                }}
              />
            ))}
          {variant === 'anneau' && <span ref={ringRef} className="tx-fx-cursor-ring" />}
          {variant === 'reticule' ? (
            <span ref={dotRef} className="tx-fx-cursor-target" />
          ) : (
            <span ref={dotRef} className="tx-fx-cursor-dot" />
          )}
        </span>
      )}
    </div>
  );
}
