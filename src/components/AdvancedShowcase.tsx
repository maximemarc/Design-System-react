import { useState } from 'react';
import '@/components/advanced.css';
import { Archive, ArrowRight, Check, FileText, ShieldCheck, Table2, Users } from 'lucide-react';
import DataTable, { type TableColumn } from '@/components/DataTable';
import { Badge, Button, Modal } from '@/components/ui';

type Member = { id: string; name: string; email: string; role: string; active: boolean };
const members: Member[] = [
  { id: 'AL', name: 'Alex Laurent', email: 'alex@exemple.fr', role: 'Design', active: true },
  { id: 'ML', name: 'Marie Leroy', email: 'marie@exemple.fr', role: 'Produit', active: true },
  { id: 'JD', name: 'Jules Dubois', email: 'jules@exemple.fr', role: 'Développement', active: false },
  { id: 'SC', name: 'Sarah Chen', email: 'sarah@exemple.fr', role: 'Design', active: true },
  { id: 'NB', name: 'Noah Bernard', email: 'noah@exemple.fr', role: 'Marketing', active: false },
  { id: 'EM', name: 'Emma Martin', email: 'emma@exemple.fr', role: 'Produit', active: true },
  { id: 'LR', name: 'Léa Robert', email: 'lea@exemple.fr', role: 'Design', active: true },
  { id: 'TM', name: 'Thomas Moreau', email: 'thomas@exemple.fr', role: 'Développement', active: true },
];
const columns: TableColumn<Member>[] = [
  { key: 'name', label: 'Membre', sortValue: row => row.name, render: row => <div className="table-member"><span className="avatar">{row.id}</span><div><strong>{row.name}</strong><span>{row.email}</span></div></div> },
  { key: 'role', label: 'Équipe', sortValue: row => row.role, render: row => row.role },
  { key: 'status', label: 'Statut', sortValue: row => row.active ? 1 : 0, render: row => <Badge tone={row.active ? 'success' : 'neutral'}>{row.active ? 'Actif' : 'En attente'}</Badge> },
];
const matchesSearch = (row: Member, query: string) => `${row.name} ${row.email} ${row.role}`.toLocaleLowerCase('fr').includes(query);

export default function AdvancedShowcase({ notify }: { notify: (message: string) => void }) {
  const [dialog, setDialog] = useState<'form' | 'confirm' | 'details' | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1);
  const [archived, setArchived] = useState(false);
  const close = () => setDialog(null);
  return <div className="advanced-gallery">
    <article className="specimen advanced-table-card"><div className="specimen-label">07 <span>Tableau de données</span><Table2 size={17}/></div><div className="advanced-heading"><div><h3>Une équipe, une vue claire.</h3><p>Recherche, tri, sélection et pagination.</p></div><Badge>Données de démonstration</Badge></div><DataTable rows={members} columns={columns} getId={row => row.id} matchesSearch={matchesSearch} caption="Membres de l’équipe de démonstration" /></article>
    <article className="specimen"><div className="specimen-label">08 <span>Dialogues & parcours</span><Users size={17}/></div><div className="advanced-heading"><div><h3>La bonne action, au bon moment.</h3><p>Des fenêtres accessibles pour les parcours plus avancés.</p></div></div><div className="dialog-examples">
      <div><span className="dialog-example-icon"><FileText size={20}/></span><h3>Création guidée</h3><p>Un formulaire en deux étapes, avec récapitulatif avant validation.</p><Button variant="secondary" onClick={() => { setName(''); setDescription(''); setStep(1); setDialog('form'); }}>Tester le formulaire <ArrowRight size={14}/></Button></div>
      <div><span className="dialog-example-icon"><Archive size={20}/></span><h3>Confirmation</h3><p>{archived ? 'L’exemple est archivé. Vous pouvez le restaurer.' : 'Une action explicite, précédée d’une confirmation.'}</p><Button variant="secondary" onClick={() => { if (archived) { setArchived(false); notify('Exemple restauré dans cette démonstration.'); } else setDialog('confirm'); }}>{archived ? 'Restaurer l’exemple' : 'Archiver l’exemple'} <ArrowRight size={14}/></Button></div>
      <div><span className="dialog-example-icon"><ShieldCheck size={20}/></span><h3>Vue détaillée</h3><p>Présentez les informations essentielles sans quitter la galerie.</p><Button variant="secondary" onClick={() => setDialog('details')}>Ouvrir les détails <ArrowRight size={14}/></Button></div>
    </div><p className="demo-note">Démonstrations temporaires : aucune donnée n’est enregistrée.</p></article>
    <Modal open={dialog === 'form'} onClose={close} title={step === 1 ? 'Imaginer un nouveau projet' : 'Tout est prêt ?'}>
      <div className="dialog-progress"><span className={step === 1 ? 'current' : ''}>01 · Informations</span><ArrowRight size={13}/><span className={step === 2 ? 'current' : ''}>02 · Vérification</span></div>
      {step === 1 ? <form className="dialog-form" onSubmit={event => { event.preventDefault(); if (name.trim()) setStep(2); }}><label htmlFor="project-name">Nom du projet</label><input id="project-name" autoFocus required maxLength={80} pattern=".*\S.*" placeholder="Votre prochaine grande idée" value={name} onChange={event => setName(event.target.value)}/><label htmlFor="project-description">Description <span>facultatif</span></label><textarea id="project-description" rows={3} maxLength={300} placeholder="Quelques mots pour poser les bases…" value={description} onChange={event => setDescription(event.target.value)}/><div className="dialog-footer"><Button type="button" variant="secondary" onClick={close}>Annuler</Button><Button type="submit">Continuer <ArrowRight size={15}/></Button></div></form> : <><dl className="dialog-summary"><dt>Nom du projet</dt><dd>{name.trim()}</dd><dt>Description</dt><dd>{description.trim() || 'Aucune description'}</dd></dl><p className="demo-note">Ce parcours illustre une création : aucun projet ne sera enregistré.</p><div className="dialog-footer"><Button variant="secondary" onClick={() => setStep(1)}>Retour</Button><Button onClick={() => { close(); notify(`Parcours terminé pour « ${name.trim()} ». Démonstration uniquement.`); }}>Valider l’exemple <Check size={15}/></Button></div></>}
    </Modal>
    <Modal open={dialog === 'confirm'} onClose={close} title="Archiver cet exemple ?"><p className="modal-copy">L’exemple sera marqué comme archivé dans cette galerie. Vous pourrez le restaurer à tout moment ; aucune donnée réelle ne sera modifiée.</p><div className="dialog-footer"><Button variant="secondary" autoFocus onClick={close}>Garder l’exemple</Button><Button onClick={() => { setArchived(true); close(); notify('Exemple archivé. La restauration reste disponible.'); }}><Archive size={15}/>Confirmer l’archivage</Button></div></Modal>
    <Modal open={dialog === 'details'} onClose={close} title="Une équipe bien entourée"><p className="modal-copy">Un aperçu des membres affichés dans le tableau, dans une fenêtre dédiée.</p><dl className="dialog-summary"><dt>Membres</dt><dd>{members.length} personnes</dd><dt>Statut</dt><dd>{members.filter(row => row.active).length} actifs · {members.filter(row => !row.active).length} en attente</dd><dt>Équipes</dt><dd>Design, Produit, Développement et Marketing</dd></dl><div className="dialog-footer"><Button onClick={close}>Revenir à la galerie <ArrowRight size={15}/></Button></div></Modal>
  </div>;
}
