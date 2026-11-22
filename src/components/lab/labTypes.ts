import { type ComponentType } from 'react';
import { type Notify } from '@/components/useToasts';

export type LabCategory =
  'Navigation' | 'Saisie' | 'Affichage' | 'Superposition' | 'Flux de travail' | 'Effets';
export type LabEntry = {
  id: string;
  name: string;
  category: LabCategory;
  description: string;
  code: string;
  Demo: ComponentType<{ notify: Notify }>;
};
