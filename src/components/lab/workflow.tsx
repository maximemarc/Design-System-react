import {
  useEffect,
  useId,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight, CornerDownLeft, GripVertical, Search } from 'lucide-react';

export type KanbanColumn = { id: string; title: string };
export type KanbanCard = { id: string; title: string; columnId: string; tag?: string };

const cardMime = 'application/x-forma-card';

export function KanbanBoard({
  columns,
  cards,
  onMove,
}: {
  columns: KanbanColumn[];
  cards: KanbanCard[];
  onMove: (cardId: string, columnId: string) => void;
}) {
  const [over, setOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const onDrop = (event: DragEvent, columnId: string) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData(cardMime);
    setOver(null);
    setDragging(null);
    if (cards.some(card => card.id === cardId && card.columnId !== columnId)) onMove(cardId, columnId);
  };
  return (
    <div
      className="lab-kanban"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(180px, 1fr))` }}
    >
      {columns.map((column, columnIndex) => {
        const items = cards.filter(card => card.columnId === column.id);
        return (
          <section
            key={column.id}
            aria-label={column.title}
            className={`lab-kanban-column ${over === column.id ? 'over' : ''}`}
            onDragOver={event => {
              if (!dragging) return;
              event.preventDefault();
              setOver(column.id);
            }}
            onDragLeave={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node)) setOver(null);
            }}
            onDrop={event => onDrop(event, column.id)}
          >
            <header>
              <strong>{column.title}</strong>
              <span>{items.length}</span>
            </header>
            <ul>
              {items.map(card => (
                <li
                  key={card.id}
                  draggable
                  className={`lab-kanban-card ${dragging === card.id ? 'dragging' : ''}`}
                  onDragStart={event => {
                    event.dataTransfer.setData(cardMime, card.id);
                    event.dataTransfer.effectAllowed = 'move';
                    setDragging(card.id);
                  }}
                  onDragEnd={() => {
                    setDragging(null);
                    setOver(null);
                  }}
                >
                  <GripVertical size={14} aria-hidden="true" />
                  <div>
                    <span>{card.title}</span>
                    {card.tag && <small>{card.tag}</small>}
                  </div>
                  <div className="lab-kanban-move">
                    <button
                      type="button"
                      aria-label={`Déplacer « ${card.title} » vers ${columns[columnIndex - 1]?.title ?? ''}`}
                      disabled={columnIndex === 0}
                      onClick={() => onMove(card.id, columns[columnIndex - 1].id)}
                    >
                      <ArrowLeft size={12} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Déplacer « ${card.title} » vers ${columns[columnIndex + 1]?.title ?? ''}`}
                      disabled={columnIndex === columns.length - 1}
                      onClick={() => onMove(card.id, columns[columnIndex + 1].id)}
                    >
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </li>
              ))}
              {!items.length && <li className="lab-kanban-empty">Déposez une carte ici</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export type Command = {
  id: string;
  label: string;
  group: string;
  icon?: ReactNode;
  shortcut?: string;
  run: () => void;
};

export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [highlight, setHighlight] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  const id = useId();
  // Remet la recherche à zéro à chaque ouverture, pendant le rendu plutôt que dans l'effet.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery('');
      setHighlight(0);
    }
  }
  useEffect(() => {
    if (open) {
      ref.current?.showModal();
      inputRef.current?.focus();
    } else ref.current?.close();
  }, [open]);
  const matches = commands.filter(command =>
    `${command.label} ${command.group}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );
  const groups = [...new Set(matches.map(command => command.group))];
  const run = (command: Command) => {
    onClose();
    command.run();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlight(previous => Math.min(previous + 1, matches.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlight(previous => Math.max(previous - 1, 0));
    }
    if (event.key === 'Enter' && matches[highlight]) {
      event.preventDefault();
      run(matches[highlight]);
    }
  };
  return (
    <dialog
      ref={ref}
      className="lab-command"
      aria-label="Palette de commandes"
      onCancel={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="lab-command-search">
        <Search size={17} aria-hidden="true" />
        <input
          ref={inputRef}
          role="combobox"
          aria-expanded="true"
          aria-controls={`${id}-list`}
          aria-activedescendant={matches[highlight] ? `${id}-${matches[highlight].id}` : undefined}
          aria-label="Rechercher une commande"
          placeholder="Que voulez-vous faire ?"
          value={query}
          onChange={event => {
            setQuery(event.target.value);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
        />
        <kbd>Échap</kbd>
      </div>
      <div id={`${id}-list`} role="listbox" aria-label="Commandes" className="lab-command-list">
        {groups.map(group => (
          <div key={group} role="group" aria-label={group}>
            <span className="lab-command-group">{group}</span>
            {matches
              .filter(command => command.group === group)
              .map(command => {
                const index = matches.indexOf(command);
                return (
                  <div
                    key={command.id}
                    id={`${id}-${command.id}`}
                    role="option"
                    aria-selected={index === highlight}
                    className={index === highlight ? 'highlight' : ''}
                    onMouseEnter={() => setHighlight(index)}
                    onClick={() => run(command)}
                  >
                    {command.icon}
                    <span>{command.label}</span>
                    {command.shortcut ? (
                      <kbd>{command.shortcut}</kbd>
                    ) : (
                      index === highlight && <CornerDownLeft size={13} />
                    )}
                  </div>
                );
              })}
          </div>
        ))}
        {!matches.length && <p className="lab-empty-line">Aucune commande pour « {query} ».</p>}
      </div>
    </dialog>
  );
}
