import { AlertTriangle, BellRing, CheckCircle2, CircleAlert } from 'lucide-react';
import { Badge, Button } from '@/components/ui';
import { type Notify, type ToastPosition } from '@/components/useToasts';

export default function ToastShowcase({
  notify,
  position,
  onPositionChange,
}: {
  notify: Notify;
  position: ToastPosition;
  onPositionChange: (position: ToastPosition) => void;
}) {
  return (
    <article className="specimen toast-showcase">
      <div className="specimen-label">
        10 <span>Notifications & alertes</span>
        <BellRing size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Un retour clair, sans interrompre.</h3>
          <p>Déclenchez plusieurs alertes pour tester leur empilement.</p>
        </div>
        <Badge>Aperçu interactif</Badge>
      </div>
      <div className="toast-position-control">
        <label htmlFor="toast-position">Position à l’écran</label>
        <select
          id="toast-position"
          value={position}
          onChange={event => onPositionChange(event.target.value as ToastPosition)}
        >
          <option value="top-left">En haut à gauche</option>
          <option value="top-center">En haut au centre</option>
          <option value="top-right">En haut à droite</option>
          <option value="bottom-left">En bas à gauche</option>
          <option value="bottom-center">En bas au centre</option>
          <option value="bottom-right">En bas à droite</option>
        </select>
        <span>Les alertes visibles se déplacent immédiatement.</span>
      </div>
      <div className="toast-examples">
        <div>
          <span className="toast-example-icon toast-success">
            <CheckCircle2 size={23} />
          </span>
          <h3>Succès</h3>
          <p>Confirmez une action terminée. Disparaît après 6 secondes.</p>
          <Button
            variant="secondary"
            onClick={() => notify('Exemple : vos modifications ont bien été enregistrées.', 'success')}
          >
            Tester le succès
          </Button>
        </div>
        <div>
          <span className="toast-example-icon toast-warning">
            <AlertTriangle size={23} />
          </span>
          <h3>Attention</h3>
          <p>Signalez un point à vérifier sans bloquer la navigation.</p>
          <Button
            variant="secondary"
            onClick={() => notify('Exemple : votre espace de stockage est presque plein.', 'warning')}
          >
            Tester l’avertissement
          </Button>
        </div>
        <div>
          <span className="toast-example-icon toast-error">
            <CircleAlert size={23} />
          </span>
          <h3>Erreur</h3>
          <p>Reste visible jusqu’à sa fermeture pour ne pas être manquée.</p>
          <Button
            variant="secondary"
            onClick={() => notify('Exemple : l’enregistrement a échoué. Veuillez réessayer.', 'error')}
          >
            Tester l’erreur
          </Button>
        </div>
      </div>
      <p className="demo-note">
        Alertes de démonstration · 4 notifications maximum · La fermeture automatique est suspendue au survol
        et au focus.
      </p>
    </article>
  );
}
