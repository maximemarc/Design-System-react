import { useState } from 'react';
import { CalendarPlus, CircleCheck, Heart, Mail, Search } from 'lucide-react';
import { Badge, Button, Modal } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { type WeddingReply, type WeddingSettings } from '@/components/useWeddingSettings';
import '@/components/wedding.css';

export default function WeddingInvitation({
  notify,
  settings,
  reply,
  setReply,
}: {
  notify: Notify;
  settings: WeddingSettings;
  reply: WeddingReply | null;
  setReply: (value: WeddingReply) => void;
}) {
  const couple = `${settings.first} & ${settings.second}`;
  const eventDate = new Date(settings.date);
  const eventLabel = new Intl.DateTimeFormat('fr', { dateStyle: 'full', timeStyle: 'short' }).format(
    eventDate,
  );
  const formatCalendarDate = (date: Date) =>
    `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}00`;
  const [dialog, setDialog] = useState<'invitation' | 'reply' | 'agenda' | 'resend' | null>(null);
  const [name, setName] = useState(reply?.name ?? '');
  const [attending, setAttending] = useState(reply?.attending ?? true);
  const [guests, setGuests] = useState(reply?.attending ? reply.guests : 1);
  const [email, setEmail] = useState('');
  const [resendDone, setResendDone] = useState(false);
  const close = () => setDialog(null);
  const calendar = () => {
    const escaped = couple
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;');
    const stamp = new Date()
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
    const content =
      [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//forma//Wedding showcase//FR',
        'BEGIN:VEVENT',
        'UID:forma-wedding-demo-20270626',
        `DTSTAMP:${stamp}`,
        `DTSTART:${formatCalendarDate(eventDate)}`,
        `DTEND:${formatCalendarDate(new Date(eventDate.getTime() + 9 * 3600000))}`,
        `SUMMARY:Mariage de ${escaped}`,
        'DESCRIPTION:Événement de démonstration forma. Horaires en heure locale.',
        'END:VEVENT',
        'END:VCALENDAR',
      ].join('\r\n') + '\r\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'text/calendar;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mariage-demo.ics';
    link.click();
    URL.revokeObjectURL(url);
    notify('L’événement de démonstration a été téléchargé. Ouvrez-le dans votre agenda.');
  };
  const steps = [
    {
      title: 'Votre invitation',
      description: 'Un lien personnel ouvre votre formulaire de réponse.',
      icon: Mail,
      dialog: 'invitation' as const,
    },
    {
      title: 'Votre réponse',
      description: 'Confirmez votre présence et le nombre de personnes.',
      icon: CircleCheck,
      dialog: 'reply' as const,
    },
    {
      title: 'Votre agenda',
      description: 'Retrouvez la date dans votre calendrier après confirmation.',
      icon: CalendarPlus,
      dialog: 'agenda' as const,
    },
  ];
  return (
    <article className="specimen wedding-invitation-card">
      <div className="specimen-label">
        14 <span>Invitation, réponse & agenda</span>
        <Badge>Démo interactive</Badge>
      </div>
      <div className="wedding-invitation-preview">
        <header>
          <h2>Comment répondre</h2>
          <p>Votre invitation vous accompagne à chaque étape.</p>
        </header>
        <ol className="invitation-steps">
          {steps.map(({ title, description, icon: Icon, dialog: type }, index) => (
            <li key={title}>
              <button onClick={() => setDialog(type)}>
                <span className="invitation-step-icon">
                  <Icon size={25} />
                  <span>{index + 1}</span>
                </span>
                <strong>{title}</strong>
                <p>{description}</p>
              </button>
            </li>
          ))}
        </ol>
        {reply && (
          <div className="wedding-reply-status" role="status">
            <CircleCheck size={20} />
            <span>
              {reply.name},{' '}
              {reply.attending
                ? `présence confirmée pour ${reply.guests} personne(s)`
                : 'votre absence a été notée'}{' '}
              dans cette démonstration.
            </span>
            <button onClick={() => setDialog('reply')}>Modifier</button>
          </div>
        )}
        <section className="invitation-recovery">
          <Search size={22} />
          <h3>Vous avez perdu votre invitation ?</h3>
          <p>Essayez le formulaire de rappel d’invitation, sans envoi réel.</p>
          <Button
            onClick={() => {
              setResendDone(false);
              setEmail('');
              setDialog('resend');
            }}
          >
            <Mail size={16} />
            Me renvoyer mon invitation
          </Button>
        </section>
        <footer className="wedding-signature">
          <Heart size={23} />
          <span>{couple}</span>
        </footer>
      </div>
      <p className="demo-note">
        Votre réponse est mémorisée dans ce navigateur. Aucun lien personnel ni e-mail n’est envoyé. L’ajout à
        l’agenda télécharge un événement de démonstration.
      </p>
      <Modal open={dialog === 'invitation'} onClose={close} title="Votre invitation personnelle">
        <p className="modal-copy">
          Dans une application réelle, chaque invité reçoit un lien personnel. Cette galerie vous permet de
          découvrir le parcours sans lien ni invitation réelle.
        </p>
        <div className="wedding-event-details">
          <Heart size={24} />
          <strong>{couple}</strong>
          <span>{eventLabel} · heure locale</span>
        </div>
        <div className="dialog-footer">
          <Button onClick={() => setDialog('reply')}>Répondre à l’exemple</Button>
        </div>
      </Modal>
      <Modal open={dialog === 'reply'} onClose={close} title="Votre réponse">
        <form
          className="dialog-form"
          onSubmit={event => {
            event.preventDefault();
            if (!name.trim()) return;
            setReply({ name: name.trim(), attending, guests: attending ? guests : 0 });
            close();
            notify('Votre réponse de démonstration est affichée. Aucune réponse réelle envoyée.');
          }}
        >
          <label htmlFor="wedding-guest-name">Votre prénom</label>
          <input
            id="wedding-guest-name"
            required
            pattern=".*\S.*"
            maxLength={60}
            autoComplete="given-name"
            value={name}
            onChange={event => setName(event.target.value)}
          />
          <fieldset className="wedding-attendance">
            <legend>Participerez-vous ?</legend>
            <label>
              <input type="radio" name="attendance" checked={attending} onChange={() => setAttending(true)} />
              Avec plaisir
            </label>
            <label>
              <input
                type="radio"
                name="attendance"
                checked={!attending}
                onChange={() => setAttending(false)}
              />
              Je ne pourrai pas venir
            </label>
          </fieldset>
          {attending && (
            <>
              <label htmlFor="wedding-guests">Nombre de personnes, vous inclus</label>
              <select
                id="wedding-guests"
                value={guests}
                onChange={event => setGuests(Number(event.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map(value => (
                  <option key={value} value={value}>
                    {value} personne{value > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </>
          )}
          <p className="demo-note">
            Cette réponse est conservée uniquement dans ce navigateur, sans envoi réel.
          </p>
          <div className="dialog-footer">
            <Button variant="secondary" onClick={close}>
              Annuler
            </Button>
            <Button type="submit">Confirmer l’exemple</Button>
          </div>
        </form>
      </Modal>
      <Modal open={dialog === 'agenda'} onClose={close} title="Votre agenda">
        <p className="modal-copy">
          {eventLabel}, en heure locale. Le fichier téléchargé reprend la date choisie et prévoit une durée de
          neuf heures. Ouvrez-le dans votre application de calendrier.
        </p>
        {reply?.attending ? (
          <Button onClick={calendar}>
            <CalendarPlus size={18} />
            Télécharger l’événement (.ics)
          </Button>
        ) : (
          <>
            <p className="modal-copy">
              Confirmez votre présence dans l’exemple pour débloquer l’ajout à l’agenda.
            </p>
            <Button onClick={() => setDialog('reply')}>Répondre d’abord</Button>
          </>
        )}
      </Modal>
      <Modal open={dialog === 'resend'} onClose={close} title="Retrouver votre invitation">
        {resendDone ? (
          <>
            <div className="wedding-recovery-success" role="status">
              <CircleCheck size={32} />
              <h3>Demande de démonstration terminée</h3>
              <p>
                Dans une application réelle, un lien serait envoyé si cette adresse correspond à une
                invitation. Aucun e-mail n’a été envoyé ici.
              </p>
            </div>
            <div className="dialog-footer">
              <Button onClick={close}>Fermer</Button>
            </div>
          </>
        ) : (
          <form
            className="dialog-form"
            onSubmit={event => {
              event.preventDefault();
              setResendDone(true);
            }}
          >
            <p className="modal-copy">Testez le rappel d’invitation avec une adresse de démonstration.</p>
            <label htmlFor="wedding-email">Adresse e-mail</label>
            <input
              id="wedding-email"
              type="email"
              required
              maxLength={254}
              placeholder="vous@exemple.fr"
              value={email}
              onChange={event => setEmail(event.target.value)}
            />
            <div className="dialog-footer">
              <Button variant="secondary" onClick={close}>
                Annuler
              </Button>
              <Button type="submit">Tester le rappel</Button>
            </div>
          </form>
        )}
      </Modal>
    </article>
  );
}
