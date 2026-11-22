import './backgrounds.css';
import { useEffect, useRef, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useMotionAllowed } from '@/components/lab/motion';

type Rgb = { r: number; g: number; b: number };

const fallbackAccent: Rgb = { r: 71, g: 123, b: 96 };

function parseColor(value: string): Rgb {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex?.[1]) {
    const n = parseInt(hex[1], 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  const numbers = value.match(/-?[\d.]+/g)?.map(Number) ?? [];
  const [r, g, b] = numbers;
  if (r === undefined || g === undefined || b === undefined) return fallbackAccent;
  // color(srgb 0.2 0.4 0.3) : composantes entre 0 et 1.
  const scale = value.startsWith('color(') ? 255 : 1;
  return { r: Math.round(r * scale), g: Math.round(g * scale), b: Math.round(b * scale) };
}

/** Lit --accent sur l'élément et le normalise en RVB via le contexte 2D (accepte tout format CSS). */
function readAccent(element: Element, ctx: CanvasRenderingContext2D): Rgb {
  const raw = getComputedStyle(element).getPropertyValue('--accent').trim();
  if (!raw) return fallbackAccent;
  ctx.fillStyle = '#000000';
  ctx.fillStyle = raw;
  return parseColor(String(ctx.fillStyle));
}

const rgba = ({ r, g, b }: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;

const mix = (a: Rgb, b: Rgb, weight: number): Rgb => ({
  r: Math.round(a.r * (1 - weight) + b.r * weight),
  g: Math.round(a.g * (1 - weight) + b.g * weight),
  b: Math.round(a.b * (1 - weight) + b.b * weight),
});

/** Prévient quand le thème change (classe .dark ou style portant --accent sur .app). */
function observeTheme(element: Element, onChange: () => void) {
  const app = element.closest('.app');
  if (!app) return () => undefined;
  const observer = new MutationObserver(onChange);
  observer.observe(app, { attributes: true, attributeFilter: ['class', 'style'] });
  return () => observer.disconnect();
}

function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, width: number, height: number) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.round(width * ratio));
  canvas.height = Math.max(1, Math.round(height * ratio));
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

/** Observe la visibilité à l'écran pour suspendre les boucles hors champ. */
function observeVisibility(element: Element, onChange: (visible: boolean) => void) {
  const observer = new IntersectionObserver(entries => {
    const last = entries[entries.length - 1];
    if (last) onChange(last.isIntersecting);
  });
  observer.observe(element);
  return () => observer.disconnect();
}

/* ─── Particles ─── */

type Dot = { x: number; y: number; vx: number; vy: number; radius: number };

export function Particles({
  children,
  count = 50,
  speed = 0.35,
  maxDistance = 80,
  interactive = true,
  className = '',
  style,
}: {
  children?: ReactNode;
  count?: number;
  speed?: number;
  /** Distance maximale (px) pour relier deux particules. */
  maxDistance?: number;
  /** Les particules fuient le pointeur. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotionAllowed(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let color = readAccent(wrap, ctx);
    let dots: Dot[] = [];
    const pointer = { x: 0, y: 0, active: false };

    const seed = () => {
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() * 2 - 1) * speed,
        vy: (Math.random() * 2 - 1) * speed,
        radius: Math.random() * 1.2 + 1.1,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        if (!a) continue;
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j];
          if (!b) continue;
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance < maxDistance) {
            ctx.strokeStyle = rgba(color, (1 - distance / maxDistance) * 0.35);
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (pointer.active) {
          const distance = Math.hypot(a.x - pointer.x, a.y - pointer.y);
          if (distance < maxDistance * 1.2) {
            ctx.strokeStyle = rgba(color, (1 - distance / (maxDistance * 1.2)) * 0.6);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = rgba(color, 0.75);
      for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const update = () => {
      const maxSpeed = speed * 4;
      for (const dot of dots) {
        if (pointer.active) {
          const dx = dot.x - pointer.x;
          const dy = dot.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 70) {
            const force = ((70 - distance) / 70) * 0.35;
            dot.vx += (dx / distance) * force;
            dot.vy += (dy / distance) * force;
          }
        }
        const current = Math.hypot(dot.vx, dot.vy);
        if (current > maxSpeed) {
          dot.vx = (dot.vx / current) * maxSpeed;
          dot.vy = (dot.vy / current) * maxSpeed;
        } else if (current > speed) {
          dot.vx *= 0.98;
          dot.vy *= 0.98;
        }
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.x < dot.radius || dot.x > width - dot.radius) {
          dot.vx *= -1;
          dot.x = Math.min(width - dot.radius, Math.max(dot.radius, dot.x));
        }
        if (dot.y < dot.radius || dot.y > height - dot.radius) {
          dot.vy *= -1;
          dot.y = Math.min(height - dot.radius, Math.max(dot.radius, dot.y));
        }
      }
    };

    const step = () => {
      update();
      draw();
      frame = requestAnimationFrame(step);
    };
    const start = () => {
      if (!frame && motion && visible) frame = requestAnimationFrame(step);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      const box = wrap.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) return;
      const first = dots.length === 0;
      width = box.width;
      height = box.height;
      fitCanvas(canvas, ctx, width, height);
      if (first) seed();
      else
        for (const dot of dots) {
          dot.x = Math.min(dot.x, width - dot.radius);
          dot.y = Math.min(dot.y, height - dot.radius);
        }
      draw();
      start();
    };

    const onMove = (event: PointerEvent) => {
      const box = wrap.getBoundingClientRect();
      pointer.x = event.clientX - box.left;
      pointer.y = event.clientY - box.top;
      pointer.active = true;
      if (!frame) draw();
    };
    const onLeave = () => {
      pointer.active = false;
      if (!frame) draw();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const stopVisibility = observeVisibility(wrap, next => {
      visible = next;
      if (visible) start();
      else stop();
    });
    const stopTheme = observeTheme(wrap, () => {
      color = readAccent(wrap, ctx);
      if (!frame) draw();
    });
    if (interactive) {
      wrap.addEventListener('pointermove', onMove);
      wrap.addEventListener('pointerleave', onLeave);
    }
    return () => {
      stop();
      resizeObserver.disconnect();
      stopVisibility();
      stopTheme();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [count, speed, maxDistance, interactive, motion]);

  return (
    <div ref={wrapRef} className={`bg-fx-particles ${className}`.trim()} style={style}>
      <canvas ref={canvasRef} className="bg-fx-canvas" aria-hidden="true" />
      {children}
    </div>
  );
}

/* ─── Confetti ─── */

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  size: number;
  round: boolean;
  color: string;
};

/**
 * Lance une gerbe de confettis à chaque incrément de `fire` (0 = aucun tir).
 * Le canvas recouvre le conteneur ; l'origine est le centre de `originRef` ou du conteneur.
 */
export function Confetti({
  children,
  fire,
  originRef,
  count = 80,
  duration = 2600,
  className = '',
}: {
  children?: ReactNode;
  fire: number;
  originRef?: RefObject<HTMLElement | null>;
  count?: number;
  /** Durée d'une gerbe, en millisecondes. */
  duration?: number;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotionAllowed(wrapRef);

  useEffect(() => {
    if (fire <= 0) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    const box = wrap.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    fitCanvas(canvas, ctx, width, height);

    const origin = originRef?.current?.getBoundingClientRect();
    const ox = origin ? origin.left + origin.width / 2 - box.left : width / 2;
    const oy = origin ? origin.top + origin.height / 2 - box.top : height / 2;

    const accent = readAccent(wrap, ctx);
    const white: Rgb = { r: 255, g: 255, b: 255 };
    const black: Rgb = { r: 0, g: 0, b: 0 };
    const palette = [
      rgba(accent, 1),
      rgba(mix(accent, white, 0.35), 1),
      rgba(mix(accent, white, 0.65), 1),
      rgba(mix(accent, black, 0.3), 1),
    ];

    const pieces: Piece[] = Array.from({ length: count }, () => {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const force = Math.random() * 7 + 4;
      return {
        x: ox,
        y: oy,
        vx: Math.cos(angle) * force,
        vy: Math.sin(angle) * force,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 5 + 5,
        round: Math.random() > 0.6,
        color: palette[Math.floor(Math.random() * palette.length)] ?? palette[0] ?? '#000',
      };
    });

    const paint = (piece: Piece, alpha: number) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = piece.color;
      ctx.translate(piece.x, piece.y);
      ctx.rotate(piece.rotation);
      if (piece.round) {
        ctx.beginPath();
        ctx.arc(0, 0, piece.size / 2.6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Le cosinus de la rotation simule le basculement d'un papier qui tombe.
        ctx.fillRect(
          -piece.size / 2,
          -piece.size / 4,
          piece.size,
          (piece.size / 2) * Math.cos(piece.rotation * 2),
        );
      }
      ctx.restore();
    };

    // Mouvement réduit : une gerbe figée autour de l'origine, effacée après un court instant.
    if (!motion) {
      ctx.clearRect(0, 0, width, height);
      for (const piece of pieces) {
        const distance = Math.random() * Math.min(width, height) * 0.45;
        const angle = Math.random() * Math.PI * 2;
        paint(
          { ...piece, x: ox + Math.cos(angle) * distance, y: oy + Math.sin(angle) * distance * 0.7 },
          0.9,
        );
      }
      const timer = window.setTimeout(() => ctx.clearRect(0, 0, width, height), 1200);
      return () => {
        window.clearTimeout(timer);
        ctx.clearRect(0, 0, width, height);
      };
    }

    let frame = 0;
    let startTime = 0;
    const step = (now: number) => {
      if (!startTime) startTime = now;
      const progress = (now - startTime) / duration;
      ctx.clearRect(0, 0, width, height);
      for (const piece of pieces) {
        piece.vy += 0.22;
        piece.vx *= 0.985;
        piece.vy *= 0.985;
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rotation += piece.spin;
        paint(piece, progress < 0.65 ? 1 : Math.max(0, 1 - (progress - 0.65) / 0.35));
      }
      if (progress < 1) frame = requestAnimationFrame(step);
      else ctx.clearRect(0, 0, width, height);
    };
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
    };
  }, [fire, originRef, count, duration, motion]);

  return (
    <div ref={wrapRef} className={`bg-fx-confetti ${className}`.trim()}>
      {children}
      <canvas ref={canvasRef} className="bg-fx-canvas" aria-hidden="true" />
    </div>
  );
}

/* ─── Globe ─── */

type Point3 = { x: number; y: number; z: number };

const toPoint = (lat: number, lon: number): Point3 => {
  const la = (lat * Math.PI) / 180;
  const lo = (lon * Math.PI) / 180;
  return { x: Math.cos(la) * Math.sin(lo), y: -Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
};

/** Points répartis régulièrement sur la sphère (spirale de Fibonacci). */
const spherePointCount = 460;
const spherePoints: Point3[] = Array.from({ length: spherePointCount }, (_, index) => {
  const y = 1 - (index / (spherePointCount - 1)) * 2;
  const radius = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(theta) * radius, y, z: Math.sin(theta) * radius };
});

const markers: Point3[] = [
  toPoint(48.85, 2.35),
  toPoint(40.71, -74),
  toPoint(35.68, 139.69),
  toPoint(-22.9, -43.2),
  toPoint(-33.92, 18.42),
  toPoint(-33.87, 151.2),
  toPoint(19.43, -99.13),
];

export function Globe({
  size = 220,
  speed = 18,
  label = 'Globe stylisé en rotation',
  className = '',
}: {
  /** Diamètre maximal, en pixels. */
  size?: number;
  /** Vitesse de rotation automatique, en degrés par seconde. */
  speed?: number;
  label?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const motion = useMotionAllowed(wrapRef);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!wrap || !canvas || !ctx) return;

    let side = 0;
    let rotY = 0.4;
    let rotX = -0.35;
    let velocity = 0;
    let frame = 0;
    let last = 0;
    let visible = true;
    let dragging = false;
    let pointerX = 0;
    let pointerY = 0;
    let color = readAccent(wrap, ctx);

    const project = (p: Point3) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;
      return { x: x1, y: y2, z: z2 };
    };

    const draw = () => {
      const center = side / 2;
      const radius = side / 2 - 10;
      ctx.clearRect(0, 0, side, side);
      if (radius <= 0) return;

      const glow = ctx.createRadialGradient(center, center, radius * 0.1, center, center, radius * 1.08);
      glow.addColorStop(0, rgba(color, 0.14));
      glow.addColorStop(0.85, rgba(color, 0.05));
      glow.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center, center, radius * 1.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = rgba(color, 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.stroke();

      for (const point of spherePoints) {
        const p = project(point);
        const front = p.z > 0;
        ctx.fillStyle = rgba(color, front ? 0.25 + p.z * 0.6 : 0.08);
        ctx.beginPath();
        ctx.arc(center + p.x * radius, center + p.y * radius, front ? 0.9 + p.z * 0.9 : 0.7, 0, Math.PI * 2);
        ctx.fill();
      }

      for (const marker of markers) {
        const p = project(marker);
        if (p.z <= 0) continue;
        const x = center + p.x * radius;
        const y = center + p.y * radius;
        ctx.fillStyle = rgba(color, 0.18 * p.z + 0.05);
        ctx.beginPath();
        ctx.arc(x, y, 7 * p.z + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(color, 1);
        ctx.beginPath();
        ctx.arc(x, y, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (now: number) => {
      const elapsed = last ? Math.min(64, now - last) / 1000 : 0;
      last = now;
      if (!dragging) {
        rotY += ((speed * Math.PI) / 180) * elapsed + velocity;
        velocity *= 0.94;
      }
      draw();
      frame = requestAnimationFrame(step);
    };
    const start = () => {
      if (!frame && motion && visible) {
        last = 0;
        frame = requestAnimationFrame(step);
      }
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const resize = () => {
      const width = wrap.clientWidth;
      if (width === 0) return;
      side = width;
      fitCanvas(canvas, ctx, side, side);
      draw();
      start();
    };

    const onDown = (event: PointerEvent) => {
      dragging = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      velocity = 0;
      wrap.setPointerCapture(event.pointerId);
      wrap.classList.add('is-dragging');
    };
    const onMove = (event: PointerEvent) => {
      if (!dragging) return;
      const dx = event.clientX - pointerX;
      const dy = event.clientY - pointerY;
      pointerX = event.clientX;
      pointerY = event.clientY;
      rotY += dx * 0.01;
      rotX = Math.max(-1.2, Math.min(1.2, rotX - dy * 0.01));
      velocity = motion ? dx * 0.0015 : 0;
      if (!frame) draw();
    };
    const onUp = (event: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (wrap.hasPointerCapture(event.pointerId)) wrap.releasePointerCapture(event.pointerId);
      wrap.classList.remove('is-dragging');
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const stopVisibility = observeVisibility(wrap, next => {
      visible = next;
      if (visible) start();
      else stop();
    });
    const stopTheme = observeTheme(wrap, () => {
      color = readAccent(wrap, ctx);
      if (!frame) draw();
    });
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointercancel', onUp);
    return () => {
      stop();
      resizeObserver.disconnect();
      stopVisibility();
      stopTheme();
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('pointercancel', onUp);
      wrap.classList.remove('is-dragging');
    };
  }, [speed, motion]);

  return (
    <div
      ref={wrapRef}
      className={`bg-fx-globe ${className}`.trim()}
      role="img"
      aria-label={label}
      style={{ '--bg-fx-globe-size': `${size}px` } as CSSProperties}
    >
      <canvas ref={canvasRef} className="bg-fx-canvas" aria-hidden="true" />
    </div>
  );
}
