import { useId, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Modal } from '@/components/ui';

export function DatePicker({ value, onChange, label, allowClear = true }: { value: Date | null; onChange: (value: Date | null) => void; label: string; allowClear?: boolean }) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date((value ?? new Date()).getFullYear(), (value ?? new Date()).getMonth(), 1));
  const id = useId();
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (month.getDay() + 6) % 7;
  const display = new Intl.DateTimeFormat('fr', { dateStyle: 'long' });
  const select = (day: number) => { onChange(new Date(month.getFullYear(), month.getMonth(), day)); setOpen(false); };
  return <div className="date-picker"><label id={id} className="field-label">{label}</label><Button type="button" variant="secondary" aria-labelledby={id} aria-haspopup="dialog" onClick={() => { const date = value ?? new Date(); setMonth(new Date(date.getFullYear(), date.getMonth(), 1)); setOpen(true); }}><CalendarDays size={16}/>{value ? display.format(value) : 'Choisir une date'}</Button>
    <Modal open={open} onClose={() => setOpen(false)} title="Choisir une date"><div className="calendar-heading"><button type="button" className="icon-button" aria-label="Mois précédent" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={20}/></button><strong aria-live="polite">{new Intl.DateTimeFormat('fr', { month: 'long', year: 'numeric' }).format(month)}</strong><button type="button" className="icon-button" aria-label="Mois suivant" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={20}/></button></div><div className="calendar-days"><div className="calendar-weekdays" aria-hidden="true">{['Lu','Ma','Me','Je','Ve','Sa','Di'].map(day => <span key={day}>{day}</span>)}</div><div className="calendar-grid">{Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`}/>)}{Array.from({ length: count }, (_, index) => { const day = index + 1; const date = new Date(month.getFullYear(), month.getMonth(), day); const selected = Boolean(value && value.toDateString() === date.toDateString()); return <button type="button" key={day} className={selected ? 'selected' : ''} aria-pressed={selected} aria-label={display.format(date)} onClick={() => select(day)}>{day}</button>; })}</div></div><div className="dialog-footer">{allowClear && <Button type="button" variant="secondary" onClick={() => { onChange(null); setOpen(false); }}>Effacer</Button>}<Button type="button" onClick={() => { onChange(new Date()); setOpen(false); }}>Aujourd’hui</Button></div></Modal>
  </div>;
}
