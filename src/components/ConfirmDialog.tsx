'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmStyle = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="stream-modal-backdrop" onClick={onCancel}>
      <div className="stream-modal p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">{title}</h3>
        <p className="text-sm text-[rgb(var(--text-secondary))] mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="stream-btn-secondary flex-1">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 ${
              confirmStyle === 'destructive'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'stream-btn-primary'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
