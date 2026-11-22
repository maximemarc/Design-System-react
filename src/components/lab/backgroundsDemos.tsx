import { useRef, useState } from 'react';
import { Cloud, Database, Globe2, PartyPopper, Server, Smartphone, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import { type Notify } from '@/components/useToasts';
import {
  AnimatedBeam,
  AnimatedGradient,
  AnimatedGrid,
  AuroraBackground,
  BorderBeam,
  DotsPattern,
  EffectStage,
  GradientMesh,
  GridBackground,
  Marquee,
  Meteors,
  NoiseBg,
  ShineBorder,
  WaveBackground,
} from '@/components/lab/backgrounds';
import { Confetti, Globe, Particles } from '@/components/lab/backgroundsCanvas';

const tokens = ['Couleur', 'Arrondi', 'Ombre', 'Typographie', 'Espacement', 'Mouvement'];

function StageText({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="bg-fx-stage-content">
      <strong>{title}</strong>
      <span>{hint}</span>
    </div>
  );
}

export function MarqueeDemo() {
  return (
    <div className="bg-fx-demo-stack">
      <Marquee label="Jetons du thème">
        {tokens.map(token => (
          <span key={token} className="bg-fx-chip">
            {token}
          </span>
        ))}
      </Marquee>
      <Marquee label="Jetons du thème, sens inverse" reverse speed={30}>
        {tokens.map(token => (
          <span key={token} className="bg-fx-chip">
            {token}
          </span>
        ))}
      </Marquee>
    </div>
  );
}

export function VerticalMarqueeDemo() {
  return (
    <Marquee label="Étapes du projet" vertical speed={20} gap={8} className="bg-fx-marquee-vertical-demo">
      {['Composer', 'Ajuster', 'Vérifier', 'Livrer'].map(step => (
        <span key={step} className="bg-fx-chip">
          {step}
        </span>
      ))}
    </Marquee>
  );
}

export function MeteorsDemo() {
  return (
    <EffectStage>
      <Meteors count={12} />
      <StageText title="Pluie d’étoiles" hint="Décor discret pour une bannière" />
    </EffectStage>
  );
}

export function ParticlesDemo() {
  return (
    <Particles className="bg-fx-stage" count={36}>
      <StageText title="Approchez le pointeur" hint="Les particules s’écartent" />
    </Particles>
  );
}

export function ConfettiDemo({ notify }: { notify: Notify }) {
  const [shots, setShots] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <Confetti fire={shots} originRef={buttonRef} className="bg-fx-confetti-demo">
      <Button
        ref={buttonRef}
        size="small"
        onClick={() => {
          setShots(value => value + 1);
          notify('Bravo, c’est publié !');
        }}
      >
        <PartyPopper size={14} /> Célébrer
      </Button>
    </Confetti>
  );
}

export function AuroraDemo() {
  return (
    <EffectStage>
      <AuroraBackground />
      <StageText title="Aurore" hint="Halos lents aux couleurs du thème" />
    </EffectStage>
  );
}

export function BorderBeamDemo() {
  return (
    <div className="bg-fx-card">
      <BorderBeam duration={5} />
      <strong>Offre Équipe</strong>
      <span>Un faisceau souligne la carte mise en avant.</span>
    </div>
  );
}

export function ShineBorderDemo() {
  return (
    <ShineBorder>
      <div className="bg-fx-card is-plain">
        <strong>Survolez-moi</strong>
        <span>Un reflet traverse la carte, la bordure scintille.</span>
      </div>
    </ShineBorder>
  );
}

export function AnimatedBeamDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLSpanElement>(null);
  const cloudRef = useRef<HTMLSpanElement>(null);
  const serverRef = useRef<HTMLSpanElement>(null);
  const databaseRef = useRef<HTMLSpanElement>(null);
  return (
    <div ref={containerRef} className="bg-fx-beam-demo">
      <AnimatedBeam containerRef={containerRef} fromRef={phoneRef} toRef={cloudRef} />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={cloudRef}
        toRef={serverRef}
        curvature={24}
        delay={0.6}
      />
      <AnimatedBeam
        containerRef={containerRef}
        fromRef={cloudRef}
        toRef={databaseRef}
        curvature={-24}
        delay={1.2}
        reverse
      />
      <span ref={phoneRef} className="bg-fx-node is-small" aria-hidden="true">
        <Smartphone size={16} />
      </span>
      <span ref={cloudRef} className="bg-fx-node" aria-hidden="true">
        <Cloud size={20} />
      </span>
      <div className="bg-fx-node-column" aria-hidden="true">
        <span ref={serverRef} className="bg-fx-node is-small">
          <Server size={16} />
        </span>
        <span ref={databaseRef} className="bg-fx-node is-small">
          <Database size={16} />
        </span>
      </div>
    </div>
  );
}

export function AnimatedGradientDemo() {
  return (
    <div className="bg-fx-demo-stack">
      <AnimatedGradient className="bg-fx-stage-content">
        <strong>
          <Sparkles size={14} /> Dégradé linéaire
        </strong>
      </AnimatedGradient>
      <AnimatedGradient variant="radial" className="bg-fx-stage-content">
        <strong>Dégradé radial</strong>
      </AnimatedGradient>
    </div>
  );
}

export function AnimatedGridDemo() {
  return (
    <EffectStage>
      <AnimatedGrid />
      <StageText title="Grille vivante" hint="Deux trames qui respirent" />
    </EffectStage>
  );
}

export function DotsPatternDemo() {
  return (
    <EffectStage>
      <DotsPattern accent fade />
      <StageText title="Trame de points" hint="Estompée vers les bords" />
    </EffectStage>
  );
}

export function GridBackgroundDemo() {
  return (
    <EffectStage>
      <GridBackground accent />
      <StageText title="Quadrillage" hint="Fond technique et sobre" />
    </EffectStage>
  );
}

export function NoiseBgDemo() {
  return (
    <EffectStage>
      <div className="bg-fx-layer bg-fx-noise-wash" aria-hidden="true" />
      <NoiseBg />
      <StageText title="Grain" hint="Texture subtile sur un aplat" />
    </EffectStage>
  );
}

export function GradientMeshDemo() {
  return (
    <EffectStage>
      <GradientMesh />
      <StageText title="Maillage" hint="Taches de couleur floutées" />
    </EffectStage>
  );
}

export function WaveBackgroundDemo() {
  return (
    <EffectStage>
      <WaveBackground />
      <StageText title="Vagues" hint="Trois couches à vitesses différentes" />
    </EffectStage>
  );
}

export function GlobeDemo() {
  return (
    <div className="bg-fx-demo-stack">
      <Globe size={170} />
      <span className="bg-fx-hint">
        <Globe2 size={12} aria-hidden="true" /> Glissez pour faire tourner
      </span>
    </div>
  );
}
