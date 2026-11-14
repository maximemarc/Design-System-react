import { useCallback, useEffect, useState } from 'react';
import { createId } from '@/components/createId';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
export type ToastTone = 'success' | 'warning' | 'error';
export type Notify = (message: string, tone?: ToastTone) => void;
export type Notification = { id: string; message: string; tone: ToastTone };

const positionStorageKey = 'forma-toast-position';
const positions: ToastPosition[] = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right',
];

export function useToasts() {
  const [position, setPosition] = useState<ToastPosition>(() => {
    try {
      const saved = localStorage.getItem(positionStorageKey);
      return positions.find(value => value === saved) ?? 'bottom-right';
    } catch {
      return 'bottom-right';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(positionStorageKey, position);
    } catch {
      console.warn('La position des notifications ne peut pas être mémorisée dans ce navigateur.');
    }
  }, [position]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notify: Notify = useCallback((message: string, tone: ToastTone = 'success') => {
    setNotifications(previous => [...previous.slice(-3), { id: createId(), message, tone }]);
  }, []);
  const dismiss = useCallback(
    (id: string) => setNotifications(previous => previous.filter(item => item.id !== id)),
    [],
  );
  return { notifications, notify, dismiss, position, setPosition };
}
