import '@/components/templates/forms.css';
import {
  useEffect,
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { flushSync } from 'react-dom';
import {
  Bell,
  CheckCircle2,
  CircleAlert,
  Command as CommandIcon,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Layers,
  LifeBuoy,
  Lock,
  Mail,
  Palette,
  Paperclip,
  Phone,
  RotateCcw,
  Save,
  Send,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  User,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Badge, Button, Switch } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import { createId } from '@/components/createId';
import { Callout } from '@/components/dashboard';
import { ColorPicker, Combobox, PasswordStrength, RangeSlider, TagInput } from '@/components/lab/inputs';
import { Checkbox, Divider, RadioGroup, Spinner } from '@/components/lab/primitives';
import { passwordScore } from '@/components/lab/password';

/* ------------------------------------------------------------------ */
/* Outils partagés                                                     */
/* ------------------------------------------------------------------ */

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Place le focus sur un champ, ou sur le premier champ d'un conteneur. */
function focusField(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const target =
    element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement
      ? element
      : element.querySelector<HTMLElement>('input, textarea, button');
  target?.focus();
}

/** Le titre d'un état de succès reçoit le focus à son apparition. */
const focusOnMount = (element: HTMLElement | null) => element?.focus();

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="tpl-f-error">
      <CircleAlert size={12} aria-hidden="true" />
      {children}
    </p>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  icon: Icon,
  optional = false,
  suffix,
  ...inputProps
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  icon?: LucideIcon;
  optional?: boolean;
  suffix?: ReactNode;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'value' | 'onChange'>) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ');
  return (
    <div className="tpl-f-field" data-invalid={error ? true : undefined}>
      <label className="field-label" htmlFor={id}>
        {label}
        {optional && <span className="tpl-f-optional"> (facultatif)</span>}
      </label>
      <div className="input-wrap">
        {Icon && <Icon size={14} aria-hidden="true" />}
        <input
          id={id}
          value={value}
          onChange={event => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          {...inputProps}
        />
        {suffix}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="lab-hint">
          {hint}
        </p>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* D · Formulaire de contact                                           */
/* ------------------------------------------------------------------ */

const services = ['Support client', 'Ventes', 'Technique', 'Design', 'Facturation'];
const priorities = ['Basse', 'Normale', 'Haute', 'Critique'];
const initialTags = ['bug', 'urgent'];
const messageMax = 1000;
const messageMin = 20;
const maxAttachments = 5;
const maxAttachmentSize = 10 * 1024 * 1024;
const acceptedExtensions = ['png', 'jpg', 'jpeg', 'webp', 'pdf', 'doc', 'docx'];

type Attachment = { id: string; name: string; size: number };
type ContactErrors = Partial<Record<'name' | 'email' | 'phone' | 'message', string>>;

const formatSize = (size: number) =>
  size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} Ko`
    : `${(size / 1024 / 1024).toLocaleString('fr', { maximumFractionDigits: 1 })} Mo`;

function validateContact(values: { name: string; email: string; phone: string; message: string }) {
  const errors: ContactErrors = {};
  if (values.name.trim().length < 2) errors.name = 'Indiquez votre nom (2 caractères minimum).';
  if (!values.email.trim()) errors.email = 'Indiquez votre adresse e-mail.';
  else if (!emailPattern.test(values.email.trim()))
    errors.email = 'Adresse e-mail invalide (ex. camille.martin@exemple.fr).';
  if (values.phone.trim() && !/^\+?[\d\s.-]{9,}$/.test(values.phone.trim()))
    errors.phone = 'Format attendu : 06 12 34 56 78 ou +33 6 12 34 56 78.';
  if (values.message.trim().length < messageMin)
    errors.message = `Décrivez votre demande en ${messageMin} caractères minimum.`;
  return errors;
}

export function ContactTemplate({ notify }: { notify: Notify }) {
  const id = useId();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [tags, setTags] = useState<string[]>(initialTags);
  const [priority, setPriority] = useState(2);
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState('');
  const [showErrors, setShowErrors] = useState(false);
  const [sent, setSent] = useState(false);
  // Le Combobox garde sa saisie en interne : on le remonte lors d'une remise à zéro.
  const [revision, setRevision] = useState(0);

  const errors = validateContact({ name, email, phone, message });
  const visible: ContactErrors = showErrors ? errors : {};
  const errorCount = Object.keys(visible).length;
  const fieldId = (key: string) => `${id}-${key}`;
  const messageDescribedBy = [`${id}-message-count`, visible.message ? `${id}-message-error` : '']
    .filter(Boolean)
    .join(' ');

  const reset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setService('');
    setTags(initialTags);
    setPriority(2);
    setMessage('');
    setFiles([]);
    setFileError('');
    setShowErrors(false);
    setRevision(previous => previous + 1);
  };

  const addFiles = (list: FileList) => {
    const next = [...files];
    const problems: string[] = [];
    Array.from(list).forEach(file => {
      const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!acceptedExtensions.includes(extension)) problems.push(`« ${file.name} » : format non accepté.`);
      else if (file.size > maxAttachmentSize) problems.push(`« ${file.name} » dépasse 10 Mo.`);
      else if (next.length >= maxAttachments) problems.push(`Maximum ${maxAttachments} fichiers.`);
      else next.push({ id: createId(), name: file.name, size: file.size });
    });
    setFiles(next);
    setFileError([...new Set(problems)].join(' '));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      // Les erreurs sont rendues avant le déplacement du focus pour être lues avec le champ.
      flushSync(() => setShowErrors(true));
      focusField(fieldId(firstInvalid));
      return;
    }
    setSent(true);
    notify(
      `Demande transmise au service ${service || 'Support client'} (démonstration : rien n’est envoyé).`,
    );
  };

  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        D <span>Formulaire de contact</span>
        <LifeBuoy size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Contacter le support.</h3>
          <p>Renseignez votre demande : notre équipe vous répond sous 24 h ouvrées.</p>
        </div>
        <Badge tone="accent">Démo locale</Badge>
      </div>

      {sent ? (
        <div className="tpl-f-success" role="status">
          <span className="tpl-f-success-icon">
            <CheckCircle2 size={28} aria-hidden="true" />
          </span>
          <h4 ref={focusOnMount} tabIndex={-1}>
            Message envoyé !
          </h4>
          <p>Nous vous répondrons sous 24 h à {email.trim()}.</p>
          <dl className="tpl-f-summary">
            <dt>Service</dt>
            <dd>{service || 'Support client'}</dd>
            <dt>Priorité</dt>
            <dd>{priorities[priority - 1]}</dd>
            <dt>Étiquettes</dt>
            <dd>{tags.length ? tags.join(', ') : '—'}</dd>
            <dt>Pièces jointes</dt>
            <dd>{files.length ? `${files.length} fichier(s)` : 'Aucune'}</dd>
          </dl>
          <Button
            variant="secondary"
            onClick={() => {
              reset();
              setSent(false);
            }}
          >
            <RotateCcw size={15} />
            Envoyer un autre message
          </Button>
        </div>
      ) : (
        <form className="tpl-f-body" noValidate aria-label="Contacter le support" onSubmit={onSubmit}>
          <div className="tpl-f-grid">
            <TextField
              id={fieldId('name')}
              label="Nom complet"
              icon={User}
              value={name}
              onChange={setName}
              error={visible.name}
              placeholder="Camille Martin"
              autoComplete="name"
              maxLength={80}
              required
            />
            <TextField
              id={fieldId('email')}
              label="Adresse e-mail"
              icon={Mail}
              type="email"
              inputMode="email"
              value={email}
              onChange={setEmail}
              error={visible.email}
              placeholder="camille.martin@exemple.fr"
              autoComplete="email"
              maxLength={120}
              required
            />
          </div>
          <div className="tpl-f-grid">
            <TextField
              id={fieldId('phone')}
              label="Téléphone"
              optional
              icon={Phone}
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={setPhone}
              error={visible.phone}
              placeholder="06 12 34 56 78"
              autoComplete="tel"
              maxLength={20}
            />
            <Combobox
              key={revision}
              label="Service concerné"
              options={services}
              value={service}
              onChange={setService}
              placeholder="Choisir un service…"
            />
          </div>

          <TagInput label="Étiquettes de la demande" tags={tags} onChange={setTags} max={6} />

          <div className="tpl-f-field">
            <RangeSlider
              label="Niveau de priorité"
              min={1}
              max={priorities.length}
              value={priority}
              onChange={setPriority}
              format={value => priorities[value - 1]}
            />
            <div className="tpl-f-scale" aria-hidden="true">
              {priorities.map((label, index) => (
                <span key={label} data-active={index + 1 === priority || undefined}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="tpl-f-field" data-invalid={visible.message ? true : undefined}>
            <label className="field-label" htmlFor={fieldId('message')}>
              Message
            </label>
            <textarea
              id={fieldId('message')}
              className="tpl-f-textarea"
              rows={4}
              value={message}
              maxLength={messageMax}
              placeholder="Décrivez votre demande en détail…"
              required
              aria-invalid={visible.message ? true : undefined}
              aria-describedby={messageDescribedBy}
              onChange={event => setMessage(event.target.value)}
            />
            <div className="tpl-f-field-foot">
              {visible.message ? (
                <FieldError id={`${fieldId('message')}-error`}>{visible.message}</FieldError>
              ) : (
                <p className="lab-hint">{messageMin} caractères minimum.</p>
              )}
              <span id={`${fieldId('message')}-count`} className="tpl-f-count">
                {message.length}/{messageMax}
              </span>
            </div>
          </div>

          <div className="tpl-f-field">
            <span className="field-label" id={fieldId('files-label')}>
              Pièces jointes <span className="tpl-f-optional">(facultatif)</span>
            </span>
            <label className="tpl-f-file">
              <Paperclip size={14} aria-hidden="true" />
              Ajouter des fichiers
              <input
                type="file"
                multiple
                className="sr-only"
                accept={acceptedExtensions.map(extension => `.${extension}`).join(',')}
                aria-labelledby={fieldId('files-label')}
                aria-describedby={fieldId('files-hint')}
                onChange={event => {
                  if (event.target.files) addFiles(event.target.files);
                  event.target.value = '';
                }}
              />
            </label>
            <p id={fieldId('files-hint')} className="lab-hint" aria-live="polite">
              {fileError ||
                `Images, PDF ou documents Word · 10 Mo maximum · ${files.length}/${maxAttachments}`}
            </p>
            {files.length > 0 && (
              <ul className="tpl-f-files" aria-label="Fichiers joints">
                {files.map(file => (
                  <li key={file.id}>
                    <Paperclip size={13} aria-hidden="true" />
                    <span>{file.name}</span>
                    <small>{formatSize(file.size)}</small>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label={`Retirer ${file.name}`}
                      onClick={() => setFiles(previous => previous.filter(item => item.id !== file.id))}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="sr-only" aria-live="polite">
            {errorCount ? `${errorCount} champ(s) à corriger.` : ''}
          </p>
          <div className="tpl-f-actions">
            <Button variant="secondary" onClick={reset}>
              Effacer
            </Button>
            <Button type="submit">
              <Send size={15} />
              Envoyer le message
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* E · Panneau de réglages                                             */
/* ------------------------------------------------------------------ */

type ThemeChoice = 'system' | 'light' | 'dark';
type DigestChoice = 'off' | 'daily' | 'weekly';
type Settings = {
  theme: ThemeChoice;
  brightness: number;
  accent: string;
  volume: number;
  push: boolean;
  marketing: boolean;
  digest: DigestChoice;
  twoFactor: boolean;
  timeout: number;
};

const defaultSettings: Settings = {
  theme: 'system',
  brightness: 85,
  accent: '#477b60',
  volume: 72,
  push: true,
  marketing: false,
  digest: 'weekly',
  twoFactor: false,
  timeout: 30,
};
const themeOptions = [
  { value: 'system', label: 'Système', description: 'Suit l’appareil' },
  { value: 'light', label: 'Clair', description: 'Fond lumineux' },
  { value: 'dark', label: 'Sombre', description: 'Fond profond' },
];
const digestOptions = [
  { value: 'off', label: 'Aucun' },
  { value: 'daily', label: 'Quotidien', description: 'Chaque matin à 8 h' },
  { value: 'weekly', label: 'Hebdomadaire', description: 'Le lundi matin' },
];
const isTheme = (value: string): value is ThemeChoice => themeOptions.some(option => option.value === value);
const isDigest = (value: string): value is DigestChoice =>
  digestOptions.some(option => option.value === value);
const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, '0')}`;
const sameSettings = (a: Settings, b: Settings) =>
  (Object.keys(a) as (keyof Settings)[]).every(key => a[key] === b[key]);

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="tpl-f-toggle">
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <Switch label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

function SettingsSection({
  id,
  title,
  icon: Icon,
  children,
}: {
  id: string;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <section className="tpl-f-section" aria-labelledby={id}>
      <h4 id={id} className="tpl-f-section-title">
        <Icon size={15} aria-hidden="true" />
        {title}
      </h4>
      {children}
    </section>
  );
}

export function SettingsTemplate({ notify }: { notify: Notify }) {
  const id = useId();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState<Settings>(defaultSettings);
  // Compteur d'enregistrements : relance la minuterie de l'encadré à chaque enregistrement.
  const [flash, setFlash] = useState(0);
  // Le sélecteur de couleur garde sa saisie en interne : on le remonte à l'annulation.
  const [revision, setRevision] = useState(0);
  const dirty = !sameSettings(settings, saved);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(0), 3000);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings(previous => ({ ...previous, [key]: value }));

  const save = () => {
    setSaved(settings);
    setFlash(previous => previous + 1);
    notify('Préférences enregistrées (démonstration : rien n’est envoyé).');
  };
  const discard = () => {
    setSettings(saved);
    setRevision(previous => previous + 1);
    setFlash(0);
    notify('Modifications annulées.', 'warning');
  };

  const themeLabel = themeOptions.find(option => option.value === settings.theme)?.label ?? '';

  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        E <span>Panneau de réglages</span>
        <Settings2 size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Vos préférences, au même endroit.</h3>
          <p>Apparence, son, notifications et sécurité, enregistrés en un geste.</p>
        </div>
        {dirty ? (
          <Badge tone="warning" dot>
            Non enregistré
          </Badge>
        ) : (
          <Badge tone="success" dot>
            À jour
          </Badge>
        )}
      </div>

      <form
        className="tpl-f-body"
        aria-label="Réglages du compte"
        onSubmit={event => {
          event.preventDefault();
          if (dirty) save();
        }}
      >
        {flash > 0 && (
          <Callout
            title="Réglages enregistrés"
            tone="success"
            icon={CheckCircle2}
            onDismiss={() => setFlash(0)}
          >
            Vos préférences s’appliquent immédiatement.
          </Callout>
        )}

        <SettingsSection id={`${id}-appearance`} title="Apparence" icon={Palette}>
          <div className="tpl-f-grid">
            <div className="lab-stack">
              <RadioGroup
                label="Thème"
                variant="cards"
                options={themeOptions}
                value={settings.theme}
                onChange={value => {
                  if (isTheme(value)) set('theme', value);
                }}
              />
              <RangeSlider
                label="Luminosité de l’affichage"
                min={10}
                max={100}
                step={5}
                value={settings.brightness}
                onChange={value => set('brightness', value)}
                format={value => `${value} %`}
              />
            </div>
            <div className="lab-stack">
              <ColorPicker
                key={revision}
                label="Couleur d’accent"
                value={settings.accent}
                onChange={value => set('accent', value)}
              />
              <div
                className="tpl-f-preview"
                data-theme={settings.theme === 'dark' ? 'dark' : 'light'}
                style={
                  {
                    '--tpl-f-preview-accent': settings.accent,
                    filter: `brightness(${settings.brightness / 100})`,
                  } as CSSProperties
                }
                aria-hidden="true"
              >
                <small>Aperçu · thème {themeLabel.toLocaleLowerCase('fr')}</small>
                <span className="tpl-f-preview-chip">Bouton principal</span>
                <span className="tpl-f-preview-bar">
                  <span style={{ width: `${settings.volume}%` }} />
                </span>
              </div>
            </div>
          </div>
        </SettingsSection>

        <Divider />

        <SettingsSection id={`${id}-audio`} title="Son" icon={Volume2}>
          <RangeSlider
            label="Volume général"
            min={0}
            max={100}
            value={settings.volume}
            onChange={value => set('volume', value)}
            format={value => `${value} %`}
          />
        </SettingsSection>

        <Divider />

        <SettingsSection id={`${id}-notifications`} title="Notifications" icon={Bell}>
          <ToggleRow
            label="Notifications push"
            description="Alertes en temps réel pour l’activité de votre espace."
            checked={settings.push}
            onChange={value => set('push', value)}
          />
          <ToggleRow
            label="E-mails d’actualité"
            description="Nouveautés, conseils et annonces, une fois par mois."
            checked={settings.marketing}
            onChange={value => set('marketing', value)}
          />
          <RadioGroup
            label="Résumé par e-mail"
            options={digestOptions}
            value={settings.digest}
            onChange={value => {
              if (isDigest(value)) set('digest', value);
            }}
          />
        </SettingsSection>

        <Divider />

        <SettingsSection id={`${id}-security`} title="Sécurité" icon={ShieldCheck}>
          <ToggleRow
            label="Double authentification"
            description="Un code à usage unique est demandé à chaque connexion."
            checked={settings.twoFactor}
            onChange={value => set('twoFactor', value)}
          />
          {!settings.twoFactor && (
            <Callout title="Double authentification désactivée" tone="warning" icon={ShieldAlert}>
              L’activer protège nettement mieux votre compte.
            </Callout>
          )}
          <div className="tpl-f-field">
            <RangeSlider
              label="Déconnexion après inactivité"
              min={5}
              max={240}
              step={5}
              value={settings.timeout}
              onChange={value => set('timeout', value)}
              format={formatDuration}
            />
            <p className="lab-hint">Vous serez déconnecté automatiquement après cette durée.</p>
          </div>
        </SettingsSection>

        <div className="tpl-f-actions">
          <Button variant="secondary" disabled={!dirty} onClick={discard}>
            <RotateCcw size={15} />
            Annuler
          </Button>
          <Button type="submit" disabled={!dirty}>
            <Save size={15} />
            Enregistrer
          </Button>
        </div>
      </form>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* F · Page d'authentification                                         */
/* ------------------------------------------------------------------ */

type AuthTab = 'signin' | 'signup';
type AuthErrors = Partial<Record<'name' | 'email' | 'password' | 'terms', string>>;

const authTabs: { id: AuthTab; label: string }[] = [
  { id: 'signin', label: 'Connexion' },
  { id: 'signup', label: 'Inscription' },
];
const socialProviders = [
  { name: 'Google', icon: Globe2 },
  { name: 'GitHub', icon: CommandIcon },
];

function validateAuth(
  tab: AuthTab,
  values: { name: string; email: string; password: string; terms: boolean },
): AuthErrors {
  const errors: AuthErrors = {};
  if (tab === 'signup' && values.name.trim().length < 2)
    errors.name = 'Indiquez votre nom (2 caractères minimum).';
  if (!values.email.trim()) errors.email = 'Indiquez votre adresse e-mail.';
  else if (!emailPattern.test(values.email.trim()))
    errors.email = 'Adresse e-mail invalide (ex. camille.martin@exemple.fr).';
  if (!values.password) errors.password = 'Indiquez votre mot de passe.';
  else if (tab === 'signin' && values.password.length < 8) errors.password = '8 caractères minimum.';
  else if (tab === 'signup' && passwordScore(values.password) < 3)
    errors.password = 'Mot de passe trop faible : respectez au moins 3 des 4 critères.';
  if (tab === 'signup' && !values.terms) errors.terms = 'Vous devez accepter les conditions d’utilisation.';
  return errors;
}

export function AuthTemplate({ notify }: { notify: Notify }) {
  const id = useId();
  const [tab, setTab] = useState<AuthTab>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [terms, setTerms] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const errors = validateAuth(tab, { name, email, password, terms });
  const visible: AuthErrors = showErrors ? errors : {};
  const errorCount = Object.keys(visible).length;
  const fieldId = (key: string) => `${id}-${key}`;
  const tabId = (value: AuthTab) => `${id}-tab-${value}`;
  const firstName = name.trim().split(/\s+/)[0];

  // Simulation d'un aller-retour serveur : aucune donnée ne quitte le navigateur.
  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => {
      setStatus('done');
      notify(
        tab === 'signin'
          ? 'Connexion simulée : aucun compte n’est vérifié.'
          : 'Inscription simulée : aucun compte n’est créé.',
      );
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [status, tab, notify]);

  const selectTab = (next: AuthTab) => {
    if (next === tab) return;
    setTab(next);
    setPassword('');
    setShowPassword(false);
    setShowErrors(false);
  };
  const onTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const index = authTabs.findIndex(item => item.id === tab);
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? authTabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + authTabs.length) % authTabs.length;
    const next = authTabs[nextIndex].id;
    selectTab(next);
    document.getElementById(tabId(next))?.focus();
  };

  const reset = () => {
    setStatus('idle');
    setTab('signin');
    setName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setRemember(true);
    setTerms(false);
    setShowErrors(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const firstInvalid = Object.keys(errors)[0];
    if (firstInvalid) {
      flushSync(() => setShowErrors(true));
      focusField(fieldId(firstInvalid));
      return;
    }
    setShowPassword(false);
    setStatus('loading');
  };

  const loading = status === 'loading';
  const passwordDescribedBy = [
    tab === 'signin' ? `${fieldId('password')}-hint` : '',
    visible.password ? `${fieldId('password')}-error` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className="specimen lab-example">
      <div className="specimen-label">
        F <span>Connexion et inscription</span>
        <KeyRound size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Entrer, ou rejoindre l’espace.</h3>
          <p>Onglets, validation en direct, robustesse du mot de passe et état de réussite.</p>
        </div>
        <Badge>Aucun compte réel</Badge>
      </div>

      <div className="tpl-f-auth-stage">
        <div className="tpl-f-auth-card">
          <span className="tpl-f-auth-logo" aria-hidden="true">
            <Layers size={18} />
          </span>

          {status === 'done' ? (
            <div className="tpl-f-success" role="status">
              <span className="tpl-f-success-icon">
                <CheckCircle2 size={28} aria-hidden="true" />
              </span>
              <h4 ref={focusOnMount} tabIndex={-1}>
                {tab === 'signin' ? 'Bon retour parmi nous !' : `Bienvenue, ${firstName} !`}
              </h4>
              <p>
                {tab === 'signin' ? 'Vous êtes connecté' : 'Votre compte est créé'} avec {email.trim()}.
                Démonstration : aucun mot de passe n’est conservé.
              </p>
              <Button variant="secondary" onClick={reset}>
                <RotateCcw size={15} />
                Réinitialiser la démo
              </Button>
            </div>
          ) : (
            <>
              <div className="tpl-f-auth-title">
                <h4>{tab === 'signin' ? 'Connexion à design-system.' : 'Créer votre compte'}</h4>
                <p>
                  {tab === 'signin'
                    ? 'Heureux de vous revoir.'
                    : 'Gratuit pendant 14 jours, sans carte bancaire.'}
                </p>
              </div>

              <div className="tpl-f-tabs" role="tablist" aria-label="Mode d’accès" onKeyDown={onTabKeyDown}>
                {authTabs.map(item => (
                  <button
                    key={item.id}
                    id={tabId(item.id)}
                    type="button"
                    role="tab"
                    aria-selected={item.id === tab}
                    aria-controls={fieldId('panel')}
                    tabIndex={item.id === tab ? 0 : -1}
                    disabled={loading}
                    onClick={() => selectTab(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="tpl-f-social">
                {socialProviders.map(provider => (
                  <Button
                    key={provider.name}
                    variant="secondary"
                    disabled={loading}
                    onClick={() =>
                      notify(`Connexion via ${provider.name} indisponible dans la démonstration.`, 'warning')
                    }
                  >
                    <provider.icon size={15} aria-hidden="true" />
                    {provider.name}
                  </Button>
                ))}
              </div>

              <Divider label="ou avec votre e-mail" />

              <form
                key={tab}
                id={fieldId('panel')}
                className="tpl-f-auth-form"
                role="tabpanel"
                aria-labelledby={tabId(tab)}
                aria-busy={loading}
                noValidate
                onSubmit={onSubmit}
              >
                <fieldset disabled={loading}>
                  <legend className="sr-only">
                    {tab === 'signin' ? 'Identifiants' : 'Informations du compte'}
                  </legend>
                  {tab === 'signup' && (
                    <TextField
                      id={fieldId('name')}
                      label="Nom complet"
                      icon={User}
                      value={name}
                      onChange={setName}
                      error={visible.name}
                      placeholder="Camille Martin"
                      autoComplete="name"
                      maxLength={80}
                      required
                    />
                  )}
                  <TextField
                    id={fieldId('email')}
                    label="Adresse e-mail"
                    icon={Mail}
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={setEmail}
                    error={visible.email}
                    placeholder="camille.martin@exemple.fr"
                    autoComplete={tab === 'signin' ? 'username' : 'email'}
                    maxLength={120}
                    required
                  />
                  <div className="tpl-f-field" data-invalid={visible.password ? true : undefined}>
                    <label className="field-label" htmlFor={fieldId('password')}>
                      Mot de passe
                    </label>
                    <div className="input-wrap">
                      <Lock size={14} aria-hidden="true" />
                      <input
                        id={fieldId('password')}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                        placeholder={tab === 'signin' ? 'Votre mot de passe' : '12 caractères conseillés'}
                        maxLength={128}
                        spellCheck={false}
                        autoCapitalize="none"
                        required
                        aria-invalid={visible.password ? true : undefined}
                        aria-describedby={passwordDescribedBy || undefined}
                      />
                      <button
                        type="button"
                        className="tpl-f-icon-toggle"
                        aria-label="Afficher le mot de passe"
                        aria-pressed={showPassword}
                        aria-controls={fieldId('password')}
                        onClick={() => setShowPassword(previous => !previous)}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {tab === 'signin' && (
                      <p id={`${fieldId('password')}-hint`} className="lab-hint">
                        8 caractères minimum.
                      </p>
                    )}
                    {visible.password && (
                      <FieldError id={`${fieldId('password')}-error`}>{visible.password}</FieldError>
                    )}
                  </div>
                  {tab === 'signup' && <PasswordStrength value={password} />}

                  {tab === 'signin' ? (
                    <div className="tpl-f-auth-row">
                      <Checkbox label="Rester connecté" checked={remember} onChange={setRemember} />
                      <button
                        type="button"
                        className="tpl-f-link"
                        onClick={() =>
                          notify('Démonstration : aucun e-mail de réinitialisation n’est envoyé.', 'warning')
                        }
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                  ) : (
                    <div id={fieldId('terms')}>
                      <Checkbox
                        label="J’accepte les conditions d’utilisation et la politique de confidentialité"
                        checked={terms}
                        onChange={setTerms}
                        error={visible.terms}
                      />
                    </div>
                  )}
                </fieldset>

                <p className="sr-only" aria-live="polite">
                  {errorCount ? `${errorCount} champ(s) à corriger.` : ''}
                </p>
                <Button type="submit" className="tpl-f-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner
                        size="xs"
                        tone="current"
                        label={tab === 'signin' ? 'Connexion en cours' : 'Création en cours'}
                      />
                      {tab === 'signin' ? 'Connexion…' : 'Création…'}
                    </>
                  ) : tab === 'signin' ? (
                    'Se connecter'
                  ) : (
                    'Créer mon compte'
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
