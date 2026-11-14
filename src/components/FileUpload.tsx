import { useEffect, useId, useRef, useState } from 'react';
import { createId } from '@/components/createId';
import { Check, Eye, FileText, Image, UploadCloud, X } from 'lucide-react';
import { Badge, Button, Modal } from '@/components/ui';
import '@/components/upload.css';

type UploadItem = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'reading' | 'ready' | 'error';
  url?: string;
  image: boolean;
  error?: string;
};
const maxSize = 10 * 1024 * 1024;
const maxFiles = 5;
const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const formatSize = (size: number) =>
  size < 1024 * 1024 ? `${Math.max(1, Math.round(size / 1024))} Ko` : `${(size / 1024 / 1024).toFixed(1)} Mo`;

function validSignature(buffer: ArrayBuffer, type: string) {
  const bytes = new Uint8Array(buffer);
  if (type === 'image/png')
    return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/webp')
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    );
  return String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-';
}

export default function FileUpload() {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const readers = useRef(new Map<string, FileReader>());
  const urls = useRef(new Map<string, string>());
  const dragDepth = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const active = items.find(item => item.id === preview);
  useEffect(() => {
    const activeReaders = readers.current;
    const activeUrls = urls.current;
    return () => {
      activeReaders.forEach(reader => {
        reader.onload = null;
        reader.onerror = null;
        reader.onprogress = null;
        if (reader.readyState === FileReader.LOADING) reader.abort();
      });
      activeUrls.forEach(url => URL.revokeObjectURL(url));
      activeReaders.clear();
      activeUrls.clear();
    };
  }, []);
  const update = (id: string, changes: Partial<UploadItem>) =>
    setItems(previous => previous.map(item => (item.id === id ? { ...item, ...changes } : item)));
  const remove = (id: string) => {
    const reader = readers.current.get(id);
    if (reader) {
      reader.onload = null;
      reader.onerror = null;
      reader.onprogress = null;
      if (reader.readyState === FileReader.LOADING) reader.abort();
      readers.current.delete(id);
    }
    const url = urls.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      urls.current.delete(id);
    }
    setItems(previous => previous.filter(item => item.id !== id));
    if (preview === id) setPreview(null);
  };
  const addFiles = (files: FileList | File[]) => {
    const rejected: string[] = [];
    const accepted: { file: File; item: UploadItem }[] = [];
    let slots = maxFiles - items.length;
    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        rejected.push(`${file.name} : choisissez une image PNG, JPEG, WebP ou un PDF.`);
        return;
      }
      if (!file.size || file.size > maxSize) {
        rejected.push(`${file.name} : le fichier doit être non vide et ne pas dépasser 10 Mo.`);
        return;
      }
      if (!slots) {
        rejected.push(`${file.name} : la limite est de 5 fichiers. Retirez un fichier pour continuer.`);
        return;
      }
      if (
        items.some(item => item.name === file.name && item.size === file.size) ||
        accepted.some(entry => entry.file.name === file.name && entry.file.size === file.size)
      ) {
        rejected.push(`${file.name} : déjà ajouté.`);
        return;
      }
      slots--;
      accepted.push({
        file,
        item: {
          id: createId(),
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'reading',
          image: file.type.startsWith('image/'),
        },
      });
    });
    setErrors(rejected);
    setItems(previous => [...previous, ...accepted.map(entry => entry.item)]);
    accepted.forEach(({ file, item }) => {
      const reader = new FileReader();
      readers.current.set(item.id, reader);
      reader.onprogress = event => {
        if (event.lengthComputable)
          update(item.id, { progress: Math.min(99, Math.round((event.loaded / event.total) * 100)) });
      };
      reader.onerror = () => {
        readers.current.delete(item.id);
        update(item.id, { status: 'error', error: 'Lecture impossible. Retirez le fichier puis réessayez.' });
      };
      reader.onload = () => {
        readers.current.delete(item.id);
        if (!(reader.result instanceof ArrayBuffer) || !validSignature(reader.result, file.type)) {
          update(item.id, { status: 'error', error: 'Le contenu ne correspond pas au format annoncé.' });
          return;
        }
        const url = item.image ? URL.createObjectURL(file) : undefined;
        if (url) urls.current.set(item.id, url);
        update(item.id, { status: 'ready', progress: 100, url });
      };
      reader.readAsArrayBuffer(file);
    });
  };
  return (
    <article className="specimen upload-card">
      <div className="specimen-label">
        09 <span>Fichiers & glisser-déposer</span>
        <UploadCloud size={17} />
      </div>
      <div className="advanced-heading">
        <div>
          <h3>Déposez. Prévisualisez. C’est prêt.</h3>
          <p>Une sélection multiple avec suivi individuel et aperçu des images.</p>
        </div>
        <Badge>Démo locale</Badge>
      </div>
      <input
        id={inputId}
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf"
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={event => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = '';
        }}
      />
      <div
        className={`upload-dropzone ${dragging ? 'dragging' : ''}`}
        onDragEnter={event => {
          event.preventDefault();
          dragDepth.current++;
          setDragging(true);
        }}
        onDragOver={event => {
          event.preventDefault();
          event.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={event => {
          event.preventDefault();
          dragDepth.current--;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setDragging(false);
          }
        }}
        onDrop={event => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
      >
        <span className="upload-symbol">
          <UploadCloud size={28} strokeWidth={1.5} />
        </span>
        <h3>{dragging ? 'Relâchez vos fichiers ici' : 'Glissez vos fichiers ici'}</h3>
        <p>ou choisissez-les depuis votre appareil</p>
        <Button
          variant="secondary"
          onClick={() => input.current?.click()}
          disabled={items.length >= maxFiles}
        >
          Parcourir les fichiers
        </Button>
        <span className="upload-limits">PNG, JPEG, WebP, PDF · 10 Mo par fichier · 5 fichiers maximum</span>
      </div>
      {errors.length > 0 && (
        <div className="upload-errors" role="alert">
          {errors.map((error, index) => (
            <p key={index}>{error}</p>
          ))}
        </div>
      )}
      {items.length > 0 && (
        <>
          <div className="upload-list-heading">
            <span aria-live="polite">
              {items.filter(item => item.status === 'ready').length} / {items.length} fichiers prêts
            </span>
            <Button
              variant="ghost"
              size="small"
              onClick={() => {
                items.forEach(item => remove(item.id));
                setErrors([]);
              }}
            >
              Tout retirer
            </Button>
          </div>
          <ul className="upload-list">
            {items.map(item => (
              <li key={item.id}>
                <div className="upload-thumbnail">
                  {item.url ? (
                    <img
                      src={item.url}
                      alt=""
                      onError={() =>
                        update(item.id, { status: 'error', error: 'L’image ne peut pas être affichée.' })
                      }
                    />
                  ) : item.image ? (
                    <Image size={22} />
                  ) : (
                    <FileText size={22} />
                  )}
                </div>
                <div className="upload-file-info">
                  <strong title={item.name}>{item.name}</strong>
                  <span>
                    {formatSize(item.size)} ·{' '}
                    {item.status === 'ready'
                      ? 'Prêt pour l’aperçu'
                      : item.status === 'error'
                        ? 'Erreur de lecture'
                        : `Lecture ${item.progress} %`}
                  </span>
                  <progress
                    value={item.progress}
                    max={100}
                    aria-label={`Progression de lecture de ${item.name}`}
                  />
                  {item.error && <p role="alert">{item.error}</p>}
                </div>
                <div className="upload-file-actions">
                  {item.status === 'ready' &&
                    (item.image ? (
                      <button
                        className="icon-button"
                        onClick={() => setPreview(item.id)}
                        aria-label={`Prévisualiser ${item.name}`}
                      >
                        <Eye size={17} />
                      </button>
                    ) : (
                      <span className="upload-ready" aria-label="Document prêt">
                        <Check size={17} />
                      </span>
                    ))}
                  <button
                    className="icon-button"
                    onClick={() => remove(item.id)}
                    aria-label={`${item.status === 'reading' ? 'Annuler la lecture de' : 'Retirer'} ${item.name}`}
                  >
                    <X size={17} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="demo-note">
        La progression mesure la lecture sur votre appareil. Aucun fichier n’est envoyé ni conservé après
        fermeture de la page. Les PDF affichent leurs informations, sans aperçu du contenu.
      </p>
      <Modal open={Boolean(active)} onClose={() => setPreview(null)} title="Aperçu de l’image">
        {active?.url && (
          <>
            <img className="upload-full-preview" src={active.url} alt={active.name} />
            <p className="upload-preview-caption">
              {active.name} · {formatSize(active.size)}
            </p>
          </>
        )}
      </Modal>
    </article>
  );
}
