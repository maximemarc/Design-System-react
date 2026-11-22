import { useState } from 'react';
import { Check, Layers, MousePointer2, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import {
  BlurFade,
  GlitchText,
  NeonText,
  ScrollVelocity,
  TextGradient,
  TypewriterText,
  WordRotate,
} from '@/components/lab/textEffects';
import {
  GlowCard,
  MagicCard,
  MagneticButton,
  RippleButton,
  Tilt3DCard,
} from '@/components/lab/textEffectsPointer';
import { CustomCursorZone, type CursorVariant } from '@/components/lab/textEffectsCursor';

// Tableaux définis hors des composants : références stables pour les dépendances des effets.
const typewriterPhrases = ['des interfaces claires.', 'des thèmes cohérents.', 'des parcours accessibles.'];
const rotatingWords = ['cohérent', 'accessible', 'rapide', 'élégant'];
const velocityWords = ['Composer', 'Ajuster', 'Livrer', 'Partager'];
const blurItems = ['Jetons de couleur importés', 'Composants vérifiés', 'Thème prêt à l’export'];
const cursorVariants: { id: CursorVariant; label: string }[] = [
  { id: 'point', label: 'Point' },
  { id: 'anneau', label: 'Anneau' },
  { id: 'trainee', label: 'Traînée' },
  { id: 'reticule', label: 'Réticule' },
];

export function TypewriterDemo() {
  return (
    <div className="tx-fx-demo">
      <p className="tx-fx-demo-title">
        Concevez <TypewriterText texts={typewriterPhrases} />
      </p>
    </div>
  );
}

export function WordRotateDemo() {
  return (
    <div className="tx-fx-demo">
      <p className="tx-fx-demo-title">
        Un thème <WordRotate words={rotatingWords} />
      </p>
    </div>
  );
}

export function GlitchDemo() {
  return (
    <div className="tx-fx-demo">
      <GlitchText className="tx-fx-demo-big" text="Erreur 404" intensity="low" trigger="always" />
      <p className="tx-fx-demo-hint">
        Survolez : <GlitchText text="signal instable" intensity="high" />
      </p>
    </div>
  );
}

export function NeonDemo() {
  return (
    <div className="tx-fx-demo">
      <div className="tx-fx-neon-plate">
        <NeonText className="tx-fx-demo-big" pulse>
          Ouvert la nuit
        </NeonText>
      </div>
    </div>
  );
}

export function TextGradientDemo() {
  return (
    <div className="tx-fx-demo">
      <TextGradient className="tx-fx-demo-big">Dégradé vivant</TextGradient>
      <p className="tx-fx-demo-hint">Les teintes dérivent de la couleur d’accent.</p>
    </div>
  );
}

export function BlurFadeDemo() {
  const [round, setRound] = useState(0);
  return (
    <div className="tx-fx-demo">
      <div key={round} className="tx-fx-blur-list">
        {blurItems.map((item, index) => (
          <BlurFade key={item} delay={index * 140}>
            <div className="tx-fx-blur-item">
              <Check size={14} aria-hidden="true" />
              {item}
            </div>
          </BlurFade>
        ))}
      </div>
      <Button variant="ghost" size="small" onClick={() => setRound(value => value + 1)}>
        <RotateCcw size={13} aria-hidden="true" /> Rejouer
      </Button>
    </div>
  );
}

export function ScrollVelocityDemo() {
  return (
    <div className="tx-fx-demo">
      <ScrollVelocity>
        {velocityWords.map((word, index) => (
          <span key={word} className="tx-fx-velocity-item" data-tone={index % 2 ? 'accent' : undefined}>
            {word}
            <span aria-hidden="true"> ·</span>
          </span>
        ))}
      </ScrollVelocity>
      <p className="tx-fx-demo-hint">Faites défiler la page pour accélérer ou inverser le bandeau.</p>
    </div>
  );
}

export function TiltDemo() {
  return (
    <div className="tx-fx-demo">
      <Tilt3DCard className="tx-fx-card-demo">
        <div className="tx-fx-card-body">
          <span className="tx-fx-card-icon">
            <Layers size={16} aria-hidden="true" />
          </span>
          <strong>Carte en relief</strong>
          <p>Déplacez le pointeur pour l’incliner.</p>
        </div>
      </Tilt3DCard>
    </div>
  );
}

export function MagicCardDemo() {
  return (
    <div className="tx-fx-demo">
      <MagicCard className="tx-fx-card-demo">
        <div className="tx-fx-card-body">
          <span className="tx-fx-card-icon">
            <Sparkles size={16} aria-hidden="true" />
          </span>
          <strong>Bordure magique</strong>
          <p>Le halo suit le pointeur le long du cadre.</p>
        </div>
      </MagicCard>
    </div>
  );
}

export function GlowCardDemo() {
  return (
    <div className="tx-fx-demo">
      <GlowCard className="tx-fx-card-demo">
        <div className="tx-fx-card-body">
          <span className="tx-fx-card-icon">
            <Zap size={16} aria-hidden="true" />
          </span>
          <strong>Carte lumineuse</strong>
          <p>Une lueur d’accent apparaît au survol.</p>
        </div>
      </GlowCard>
    </div>
  );
}

export function MagneticDemo({ notify }: { notify: Notify }) {
  return (
    <div className="tx-fx-demo">
      <MagneticButton onClick={() => notify('Bouton magnétique activé.')}>Approchez-vous</MagneticButton>
    </div>
  );
}

export function RippleDemo({ notify }: { notify: Notify }) {
  return (
    <div className="tx-fx-demo">
      <div className="tx-fx-demo-row">
        <RippleButton onClick={() => notify('Onde déclenchée.')}>Cliquez ici</RippleButton>
        <RippleButton variant="secondary" onClick={() => notify('Onde déclenchée (secondaire).')}>
          Secondaire
        </RippleButton>
      </div>
    </div>
  );
}

export function CursorDemo({ notify }: { notify: Notify }) {
  const [variant, setVariant] = useState<CursorVariant>('anneau');
  return (
    <div className="tx-fx-cursor-demo">
      <div className="tx-fx-cursor-styles" role="group" aria-label="Style du curseur">
        {cursorVariants.map(option => (
          <button
            key={option.id}
            type="button"
            aria-pressed={variant === option.id}
            onClick={() => setVariant(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <CustomCursorZone variant={variant}>
        <span>
          <MousePointer2 size={13} aria-hidden="true" /> Survolez cette zone
        </span>
        <Button variant="secondary" size="small" onClick={() => notify('Clic avec le curseur personnalisé.')}>
          Bouton de test
        </Button>
      </CustomCursorZone>
    </div>
  );
}
