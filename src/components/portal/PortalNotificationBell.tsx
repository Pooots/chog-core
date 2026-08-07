import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bell,
  CalendarCheck2,
  DoorOpen,
  GraduationCap,
  LoaderCircle,
  X,
} from 'lucide-react'
import { portalNotificationService } from '@/services/portalNotificationService'
import type { PortalNotificationItem } from '@/types/portalNotification'

function typeIcon(type: string) {
  if (type === 'attendance') return CalendarCheck2
  if (type === 'grade_posted') return GraduationCap
  if (type === 'school_entrance') return DoorOpen
  return Bell
}

function formatTime(value?: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PortalNotificationBell({
  onOpenNotification,
}: {
  onOpenNotification?: (item: PortalNotificationItem) => void
} = {}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<PortalNotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [error, setError] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await portalNotificationService.list()
      setItems(response.data)
      setUnreadCount(response.meta.unread_count)
    } catch {
      setError('Unable to load notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, 60000)
    return () => window.clearInterval(timer)
  }, [refresh])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('mousedown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const handleOpen = () => {
    setOpen((value) => !value)
    if (!open) void refresh()
  }

  const handleMarkRead = async (item: PortalNotificationItem) => {
    if (!item.is_unread) return
    try {
      const updated = await portalNotificationService.markRead(item.uuid)
      setItems((current) =>
        current.map((row) => (row.uuid === item.uuid ? updated : row)),
      )
      setUnreadCount((count) => Math.max(0, count - 1))
    } catch {
      setError('Unable to mark notification as read.')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await portalNotificationService.markAllRead()
      setItems((current) =>
        current.map((row) => ({
          ...row,
          is_unread: false,
          read_at: row.read_at ?? new Date().toISOString(),
        })),
      )
      setUnreadCount(0)
    } catch {
      setError('Unable to mark all as read.')
    }
  }

  const handleSelect = async (item: PortalNotificationItem) => {
    await handleMarkRead(item)
    setOpen(false)
    onOpenNotification?.(item)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-5 text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed left-3 right-3 top-[4.75rem] z-40 flex max-h-[calc(100dvh-5.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:max-h-[32rem] sm:w-96">
          <div className="flex shrink-0 items-start justify-between gap-2 border-b border-slate-100 px-3 py-3 sm:px-4">
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Notifications</p>
              <p className="truncate text-[11px] text-slate-500">
                Attendance, grades, and school entrance
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleMarkAllRead()}
                  className="whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Mark all read
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {loading && items.length === 0 ? (
              <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading…
              </div>
            ) : null}

            {error ? (
              <p className="px-4 py-3 text-xs text-red-600">{error}</p>
            ) : null}

            {!loading && items.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-slate-500">
                No notifications yet.
              </p>
            ) : null}

            <ul>
              {items.map((item) => {
                const Icon = typeIcon(item.type)
                return (
                  <li key={item.uuid} className="border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => void handleSelect(item)}
                      className={`flex w-full gap-2.5 px-3 py-3 text-left transition hover:bg-slate-50 sm:gap-3 sm:px-4 ${
                        item.is_unread ? 'bg-blue-50/40' : 'bg-white'
                      }`}
                    >
                      <span
                        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                          item.type === 'attendance'
                            ? 'bg-amber-50 text-amber-700'
                            : item.type === 'grade_posted'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-start justify-between gap-2">
                          <span className="min-w-0 break-words text-sm font-semibold text-slate-900">
                            {item.title}
                          </span>
                          {item.is_unread ? (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                          ) : null}
                        </span>
                        <span className="mt-0.5 block break-words text-xs leading-relaxed text-slate-600">
                          {item.body}
                        </span>
                        <span className="mt-1 block break-words text-[10px] font-medium uppercase tracking-wide text-slate-400">
                          {item.type_label}
                          {item.created_at
                            ? ` · ${formatTime(item.created_at)}`
                            : ''}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  )
}
