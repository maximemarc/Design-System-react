import { type BadgeTone } from '@/components/ui';

/** État d'un service tel qu'une sonde (Gatus, Uptime Kuma…) le rapporte. */
export type ServiceStatus = 'up' | 'slow' | 'down' | 'unknown' | 'vpn';

export const statusLabels: Record<ServiceStatus, string> = {
  up: 'En ligne',
  slow: 'Lent',
  down: 'Hors ligne',
  unknown: 'Inconnu',
  vpn: 'VPN requis',
};

export const statusTones: Record<ServiceStatus, BadgeTone> = {
  up: 'success',
  slow: 'warning',
  down: 'danger',
  unknown: 'neutral',
  vpn: 'warning',
};

/** Un état qui mérite d'être affiché en toutes lettres (pas « en ligne », pas « inconnu »). */
export function isNoteworthy(status: ServiceStatus | undefined): status is 'slow' | 'down' | 'vpn' {
  return status === 'slow' || status === 'down' || status === 'vpn';
}

export function monogram(label: string) {
  return label.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2);
}

export type BentoSpan = 3 | 4 | 5 | 6 | 8 | 12;
