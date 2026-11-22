import '@/components/lab/overlays.css';
import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { Check, ChevronDown, Info, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui';

/* ─── Menus partagés (Dropdown, ContextMenu) ─────────────────────────── */

export type MenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  description?: string;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  /** Défini (vrai ou faux) : l'élément devient une case à cocher de menu. */
  checked?: boolean;
  onSelect?: () => void;
};
/** Un groupe d'éléments ; un séparateur est tracé entre deux groupes. */
export type MenuGroup = { id: string; label?: string; items: MenuItem[] };

const menuItemSelector = '[role="menuitem"], [role="menuitemcheckbox"]';

function menuItems(menu: HTMLElement) {
  return Array.from(menu.querySelectorAll<HTMLElement>(menuItemSelector));
}

/** Clavier commun aux menus : flèches, Début/Fin, Échap, Tab et recherche par première lettre. */
function onMenuKeyDown(event: KeyboardEvent<HTMLElement>, close: (restoreFocus: boolean) => void) {
  const items = menuItems(event.currentTarget);
  if (!items.length) return;
  const index = items.indexOf(document.activeElement as HTMLElement);
  const focusAt = (next: number) => items[(next + items.length) % items.length]?.focus();
  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      focusAt(index + 1);
      return;
    case 'ArrowUp':
      event.preventDefault();
      focusAt(index < 0 ? -1 : index - 1);
      return;
    case 'Home':
      event.preventDefault();
      focusAt(0);
      return;
    case 'End':
      event.preventDefault();
      focusAt(items.length - 1);
      return;
    case 'Escape':
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    case 'Tab':
      // Le focus revient au déclencheur puis Tab poursuit son chemin naturel.
      close(true);
      return;
  }
  if (event.key.length === 1 && /\S/.test(event.key) && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const letter = event.key.toLocaleLowerCase();
    const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
    ordered.find(item => item.textContent?.trim().toLocaleLowerCase().startsWith(letter))?.focus();
  }
}

function MenuEntries({ groups, onActivate }: { groups: MenuGroup[]; onActivate: (item: MenuItem) => void }) {
  const baseId = useId();
  return groups.map((group, groupIndex) => (
    <Fragment key={group.id}>
      {groupIndex > 0 && <div role="separator" className="ov-menu-separator" />}
      <div
        role="group"
        aria-labelledby={group.label ? `${baseId}-${group.id}` : undefined}
        className="ov-menu-group"
      >
        {group.label && (
          <div id={`${baseId}-${group.id}`} className="ov-menu-label" role="presentation">
            {group.label}
          </div>
        )}
        {group.items.map(item => (
          <button
            key={item.id}
            type="button"
            role={item.checked === undefined ? 'menuitem' : 'menuitemcheckbox'}
            aria-checked={item.checked}
            aria-disabled={item.disabled || undefined}
            tabIndex={-1}
            className={`ov-menu-item ${item.destructive ? 'destructive' : ''}`}
            onClick={() => {
              if (!item.disabled) onActivate(item);
            }}
            onMouseMove={event => {
              if (document.activeElement !== event.currentTarget) event.currentTarget.focus();
            }}
          >
            <span className="ov-menu-icon" aria-hidden="true">
              {item.checked === undefined ? item.icon : item.checked && <Check size={14} />}
            </span>
            <span className="ov-menu-text">
              <span>{item.label}</span>
              {item.description && <small>{item.description}</small>}
            </span>
            {item.shortcut && <kbd aria-hidden="true">{item.shortcut}</kbd>}
          </button>
        ))}
      </div>
    </Fragment>
  ));
}

/* ─── Dropdown ───────────────────────────────────────────────────────── */

export function Dropdown({
  label,
  groups,
  ariaLabel,
  menuLabel,
  variant = 'secondary',
  align = 'start',
  side = 'bottom',
}: {
  /** Contenu du bouton déclencheur. */
  label: ReactNode;
  groups: MenuGroup[];
  /** Nom accessible du déclencheur, obligatoire s'il ne contient qu'une icône. */
  ariaLabel?: string;
  /** Nom accessible du menu ; par défaut, celui du déclencheur. */
  menuLabel?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  align?: 'start' | 'end';
  side?: 'top' | 'bottom';
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const focusEdge = useRef<'first' | 'last'>('first');
  const baseId = useId();
  const show = (edge: 'first' | 'last') => {
    focusEdge.current = edge;
    setOpen(true);
  };
  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  };
  useEffect(() => {
    if (!open) return;
    const items = menuRef.current ? menuItems(menuRef.current) : [];
    (focusEdge.current === 'last' ? items[items.length - 1] : items[0])?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);
  return (
    <div ref={wrapperRef} className={`ov-dropdown ${open ? 'ov-open' : ''}`}>
      <Button
        ref={triggerRef}
        id={`${baseId}-trigger`}
        variant={variant}
        className="ov-dropdown-trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? `${baseId}-menu` : undefined}
        onClick={() => (open ? close(false) : show('first'))}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            show(event.key === 'ArrowUp' ? 'last' : 'first');
          }
        }}
      >
        {label}
        <ChevronDown size={14} aria-hidden="true" className="ov-dropdown-chevron" />
      </Button>
      {open && (
        <div
          ref={menuRef}
          id={`${baseId}-menu`}
          role="menu"
          aria-orientation="vertical"
          aria-label={menuLabel}
          aria-labelledby={menuLabel ? undefined : `${baseId}-trigger`}
          className={`ov-menu ov-dropdown-menu side-${side} align-${align}`}
          onKeyDown={event => onMenuKeyDown(event, close)}
        >
          <MenuEntries
            groups={groups}
            onActivate={item => {
              close(true);
              item.onSelect?.();
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ─── ContextMenu ────────────────────────────────────────────────────── */

export function ContextMenu({
  groups,
  children,
  label = 'Menu contextuel',
  zoneLabel,
}: {
  groups: MenuGroup[];
  children: ReactNode;
  /** Nom accessible du menu. */
  label?: string;
  /** Nom accessible de la zone qui ouvre le menu. */
  zoneLabel: string;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hintId = useId();
  const close = (restoreFocus: boolean) => {
    setPosition(null);
    if (restoreFocus) zoneRef.current?.focus();
  };
  const openFromZone = () => {
    const rect = zoneRef.current?.getBoundingClientRect();
    if (rect) setPosition({ x: rect.left + 16, y: rect.top + 16 });
  };
  // Place le menu dans la fenêtre avant l'affichage (écriture DOM directe, pas d'état).
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!position || !menu) return;
    if (typeof menu.showPopover === 'function' && !menu.matches(':popover-open')) menu.showPopover();
    const margin = 8;
    const { width, height } = menu.getBoundingClientRect();
    const fitsRight = position.x + width + margin <= window.innerWidth;
    const fitsBelow = position.y + height + margin <= window.innerHeight;
    const x = fitsRight ? position.x : position.x - width;
    const y = fitsBelow ? position.y : position.y - height;
    menu.style.left = `${Math.max(margin, Math.min(x, window.innerWidth - width - margin))}px`;
    menu.style.top = `${Math.max(margin, Math.min(y, window.innerHeight - height - margin))}px`;
    menuItems(menu)[0]?.focus({ preventScroll: true });
    const dismiss = () => setPosition(null);
    const onPointerDown = (event: PointerEvent) => {
      if (!menu.contains(event.target as Node)) dismiss();
    };
    const onScroll = (event: Event) => {
      if (!menu.contains(event.target as Node)) dismiss();
    };
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', dismiss);
    window.addEventListener('blur', dismiss);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('blur', dismiss);
    };
  }, [position]);
  return (
    <>
      <div
        ref={zoneRef}
        role="group"
        tabIndex={0}
        aria-label={zoneLabel}
        aria-describedby={hintId}
        className={`ov-context-zone ${position ? 'ov-open' : ''}`}
        onContextMenu={event => {
          event.preventDefault();
          // Ouverture au clavier sans coordonnées : on part du coin de la zone.
          if (event.clientX === 0 && event.clientY === 0) openFromZone();
          else setPosition({ x: event.clientX, y: event.clientY });
        }}
        onKeyDown={event => {
          if (event.key === 'ContextMenu' || (event.shiftKey && event.key === 'F10')) {
            event.preventDefault();
            openFromZone();
          }
        }}
      >
        {children}
        <span id={hintId} className="sr-only">
          Clic droit, touche Menu ou Maj+F10 pour ouvrir le menu.
        </span>
      </div>
      {position && (
        <div
          ref={menuRef}
          popover="manual"
          role="menu"
          aria-orientation="vertical"
          aria-label={label}
          className="ov-menu ov-context-menu"
          onKeyDown={event => onMenuKeyDown(event, close)}
          onContextMenu={event => event.preventDefault()}
        >
          <MenuEntries
            groups={groups}
            onActivate={item => {
              close(true);
              item.onSelect?.();
            }}
          />
        </div>
      )}
    </>
  );
}

/* ─── HoverCard ──────────────────────────────────────────────────────── */

export function HoverCard({
  trigger,
  children,
  openDelay = 350,
  closeDelay = 180,
  side = 'bottom',
  align = 'start',
}: {
  /** Élément focalisable (lien, bouton) qui déclenche la carte. */
  trigger: ReactNode;
  children: ReactNode;
  openDelay?: number;
  closeDelay?: number;
  side?: 'top' | 'bottom';
  align?: 'start' | 'center' | 'end';
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const cardId = useId();
  const schedule = (next: boolean) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(next), next ? openDelay : closeDelay);
  };
  useEffect(() => {
    const pending = timer;
    return () => window.clearTimeout(pending.current);
  }, []);
  return (
    <span
      className={`ov-hovercard ${open ? 'ov-open' : ''}`}
      onMouseEnter={() => schedule(true)}
      onMouseLeave={() => schedule(false)}
      onFocus={() => schedule(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) schedule(false);
      }}
      onKeyDown={event => {
        if (event.key === 'Escape' && open) {
          event.stopPropagation();
          window.clearTimeout(timer.current);
          setOpen(false);
        }
      }}
    >
      {trigger}
      {open && (
        <span id={cardId} className={`ov-hovercard-card side-${side} align-${align}`}>
          {children}
        </span>
      )}
    </span>
  );
}

/* ─── AlertDialog ────────────────────────────────────────────────────── */

export type AlertTone = 'danger' | 'warning' | 'info';

export function AlertDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  tone = 'danger',
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  confirmText,
}: {
  open: boolean;
  onClose: () => void;
  /** Peut renvoyer une promesse : les boutons restent bloqués pendant l'attente. */
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  tone?: AlertTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Texte à recopier pour autoriser la confirmation (actions irréversibles). */
  confirmText?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [typed, setTyped] = useState('');
  const [pending, setPending] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const baseId = useId();
  // Remise à zéro à chaque ouverture, pendant le rendu plutôt que dans l'effet.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTyped('');
      setPending(false);
    }
  }
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      if (!dialog.open) dialog.showModal();
      // Action destructive : le focus part sur « Annuler », jamais sur la confirmation.
      cancelRef.current?.focus();
    } else if (dialog.open) dialog.close();
  }, [open]);
  const blocked = pending || (confirmText !== undefined && typed !== confirmText);
  const confirm = async () => {
    if (blocked) return;
    setPending(true);
    try {
      await onConfirm();
    } finally {
      setPending(false);
    }
  };
  return (
    <dialog
      ref={ref}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby={`${baseId}-title`}
      aria-describedby={description ? `${baseId}-description` : undefined}
      className={`ov-alert tone-${tone}`}
      onCancel={event => {
        event.preventDefault();
        if (!pending) onClose();
      }}
      onClose={() => {
        // Fermeture imposée par le navigateur (Échap répété) : on resynchronise le parent.
        if (open) onClose();
      }}
      onKeyDown={event => {
        if (event.key !== 'Tab') return;
        const focusable = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
          ),
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }}
    >
      <div className="ov-alert-body">
        <span className="ov-alert-icon" aria-hidden="true">
          {tone === 'info' ? <Info size={20} /> : <TriangleAlert size={20} />}
        </span>
        <div className="ov-alert-text">
          <h2 id={`${baseId}-title`}>{title}</h2>
          {description && (
            <div id={`${baseId}-description`} className="ov-alert-description">
              {description}
            </div>
          )}
        </div>
      </div>
      {confirmText !== undefined && (
        <div className="ov-alert-confirm-field">
          <label htmlFor={`${baseId}-confirm`}>
            Saisissez <strong>{confirmText}</strong> pour confirmer
          </label>
          <div className="input-wrap">
            <input
              id={`${baseId}-confirm`}
              value={typed}
              autoComplete="off"
              spellCheck={false}
              onChange={event => setTyped(event.target.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void confirm();
                }
              }}
            />
          </div>
        </div>
      )}
      <div className="ov-alert-actions">
        <Button ref={cancelRef} variant="secondary" size="small" disabled={pending} onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          size="small"
          className={`ov-alert-confirm tone-${tone}`}
          disabled={blocked}
          aria-busy={pending || undefined}
          onClick={() => void confirm()}
        >
          {pending ? 'Patientez…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
