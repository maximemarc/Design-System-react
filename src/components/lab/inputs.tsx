import { useId, useRef, useState, type ClipboardEvent, type CSSProperties, type KeyboardEvent } from 'react';
import { Check, Copy, Star, X } from 'lucide-react';

export function Rating({ value, onChange, max = 5, label }: { value: number; onChange: (value: number) => void; max?: number; label: string }) {
  const [hover, setHover] = useState(0);
  const name = useId();
  const shown = hover || value;
  return <fieldset className="lab-rating" onMouseLeave={() => setHover(0)}>
    <legend className="field-label">{label}</legend>
    <div>{Array.from({ length: max }, (_, index) => index + 1).map(score => <label key={score} className={score <= shown ? 'filled' : ''} onMouseEnter={() => setHover(score)}>
      <input type="radio" name={name} value={score} checked={value === score} onChange={() => onChange(score)}/>
      <Star size={22} aria-hidden="true"/><span className="sr-only">{score} sur {max}</span>
    </label>)}<span className="lab-rating-value">{value ? `${value}/${max}` : 'Non noté'}</span></div>
  </fieldset>;
}

export function TagInput({ tags, onChange, label, max = 8 }: { tags: string[]; onChange: (tags: string[]) => void; label: string; max?: number }) {
  const [draft, setDraft] = useState('');
  const [message, setMessage] = useState('');
  const id = useId();
  const add = () => {
    const tag = draft.trim().replace(/,$/, '').slice(0, 24);
    if (!tag) return;
    if (tags.some(item => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) { setMessage(`« ${tag} » existe déjà.`); return; }
    if (tags.length >= max) { setMessage(`Maximum ${max} étiquettes.`); return; }
    onChange([...tags, tag]);
    setDraft('');
    setMessage('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); add(); }
    if (event.key === 'Backspace' && !draft && tags.length) onChange(tags.slice(0, -1));
  };
  return <div className="lab-tag-input">
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className="lab-tag-box">{tags.map(tag => <span key={tag} className="lab-tag">{tag}<button type="button" aria-label={`Retirer ${tag}`} onClick={() => onChange(tags.filter(item => item !== tag))}><X size={12}/></button></span>)}
      <input id={id} value={draft} placeholder={tags.length ? '' : 'Tapez puis Entrée'} onChange={event => setDraft(event.target.value)} onKeyDown={onKeyDown} onBlur={add}/>
    </div>
    <p className="lab-hint" aria-live="polite">{message || `${tags.length}/${max} · Entrée ou virgule pour ajouter`}</p>
  </div>;
}

export function RangeSlider({ value, onChange, min = 0, max = 100, step = 1, label, format = String }: { value: number; onChange: (value: number) => void; min?: number; max?: number; step?: number; label: string; format?: (value: number) => string }) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;
  return <div className="lab-range" style={{ '--fill': `${percent}%` } as CSSProperties}>
    <div className="lab-range-head"><label className="field-label" htmlFor={id}>{label}</label><output htmlFor={id}>{format(value)}</output></div>
    <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={event => onChange(Number(event.target.value))} aria-valuetext={format(value)}/>
    <div className="range-labels"><span>{format(min)}</span><span>{format(max)}</span></div>
  </div>;
}

export function OtpInput({ length = 6, value, onChange, label }: { length?: number; value: string; onChange: (value: string) => void; label: string }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');
  const setAt = (index: number, digit: string) => {
    const next = [...digits];
    next[index] = digit;
    onChange(next.join('').slice(0, length));
  };
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };
  return <fieldset className="lab-otp">
    <legend className="field-label">{label}</legend>
    <div>{digits.map((digit, index) => <input key={index} ref={element => { refs.current[index] = element; }} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} aria-label={`Chiffre ${index + 1} sur ${length}`} value={digit} className={digit ? 'filled' : ''} onPaste={onPaste}
      onChange={event => { const digit = event.target.value.replace(/\D/g, '').slice(-1); if (!digit) return; setAt(index, digit); refs.current[index + 1]?.focus(); }}
      onKeyDown={event => {
        if (event.key === 'Backspace') { event.preventDefault(); if (digit) setAt(index, ''); else if (index > 0) { setAt(index - 1, ''); refs.current[index - 1]?.focus(); } }
        if (event.key === 'ArrowLeft') refs.current[index - 1]?.focus();
        if (event.key === 'ArrowRight') refs.current[index + 1]?.focus();
      }}/>)}</div>
  </fieldset>;
}

export function Combobox({ options, value, onChange, label, placeholder = 'Rechercher…' }: { options: string[]; value: string; onChange: (value: string) => void; label: string; placeholder?: string }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const id = useId();
  const matches = options.filter(option => option.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const choose = (option: string) => { onChange(option); setQuery(option); setOpen(false); };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); setHighlight(previous => Math.min(previous + 1, matches.length - 1)); }
    if (event.key === 'ArrowUp') { event.preventDefault(); setHighlight(previous => Math.max(previous - 1, 0)); }
    if (event.key === 'Enter' && open && matches[highlight]) { event.preventDefault(); choose(matches[highlight]); }
    if (event.key === 'Escape') { setOpen(false); setQuery(value); }
  };
  return <div className="lab-combobox">
    <label className="field-label" htmlFor={id}>{label}</label>
    <input id={id} role="combobox" aria-expanded={open} aria-controls={`${id}-list`} aria-autocomplete="list" aria-activedescendant={open && matches[highlight] ? `${id}-${highlight}` : undefined} value={query} placeholder={placeholder}
      onChange={event => { setQuery(event.target.value); setOpen(true); setHighlight(0); }} onFocus={() => setOpen(true)} onBlur={() => { setOpen(false); setQuery(value); }} onKeyDown={onKeyDown}/>
    {open && <ul id={`${id}-list`} role="listbox" aria-label={label}>{matches.length ? matches.map((option, index) => <li key={option} id={`${id}-${index}`} role="option" aria-selected={option === value} className={index === highlight ? 'highlight' : ''} onMouseDown={event => { event.preventDefault(); choose(option); }} onMouseEnter={() => setHighlight(index)}>{option}{option === value && <Check size={14}/>}</li>) : <li className="lab-combobox-empty" role="option" aria-selected="false" aria-disabled="true">Aucun résultat</li>}</ul>}
  </div>;
}

const palette = ['#477b60', '#2676b8', '#b35435', '#59616e', '#c52c73', '#a76510', '#1f7a7a', '#2f2f2f'];

export function ColorPicker({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const [draft, setDraft] = useState(value);
  const id = useId();
  const valid = /^#[0-9a-f]{6}$/i.test(draft);
  const commit = (color: string) => { setDraft(color); onChange(color); };
  return <div className="lab-color">
    <span className="field-label">{label}</span>
    <div className="lab-color-swatches">{palette.map(color => <button key={color} type="button" aria-label={`Couleur ${color}`} aria-pressed={value.toLowerCase() === color} style={{ background: color }} onClick={() => commit(color)}>{value.toLowerCase() === color && <Check size={14}/>}</button>)}</div>
    <div className="lab-color-row"><input type="color" aria-label="Choisir une couleur libre" value={value} onChange={event => commit(event.target.value)}/>
      <label className="sr-only" htmlFor={id}>Code hexadécimal</label>
      <input id={id} className={valid ? '' : 'invalid'} value={draft} maxLength={7} aria-invalid={!valid} onChange={event => { const next = event.target.value.trim(); setDraft(next); if (/^#[0-9a-f]{6}$/i.test(next)) onChange(next.toLowerCase()); }}/>
    </div>
    {!valid && <p className="lab-error-text">Format attendu : #RRGGBB</p>}
  </div>;
}

const criteria = [
  { label: '12 caractères minimum', test: (value: string) => value.length >= 12 },
  { label: 'Une majuscule et une minuscule', test: (value: string) => /[a-z]/.test(value) && /[A-Z]/.test(value) },
  { label: 'Un chiffre', test: (value: string) => /\d/.test(value) },
  { label: 'Un symbole', test: (value: string) => /[^A-Za-z0-9]/.test(value) },
];
const levels = ['Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'];

export function passwordScore(value: string) {
  return value ? criteria.filter(item => item.test(value)).length : 0;
}

export function PasswordStrength({ value }: { value: string }) {
  const score = passwordScore(value);
  return <div className="lab-strength" data-score={score}>
    <div className="lab-strength-bars" aria-hidden="true">{criteria.map((_, index) => <span key={index} className={index < score ? 'on' : ''}/>)}</div>
    <p aria-live="polite">Robustesse : <strong>{value ? levels[score] : '—'}</strong></p>
    <ul>{criteria.map(item => { const passed = item.test(value); return <li key={item.label} className={passed ? 'passed' : ''}>{passed ? <Check size={12}/> : <X size={12}/>}{item.label}</li>; })}</ul>
  </div>;
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const id = useId();
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setStatus('copied');
    } catch {
      setStatus('error');
    }
    window.setTimeout(() => setStatus('idle'), 2000);
  };
  return <div className="lab-copy">
    <label className="field-label" htmlFor={id}>{label}</label>
    <div className="input-wrap"><input id={id} value={value} readOnly onFocus={event => event.target.select()}/><button type="button" onClick={copy} aria-label={`Copier ${label}`}>{status === 'copied' ? <Check size={16}/> : <Copy size={16}/>}</button></div>
    <p className={`lab-hint ${status === 'error' ? 'lab-error-text' : ''}`} aria-live="polite">{status === 'copied' ? 'Copié dans le presse-papiers.' : status === 'error' ? 'Copie refusée par le navigateur : sélectionnez le texte.' : 'Cliquez pour copier.'}</p>
  </div>;
}
