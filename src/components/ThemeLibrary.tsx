import { useState } from 'react';
import { Check, Download, Pencil, Plus, Save, Trash2 } from 'lucide-react';
import { backgroundIcons, seasons } from '@/components/seasons';
import { Badge, Button, Modal } from '@/components/ui';
import { type SavedTheme, type ThemeConfiguration } from '@/components/themeConfiguration';
import { type Notify } from '@/components/useToasts';
import '@/components/themes.css';

export default function ThemeLibrary({ current, savedThemes, saveThemes, storageError, onApply, onAccentChange, onExport, notify }: {
  current: ThemeConfiguration; savedThemes: SavedTheme[]; saveThemes: (themes: SavedTheme[]) => boolean; storageError: string;
  onApply: (theme: ThemeConfiguration) => void; onAccentChange: (color: string) => void; onExport: () => void; notify: Notify;
}) {
  const [name, setName] = useState('');
  const [edit, setEdit] = useState<SavedTheme | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState('');
  const currentSeason = seasons.find(item => item.id === current.season)!;
  const currentIcon = backgroundIcons.find(item => item.id === current.backgroundIcon);
  const Icon = currentIcon?.icon ?? currentSeason.icon;
  const isDuplicate = (value: string, except?: string) => savedThemes.some(item => item.id !== except && item.name.toLocaleLowerCase('fr') === value.toLocaleLowerCase('fr'));
  const add = () => {
    const trimmed = name.trim();
    if (!trimmed) { setMessage('Donnez un nom à votre combinaison.'); return; }
    if (isDuplicate(trimmed)) { setMessage('Ce nom est déjà utilisé. Choisissez un autre nom.'); return; }
    if (savedThemes.length >= 20) { setMessage('Vous avez atteint la limite de 20 thèmes. Retirez un thème pour continuer.'); return; }
    if (saveThemes([...savedThemes, { id: crypto.randomUUID(), name: trimmed, configuration: { ...current } }])) {
      setName(''); setMessage(''); notify(`« ${trimmed} » est sauvegardé dans ce navigateur.`);
    }
  };
  return <div className="theme-library"><article className="specimen theme-current"><div className="theme-library-title"><div><span className="eyebrow">VOTRE SIGNATURE</span><h3>Composez. Sauvegardez. Retrouvez.</h3><p>Choisissez une ambiance et un symbole dans « À votre image », puis donnez un nom à votre combinaison.</p></div><span className="theme-current-icon"><Icon size={38}/></span></div><div className="theme-current-details"><Badge tone="accent">{currentSeason.name}</Badge><Badge>{current.dark ? 'Sombre' : 'Clair'}</Badge><Badge>{currentIcon?.name ?? 'Symbole du thème'}</Badge><Badge>{current.motifs ? 'Motifs visibles' : 'Sans motifs'}</Badge></div><div className="theme-save-controls"><label className="theme-color-control">Couleur personnalisée<input type="color" aria-label="Couleur personnalisée du thème" value={current.accent} onChange={event => onAccentChange(event.target.value)}/><span>{current.accent.toUpperCase()}</span></label><form onSubmit={event => { event.preventDefault(); add(); }}><label className="field-label" htmlFor="saved-theme-name">Nom de la combinaison</label><div className="theme-name-row"><input id="saved-theme-name" placeholder="Mon Noël bleu, mariage pastel…" maxLength={60} value={name} onChange={event => { setName(event.target.value); setMessage(''); }} required/><Button type="submit"><Save size={15}/>Sauvegarder</Button></div></form></div>{message && <p className="theme-library-error" role="alert">{message}</p>}{storageError && <p className="theme-library-error" role="alert">{storageError}</p>}<p className="demo-note">Vos combinaisons restent privées dans ce navigateur, y compris après rechargement. Elles ne sont pas synchronisées entre appareils.</p></article>
    <div className="saved-themes-heading"><h3>Mes combinaisons <span>{savedThemes.length} / 20</span></h3><Button variant="secondary" onClick={onExport}><Download size={15}/>Exporter la configuration</Button></div>
    {!savedThemes.length ? <div className="theme-empty"><Plus size={28}/><h3>Une collection à votre image.</h3><p>Votre première combinaison apparaîtra ici après sauvegarde.</p></div> : <div className="saved-themes-grid">{savedThemes.map(item => {
      const season = seasons.find(value => value.id === item.configuration.season)!;
      const symbol = backgroundIcons.find(value => value.id === item.configuration.backgroundIcon);
      const SavedIcon = symbol?.icon ?? season.icon;
      const active = JSON.stringify(item.configuration) === JSON.stringify(current);
      return <article className="specimen saved-theme-card" key={item.id}><div className={`saved-theme-preview ${item.configuration.dark ? 'preview-dark' : ''}`}><SavedIcon size={50} style={{ color: item.configuration.accent }}/><div className="saved-theme-mini-lines"><span/><span/></div><i style={{ background: item.configuration.accent, borderRadius: item.configuration.radius }}/></div><div className="saved-theme-title"><h3>{item.name}</h3>{active && <Badge tone="success"><Check size={10}/>Actif</Badge>}</div><p>{season.name} · {item.configuration.dark ? 'Sombre' : 'Clair'} · {symbol?.name ?? 'Symbole du thème'}</p><div className="saved-theme-actions"><Button variant={active ? 'secondary' : 'primary'} size="small" onClick={() => { onApply(item.configuration); notify(`Thème « ${item.name} » appliqué.`); }}>{active ? 'Réappliquer' : 'Appliquer'}</Button><button className="icon-button" aria-label={`Renommer ${item.name}`} onClick={() => { setEdit(item); setEditName(item.name); setMessage(''); }}><Pencil size={15}/></button><button className="icon-button" aria-label={`Retirer ${item.name}`} onClick={() => { if (saveThemes(savedThemes.filter(value => value.id !== item.id))) notify(`« ${item.name} » retiré de vos combinaisons.`); }}><Trash2 size={15}/></button></div></article>;
    })}</div>}
    <Modal open={Boolean(edit)} onClose={() => { setEdit(null); setMessage(''); }} title="Renommer la combinaison"><form className="dialog-form" onSubmit={event => { event.preventDefault(); const trimmed = editName.trim(); if (!edit || !trimmed) return; if (isDuplicate(trimmed, edit.id)) { setMessage('Ce nom est déjà utilisé.'); return; } if (saveThemes(savedThemes.map(item => item.id === edit.id ? { ...item, name: trimmed } : item))) { setEdit(null); setMessage(''); notify('Le nom de votre combinaison a été mis à jour.'); } }}><label htmlFor="rename-theme">Nouveau nom</label><input id="rename-theme" autoFocus required maxLength={60} value={editName} onChange={event => setEditName(event.target.value)}/>{message && <p className="theme-library-error" role="alert">{message}</p>}<div className="dialog-footer"><Button type="button" variant="secondary" onClick={() => setEdit(null)}>Annuler</Button><Button type="submit">Enregistrer</Button></div></form></Modal>
  </div>;
}
