import './textEffects.css';
import {
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { useMotionAllowed } from '@/components/lab/motion';

/** Le suivi du pointeur ne concerne que la souris et le stylet : au doigt, on laisse défiler la page. */
const isFinePointer = (event: PointerEvent) => event.pointerType !== 'touch';

/** Carte qui s'incline en 3D sous le pointeur, avec un reflet lumineux. */
export function Tilt3DCard({
  children,
  maxTilt = 12,
  scale = 1.03,
  glare = true,
  className = '',
}: {
  children: ReactNode;
  maxTilt?: number;
  scale?: number;
  glare?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(ref);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowed || !isFinePointer(event)) return;
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return;
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    element.style.setProperty('--tx-tilt-x', `${(0.5 - y) * maxTilt * 2}deg`);
    element.style.setProperty('--tx-tilt-y', `${(x - 0.5) * maxTilt * 2}deg`);
    element.style.setProperty('--tx-tilt-scale', String(scale));
    if (glare) {
      const angle = (Math.atan2(y - 0.5, x - 0.5) * 180) / Math.PI + 90;
      element.style.setProperty('--tx-glare-angle', `${angle}deg`);
      element.style.setProperty('--tx-glare-opacity', '1');
    }
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    const style = event.currentTarget.style;
    for (const name of ['--tx-tilt-x', '--tx-tilt-y', '--tx-tilt-scale', '--tx-glare-opacity']) {
      style.removeProperty(name);
    }
  };

  return (
    <div
      ref={ref}
      className={`tx-fx-tilt ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
      {glare && <span className="tx-fx-tilt-glare" aria-hidden="true" />}
    </div>
  );
}

/** Carte dont la bordure s'illumine d'un halo dégradé qui suit le pointeur. */
export function MagicCard({
  children,
  size = 180,
  className = '',
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(ref);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowed || !isFinePointer(event)) return;
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();
    element.style.setProperty('--tx-mx', `${event.clientX - box.left}px`);
    element.style.setProperty('--tx-my', `${event.clientY - box.top}px`);
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty('--tx-mx');
    event.currentTarget.style.removeProperty('--tx-my');
  };

  return (
    <div
      ref={ref}
      className={`tx-fx-magic ${className}`}
      style={{ '--tx-magic-size': `${size}px` } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="tx-fx-magic-inner">{children}</div>
    </div>
  );
}

/** Carte qui s'éclaire au survol ; la lueur suit le pointeur quand les animations sont permises. */
export function GlowCard({
  children,
  size = 260,
  className = '',
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(ref);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!allowed || !isFinePointer(event)) return;
    const element = event.currentTarget;
    const box = element.getBoundingClientRect();
    element.style.setProperty('--tx-gx', `${event.clientX - box.left}px`);
    element.style.setProperty('--tx-gy', `${event.clientY - box.top}px`);
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty('--tx-gx');
    event.currentTarget.style.removeProperty('--tx-gy');
  };

  return (
    <div
      ref={ref}
      className={`tx-fx-glow ${className}`}
      style={{ '--tx-glow-size': `${size}px` } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {children}
    </div>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' };

/** Bouton attiré par le pointeur lorsqu'il s'approche (zone d'attraction autour du bouton). */
export function MagneticButton({
  strength = 0.35,
  zone = 24,
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps & { strength?: number; zone?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const allowed = useMotionAllowed(ref);

  const onPointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    const button = buttonRef.current;
    if (!allowed || !button || props.disabled || !isFinePointer(event)) return;
    const box = button.getBoundingClientRect();
    const dx = (event.clientX - (box.left + box.width / 2)) * strength;
    const dy = (event.clientY - (box.top + box.height / 2)) * strength;
    button.style.setProperty('--tx-magnet-x', `${dx}px`);
    button.style.setProperty('--tx-magnet-y', `${dy}px`);
  };
  const onPointerLeave = () => {
    buttonRef.current?.style.removeProperty('--tx-magnet-x');
    buttonRef.current?.style.removeProperty('--tx-magnet-y');
  };

  return (
    <span
      ref={ref}
      className="tx-fx-magnet"
      style={{ '--tx-magnet-zone': `${zone}px` } as CSSProperties}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <button
        type="button"
        ref={buttonRef}
        className={`button button-${variant} tx-fx-magnet-button ${className}`}
        {...props}
      >
        {children}
      </button>
    </span>
  );
}

type Wave = { id: number; x: number; y: number; size: number };

/** Bouton qui émet une onde depuis le point de clic. */
export function RippleButton({
  duration = 600,
  variant = 'primary',
  className = '',
  children,
  onPointerDown,
  ...props
}: ButtonProps & { duration?: number }) {
  const ref = useRef<HTMLButtonElement>(null);
  const allowed = useMotionAllowed(ref);
  const [waves, setWaves] = useState<Wave[]>([]);
  const nextId = useRef(0);

  const addWave = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event);
    if (!allowed || props.disabled) return;
    const box = event.currentTarget.getBoundingClientRect();
    const size = Math.max(box.width, box.height) * 2;
    const id = nextId.current++;
    setWaves(previous => [
      ...previous,
      { id, x: event.clientX - box.left - size / 2, y: event.clientY - box.top - size / 2, size },
    ]);
  };
  const removeWave = (id: number) => setWaves(previous => previous.filter(wave => wave.id !== id));

  return (
    <button
      type="button"
      ref={ref}
      className={`button button-${variant} tx-fx-ripple ${className}`}
      onPointerDown={addWave}
      {...props}
    >
      {children}
      {allowed &&
        waves.map(wave => (
          <span
            key={wave.id}
            className="tx-fx-ripple-wave"
            aria-hidden="true"
            onAnimationEnd={() => removeWave(wave.id)}
            style={
              {
                left: wave.x,
                top: wave.y,
                width: wave.size,
                height: wave.size,
                '--tx-ripple-duration': `${duration}ms`,
              } as CSSProperties
            }
          />
        ))}
    </button>
  );
}
