import { useState, type CSSProperties, type DragEvent } from 'react';
import { PiArmchairDuotone, PiUsersDuotone } from 'react-icons/pi';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { Badge, Button, Modal } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import '@/components/seating.css';

type DiningTable = { id: string; name: string; capacity: number };
type Guest = { id: string; name: string; tableId: string | null; seat: number | null };
const initialTables: DiningTable[] = [{ id: 'roses', name: 'Les roses', capacity: 6 }, { id: 'peonies', name: 'Les pivoines', capacity: 6 }];
const initialGuests: Guest[] = ['Camille Martin', 'Lucas Bernard', 'Emma Robert', 'Hugo Laurent', 'Léa Dubois', 'Nathan Petit', 'Chloé Moreau', 'Louis Simon'].map((name, index) => ({ id: `guest-${index}`, name, tableId: index < 2 ? 'roses' : null, seat: index < 2 ? index : null }));
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();

export default function SeatingPlanner({ couple, notify }: { couple: string; notify: Notify }) {
  const [tables, setTables] = useState(initialTables);
  const [guests, setGuests] = useState(initialGuests);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [newGuest, setNewGuest] = useState('');
  const [editor, setEditor] = useState<{ id: string | null; name: string; capacity: number } | null>(null);
  const [editorError, setEditorError] = useState('');
  const [dragged, setDragged] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);
  const currentGuest = guests.find(guest => guest.id === selected);
  const seated = guests.filter(guest => guest.tableId !== null).length;
  const seats = tables.reduce((sum, table) => sum + table.capacity, 0);
  const visibleGuests = guests.filter(guest => guest.name.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr')));
  const assign = (guestId: string | null, tableId: string, requestedSeat?: number) => {
    const guest = guests.find(item => item.id === guestId);
    const table = tables.find(item => item.id === tableId);
    if (!guest || !table) { notify('Sélectionnez un invité, puis choisissez une place.', 'warning'); return; }
    const occupied = guests.filter(item => item.tableId === tableId && item.id !== guest.id).map(item => item.seat);
    const seat = requestedSeat ?? Array.from({ length: table.capacity }, (_, index) => index).find(index => !occupied.includes(index));
    if (seat === undefined || occupied.includes(seat)) { notify('Cette place est occupée ou la table est complète. Choisissez une place libre.', 'warning'); return; }
    setGuests(previous => previous.map(item => item.id === guest.id ? { ...item, tableId, seat } : item));
    setSelected(null);
    notify(`${guest.name} est placé à « ${table.name} », place ${seat + 1}.`);
  };
  const unseat = (guestId: string) => {
    setGuests(previous => previous.map(guest => guest.id === guestId ? { ...guest, tableId: null, seat: null } : guest));
    setSelected(null);
  };
  const startDrag = (event: DragEvent, guestId: string) => {
    event.dataTransfer.setData('application/x-forma-guest', guestId);
    event.dataTransfer.effectAllowed = 'move';
    setDragged(guestId); setSelected(guestId);
  };
  const dropGuest = (event: DragEvent, tableId: string, seat?: number) => {
    event.preventDefault(); event.stopPropagation();
    const id = event.dataTransfer.getData('application/x-forma-guest');
    if (guests.some(guest => guest.id === id)) assign(id, tableId, seat);
    setDragged(null); setOver(null);
  };
  const openEditor = (table?: DiningTable) => { setEditor(table ? { ...table } : { id: null, name: '', capacity: 6 }); setEditorError(''); };
  return <article className="specimen seating-planner"><div className="specimen-label">15 <span>Plan de table interactif</span><PiArmchairDuotone size={20}/></div><div className="advanced-heading"><div><h3>Une place pour chacun.</h3><p>{couple} · Organisez vos tables et vos invités.</p></div><Button variant="secondary" onClick={() => openEditor()}><Plus size={15}/>Ajouter une table</Button></div><div className="seating-stats"><Badge tone="accent"><PiUsersDuotone size={14}/>{guests.length} invités</Badge><Badge tone="success">{seated} placés</Badge><Badge>{guests.length - seated} à placer</Badge><Badge>{seats - seated} places libres</Badge></div><p className="seating-instructions">Glissez un invité sur une place, ou sélectionnez son nom puis une place libre. Une place occupée permet de sélectionner son invité pour le déplacer.</p>
    <div className="seating-layout"><aside className="seating-roster"><div className="input-wrap"><Search size={15}/><input aria-label="Rechercher un invité" placeholder="Rechercher un invité…" value={query} onChange={event => setQuery(event.target.value)}/></div><form className="seating-add-guest" onSubmit={event => { event.preventDefault(); const name = newGuest.trim(); if (!name) return; setGuests(previous => [...previous, { id: crypto.randomUUID(), name, tableId: null, seat: null }]); setNewGuest(''); }}><input aria-label="Nom du nouvel invité" placeholder="Ajouter un invité" required maxLength={60} value={newGuest} onChange={event => setNewGuest(event.target.value)}/><Button type="submit" size="small" variant="secondary" aria-label="Ajouter cet invité"><Plus size={15}/></Button></form><ul className="seating-guest-list">{visibleGuests.map(guest => { const table = tables.find(item => item.id === guest.tableId); return <li key={guest.id}><button className={`seating-guest ${selected === guest.id ? 'selected' : ''}`} draggable onDragStart={event => startDrag(event, guest.id)} onDragEnd={() => { setDragged(null); setOver(null); }} aria-pressed={selected === guest.id} onClick={() => setSelected(selected === guest.id ? null : guest.id)}><span className="seating-initials">{initials(guest.name)}</span><span><strong>{guest.name}</strong><small>{table ? `${table.name} · place ${(guest.seat ?? 0) + 1}` : 'À placer'}</small></span>{table && <Check size={13}/>}</button><button className="icon-button" aria-label={`Retirer l’invité ${guest.name}`} onClick={() => { setGuests(previous => previous.filter(item => item.id !== guest.id)); if (selected === guest.id) setSelected(null); }}><X size={13}/></button></li>; })}</ul>{!visibleGuests.length && <p className="seating-empty">{guests.length ? 'Aucun invité trouvé.' : 'Ajoutez votre premier invité.'}</p>}</aside>
    <div className="seating-floor"><div className="seating-selection" role="status">{currentGuest ? <><strong>{currentGuest.name}</strong><span>Choisissez sa place.</span>{currentGuest.tableId && <Button variant="ghost" size="small" onClick={() => unseat(currentGuest.id)}>Remettre à placer</Button>}<button className="icon-button" onClick={() => setSelected(null)} aria-label="Annuler la sélection"><X size={14}/></button></> : <span>Sélectionnez un invité pour commencer.</span>}</div><div className="seating-tables">{tables.map(table => { const count = guests.filter(guest => guest.tableId === table.id).length; return <section className={`seating-table-card ${over === table.id ? 'drop-active' : ''}`} key={table.id} aria-label={`${table.name}, ${count} invités sur ${table.capacity} places`} onDragOver={event => { if (dragged) { event.preventDefault(); setOver(table.id); event.dataTransfer.dropEffect = 'move'; } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOver(null); }} onDrop={event => dropGuest(event, table.id)}><div className="seating-table-toolbar"><span>{count} / {table.capacity}</span><button className="icon-button" aria-label={`Modifier ${table.name}`} onClick={() => openEditor(table)}><Pencil size={14}/></button><button className="icon-button" aria-label={`Retirer la table ${table.name}`} onClick={() => { setTables(previous => previous.filter(item => item.id !== table.id)); setGuests(previous => previous.map(guest => guest.tableId === table.id ? { ...guest, tableId: null, seat: null } : guest)); notify('Table retirée. Ses invités sont de nouveau à placer.'); }}><Trash2 size={14}/></button></div><div className="seating-round-table"><div className="seating-table-center"><PiArmchairDuotone size={22}/><strong>{table.name}</strong><button onClick={() => assign(selected, table.id)} disabled={!selected}>{count === table.capacity ? 'Table complète' : 'Placer ici'}</button></div>{Array.from({ length: table.capacity }, (_, seat) => { const guest = guests.find(item => item.tableId === table.id && item.seat === seat); const angle = seat * 2 * Math.PI / table.capacity - Math.PI / 2; const style = { left: `${50 + 40 * Math.cos(angle)}%`, top: `${50 + 40 * Math.sin(angle)}%` } as CSSProperties; return <button key={seat} style={style} className={`seating-seat ${guest ? 'occupied' : ''} ${guest?.id === selected ? 'selected' : ''}`} title={guest ? `${guest.name} · place ${seat + 1}` : `Place ${seat + 1} libre`} aria-label={`${table.name}, place ${seat + 1} : ${guest ? guest.name : 'libre'}`} draggable={Boolean(guest)} onDragStart={event => { if (guest) startDrag(event, guest.id); }} onDragEnd={() => { setDragged(null); setOver(null); }} onDrop={event => dropGuest(event, table.id, seat)} onClick={() => { if (guest && !selected) setSelected(guest.id); else if (guest?.id === selected) setSelected(null); else assign(selected, table.id, seat); }}>{guest ? initials(guest.name) : seat + 1}</button>; })}</div></section>; })}</div>{!tables.length && <div className="seating-empty"><p>Aucune table pour le moment.</p><Button variant="secondary" onClick={() => openEditor()}>Créer une table</Button></div>}</div></div><p className="demo-note">Plan de table de démonstration : les invités et tables restent temporaires et ne sont pas liés aux réponses RSVP enregistrées.</p>
    <Modal open={Boolean(editor)} onClose={() => setEditor(null)} title={editor?.id ? 'Modifier la table' : 'Une nouvelle table'}>{editor && <form className="dialog-form" onSubmit={event => { event.preventDefault(); const name = editor.name.trim(); if (!name) { setEditorError('Donnez un nom à la table.'); return; } const assigned = guests.filter(guest => guest.tableId === editor.id); if (assigned.some(guest => guest.seat !== null && guest.seat >= editor.capacity)) { setEditorError('Déplacez les invités des places supprimées avant de réduire la capacité.'); return; } if (editor.id) setTables(previous => previous.map(table => table.id === editor.id ? { id: table.id, name, capacity: editor.capacity } : table)); else setTables(previous => [...previous, { id: crypto.randomUUID(), name, capacity: editor.capacity }]); setEditor(null); }}><label htmlFor="seating-table-name">Nom de la table</label><input id="seating-table-name" autoFocus required maxLength={30} value={editor.name} onChange={event => setEditor({ ...editor, name: event.target.value })}/><label htmlFor="seating-table-capacity">Nombre de places</label><select id="seating-table-capacity" value={editor.capacity} onChange={event => { setEditor({ ...editor, capacity: Number(event.target.value) }); setEditorError(''); }}>{Array.from({ length: 11 }, (_, index) => index + 2).map(value => <option key={value} value={value}>{value} places</option>)}</select>{editorError && <p className="theme-library-error" role="alert">{editorError}</p>}<div className="dialog-footer"><Button variant="secondary" onClick={() => setEditor(null)}>Annuler</Button><Button type="submit">Enregistrer la table</Button></div></form>}</Modal>
  </article>;
}
