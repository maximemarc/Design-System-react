import './primitives.css';
import {
  Fragment,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  Bell,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Ellipsis,
  Info,
  Minus,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useMotionAllowed } from '@/components/lab/motion';

/* ------------------------------------------------------------------ */
/* Case à cocher                                                       */
/* ------------------------------------------------------------------ */

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  indeterminate = false,
  error,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  indeterminate?: boolean;
  error?: string;
  disabled?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // L'état « mixte » n'existe que comme propriété DOM : il est posé après le rendu.
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const describedBy = [description ? `${id}-desc` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
  const state = indeterminate ? 'mixed' : checked ? 'checked' : 'unchecked';
  return (
    <div
      className="pr-check"
      data-state={state}
      data-disabled={disabled || undefined}
      data-invalid={!!error || undefined}
    >
      <span className="pr-check-control">
        <input
          ref={inputRef}
          id={id}
          type="checkbox"
          className="pr-check-input"
          checked={checked}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={event => onChange(event.target.checked)}
        />
        <span className="pr-check-box" aria-hidden="true">
          {indeterminate ? (
            <Minus size={11} strokeWidth={3} />
          ) : checked ? (
            <Check size={11} strokeWidth={3} />
          ) : null}
        </span>
      </span>
      <span className="pr-check-text">
        <label htmlFor={id}>{label}</label>
        {description && (
          <span id={`${id}-desc`} className="pr-check-description">
            {description}
          </span>
        )}
        {error && (
          <span id={`${id}-error`} className="pr-check-error" role="alert">
            {error}
          </span>
        )}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Groupe de boutons radio                                             */
/* ------------------------------------------------------------------ */

export type RadioOption = { value: string; label: string; description?: string; disabled?: boolean };

/**
 * Boutons radio natifs regroupés : le navigateur gère déjà les flèches
 * (déplacement et sélection) et la tabulation unique dans le groupe.
 */
export function RadioGroup({
  options,
  value,
  onChange,
  label,
  variant = 'list',
  disabled = false,
}: {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label: string;
  variant?: 'list' | 'cards';
  disabled?: boolean;
}) {
  const name = useId();
  return (
    <fieldset className={`pr-radio pr-radio-${variant}`} disabled={disabled}>
      <legend className="field-label">{label}</legend>
      <div className="pr-radio-options">
        {options.map(option => {
          const optionId = `${name}-${option.value}`;
          const selected = option.value === value;
          return (
            <label
              key={option.value}
              className="pr-radio-option"
              data-checked={selected || undefined}
              data-disabled={option.disabled || disabled || undefined}
            >
              <input
                type="radio"
                className="pr-radio-input"
                name={name}
                value={option.value}
                checked={selected}
                disabled={option.disabled}
                aria-labelledby={`${optionId}-label`}
                aria-describedby={option.description ? `${optionId}-desc` : undefined}
                onChange={() => onChange(option.value)}
              />
              <span className="pr-radio-dot" aria-hidden="true" />
              <span className="pr-radio-text">
                <span id={`${optionId}-label`} className="pr-radio-label">
                  {option.label}
                </span>
                {option.description && (
                  <span id={`${optionId}-desc`} className="pr-radio-description">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Fil d'Ariane                                                        */
/* ------------------------------------------------------------------ */

export type BreadcrumbItem = { label: string; href?: string; icon?: ReactNode };

export function Breadcrumb({
  items,
  separator,
  maxItems,
  onNavigate,
  label = "Fil d'Ariane",
}: {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  /** Nombre d'éléments visibles au-delà duquel les intermédiaires passent dans un menu « … ». */
  maxItems?: number;
  /** Si fourni, la navigation native est interceptée et confiée à ce rappel. */
  onNavigate?: (item: BreadcrumbItem) => void;
  label?: string;
}) {
  const sep = separator ?? <ChevronRight size={13} />;
  const truncate = maxItems !== undefined && maxItems >= 2 && items.length > maxItems;
  const tailCount = truncate ? maxItems - 1 : 0;
  const first = items[0];
  const hidden = truncate ? items.slice(1, items.length - tailCount) : [];
  const tail = truncate ? items.slice(items.length - tailCount) : items.slice(1);

  const renderLink = (item: BreadcrumbItem, current: boolean) => {
    if (current) {
      return (
        <span className="pr-crumb pr-crumb-current" aria-current="page">
          {item.icon}
          {item.label}
        </span>
      );
    }
    if (item.href) {
      return (
        <a
          className="pr-crumb"
          href={item.href}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!onNavigate) return;
            event.preventDefault();
            onNavigate(item);
          }}
        >
          {item.icon}
          {item.label}
        </a>
      );
    }
    return (
      <span className="pr-crumb pr-crumb-static">
        {item.icon}
        {item.label}
      </span>
    );
  };

  if (!first) return null;
  const visible: (BreadcrumbItem | 'ellipsis')[] = [
    first,
    ...(hidden.length ? ['ellipsis' as const] : []),
    ...tail,
  ];

  return (
    <nav className="pr-breadcrumb" aria-label={label}>
      <ol>
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1;
          return (
            <li key={item === 'ellipsis' ? 'ellipsis' : `${index}-${item.label}`}>
              {index > 0 && (
                <span className="pr-crumb-separator" aria-hidden="true">
                  {sep}
                </span>
              )}
              {item === 'ellipsis' ? (
                <BreadcrumbOverflow items={hidden} onNavigate={onNavigate} />
              ) : (
                renderLink(item, isLast)
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function BreadcrumbOverflow({
  items,
  onNavigate,
}: {
  items: BreadcrumbItem[];
  onNavigate?: (item: BreadcrumbItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) buttonRef.current?.focus();
  };

  const onMenuKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const entries = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [],
    );
    const index = entries.findIndex(entry => entry === document.activeElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      entries[(index + 1) % entries.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      entries[(index - 1 + entries.length) % entries.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      entries[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      entries[entries.length - 1]?.focus();
    } else if (event.key === 'Tab') {
      close(false);
    }
  };

  return (
    <span className="pr-crumb-overflow" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="pr-crumb-more"
        aria-label={`Afficher ${items.length} niveau${items.length > 1 ? 'x' : ''} masqué${items.length > 1 ? 's' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(previous => !previous)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' && !open) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <Ellipsis size={14} />
      </button>
      {open && (
        <ul id={menuId} ref={menuRef} role="menu" className="pr-crumb-menu" onKeyDown={onMenuKeyDown}>
          {items.map((item, index) => (
            <li key={`${index}-${item.label}`} role="none">
              {item.href ? (
                <a
                  role="menuitem"
                  tabIndex={-1}
                  href={item.href}
                  onClick={event => {
                    if (onNavigate) {
                      event.preventDefault();
                      onNavigate(item);
                    }
                    close(false);
                  }}
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <span role="menuitem" tabIndex={-1} aria-disabled="true">
                  {item.icon}
                  {item.label}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Séparateur                                                          */
/* ------------------------------------------------------------------ */

export function Divider({
  orientation = 'horizontal',
  label,
  align = 'center',
}: {
  orientation?: 'horizontal' | 'vertical';
  label?: ReactNode;
  align?: 'start' | 'center' | 'end';
}) {
  if (orientation === 'vertical') {
    return <div className="pr-divider pr-divider-vertical" role="separator" aria-orientation="vertical" />;
  }
  if (label) {
    return (
      <div
        className={`pr-divider pr-divider-labelled pr-divider-${align}`}
        role="separator"
        aria-orientation="horizontal"
      >
        <span className="pr-divider-line" />
        <span className="pr-divider-label">{label}</span>
        <span className="pr-divider-line" />
      </div>
    );
  }
  return <div className="pr-divider pr-divider-horizontal" role="separator" aria-orientation="horizontal" />;
}

/* ------------------------------------------------------------------ */
/* Touches de clavier                                                  */
/* ------------------------------------------------------------------ */

export type KbdSize = 'sm' | 'md' | 'lg';

export function Kbd({
  children,
  size = 'md',
  title,
}: {
  children: ReactNode;
  size?: KbdSize;
  title?: string;
}) {
  return (
    <kbd className={`pr-kbd pr-kbd-${size}`} title={title}>
      {children}
    </kbd>
  );
}

/** Combinaison de touches : `keys` dans l'ordre de frappe, `label` lu par les lecteurs d'écran si fourni. */
export function KbdShortcut({
  keys,
  size = 'md',
  joiner = '+',
  label,
}: {
  keys: string[];
  size?: KbdSize;
  joiner?: string | null;
  label?: string;
}) {
  return (
    <kbd className="pr-kbd-combo" aria-label={label}>
      {keys.map((key, index) => (
        <Fragment key={`${index}-${key}`}>
          {index > 0 && joiner && (
            <span className="pr-kbd-joiner" aria-hidden="true">
              {joiner}
            </span>
          )}
          <Kbd size={size}>{key}</Kbd>
        </Fragment>
      ))}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/* Indicateur de chargement                                            */
/* ------------------------------------------------------------------ */

export type SpinnerVariant = 'ring' | 'dots' | 'bars' | 'pulse';
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg';

export function Spinner({
  variant = 'ring',
  size = 'md',
  label = 'Chargement en cours',
  tone = 'accent',
}: {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  label?: string;
  tone?: 'accent' | 'current';
}) {
  return (
    <span
      className={`pr-spinner pr-spinner-${variant} pr-spinner-${size} pr-spinner-tone-${tone}`}
      role="status"
    >
      <span className="pr-spinner-shape" aria-hidden="true">
        {variant === 'dots' && (
          <>
            <i />
            <i />
            <i />
          </>
        )}
        {variant === 'bars' && (
          <>
            <i />
            <i />
            <i />
            <i />
          </>
        )}
      </span>
      <span className="pr-sr-only">{label}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Barre de progression                                                */
/* ------------------------------------------------------------------ */

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger';

/** Sans `value`, la barre est indéterminée (aucune valeur annoncée). */
export function ProgressBar({
  value,
  max = 100,
  label,
  tone = 'accent',
  size = 'md',
  showValue = false,
  valueText,
}: {
  value?: number;
  max?: number;
  label: string;
  tone?: ProgressTone;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  valueText?: string;
}) {
  const determinate = value !== undefined;
  const now = value === undefined ? undefined : Math.min(max, Math.max(0, value));
  const percent = now !== undefined && max > 0 ? (now / max) * 100 : 0;
  const text = valueText ?? `${Math.round(percent)} %`;
  return (
    <div className={`pr-progress pr-progress-${size}`} data-tone={tone}>
      <div className="pr-progress-head">
        <span className="pr-progress-label">{label}</span>
        {showValue && (
          <span className="pr-progress-value" aria-hidden="true">
            {determinate ? text : 'En cours…'}
          </span>
        )}
      </div>
      <div
        className="pr-progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={determinate ? 0 : undefined}
        aria-valuemax={determinate ? max : undefined}
        aria-valuenow={now}
        aria-valuetext={determinate ? text : undefined}
        aria-busy={determinate ? undefined : true}
      >
        <span
          className={`pr-progress-fill${determinate ? '' : ' pr-progress-indeterminate'}`}
          style={determinate ? { width: `${percent}%` } : undefined}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Zone défilante                                                      */
/* ------------------------------------------------------------------ */

/**
 * Zone défilante focalisable (flèches, Page suivante/précédente, Début/Fin une fois le focus posé),
 * avec ombres indiquant qu'il reste du contenu au-dessus ou en dessous.
 */
export function ScrollArea({
  children,
  label,
  maxHeight = 220,
  height,
  className = '',
}: {
  children: ReactNode;
  label: string;
  maxHeight?: number | string;
  height?: number | string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const top = element.scrollTop > 1;
      const bottom = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
      setEdges(previous => (previous.top === top && previous.bottom === bottom ? previous : { top, bottom }));
    };
    element.addEventListener('scroll', measure, { passive: true });
    // Le premier rappel de l'observateur fournit la mesure initiale.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => {
      element.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className={`pr-scrollarea-frame ${className}`}
      data-top={edges.top || undefined}
      data-bottom={edges.bottom || undefined}
    >
      <div
        ref={ref}
        className="pr-scrollarea"
        role="region"
        aria-label={label}
        tabIndex={0}
        style={{ maxHeight, height }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* État vide                                                           */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  headingLevel = 3,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  headingLevel?: 2 | 3 | 4;
}) {
  const Heading = `h${headingLevel}` as const;
  return (
    <div className={`pr-empty pr-empty-${size}`}>
      {icon && (
        <span className="pr-empty-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="pr-empty-text">
        <Heading className="pr-empty-title">{title}</Heading>
        {description && <p className="pr-empty-description">{description}</p>}
      </div>
      {action && <div className="pr-empty-action">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Notification                                                        */
/* ------------------------------------------------------------------ */

export type NotificationTone = 'default' | 'info' | 'success' | 'warning' | 'danger';

const toneIcons: Record<NotificationTone, ReactNode> = {
  default: <Bell size={15} />,
  info: <Info size={15} />,
  success: <CircleCheck size={15} />,
  warning: <TriangleAlert size={15} />,
  danger: <CircleAlert size={15} />,
};

/**
 * Bannière de notification. Échap ferme la notification quand le focus est à l'intérieur.
 * `live` l'annonce aux lecteurs d'écran à son apparition (alerte pour le ton « danger »).
 */
export function Notification({
  title,
  description,
  tone = 'default',
  timestamp,
  read = true,
  icon,
  actions,
  onDismiss,
  onRead,
  live = false,
}: {
  title: string;
  description?: ReactNode;
  tone?: NotificationTone;
  timestamp?: string;
  read?: boolean;
  icon?: ReactNode;
  actions?: ReactNode;
  onDismiss?: () => void;
  onRead?: () => void;
  live?: boolean;
}) {
  const id = useId();
  const role = live ? (tone === 'danger' ? 'alert' : 'status') : undefined;
  return (
    <article
      className="pr-notif"
      data-tone={tone}
      data-unread={!read || undefined}
      role={role}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      onKeyDown={event => {
        if (event.key === 'Escape' && onDismiss) {
          event.stopPropagation();
          onDismiss();
        }
      }}
    >
      <span className="pr-notif-icon" aria-hidden="true">
        {icon ?? toneIcons[tone]}
      </span>
      <div className="pr-notif-body">
        <div className="pr-notif-head">
          <p id={`${id}-title`} className="pr-notif-title">
            {!read && <span className="pr-sr-only">Non lue : </span>}
            {title}
          </p>
          {timestamp && <span className="pr-notif-time">{timestamp}</span>}
        </div>
        {description && (
          <div id={`${id}-desc`} className="pr-notif-description">
            {description}
          </div>
        )}
        {(actions || (!read && onRead)) && (
          <div className="pr-notif-actions">
            {actions}
            {!read && onRead && (
              <button type="button" className="pr-notif-link" onClick={onRead}>
                Marquer comme lue
              </button>
            )}
          </div>
        )}
      </div>
      {!read && <span className="pr-notif-dot" aria-hidden="true" />}
      {onDismiss && (
        <button
          type="button"
          className="pr-notif-close"
          aria-label={`Fermer la notification « ${title} »`}
          onClick={onDismiss}
        >
          <X size={14} />
        </button>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Progression de lecture                                              */
/* ------------------------------------------------------------------ */

function useContainerScrollProgress(target: RefObject<HTMLElement | null>, smooth: boolean) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const element = target.current;
    if (!element) return;
    let goal = 0;
    let current = 0;
    let frame = 0;
    const read = () => {
      const total = element.scrollHeight - element.clientHeight;
      goal = total <= 0 ? 0 : Math.min(100, Math.max(0, (element.scrollTop / total) * 100));
    };
    const step = () => {
      current += (goal - current) * 0.2;
      if (Math.abs(goal - current) < 0.1) {
        current = goal;
        frame = 0;
      } else {
        frame = requestAnimationFrame(step);
      }
      setProgress(Math.round(current * 10) / 10);
    };
    const update = () => {
      read();
      if (!smooth) {
        current = goal;
        setProgress(Math.round(goal * 10) / 10);
        return;
      }
      if (!frame) frame = requestAnimationFrame(step);
    };
    element.addEventListener('scroll', update, { passive: true });
    // Mesure initiale et recalcul quand le contenu change de taille.
    const observer = new ResizeObserver(update);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => {
      element.removeEventListener('scroll', update);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [target, smooth]);
  return progress;
}

/** Indicateur de lecture lié au défilement d'un conteneur (`target`). */
export function ScrollProgress({
  target,
  variant = 'bar',
  label = 'Progression de lecture',
  thickness = 3,
  size = 44,
  showValue = false,
  smoothing = true,
  tone = 'accent',
}: {
  target: RefObject<HTMLElement | null>;
  variant?: 'bar' | 'circular';
  label?: string;
  thickness?: number;
  size?: number;
  showValue?: boolean;
  smoothing?: boolean;
  tone?: ProgressTone;
}) {
  const selfRef = useRef<HTMLDivElement>(null);
  const motion = useMotionAllowed(selfRef);
  const progress = useContainerScrollProgress(target, smoothing && motion);
  const rounded = Math.round(progress);
  const aria = {
    role: 'progressbar' as const,
    'aria-label': label,
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': rounded,
    'aria-valuetext': `${rounded} % lu`,
  };

  if (variant === 'circular') {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    return (
      <div
        ref={selfRef}
        className="pr-scrollprogress-ring"
        data-tone={tone}
        style={{ width: size, height: size }}
        {...aria}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
          <circle
            className="pr-scrollprogress-ring-track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
          />
          <circle
            className="pr-scrollprogress-ring-value"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={thickness}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress / 100)}
          />
        </svg>
        {showValue && <span aria-hidden="true">{rounded}</span>}
      </div>
    );
  }

  return (
    <div
      ref={selfRef}
      className="pr-scrollprogress"
      data-tone={tone}
      style={{ '--pr-thickness': `${thickness}px` } as CSSProperties}
      {...aria}
    >
      <span className="pr-scrollprogress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
      {showValue && (
        <span className="pr-scrollprogress-value" aria-hidden="true">
          {rounded} %
        </span>
      )}
    </div>
  );
}
