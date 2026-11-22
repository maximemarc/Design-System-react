import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

export type AccordionItem = { id: string; title: string; content: ReactNode };

export function Accordion({
  items,
  multiple = false,
  defaultOpen = [],
}: {
  items: AccordionItem[];
  multiple?: boolean;
  defaultOpen?: string[];
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const baseId = useId();
  const toggle = (id: string) =>
    setOpen(previous =>
      previous.includes(id) ? previous.filter(item => item !== id) : multiple ? [...previous, id] : [id],
    );
  return (
    <div className="lab-accordion">
      {items.map(item => {
        const expanded = open.includes(item.id);
        return (
          <div key={item.id} className={`lab-accordion-item ${expanded ? 'open' : ''}`}>
            <h4>
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={`${baseId}-${item.id}`}
                onClick={() => toggle(item.id)}
              >
                {item.title}
                <ChevronDown size={16} />
              </button>
            </h4>
            <div id={`${baseId}-${item.id}`} className="lab-accordion-panel" role="region" hidden={!expanded}>
              <div>{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export type TabItem = { id: string; label: string; content: ReactNode };

export function AnimatedTabs({ tabs, label }: { tabs: TabItem[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const baseId = useId();
  useLayoutEffect(() => {
    const measure = () => {
      const element = active ? refs.current.get(active) : undefined;
      if (element) setIndicator({ left: element.offsetLeft, width: element.offsetWidth });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [active]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const index = tabs.findIndex(tab => tab.id === active);
    const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    setActive(next.id);
    refs.current.get(next.id)?.focus();
  };
  const current = tabs.find(tab => tab.id === active);
  return (
    <div className="lab-tabs">
      <div className="lab-tablist" role="tablist" aria-label={label} onKeyDown={onKeyDown}>
        <span
          className="lab-tab-indicator"
          style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          aria-hidden="true"
        />
        {tabs.map(tab => (
          <button
            key={tab.id}
            ref={element => {
              if (element) refs.current.set(tab.id, element);
              else refs.current.delete(tab.id);
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${baseId}-panel`}
            tabIndex={tab.id === active ? 0 : -1}
            onClick={() => setActive(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {current && (
        <div
          key={current.id}
          className="lab-tab-panel"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${current.id}`}
        >
          {current.content}
        </div>
      )}
    </div>
  );
}

export function Tooltip({
  label,
  children,
  align = 'center',
}: {
  label: string;
  children: ReactNode;
  /** Côté auquel la bulle s'aligne : « end » pour un déclencheur collé au bord droit. */
  align?: 'start' | 'center' | 'end';
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  return (
    <span
      className="lab-tooltip-anchor"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onKeyDown={event => {
        if (event.key === 'Escape') setVisible(false);
      }}
      aria-describedby={visible ? id : undefined}
    >
      {children}
      <span id={id} role="tooltip" className={`lab-tooltip lab-tooltip-${align} ${visible ? 'visible' : ''}`}>
        {label}
      </span>
    </span>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (open) ref.current?.showModal();
    else ref.current?.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="lab-drawer"
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="lab-drawer-body">
        <div className="modal-heading">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Fermer le panneau">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="lab-stepper" aria-label="Progression">
      {steps.map((step, index) => {
        const status = index < current ? 'done' : index === current ? 'current' : 'upcoming';
        return (
          <li key={step} className={status} aria-current={status === 'current' ? 'step' : undefined}>
            <span className="lab-step-dot">{status === 'done' ? <Check size={13} /> : index + 1}</span>
            <span className="lab-step-label">{step}</span>
          </li>
        );
      })}
    </ol>
  );
}

export type TimelineEntry = {
  id: string;
  title: string;
  time: string;
  description?: string;
  tone?: 'accent' | 'success' | 'neutral';
};

export function Timeline({
  items,
  emptyLabel = 'Aucune activité pour le moment.',
}: {
  items: TimelineEntry[];
  emptyLabel?: string;
}) {
  if (!items.length) return <p className="lab-empty-line">{emptyLabel}</p>;
  return (
    <ol className="lab-timeline">
      {items.map(item => (
        <li key={item.id} className={`tone-${item.tone ?? 'accent'}`}>
          <span className="lab-timeline-dot" aria-hidden="true" />
          <div>
            <div className="lab-timeline-head">
              <strong>{item.title}</strong>
              <time>{item.time}</time>
            </div>
            {item.description && <p>{item.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
