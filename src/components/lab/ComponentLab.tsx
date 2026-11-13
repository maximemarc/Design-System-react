import { useState } from 'react';
import { Check, Code2, Copy, FlaskConical, Search } from 'lucide-react';
import { Badge } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { labCatalog, type LabCategory, type LabEntry } from '@/components/lab/labCatalog';
import '@/components/lab/lab.css';

const categories: ('Tous' | LabCategory)[] = ['Tous', 'Navigation', 'Saisie', 'Affichage', 'Flux de travail'];
const labStartNumber = 16;

function LabCard({ entry, number, notify }: { entry: LabEntry; number: number; notify: Notify }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(entry.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      notify('Copie refusée par le navigateur. Sélectionnez le code manuellement.', 'warning');
    }
  };
  const { Demo } = entry;
  return <article className={`specimen lab-card lab-card-${entry.id}`}>
    <div className="specimen-label">{number} <span>{entry.name}</span><Badge>{entry.category}</Badge></div>
    <p className="lab-card-description">{entry.description}</p>
    <div className="lab-demo"><Demo notify={notify}/></div>
    <div className="lab-card-footer">
      <button type="button" className="lab-code-toggle" aria-expanded={showCode} onClick={() => setShowCode(!showCode)}><Code2 size={14}/>{showCode ? 'Masquer le code' : 'Voir le code'}</button>
      {showCode && <button type="button" className="lab-code-toggle" onClick={copy}>{copied ? <Check size={14}/> : <Copy size={14}/>}{copied ? 'Copié' : 'Copier'}</button>}
    </div>
    {showCode && <pre className="lab-code"><code>{entry.code}</code></pre>}
  </article>;
}

export default function ComponentLab({ notify }: { notify: Notify }) {
  const [category, setCategory] = useState<(typeof categories)[number]>('Tous');
  const [query, setQuery] = useState('');
  const normalized = query.trim().toLocaleLowerCase();
  const visible = labCatalog.map((entry, index) => ({ entry, number: labStartNumber + index })).filter(({ entry }) => (category === 'Tous' || entry.category === category) && `${entry.name} ${entry.description}`.toLocaleLowerCase().includes(normalized));
  return <section className="lab-section" aria-labelledby="lab-title">
    <div className="lab-header">
      <div><span className="eyebrow"><FlaskConical size={13}/> Laboratoire</span><h2 id="lab-title">{labCatalog.length} composants prêts à composer.</h2><p>Chaque pièce suit vos couleurs, arrondis et animations. Testez-la, puis copiez son exemple.</p></div>
      <div className="lab-search input-wrap"><Search size={15}/><input aria-label="Filtrer les composants" placeholder="Filtrer…" value={query} onChange={event => setQuery(event.target.value)}/></div>
    </div>
    <div className="lab-filters" role="group" aria-label="Catégories">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} className={category === item ? 'selected' : ''} onClick={() => setCategory(item)}>{item}<span>{item === 'Tous' ? labCatalog.length : labCatalog.filter(entry => entry.category === item).length}</span></button>)}</div>
    {visible.length ? <div className="lab-grid">{visible.map(({ entry, number }) => <LabCard key={entry.id} entry={entry} number={number} notify={notify}/>)}</div> : <div className="lab-empty"><strong>Aucun composant trouvé</strong><p>Essayez un autre mot ou une autre catégorie.</p><button type="button" className="lab-code-toggle" onClick={() => { setQuery(''); setCategory('Tous'); }}>Réinitialiser les filtres</button></div>}
  </section>;
}
