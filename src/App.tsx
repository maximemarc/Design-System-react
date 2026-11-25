import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Blocks,
  BookOpen,
  Check,
  ChevronRight,
  Code2,
  Component,
  Copy,
  Download,
  ExternalLink,
  LayoutDashboard,
  LayoutGrid,
  Menu,
  Moon,
  Palette,
  RotateCcw,
  Search,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';
import Showcase from '@/components/Showcase';
import DashboardShowcase from '@/components/DashboardShowcase';
import ThemeLibrary from '@/components/ThemeLibrary';
import LabExamples from '@/components/lab/LabExamples';
import ComponentLab from '@/components/lab/ComponentLab';
import {
  effectsCatalog,
  effectsStartNumber,
  labCatalog,
  showcaseComponentCount,
} from '@/components/lab/labCatalog';
import { useSavedThemes } from '@/components/useSavedThemes';
import { formaStyle } from '@/lib/theme';
import {
  activeThemeStorageKey,
  readActiveTheme,
  type ThemeConfiguration,
} from '@/components/themeConfiguration';
import { SeasonPicker, SeasonalBackground } from '@/components/SeasonPicker';
import { useSeasonPreferences } from '@/components/useSeasonPreferences';
import { seasons, type Season } from '@/components/seasons';
import { ToastViewport } from '@/components/Toast';
import { useToasts } from '@/components/useToasts';
import { useMotionAllowed } from '@/components/lab/motion';
import { Badge, Button, Modal, SectionHeading, Switch } from '@/components/ui';

const pages = [
  { name: 'Vue d’ensemble', icon: LayoutDashboard },
  { name: 'Composants', icon: Component },
  { name: 'Tableau de bord', icon: LayoutGrid },
  { name: 'Fondations', icon: Palette },
  { name: 'Thèmes', icon: Sparkles },
  { name: 'Animations', icon: Zap },
  { name: 'Modèles', icon: Blocks },
];
const accents = [
  { name: 'Sauge', color: '#477b60' },
  { name: 'Océan', color: '#2676b8' },
  { name: 'Terracotta', color: '#b35435' },
  { name: 'Graphite', color: '#59616e' },
  { name: 'Rose amour', color: '#c52c73' },
];

function App() {
  const [page, setPage] = useState('Vue d’ensemble');
  const [restoredTheme] = useState(readActiveTheme);
  const [dark, setDark] = useState(restoredTheme?.dark ?? false);
  const { savedThemes, saveThemes, storageError } = useSavedThemes();
  const { preferences, setPreferences } = useSeasonPreferences();
  const { season, motifs, backgroundIcon } = preferences;
  const setSeason = (value: Season) => setPreferences(previous => ({ ...previous, season: value }));
  const setMotifs = (value: boolean) => setPreferences(previous => ({ ...previous, motifs: value }));
  const [accent, setAccent] = useState<{ name: string; color: string }>(() => {
    const saved = seasons.find(item => item.id === preferences.season)!;
    return { name: restoredTheme?.accentName ?? saved.name, color: restoredTheme?.accent ?? saved.color };
  });
  const seasonalTheme = seasons.find(item => item.id === season)!;
  const SeasonIcon = seasonalTheme.icon;
  const changeSeason = (value: Season) => {
    const selected = seasons.find(item => item.id === value)!;
    setSeason(value);
    setAccent(value === 'original' ? accents[0] : { name: selected.name, color: selected.color });
  };
  const [radius, setRadius] = useState(restoredTheme?.radius ?? 12);
  const [motion, setMotion] = useState(restoredTheme?.motion ?? true);
  const [density, setDensity] = useState<'Compact' | 'Confort'>(restoredTheme?.density ?? 'Confort');
  const { notifications, notify, dismiss, position, setPosition } = useToasts();
  const [docs, setDocs] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const customizerRef = useRef<HTMLElement>(null);
  const customizerTitleRef = useRef<HTMLHeadingElement>(null);
  const customizerMotion = useMotionAllowed(customizerRef);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') {
        setQuery('');
        setMobileMenu(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const theme: ThemeConfiguration = {
    accent: accent.color,
    accentName: accent.name,
    radius,
    dark,
    motion,
    density,
    season,
    motifs,
    backgroundIcon,
    toastPosition: position,
  };
  useEffect(() => {
    try {
      localStorage.setItem(
        activeThemeStorageKey,
        JSON.stringify({
          accent: accent.color,
          accentName: accent.name,
          radius,
          dark,
          motion,
          density,
          season,
          motifs,
          backgroundIcon,
          toastPosition: position,
        }),
      );
    } catch {
      console.warn('Le thème actif ne peut pas être mémorisé dans ce navigateur.');
    }
  }, [accent.color, accent.name, radius, dark, motion, density, season, motifs, backgroundIcon, position]);
  const applyTheme = (configuration: ThemeConfiguration) => {
    setAccent({ name: configuration.accentName, color: configuration.accent });
    setPreferences({
      season: configuration.season,
      motifs: configuration.motifs,
      backgroundIcon: configuration.backgroundIcon,
    });
    setDark(configuration.dark);
    setRadius(configuration.radius);
    setMotion(configuration.motion);
    setDensity(configuration.density);
    setPosition(configuration.toastPosition);
  };
  const exportTheme = () => {
    const file = new Blob(
      [
        JSON.stringify(
          {
            format: 'forma-design-pattern',
            version: 1,
            currentTheme: theme,
            savedThemes,
            resolvedIcon: backgroundIcon === 'auto' ? seasonalTheme.name : backgroundIcon,
            displayPreferences: { dark, density, radius, motion, motifs, toastPosition: position },
          },
          null,
          2,
        ),
      ],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'forma-design-pattern.json';
    link.click();
    URL.revokeObjectURL(url);
    notify('Votre thème a été exporté.');
  };
  const copyTheme = async () => {
    try {
      await navigator.clipboard.writeText(
        `:root { --accent: ${accent.color}; --radius: ${radius}px; --motion-duration: ${motion ? '220ms' : '0ms'}; }`,
      );
      notify('Les variables du thème ont été copiées.');
    } catch {
      notify('La copie est indisponible ici. Utilisez Exporter le thème.', 'error');
    }
  };
  const navigate = (name: string) => {
    setPage(name);
    setMobileMenu(false);
    setQuery('');
  };
  // Personnalisation : le panneau « À votre image » est à droite en bureau, mais tout en bas de
  // la page sous 1000 px. On n'y fait défiler que s'il n'est pas déjà en vue, puis on y place le
  // focus (sans second défilement) pour le clavier et les lecteurs d'écran.
  const openCustomizer = () => {
    navigate('Fondations');
    requestAnimationFrame(() => {
      const panel = customizerRef.current;
      if (!panel) return;
      const { top } = panel.getBoundingClientRect();
      if (top < 0 || top > window.innerHeight * 0.6) {
        panel.scrollIntoView({ behavior: customizerMotion ? 'smooth' : 'instant', block: 'start' });
      }
      customizerTitleRef.current?.focus({ preventScroll: true });
    });
    notify('Le panneau « À votre image » ajuste le thème en temps réel.', 'info');
  };
  const style = formaStyle({ accent: accent.color, dark, radius, motion, density });
  return (
    <div
      className={`app ${dark ? 'dark' : ''} ${!motion ? 'no-motion' : ''}`}
      style={style}
      data-season={season}
    >
      <aside className={`sidebar ${mobileMenu ? 'mobile-open' : ''}`}>
        <a
          className="brand"
          href="#"
          onClick={event => {
            event.preventDefault();
            navigate('Vue d’ensemble');
          }}
        >
          <Component size={29} strokeWidth={1.8} />
          <span>
            forma<span className="brand-period">.</span>
          </span>
          <Badge>UI KIT</Badge>
        </a>
        <div className="workspace">
          <div className="workspace-icon">
            <LayersIcon />
          </div>
          <div>
            <strong>Votre espace créatif</strong>
            <span>Design system personnel</span>
          </div>
          <ChevronRight size={15} />
        </div>
        <span className="nav-label">EXPLORER</span>
        <nav>
          {pages.map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${page === name ? 'active' : ''}`}
              onClick={() => navigate(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === 'Composants' && (
                <span className="nav-count">{showcaseComponentCount + labCatalog.length}</span>
              )}
              {name === 'Animations' && <span className="nav-count">{effectsCatalog.length}</span>}
              {page === name && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-divider" />
        <span className="nav-label">RESSOURCES</span>
        <button className="nav-item" onClick={() => setDocs(true)}>
          <BookOpen size={18} />
          <span>Documentation</span>
          <ExternalLink size={13} />
        </button>
        <button className="nav-item" onClick={openCustomizer}>
          <Settings2 size={18} />
          <span>Personnalisation</span>
        </button>
        <div className="sidebar-bottom">
          <div className="build-card">
            <span className="build-icon">
              <Sparkles size={19} />
            </span>
            <h3>
              Votre prochain projet
              <br />
              commence ici.
            </h3>
            <p>
              Une base solide.
              <br />
              Des possibilités infinies.
            </p>
            <button onClick={exportTheme}>
              Exporter le thème <ArrowRight size={15} />
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="version-dot" />
            Version 1.0.0<span className="footer-shortcut">⌘ K</span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-toggle icon-button"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Ouvrir la navigation"
            >
              <Menu size={20} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} />
            <strong>{page}</strong>
          </div>
          <div className="topbar-actions">
            <div className="search-wrap">
              <Search size={15} />
              <input
                ref={searchRef}
                aria-label="Rechercher une section"
                placeholder="Rechercher..."
                value={query}
                onChange={event => setQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
              {query && (
                <div className="search-results">
                  {pages
                    .filter(item => item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
                    .map(item => (
                      <button key={item.name} onClick={() => navigate(item.name)}>
                        {item.name}
                        <ArrowRight size={14} />
                      </button>
                    ))}
                  {!pages.some(item => item.name.toLocaleLowerCase().includes(query.toLocaleLowerCase())) && (
                    <span>Aucun résultat</span>
                  )}
                </div>
              )}
            </div>
            <button
              className="icon-button"
              aria-label={dark ? 'Activer le thème clair' : 'Activer le thème sombre'}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="topbar-divider" />
            <button className="user-avatar" onClick={() => setDocs(true)} aria-label="Ouvrir le guide">
              JD
            </button>
          </div>
        </header>
        <div className="content-layout">
          <main className="content">
            <SeasonalBackground season={season} visible={motifs} backgroundIcon={backgroundIcon} />
            <div className="intro">
              <div className="intro-meta">
                {season !== 'original' && (
                  <span className="season-badge">
                    <SeasonIcon size={14} aria-hidden="true" />
                    {seasonalTheme.name}
                  </span>
                )}
                <span className="eyebrow">
                  <span />
                  DESIGN LESS. CREATE MORE.
                </span>
                <Badge>
                  <span className="status-dot" />
                  React + Tailwind
                </Badge>
              </div>
              <h1>
                De belles interfaces.
                <br />
                <span>Sans repartir de zéro.</span>
              </h1>
              <p>
                Un système de design pensé pour vos idées. Des composants
                <br className="desktop-break" /> soignés, fluides et entièrement à votre image.
              </p>
              <div className="intro-actions">
                <Button
                  onClick={() => {
                    navigate('Composants');
                    document
                      .getElementById('gallery')
                      ?.scrollIntoView({ behavior: motion ? 'smooth' : 'instant' });
                  }}
                >
                  Explorer les composants <ArrowRight size={16} />
                </Button>
                <Button variant="ghost" onClick={() => setDocs(true)}>
                  <BookOpen size={16} />
                  Le guide de démarrage
                </Button>
              </div>
              <div className="hero-decoration" aria-hidden="true">
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />
                <div className="orbit orbit-three" />
                <div className="floating-tile tile-one">
                  <Component size={38} strokeWidth={1.3} />
                </div>
                <div className="floating-tile tile-two">
                  <SlidersHorizontal size={27} strokeWidth={1.4} />
                </div>
                <div className="floating-tile tile-three">
                  <Code2 size={22} />
                </div>
                <span className="decoration-dot dot-one" />
                <span className="decoration-dot dot-two" />
              </div>
            </div>
            <div className="principles">
              <div>
                <span className="principle-icon">
                  <Component size={19} />
                </span>
                <div>
                  <strong>Modulaire par nature</strong>
                  <p>Composez. Adaptez. Réutilisez.</p>
                </div>
              </div>
              <div>
                <span className="principle-icon">
                  <Zap size={19} />
                </span>
                <div>
                  <strong>Le mouvement juste</strong>
                  <p>Des interactions qui font sens.</p>
                </div>
              </div>
              <div>
                <span className="principle-icon">
                  <SlidersHorizontal size={19} />
                </span>
                <div>
                  <strong>Vraiment personnalisable</strong>
                  <p>Votre marque, vos règles.</p>
                </div>
              </div>
            </div>
            <section id="gallery" className="gallery-section">
              <div className="gallery-heading">
                <SectionHeading
                  eyebrow="LE TERRAIN DE JEU"
                  title={page === 'Vue d’ensemble' ? 'Petits détails. Grandes possibilités.' : page}
                  description={
                    page === 'Vue d’ensemble' || page === 'Composants'
                      ? 'Des essentiels bien pensés. Cliquez, testez, appropriez-vous.'
                      : 'Une base cohérente, adaptable à chaque nouvelle idée.'
                  }
                />
                <Badge>
                  <span className="live-dot" />
                  Aperçu interactif
                </Badge>
              </div>
              {(page === 'Vue d’ensemble' || page === 'Composants') && (
                <Showcase notify={notify} toastPosition={position} onToastPositionChange={setPosition} />
              )}
              {page === 'Tableau de bord' && <DashboardShowcase notify={notify} />}
              {page === 'Thèmes' && (
                <ThemeLibrary
                  current={theme}
                  savedThemes={savedThemes}
                  saveThemes={saveThemes}
                  storageError={storageError}
                  onApply={applyTheme}
                  onAccentChange={color => setAccent({ name: 'Personnalisé', color })}
                  onExport={exportTheme}
                  notify={notify}
                />
              )}
              {page === 'Fondations' && (
                <div className="foundation-grid">
                  <article className="specimen">
                    <h3>Une palette qui vous ressemble</h3>
                    <p>Les couleurs suivent instantanément votre accent.</p>
                    <div className="palette-preview">
                      {[1, 0.75, 0.5, 0.25, 0.1].map(opacity => (
                        <div key={opacity} style={{ background: accent.color, opacity }} />
                      ))}
                    </div>
                    <Button variant="secondary" onClick={copyTheme}>
                      <Copy size={16} />
                      Copier les variables
                    </Button>
                  </article>
                  <article className="specimen">
                    <span className="eyebrow">TYPOGRAPHIE</span>
                    <h1 className="type-sample">Aa</h1>
                    <h3>Claire. Expressive. Intemporelle.</h3>
                    <p>
                      Une hiérarchie lisible avec trois graisses, des titres resserrés et un texte
                      généreusement espacé.
                    </p>
                  </article>
                  <article className="specimen">
                    <h3>Un rythme de 8 pixels</h3>
                    <div className="spacing-preview">
                      {[8, 16, 24, 32, 48].map(size => (
                        <div key={size}>
                          <span style={{ width: size, height: size }} />
                          <small>{size}</small>
                        </div>
                      ))}
                    </div>
                    <p>Des espacements réguliers donnent à vos écrans un équilibre naturel.</p>
                  </article>
                  <article className="specimen">
                    <h3>Des formes flexibles</h3>
                    <div className="radius-preview">
                      <div />
                      <div />
                      <div />
                    </div>
                    <p>Ajustez les arrondis avec le panneau de personnalisation.</p>
                  </article>
                </div>
              )}
              {page === 'Animations' && (
                <div className="foundation-grid">
                  {['Survol subtil', 'Apparition fluide', 'Interaction précise', 'Mouvement accessible'].map(
                    (title, index) => (
                      <article className="specimen animation-specimen" key={title}>
                        <div className={`motion-demo motion-${index}`}>
                          <Component size={36} />
                        </div>
                        <h3>{title}</h3>
                        <p>
                          {
                            [
                              'Passez sur cette carte pour voir le relief évoluer.',
                              'Un mouvement doux, jamais distrayant.',
                              'Les contrôles répondent à chaque intention.',
                              'Le système respecte la réduction des animations.',
                            ][index]
                          }
                        </p>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => notify(`${title} : animation ${motion ? 'activée' : 'désactivée'}.`)}
                        >
                          Tester <ArrowRight size={14} />
                        </Button>
                      </article>
                    ),
                  )}
                </div>
              )}
              {page === 'Animations' && (
                <ComponentLab
                  id="effets"
                  notify={notify}
                  entries={effectsCatalog}
                  categories={['Effets']}
                  startNumber={effectsStartNumber}
                  eyebrow="Effets"
                  title={`${effectsCatalog.length} effets pour donner du relief.`}
                  intro="Textes animés, cartes réactives et fonds vivants. Tous suivent votre couleur d’accent et se figent quand les animations sont coupées."
                />
              )}
              {page === 'Modèles' && <LabExamples notify={notify} withTemplates />}
            </section>
            <div className="bottom-banner">
              <div className="banner-symbol">
                <Blocks size={24} />
              </div>
              <div>
                <strong>Une base. Mille façons de créer.</strong>
                <p>Du premier prototype au produit final, forma évolue avec vous.</p>
              </div>
              <button onClick={() => setDocs(true)}>
                Découvrir la philosophie <ArrowRight size={15} />
              </button>
            </div>
            <footer className="content-footer">
              <span>Conçu avec intention. Construit pour durer.</span>
              <span>
                forma. <span className="footer-dot">/</span> Design system v{__FORMA_VERSION__}
              </span>
            </footer>
          </main>
          <aside className="customizer" ref={customizerRef}>
            <div className="customizer-heading">
              <div>
                <SlidersHorizontal size={17} />
                <h2 ref={customizerTitleRef} tabIndex={-1}>
                  À votre image
                </h2>
              </div>
              <button
                className="icon-button"
                title="Réinitialiser le thème"
                aria-label="Réinitialiser le thème"
                onClick={() => {
                  setAccent(accents[0]);
                  setRadius(12);
                  setDark(false);
                  setMotion(true);
                  setDensity('Confort');
                  setPreferences({ season: 'original', motifs: true, backgroundIcon: 'auto' });
                }}
              >
                <RotateCcw size={15} />
              </button>
            </div>
            <p className="customizer-subtitle">Changez les règles. En temps réel.</p>
            <SeasonPicker
              season={season}
              onChange={changeSeason}
              motifs={motifs}
              onMotifsChange={setMotifs}
              backgroundIcon={backgroundIcon}
              onIconChange={value => setPreferences(previous => ({ ...previous, backgroundIcon: value }))}
            />
            <div className="control-section">
              <label>Apparence</label>
              <div className="theme-options">
                <button className={!dark ? 'selected' : ''} onClick={() => setDark(false)}>
                  <Sun size={16} />
                  Clair
                </button>
                <button className={dark ? 'selected' : ''} onClick={() => setDark(true)}>
                  <Moon size={16} />
                  Sombre
                </button>
              </div>
            </div>
            <div className="control-section">
              <label>
                Couleur d’accent <span>{accent.name}</span>
              </label>
              <div className="swatches">
                {accents.map(item => (
                  <button
                    key={item.name}
                    aria-label={`Accent ${item.name}`}
                    aria-pressed={accent.name === item.name}
                    style={{ background: item.color }}
                    className={accent.name === item.name ? 'selected' : ''}
                    onClick={() => setAccent(item)}
                  >
                    {accent.name === item.name && <Check size={17} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="control-section">
              <label htmlFor="radius">
                Arrondis <span>{radius} px</span>
              </label>
              <input
                id="radius"
                className="range"
                type="range"
                min="0"
                max="24"
                step="2"
                value={radius}
                onChange={event => setRadius(Number(event.target.value))}
              />
              <div className="range-labels">
                <span>Angulaire</span>
                <span>Organique</span>
              </div>
            </div>
            <div className="control-section">
              <label>Densité</label>
              <div className="theme-options">
                <button
                  className={density === 'Compact' ? 'selected' : ''}
                  onClick={() => setDensity('Compact')}
                >
                  Compact
                </button>
                <button
                  className={density === 'Confort' ? 'selected' : ''}
                  onClick={() => setDensity('Confort')}
                >
                  Confort
                </button>
              </div>
            </div>
            <div className="motion-control">
              <div>
                <strong>Animations</strong>
                <p>Un peu de vie dans vos écrans.</p>
              </div>
              <Switch label="Activer les animations" checked={motion} onChange={setMotion} />
            </div>
            <div className="customizer-divider" />
            <div className="theme-preview">
              <span className="eyebrow">VOTRE SIGNATURE</span>
              <div className="preview-window">
                <div className="window-dots">
                  <i />
                  <i />
                  <i />
                </div>
                <div className="preview-body">
                  <div className="preview-avatar">
                    <Component size={18} />
                  </div>
                  <div className="preview-lines">
                    <i />
                    <i />
                  </div>
                  <span />
                  <button onClick={() => notify('Votre signature est prête à être exportée.')}>
                    C’est tout vous <ArrowRight size={12} />
                  </button>
                </div>
              </div>
              <p>
                Un système cohérent,
                <br />
                dans les moindres détails.
              </p>
            </div>
            <Button variant="secondary" className="export-button" onClick={exportTheme}>
              <Download size={15} />
              Exporter le thème
            </Button>
            <button className="copy-theme" onClick={copyTheme}>
              <Code2 size={13} />
              Copier les variables CSS
            </button>
            <div className="customizer-note">
              <span className="status-dot" />
              Ambiance et symbole mémorisés localement.
            </div>
          </aside>
        </div>
      </div>
      <ToastViewport notifications={notifications} dismiss={dismiss} position={position} />
      <Modal open={docs} onClose={() => setDocs(false)} title="Bienvenue dans forma.">
        <p className="modal-copy">
          Une boîte à outils pensée pour créer des interfaces cohérentes, sans limiter votre créativité.
        </p>
        <div className="guide-steps">
          {[
            [
              '01',
              'Choisissez votre signature',
              'Ajustez les couleurs, les arrondis, la densité et les animations.',
            ],
            [
              '02',
              'Composez votre interface',
              'Réutilisez les boutons, cartes, champs et fenêtres de la galerie.',
            ],
            [
              '03',
              'Emportez votre thème',
              'Exportez les réglages ou copiez les variables pour votre prochain projet.',
            ],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span>{number}</span>
              <div>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
        <Button
          onClick={() => {
            setDocs(false);
            navigate('Composants');
          }}
        >
          Commencer à explorer <ArrowRight size={16} />
        </Button>
      </Modal>
    </div>
  );
}
function LayersIcon() {
  return <Blocks size={17} />;
}
export default App;
