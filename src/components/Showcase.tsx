import { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  Layers,
  Mail,
  MoreHorizontal,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, Modal, Switch } from '@/components/ui';
import AdvancedShowcase from '@/components/AdvancedShowcase';
import FileUpload from '@/components/FileUpload';
import ToastShowcase from '@/components/ToastShowcase';
import InteractiveShowcase from '@/components/InteractiveShowcase';
import EventCountdown from '@/components/EventCountdown';
import WeddingInvitation from '@/components/WeddingInvitation';
import SeatingPlanner from '@/components/SeatingPlanner';
import ComponentLab from '@/components/lab/ComponentLab';
import LabExamples from '@/components/lab/LabExamples';
import { useWeddingSettings } from '@/components/useWeddingSettings';
import { type Notify, type ToastPosition } from '@/components/useToasts';

export default function Showcase({
  notify,
  toastPosition,
  onToastPositionChange,
}: {
  notify: Notify;
  toastPosition: ToastPosition;
  onToastPositionChange: (position: ToastPosition) => void;
}) {
  const wedding = useWeddingSettings();
  const [notifications, setNotifications] = useState(true);
  const [updates, setUpdates] = useState(false);
  const [tab, setTab] = useState('Mensuel');
  const [email, setEmail] = useState('');
  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState('Design');
  return (
    <>
      <div className="showcase-grid">
        <article className="specimen actions-card">
          <div className="specimen-label">
            01 <span>Boutons & actions</span>
            <MoreHorizontal size={17} />
          </div>
          <div className="action-samples">
            <Button onClick={() => notify('Votre prochaine idée commence ici.')}>
              <Plus size={16} />
              Créer un projet
            </Button>
            <Button
              variant="secondary"
              onClick={() => notify('Votre téléchargement est prêt dans Exporter le thème.')}
            >
              <Download size={16} />
              Télécharger
            </Button>
            <Button variant="ghost" onClick={() => setModal(true)}>
              En savoir plus <ArrowRight size={16} />
            </Button>
          </div>
          <div className="sample-bottom">
            <Button size="small" onClick={() => notify('Modifications confirmées.')}>
              <Check size={14} />
              Confirmer
            </Button>
            <Button size="small" variant="secondary" disabled>
              Indisponible
            </Button>
            <button
              className="square-button"
              aria-label="Envoyer"
              onClick={() => notify('Action exécutée avec succès.')}
            >
              <Send size={17} />
            </button>
          </div>
        </article>
        <article className="specimen form-card">
          <div className="specimen-label">
            02 <span>Champs & sélection</span>
            <MoreHorizontal size={17} />
          </div>
          <form
            onSubmit={event => {
              event.preventDefault();
              notify(`Invitation prête pour ${email}. Démonstration : aucun e-mail envoyé.`);
            }}
          >
            <label className="field-label" htmlFor="email">
              Adresse e-mail
            </label>
            <div className="input-wrap">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
              />
              <button aria-label="Valider l’adresse e-mail" type="submit">
                <ArrowRight size={16} />
              </button>
            </div>
            <label className="field-label select-label" htmlFor="role">
              Votre espace de travail
            </label>
            <div className="input-wrap">
              <Layers size={16} />
              <select id="role" value={selected} onChange={event => setSelected(event.target.value)}>
                <option>Design</option>
                <option>Développement</option>
                <option>Marketing</option>
              </select>
              <ChevronDown size={15} />
            </div>
          </form>
        </article>
        <article className="specimen preferences-card">
          <div className="specimen-label">
            03 <span>Préférences</span>
            <MoreHorizontal size={17} />
          </div>
          <div className="preference-row">
            <div>
              <strong>Notifications</strong>
              <p>Gardez une longueur d’avance.</p>
            </div>
            <Switch checked={notifications} onChange={setNotifications} label="Notifications" />
          </div>
          <div className="preference-row">
            <div>
              <strong>Mises à jour produit</strong>
              <p>Seulement l’essentiel.</p>
            </div>
            <Switch checked={updates} onChange={setUpdates} label="Mises à jour produit" />
          </div>
          <div className="status-chips">
            <Badge tone="success">
              <span className="status-dot" />
              Actif
            </Badge>
            <Badge tone="accent">Nouveau</Badge>
            <Badge>En attente</Badge>
          </div>
        </article>
        <article className="specimen metric-card">
          <div className="specimen-label">
            04 <span>Statistiques</span>
            <MoreHorizontal size={17} />
          </div>
          <div className="metric-head">
            <span>Revenus totaux</span>
            <TrendingUp size={18} />
          </div>
          <div className="metric-number">
            24 680 € <Badge tone="success">↗ 12,8 %</Badge>
          </div>
          <div className="chart" aria-label="Graphique de revenus croissants">
            <svg
              viewBox="0 0 320 74"
              preserveAspectRatio="none"
              role="img"
              aria-label="Courbe de progression"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity=".18" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0 63 C15 63 17 47 32 51 S53 66 69 44 S90 60 109 35 S132 50 150 30 S170 40 185 24 S206 39 224 18 S245 30 263 12 S294 21 320 2 L320 74 L0 74Z"
                fill="url(#chart-fill)"
              />
              <path
                d="M0 63 C15 63 17 47 32 51 S53 66 69 44 S90 60 109 35 S132 50 150 30 S170 40 185 24 S206 39 224 18 S245 30 263 12 S294 21 320 2"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
              />
            </svg>
          </div>
          <div className="chart-labels">
            <span>1 juin</span>
            <span>15 juin</span>
            <span>30 juin</span>
          </div>
        </article>
        <article className="specimen profile-card">
          <div className="specimen-label">
            05 <span>Cartes & profils</span>
            <MoreHorizontal size={17} />
          </div>
          <div className="profile">
            <div className="avatar avatar-main">
              AL
              <span />
            </div>
            <div>
              <h3>Alex Laurent</h3>
              <p>Product designer</p>
            </div>
            <Badge tone="accent">Pro</Badge>
          </div>
          <p className="profile-description">
            Des idées aux interfaces. Toujours à la recherche du prochain détail qui fait la différence.
          </p>
          <div className="profile-footer">
            <div className="avatar-stack">
              <span>ML</span>
              <span>JD</span>
              <span>SC</span>
              <span>+4</span>
            </div>
            <Button variant="secondary" size="small" onClick={() => setModal(true)}>
              Voir le profil <ArrowRight size={13} />
            </Button>
          </div>
        </article>
        <article className="specimen pricing-card">
          <div className="specimen-label">
            06 <span>Onglets & offres</span>
            <MoreHorizontal size={17} />
          </div>
          <div className="segmented" role="tablist" aria-label="Période de facturation">
            {['Mensuel', 'Annuel'].map(value => (
              <button
                key={value}
                role="tab"
                aria-selected={tab === value}
                className={tab === value ? 'selected' : ''}
                onClick={() => setTab(value)}
              >
                {value}
                {value === 'Annuel' && <span>−20 %</span>}
              </button>
            ))}
          </div>
          <div className="plan-price">
            {tab === 'Mensuel' ? '19' : '15,20'} € <span>/ mois</span>
            <Sparkles size={20} />
          </div>
          <p>Tout ce qu’il faut pour aller plus loin.</p>
          <Button
            variant="secondary"
            onClick={() => notify('Offre de démonstration : aucun paiement demandé.')}
          >
            <CreditCard size={16} />
            Découvrir l’offre <ArrowRight size={15} />
          </Button>
        </article>
      </div>
      <AdvancedShowcase notify={notify} />
      <FileUpload />
      <ToastShowcase notify={notify} position={toastPosition} onPositionChange={onToastPositionChange} />
      <InteractiveShowcase notify={notify} />
      {wedding.storageError && (
        <p className="theme-library-error" role="alert">
          {wedding.storageError}
        </p>
      )}
      <EventCountdown settings={wedding.settings} setSettings={wedding.setSettings} />
      <WeddingInvitation
        notify={notify}
        settings={wedding.settings}
        reply={wedding.reply}
        setReply={wedding.setReply}
      />
      <SeatingPlanner couple={`${wedding.settings.first} & ${wedding.settings.second}`} notify={notify} />
      <ComponentLab notify={notify} />
      <LabExamples notify={notify} />
      <Modal open={modal} onClose={() => setModal(false)} title="Le détail fait la différence">
        <div className="modal-profile">
          <div className="avatar avatar-main">AL</div>
          <h3>Alex Laurent</h3>
          <p>Product designer · Paris</p>
        </div>
        <p className="modal-copy">
          Une carte devient un profil complet, dans une fenêtre accessible au clavier. Personnalisez ce modèle
          pour présenter votre équipe ou vos utilisateurs.
        </p>
        <Button
          onClick={() => {
            setModal(false);
            notify('Vous suivez maintenant Alex dans cette démonstration.');
          }}
        >
          Suivre Alex <Plus size={16} />
        </Button>
      </Modal>
    </>
  );
}
