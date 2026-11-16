import { type LucideIcon } from 'lucide-react';

export type TabBarItem = { id: string; label: string; icon: LucideIcon };

/** Barre d'onglets mobile : zones de 52 px, onglet courant en accent doux. */
export function TabBar({
  items,
  current,
  onChange,
  label = 'Navigation principale',
}: {
  items: TabBarItem[];
  current: string;
  onChange: (id: string) => void;
  label?: string;
}) {
  return (
    <nav
      className="tab-bar"
      aria-label={label}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
    >
      {items.map(({ id, label: itemLabel, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className="tab-bar-item"
          aria-current={current === id ? 'page' : undefined}
          onClick={() => onChange(id)}
        >
          <Icon size={22} aria-hidden="true" />
          <span>{itemLabel}</span>
        </button>
      ))}
    </nav>
  );
}
