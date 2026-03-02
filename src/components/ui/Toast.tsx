import { useAppStore } from '../../store/appStore.ts';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const icons: Record<string, React.ReactNode> = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export function ToastContainer() {
  const toasts = useAppStore(s => s.toasts);
  const removeToast = useAppStore(s => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3 shadow-lg min-w-[280px] animate-in slide-in-from-right">
          {icons[t.type]}
          <span className="text-sm text-gray-700 flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
