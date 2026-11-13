import { useMemo, useRef, useEffect, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Button } from '@/components/ui';

export type TableColumn<T> = {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
};

type DataTableProps<T> = {
  rows: T[];
  columns: TableColumn<T>[];
  getId: (row: T) => string;
  matchesSearch: (row: T, query: string) => boolean;
  caption: string;
  pageSize?: number;
};

function SelectionCheckbox({ checked, mixed = false, label, onChange }: { checked: boolean; mixed?: boolean; label: string; onChange: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <input ref={ref} type="checkbox" checked={checked} aria-label={label} onChange={onChange} className="table-checkbox" />;
}

export default function DataTable<T>({ rows, columns, getId, matchesSearch, caption, pageSize = 4 }: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: string; ascending: boolean } | null>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = useMemo(() => {
    const result = rows.filter(row => matchesSearch(row, query.trim().toLocaleLowerCase('fr')));
    const column = columns.find(item => item.key === sort?.key);
    if (column?.sortValue && sort) {
      const value = column.sortValue;
      result.sort((a, b) => {
        const left = value(a), right = value(b);
        const comparison = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right), 'fr');
        return comparison * (sort.ascending ? 1 : -1);
      });
    }
    return result;
  }, [rows, columns, matchesSearch, query, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const visible = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  const allSelected = visible.length > 0 && visible.every(row => selected.has(getId(row)));
  const someSelected = visible.some(row => selected.has(getId(row)));
  const selectionCount = rows.filter(row => selected.has(getId(row))).length;
  const toggle = (ids: string[], remove: boolean) => setSelected(previous => {
    const next = new Set(previous);
    ids.forEach(id => { if (remove) next.delete(id); else next.add(id); });
    return next;
  });
  return <div className="data-table">
    <div className="table-toolbar"><div className="input-wrap"><Search size={15}/><input aria-label="Rechercher dans le tableau" placeholder="Rechercher un membre…" value={query} onChange={event => { setQuery(event.target.value); setPage(0); }}/></div><span aria-live="polite">{selectionCount ? `${selectionCount} sélectionné(s)` : `${filtered.length} membres`}</span>{selectionCount > 0 && <Button size="small" variant="ghost" onClick={() => setSelected(new Set())}>Effacer la sélection</Button>}</div>
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}><table><caption className="sr-only">{caption}</caption><thead><tr><th scope="col"><SelectionCheckbox checked={allSelected} mixed={someSelected && !allSelected} label="Sélectionner les lignes de cette page" onChange={() => toggle(visible.map(getId), allSelected)}/></th>{columns.map(column => <th key={column.key} scope="col" aria-sort={sort?.key === column.key ? sort.ascending ? 'ascending' : 'descending' : column.sortValue ? 'none' : undefined}>{column.sortValue ? <button onClick={() => { setSort({ key: column.key, ascending: sort?.key === column.key ? !sort.ascending : true }); setPage(0); }}>{column.label}{sort?.key === column.key ? sort.ascending ? <ArrowUp size={12}/> : <ArrowDown size={12}/> : <span className="sort-placeholder">↕</span>}</button> : column.label}</th>)}</tr></thead><tbody>{visible.map(row => <tr key={getId(row)} data-selected={selected.has(getId(row))}><td><SelectionCheckbox checked={selected.has(getId(row))} label={`Sélectionner la ligne ${getId(row)}`} onChange={() => toggle([getId(row)], selected.has(getId(row)))}/></td>{columns.map(column => <td key={column.key}>{column.render(row)}</td>)}</tr>)}{!visible.length && <tr><td className="table-empty" colSpan={columns.length + 1}>Aucun membre ne correspond à votre recherche.<Button size="small" variant="ghost" onClick={() => { setQuery(''); setPage(0); }}>Réinitialiser la recherche</Button></td></tr>}</tbody></table></div>
    <div className="table-pagination"><span aria-live="polite">{filtered.length ? `${currentPage * pageSize + 1}–${Math.min((currentPage + 1) * pageSize, filtered.length)} sur ${filtered.length}` : '0 résultat'}</span><div><Button variant="secondary" size="small" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} aria-label="Page précédente"><ChevronLeft size={14}/></Button><span>Page {currentPage + 1} / {totalPages}</span><Button variant="secondary" size="small" disabled={currentPage + 1 >= totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Page suivante"><ChevronRight size={14}/></Button></div></div>
  </div>;
}
