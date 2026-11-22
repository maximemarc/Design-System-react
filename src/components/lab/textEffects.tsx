import './textEffects.css';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from 'react';
import { useMotionAllowed } from '@/components/lab/motion';

/** Passe à vrai la première fois que l'élément entre dans la fenêtre (puis cesse d'observer). */
function useInView(ref: RefObject<Element | null>, threshold = 0.1) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return inView;
}

type TypeStep = { phrase: number; length: number; deleting: boolean };

/**
 * Écrit puis efface plusieurs phrases à tour de rôle, avec un curseur clignotant.
 * Le texte complet est lu par les lecteurs d'écran ; sans animation, la première phrase est affichée.
 */
export function TypewriterText({
  texts,
  typingSpeed = 70,
  deletingSpeed = 35,
  pauseDuration = 1800,
  loop = true,
  label,
  className = '',
}: {
  texts: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const allowed = useMotionAllowed(ref);
  const inView = useInView(ref);
  const [step, setStep] = useState<TypeStep>({ phrase: 0, length: 0, deleting: false });

  useEffect(() => {
    if (!allowed || !inView || texts.length === 0) return;
    const current = texts[step.phrase] ?? '';
    const isLast = step.phrase >= texts.length - 1;
    let delay: number;
    let next: TypeStep;
    if (!step.deleting) {
      if (step.length < current.length) {
        delay = typingSpeed;
        next = { ...step, length: step.length + 1 };
      } else {
        // Dernière phrase sans boucle : on s'arrête ici.
        if (!loop && isLast) return;
        delay = pauseDuration;
        next = { ...step, deleting: true };
      }
    } else if (step.length > 0) {
      delay = deletingSpeed;
      next = { ...step, length: step.length - 1 };
    } else {
      delay = typingSpeed * 3;
      next = { phrase: (step.phrase + 1) % texts.length, length: 0, deleting: false };
    }
    const timer = window.setTimeout(() => setStep(next), delay);
    return () => window.clearTimeout(timer);
  }, [allowed, inView, step, texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  const spoken = label ?? texts.join(', ');
  const shown = allowed ? (texts[step.phrase] ?? '').slice(0, step.length) : (texts[0] ?? '');

  return (
    <span ref={ref} className={`tx-fx-typewriter ${className}`}>
      <span className="tx-fx-sr">{spoken}</span>
      <span aria-hidden="true">
        <span className="tx-fx-typewriter-text">{shown}</span>
        {allowed && <span className="tx-fx-caret" />}
      </span>
    </span>
  );
}

/** Fait défiler une liste de mots à la même place, avec un fondu vertical. */
export function WordRotate({
  words,
  duration = 2400,
  label,
  className = '',
}: {
  words: string[];
  duration?: number;
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const allowed = useMotionAllowed(ref);
  const inView = useInView(ref);
  const [state, setState] = useState({ index: 0, leaving: false });

  useEffect(() => {
    if (!allowed || !inView || words.length < 2) return;
    const timer = window.setTimeout(
      () =>
        setState(previous =>
          previous.leaving
            ? { index: (previous.index + 1) % words.length, leaving: false }
            : { index: previous.index, leaving: true },
        ),
      state.leaving ? 300 : duration,
    );
    return () => window.clearTimeout(timer);
  }, [allowed, inView, words.length, duration, state]);

  const index = allowed ? state.index : 0;
  return (
    <span ref={ref} className={`tx-fx-rotate ${className}`}>
      <span className="tx-fx-sr">{label ?? words.join(', ')}</span>
      <span
        key={index}
        className="tx-fx-rotate-word"
        data-leaving={allowed && state.leaving ? '' : undefined}
        aria-hidden="true"
      >
        {words[index] ?? ''}
      </span>
    </span>
  );
}

/** Texte « glitch » : deux copies décalées et découpées, en continu ou au survol (animation CSS). */
export function GlitchText({
  text,
  intensity = 'medium',
  trigger = 'hover',
  className = '',
}: {
  text: string;
  intensity?: 'low' | 'medium' | 'high';
  trigger?: 'hover' | 'always';
  className?: string;
}) {
  return (
    <span className={`tx-fx-glitch ${className}`} data-intensity={intensity} data-trigger={trigger}>
      <span className="tx-fx-glitch-main">{text}</span>
      <span className="tx-fx-glitch-layer" data-layer="a" aria-hidden="true">
        {text}
      </span>
      <span className="tx-fx-glitch-layer" data-layer="b" aria-hidden="true">
        {text}
      </span>
    </span>
  );
}

/** Texte néon : halo de la couleur d'accent, avec pulsation facultative. */
export function NeonText({
  children,
  pulse = false,
  className = '',
}: {
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={`tx-fx-neon ${className}`} data-pulse={pulse ? '' : undefined}>
      {children}
    </span>
  );
}

/** Texte rempli d'un dégradé dérivé de l'accent, qui peut glisser en continu. */
export function TextGradient({
  children,
  animated = true,
  className = '',
}: {
  children: ReactNode;
  animated?: boolean;
  className?: string;
}) {
  return (
    <span className={`tx-fx-gradient ${className}`} data-animated={animated ? '' : undefined}>
      {children}
    </span>
  );
}

/** Apparition floutée quand l'élément entre dans la fenêtre ; `delay` permet d'échelonner une liste. */
export function BlurFade({
  children,
  delay = 0,
  duration = 500,
  offset = 10,
  blur = 8,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  offset?: number;
  blur?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(ref);
  const inView = useInView(ref);
  const visible = !allowed || inView;
  return (
    <div
      ref={ref}
      className={`tx-fx-blur ${className}`}
      data-visible={visible ? '' : undefined}
      style={
        {
          '--tx-blur-delay': `${delay}ms`,
          '--tx-blur-duration': `${duration}ms`,
          '--tx-blur-offset': `${offset}px`,
          '--tx-blur-amount': `${blur}px`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * Bandeau qui défile en boucle ; le défilement de la page (ou d'un conteneur) l'accélère
 * et peut inverser son sens. Seule la première copie du contenu est exposée aux lecteurs d'écran.
 */
export function ScrollVelocity({
  children,
  baseVelocity = 40,
  repeat = 4,
  className = '',
}: {
  children: ReactNode;
  /** Vitesse de base en pixels par seconde (négative pour aller vers la droite). */
  baseVelocity?: number;
  repeat?: number;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const allowed = useMotionAllowed(rootRef);

  useEffect(() => {
    const track = trackRef.current;
    const group = groupRef.current;
    if (!allowed || !track || !group) return;

    let period = 0;
    const measure = () => {
      const second = group.nextElementSibling;
      period = second instanceof HTMLElement ? second.offsetLeft - group.offsetLeft : group.offsetWidth;
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(group);

    const lastPositions = new WeakMap<object, number>();
    let boost = 0;
    const onScroll = (event: Event) => {
      const target = event.target;
      const isElement = target instanceof Element;
      const key: object = isElement ? target : document;
      const position = isElement ? target.scrollTop : window.scrollY;
      const previous = lastPositions.get(key);
      lastPositions.set(key, position);
      if (previous === undefined) return;
      boost = Math.max(-2400, Math.min(2400, boost + (position - previous) * 12));
    };
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });

    let offset = 0;
    let last = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      boost *= Math.exp(-dt * 2.5);
      offset -= (baseVelocity + boost) * dt;
      if (period > 0) {
        if (offset <= -period) offset += period;
        else if (offset > 0) offset -= period;
      }
      track.style.transform = `translate3d(${offset}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, { capture: true });
      resize.disconnect();
      track.style.transform = '';
    };
  }, [allowed, baseVelocity]);

  return (
    <div ref={rootRef} className={`tx-fx-velocity ${className}`}>
      <div ref={trackRef} className="tx-fx-velocity-track">
        {Array.from({ length: Math.max(2, repeat) }, (_, index) => (
          <div
            key={index}
            ref={index === 0 ? groupRef : undefined}
            className="tx-fx-velocity-group"
            aria-hidden={index === 0 ? undefined : true}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
