import type { ReactNode } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'

type ConfirmTone = 'danger' | 'primary'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: ConfirmTone
  pending?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null

  const Icon = tone === 'danger' ? Trash2 : AlertTriangle
  const iconWrap =
    tone === 'danger'
      ? 'bg-red-50 text-red-600'
      : 'bg-amber-50 text-amber-600'
  const confirmBtn =
    tone === 'danger'
      ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel()
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl ${iconWrap}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-modal-title"
              className="text-base font-bold text-slate-950"
            >
              {title}
            </h2>
            {description ? (
              <div className="mt-1.5 text-sm text-slate-500">{description}</div>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition disabled:opacity-60 ${confirmBtn}`}
          >
            {pending ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
