import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || !!document.querySelector('.app.no-motion');

export function ProgressRing({ value, label, size = 112 }: { value: number; label: string; size?: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="lab-ring"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r={radius} className="lab-ring-track" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          className="lab-ring-value"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
        />
      </svg>
      <span>
        <strong>{Math.round(clamped)}%</strong>
        <small>{label}</small>
      </span>
    </div>
  );
}

export function Skeleton({ lines = 3, avatar = true }: { lines?: number; avatar?: boolean }) {
  return (
    <div className="lab-skeleton" aria-hidden="true">
      {avatar && <span className="lab-skeleton-avatar" />}
      <div>
        {Array.from({ length: lines }, (_, index) => (
          <span key={index} style={{ width: `${92 - index * 18}%` }} />
        ))}
      </div>
    </div>
  );
}

export function NumberTicker({
  value,
  duration = 900,
  format = (number: number) => Math.round(number).toLocaleString('fr'),
}: {
  value: number;
  duration?: number;
  format?: (value: number) => string;
}) {
  const [shown, setShown] = useState(value);
  const shownRef = useRef(value);
  useEffect(() => {
    const from = shownRef.current;
    if (from === value) return;
    if (prefersReducedMotion()) {
      shownRef.current = value;
      setShown(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const next = from + (value - from) * (1 - Math.pow(1 - progress, 3));
      shownRef.current = next;
      setShown(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration]);
  return (
    <span className="lab-ticker" aria-live="polite">
      {format(shown)}
    </span>
  );
}

export function SpotlightCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: ((event.clientX - box.left) / box.width) * 100,
      y: ((event.clientY - box.top) / box.height) * 100,
    });
  };
  return (
    <div
      className={`lab-spotlight ${className}`}
      onPointerMove={onPointerMove}
      style={{ '--spot-x': `${position.x}%`, '--spot-y': `${position.y}%` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export type Slide = { id: string; title: string; description: string; tone: string };

export function Carousel({ slides, label }: { slides: Slide[]; label: string }) {
  const [index, setIndex] = useState(0);
  const startX = useRef<number | null>(null);
  const go = (next: number) => setIndex((next + slides.length) % slides.length);
  const current = slides[index];
  if (!current) return null;
  return (
    <section className="lab-carousel" aria-roledescription="carrousel" aria-label={label}>
      <div
        className="lab-carousel-viewport"
        onPointerDown={event => {
          startX.current = event.clientX;
        }}
        onPointerUp={event => {
          if (startX.current === null) return;
          const delta = event.clientX - startX.current;
          startX.current = null;
          if (Math.abs(delta) > 40) go(index + (delta < 0 ? 1 : -1));
        }}
      >
        <div className="lab-carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((slide, slideIndex) => (
            <div
              key={slide.id}
              className="lab-slide"
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${slideIndex + 1} sur ${slides.length}`}
              aria-hidden={slideIndex !== index}
              style={{ '--slide-tone': slide.tone } as CSSProperties}
            >
              <strong>{slide.title}</strong>
              <p>{slide.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="lab-carousel-controls">
        <button
          type="button"
          className="icon-button"
          aria-label="Diapositive précédente"
          onClick={() => go(index - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="lab-dots">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`Aller à la diapositive ${dotIndex + 1}`}
              aria-current={dotIndex === index}
              className={dotIndex === index ? 'active' : ''}
              onClick={() => setIndex(dotIndex)}
            />
          ))}
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Diapositive suivante"
          onClick={() => go(index + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </section>
  );
}

export function CompareSlider({
  before,
  after,
  label,
}: {
  before: ReactNode;
  after: ReactNode;
  label: string;
}) {
  const [split, setSplit] = useState(50);
  return (
    <div className="lab-compare" style={{ '--split': `${split}%` } as CSSProperties}>
      <div className="lab-compare-layer lab-compare-after">{after}</div>
      <div className="lab-compare-layer lab-compare-before" aria-hidden="true">
        {before}
      </div>
      <span className="lab-compare-handle" aria-hidden="true" />
      <input
        type="range"
        min="0"
        max="100"
        value={split}
        aria-label={label}
        aria-valuetext={`${split} % avant`}
        onChange={event => setSplit(Number(event.target.value))}
      />
    </div>
  );
}
