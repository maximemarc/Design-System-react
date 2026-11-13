import { PiFlowerLotusDuotone, PiSunDuotone, PiLeafDuotone, PiSnowflakeDuotone, PiShapesDuotone, PiGhostDuotone, PiTreeDuotone, PiConfettiDuotone, PiHeartDuotone, PiStarDuotone, PiMoonDuotone, PiPlanetDuotone, PiLightningDuotone } from 'react-icons/pi';

export const seasons = [
  { id: 'original', name: 'Original', icon: PiShapesDuotone, color: '#477b60', description: 'L’essentiel, sans décoration.' },
  { id: 'spring', name: 'Printemps', icon: PiFlowerLotusDuotone, color: '#42764c', description: 'Des fleurs et une fraîcheur végétale.' },
  { id: 'summer', name: 'Été', icon: PiSunDuotone, color: '#a76510', description: 'Des soleils et une lumière dorée.' },
  { id: 'autumn', name: 'Automne', icon: PiLeafDuotone, color: '#a64e2b', description: 'Des feuilles et des nuances cuivrées.' },
  { id: 'winter', name: 'Hiver', icon: PiSnowflakeDuotone, color: '#286d9b', description: 'Des flocons et une douceur glacée.' },
  { id: 'halloween', name: 'Halloween', icon: PiGhostDuotone, color: '#aa531c', description: 'Des fantômes et des tons citrouille.' },
  { id: 'christmas', name: 'Noël', icon: PiTreeDuotone, color: '#a33f3f', description: 'Des sapins pour une ambiance festive.' },
  { id: 'love', name: 'Rose amour', icon: PiHeartDuotone, color: '#c52c73', description: 'Une touche rose, des cœurs et beaucoup de tendresse.' },
  { id: 'wedding', name: 'Mariage', icon: PiHeartDuotone, color: '#b52f6a', description: 'Des cœurs, du rose et une élégance délicate.' },
  { id: 'celebration', name: 'Célébration', icon: PiConfettiDuotone, color: '#9a6915', description: 'Des confettis pour les grandes occasions.' },
] as const;
export type Season = typeof seasons[number]['id'];
export const backgroundIcons = [
  { id: 'flower', name: 'Fleur', icon: PiFlowerLotusDuotone },
  { id: 'sun', name: 'Soleil', icon: PiSunDuotone },
  { id: 'leaf', name: 'Feuille', icon: PiLeafDuotone },
  { id: 'snow', name: 'Flocon', icon: PiSnowflakeDuotone },
  { id: 'ghost', name: 'Fantôme', icon: PiGhostDuotone },
  { id: 'tree', name: 'Sapin', icon: PiTreeDuotone },
  { id: 'party', name: 'Confettis', icon: PiConfettiDuotone },
  { id: 'heart', name: 'Cœur', icon: PiHeartDuotone },
  { id: 'star', name: 'Étoile', icon: PiStarDuotone },
  { id: 'moon', name: 'Lune', icon: PiMoonDuotone },
  { id: 'planet', name: 'Planète', icon: PiPlanetDuotone },
  { id: 'bolt', name: 'Éclair', icon: PiLightningDuotone },
] as const;
export type BackgroundIcon = 'auto' | typeof backgroundIcons[number]['id'];
