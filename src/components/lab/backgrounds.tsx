import './backgrounds.css';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';
import { Pause, Play } from 'lucide-react';

/** Générateur pseudo-aléatoire déterministe (mulberry32) : même graine, même suite. */
function mulberry32(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const layerClass = (base: string, className: string) => `bg-fx-layer ${base} ${className}`.trim();

/** Conteneur positionné qui accueille un calque d'arrière-plan et son contenu. */
export function EffectStage({
  children,
  className = '',
  style,
}: {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`bg-fx-stage ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

/* ─── Marquee ─── */

export function Marquee({
  children,
  label,
  speed = 40,
  gap = 16,
  vertical = false,
  reverse = false,
  pauseOnHover = true,
  className = '',
}: {
  children: ReactNode;
  /** Nom accessible de la zone qui défile. */
  label: string;
  /** Vitesse en pixels par seconde. */
  speed?: number;
  gap?: number;
  vertical?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
  className?: string;
}) {
  const groupRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    // Le premier rappel de ResizeObserver arrive après l'observation : pas de mise à jour synchrone.
    const observer = new ResizeObserver(() => {
      const size = vertical ? group.offsetHeight : group.offsetWidth;
      if (size > 0) setDuration(Math.max(4, size / Math.max(1, speed)));
    });
    observer.observe(group);
    return () => observer.disconnect();
  }, [speed, vertical]);

  const classes = [
    'bg-fx-marquee',
    vertical && 'is-vertical',
    reverse && 'is-reverse',
    pauseOnHover && 'is-pausable',
    paused && 'is-paused',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      style={
        {
          '--bg-fx-marquee-gap': `${gap}px`,
          '--bg-fx-marquee-duration': `${duration}s`,
        } as CSSProperties
      }
    >
      <div className="bg-fx-marquee-viewport" role="region" aria-label={label}>
        <div className="bg-fx-marquee-track">
          <div className="bg-fx-marquee-group" ref={groupRef}>
            {children}
          </div>
          <div className="bg-fx-marquee-group" aria-hidden="true" inert>
            {children}
          </div>
        </div>
      </div>
      <button
        type="button"
        className="bg-fx-marquee-toggle"
        aria-pressed={paused}
        aria-label={paused ? 'Reprendre le défilement' : 'Mettre en pause le défilement'}
        onClick={() => setPaused(value => !value)}
      >
        {paused ? <Play size={11} /> : <Pause size={11} />}
      </button>
    </div>
  );
}

/* ─── Meteors ─── */

export function Meteors({
  count = 14,
  seed = 7,
  className = '',
}: {
  count?: number;
  seed?: number;
  className?: string;
}) {
  const meteors = useMemo(() => {
    const random = mulberry32(seed);
    return Array.from({ length: count }, (_, index) => ({
      id: index,
      top: random() * 70 - 15,
      left: random() * 110,
      delay: random() * 6,
      duration: random() * 3 + 3,
      length: random() * 50 + 40,
    }));
  }, [count, seed]);
  return (
    <div className={layerClass('bg-fx-meteors', className)} aria-hidden="true">
      {meteors.map(meteor => (
        <span
          key={meteor.id}
          className="bg-fx-meteor"
          style={
            {
              '--bg-fx-top': `${meteor.top}%`,
              '--bg-fx-left': `${meteor.left}%`,
              '--bg-fx-delay': `${meteor.delay.toFixed(2)}s`,
              '--bg-fx-duration': `${meteor.duration.toFixed(2)}s`,
              '--bg-fx-length': `${Math.round(meteor.length)}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ─── AuroraBackground ─── */

export function AuroraBackground({ className = '' }: { className?: string }) {
  return (
    <div className={layerClass('bg-fx-aurora', className)} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

/* ─── BorderBeam ─── */

/** Faisceau qui parcourt la bordure de son parent (parent positionné, arrondi hérité). */
export function BorderBeam({
  duration = 4,
  borderWidth = 1.5,
  size = 25,
  className = '',
}: {
  /** Durée d'un tour, en secondes. */
  duration?: number;
  borderWidth?: number;
  /** Longueur du faisceau, en pourcentage du tour. */
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`bg-fx-border-beam ${className}`.trim()}
      aria-hidden="true"
      style={
        {
          '--bg-fx-beam-duration': `${duration}s`,
          '--bg-fx-beam-width': `${borderWidth}px`,
          '--bg-fx-beam-size': `${size}%`,
        } as CSSProperties
      }
    />
  );
}

/* ─── ShineBorder ─── */

export function ShineBorder({
  children,
  borderWidth = 1,
  duration = 8,
  className = '',
}: {
  children: ReactNode;
  borderWidth?: number;
  /** Durée d'un cycle de reflet sur la bordure, en secondes. */
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-fx-shine ${className}`.trim()}
      style={
        {
          '--bg-fx-shine-width': `${borderWidth}px`,
          '--bg-fx-shine-duration': `${duration}s`,
        } as CSSProperties
      }
    >
      <div className="bg-fx-shine-content">{children}</div>
    </div>
  );
}

/* ─── AnimatedBeam ─── */

/**
 * Faisceau SVG entre deux éléments d'un même conteneur positionné.
 * Le tracé est recalculé à chaque redimensionnement, sans état React.
 */
export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  duration = 3,
  delay = 0,
  width = 2,
  className = '',
}: {
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  width?: number;
  className?: string;
}) {
  const trackRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGPathElement>(null);
  const startRef = useRef<SVGCircleElement>(null);
  const endRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!container || !from || !to) return;
    const update = () => {
      const box = container.getBoundingClientRect();
      const a = from.getBoundingClientRect();
      const b = to.getBoundingClientRect();
      const sx = a.left + a.width / 2 - box.left;
      const sy = a.top + a.height / 2 - box.top;
      const ex = b.left + b.width / 2 - box.left;
      const ey = b.top + b.height / 2 - box.top;
      const cx = (sx + ex) / 2;
      const cy = (sy + ey) / 2 - curvature;
      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      trackRef.current?.setAttribute('d', d);
      pulseRef.current?.setAttribute('d', d);
      startRef.current?.setAttribute('cx', sx.toFixed(1));
      startRef.current?.setAttribute('cy', sy.toFixed(1));
      endRef.current?.setAttribute('cx', ex.toFixed(1));
      endRef.current?.setAttribute('cy', ey.toFixed(1));
    };
    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(from);
    observer.observe(to);
    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  return (
    <svg
      className={`bg-fx-beam ${reverse ? 'is-reverse' : ''} ${className}`.trim()}
      aria-hidden="true"
      focusable="false"
      style={
        {
          '--bg-fx-beam-duration': `${duration}s`,
          '--bg-fx-beam-delay': `${delay}s`,
        } as CSSProperties
      }
    >
      <path ref={trackRef} className="bg-fx-beam-track" d="M 0 0" />
      <path ref={pulseRef} className="bg-fx-beam-pulse" d="M 0 0" pathLength={100} strokeWidth={width} />
      <circle ref={startRef} className="bg-fx-beam-end" r={3} cx={0} cy={0} />
      <circle ref={endRef} className="bg-fx-beam-end" r={3} cx={0} cy={0} />
    </svg>
  );
}

/* ─── AnimatedGradient ─── */

export function AnimatedGradient({
  children,
  variant = 'linear',
  duration = 8,
  className = '',
}: {
  children?: ReactNode;
  variant?: 'linear' | 'radial';
  /** Durée d'un aller-retour, en secondes. */
  duration?: number;
  className?: string;
}) {
  return (
    <div
      className={`bg-fx-gradient ${variant === 'radial' ? 'is-radial' : ''} ${className}`.trim()}
      style={{ '--bg-fx-gradient-duration': `${duration}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/* ─── Motifs de fond ─── */

export function AnimatedGrid({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      className={layerClass('bg-fx-animated-grid', className)}
      aria-hidden="true"
      style={{ '--bg-fx-cell': `${size}px` } as CSSProperties}
    >
      <span className="bg-fx-grid-base" />
      <span className="bg-fx-grid-accent" />
    </div>
  );
}

export function DotsPattern({
  size = 18,
  dotSize = 1.5,
  accent = false,
  fade = false,
  className = '',
}: {
  size?: number;
  dotSize?: number;
  /** Teinte les points avec la couleur d'accent. */
  accent?: boolean;
  /** Estompe le motif vers les bords. */
  fade?: boolean;
  className?: string;
}) {
  const classes = ['bg-fx-dots', accent && 'is-accent', fade && 'bg-fx-fade', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={layerClass(classes, '')}
      aria-hidden="true"
      style={{ '--bg-fx-cell': `${size}px`, '--bg-fx-dot': `${dotSize}px` } as CSSProperties}
    />
  );
}

export function GridBackground({
  size = 24,
  accent = false,
  fade = true,
  className = '',
}: {
  size?: number;
  accent?: boolean;
  fade?: boolean;
  className?: string;
}) {
  const classes = ['bg-fx-grid', accent && 'is-accent', fade && 'bg-fx-fade', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
      className={layerClass(classes, '')}
      aria-hidden="true"
      style={{ '--bg-fx-cell': `${size}px` } as CSSProperties}
    />
  );
}

const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='200' height='200' filter='url(#n)'/></svg>`;
const noiseUrl = `url("data:image/svg+xml,${encodeURIComponent(noiseSvg)}")`;

export function NoiseBg({ opacity = 0.18, className = '' }: { opacity?: number; className?: string }) {
  return (
    <div
      className={layerClass('bg-fx-noise', className)}
      aria-hidden="true"
      style={{ backgroundImage: noiseUrl, opacity }}
    />
  );
}

export function GradientMesh({ className = '' }: { className?: string }) {
  return (
    <div className={layerClass('bg-fx-mesh', className)} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function WaveBackground({ className = '' }: { className?: string }) {
  return (
    <div className={layerClass('bg-fx-waves', className)} aria-hidden="true">
      <div className="bg-fx-waves-inner">
        <svg className="bg-fx-wave" viewBox="0 0 2880 320" preserveAspectRatio="none" focusable="false">
          <path d="M0,160 C240,200 480,80 720,160 C960,240 1200,120 1440,160 C1680,200 1920,80 2160,160 C2400,240 2640,120 2880,160 L2880,320 L0,320 Z" />
        </svg>
        <svg className="bg-fx-wave" viewBox="0 0 2880 280" preserveAspectRatio="none" focusable="false">
          <path d="M0,100 C360,160 720,40 1080,100 C1440,160 1800,50 2160,100 C2520,160 2760,60 2880,100 L2880,280 L0,280 Z" />
        </svg>
        <svg className="bg-fx-wave" viewBox="0 0 2880 240" preserveAspectRatio="none" focusable="false">
          <path d="M0,80 C480,140 960,30 1440,80 C1920,140 2400,20 2880,80 L2880,240 L0,240 Z" />
        </svg>
      </div>
    </div>
  );
}
