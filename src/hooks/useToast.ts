import { useAppStore } from '../store/appStore.ts';

export function useToast() {
  const addToast = useAppStore(s => s.addToast);
  return {
    success: (msg: string) => addToast(msg, 'success'),
    error: (msg: string) => addToast(msg, 'error'),
    info: (msg: string) => addToast(msg, 'info'),
  };
}
