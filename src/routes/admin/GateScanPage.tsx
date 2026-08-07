import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import axios from 'axios'
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DoorOpen,
  GraduationCap,
  LoaderCircle,
  ScanLine,
  UserPlus,
  X,
} from 'lucide-react'
import QrCameraScanner, {
  CameraToggleButton,
} from '@/components/admin/QrCameraScanner'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { schoolAuthService } from '@/services/schoolAuthService'
import {
  scannerService,
  type CreateScannerPayload,
} from '@/services/scannerService'
import { studentService, type Student } from '@/services/studentService'
import type { AdminUser } from '@/types/auth'

const SCAN_MODAL_SECONDS = 3

type ScanResult = {
  student: Student
  directionLabel: string
  scannedAt: string
}

const emptyScannerForm: CreateScannerPayload = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password_confirmation: '',
}

export default function GateScanPage() {
  const isPrincipal = !schoolAuthService.isScanner()
  const [studentNumber, setStudentNumber] = useState('')
  const [direction, setDirection] = useState<'in' | 'out'>('in')
  const [saving, setSaving] = useState(false)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [error, setError] = useState('')
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [countdown, setCountdown] = useState(SCAN_MODAL_SECONDS)
  const [recordsRefreshKey, setRecordsRefreshKey] = useState(0)
  const savingRef = useRef(false)
  const directionRef = useRef(direction)
  const modalTimerRef = useRef<number | null>(null)
  const countdownTimerRef = useRef<number | null>(null)

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  const clearModalTimers = useCallback(() => {
    if (modalTimerRef.current != null) {
      window.clearTimeout(modalTimerRef.current)
      modalTimerRef.current = null
    }
    if (countdownTimerRef.current != null) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  const closeScanModal = useCallback(() => {
    clearModalTimers()
    setScanResult(null)
    setCountdown(SCAN_MODAL_SECONDS)
    savingRef.current = false
    setSaving(false)
  }, [clearModalTimers])

  const openScanModal = useCallback(
    (result: ScanResult) => {
      clearModalTimers()
      setScanResult(result)
      setCountdown(SCAN_MODAL_SECONDS)

      countdownTimerRef.current = window.setInterval(() => {
        setCountdown((value) => Math.max(0, value - 1))
      }, 1000)

      modalTimerRef.current = window.setTimeout(() => {
        closeScanModal()
      }, SCAN_MODAL_SECONDS * 1000)
    },
    [clearModalTimers, closeScanModal],
  )

  useEffect(() => {
    return () => clearModalTimers()
  }, [clearModalTimers])

  const recordEntrance = useCallback(
    async (number: string) => {
      const trimmed = number.trim().toUpperCase()
      if (!trimmed || savingRef.current || scanResult) return

      savingRef.current = true
      setSaving(true)
      setError('')
      setStudentNumber(trimmed)

      try {
        const result = await studentService.recordEntrance({
          student_number: trimmed,
          direction: directionRef.current,
        })
        setStudentNumber('')
        setRecordsRefreshKey((value) => value + 1)
        openScanModal({
          student: result.student,
          directionLabel: result.direction_label,
          scannedAt: result.scanned_at,
        })
      } catch (requestError) {
        savingRef.current = false
        setSaving(false)
        if (axios.isAxiosError(requestError)) {
          const data = requestError.response?.data as
            | { message?: string; errors?: Record<string, string[]> }
            | undefined
          const firstFieldError = data?.errors
            ? Object.values(data.errors).flat()[0]
            : undefined
          setError(
            firstFieldError ?? data?.message ?? 'Unable to record entrance.',
          )
        } else {
          setError('Unable to record entrance.')
        }
      }
    },
    [openScanModal, scanResult],
  )

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    void recordEntrance(studentNumber)
  }

  return (
    <SchoolAdminShell>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            Gate / Entrance
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Open the camera to scan a student QR, or type the student number.
            After each scan, student details show for {SCAN_MODAL_SECONDS}{' '}
            seconds before the next scan.
          </p>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Scan student</h2>
            </div>
            <CameraToggleButton
              active={cameraOpen}
              disabled={saving || !!scanResult}
              onToggle={() => {
                setError('')
                setCameraOpen((value) => !value)
              }}
            />
          </div>

          <div className="mt-5 space-y-4">
            <QrCameraScanner
              active={cameraOpen && !scanResult}
              onScan={(value) => {
                void recordEntrance(value)
              }}
              onError={(message) => setError(message)}
            />

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="gate_student_number"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Student number
                </label>
                <input
                  id="gate_student_number"
                  autoFocus={!cameraOpen}
                  required
                  disabled={!!scanResult}
                  value={studentNumber}
                  onChange={(event) =>
                    setStudentNumber(event.target.value.toUpperCase())
                  }
                  placeholder="Scan QR or type e.g. ASHI-123412"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm uppercase outline-none transition placeholder:normal-case focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 disabled:opacity-60"
                />
              </div>

              <div className="flex gap-2">
                {(
                  [
                    { id: 'in', label: 'Enter campus' },
                    { id: 'out', label: 'Exit campus' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!!scanResult}
                    onClick={() => setDirection(item.id)}
                    className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
                      direction === item.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {error ? (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={saving || !!scanResult}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <DoorOpen className="h-4 w-4" />
                {saving
                  ? 'Recording…'
                  : direction === 'in'
                    ? 'Record entrance'
                    : 'Record exit'}
              </button>
            </form>
          </div>
        </section>

        <EntranceRecordsPanel refreshKey={recordsRefreshKey} />

        {isPrincipal ? <ScannerAccountsPanel /> : null}
      </div>

      {scanResult ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="gate-scan-title"
        >
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-5 text-white">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20">
                    <CheckCircle2 className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-50">
                      {scanResult.directionLabel}
                    </p>
                    <h2
                      id="gate-scan-title"
                      className="text-lg font-bold tracking-tight"
                    >
                      Scan recorded
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeScanModal}
                  className="rounded-xl p-2 text-white/80 transition hover:bg-white/15 hover:text-white"
                  aria-label="Close scan result"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <p className="text-xl font-bold text-slate-950">
                  {scanResult.student.full_name}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {scanResult.student.student_number}
                  {scanResult.student.lrn_number
                    ? ` · LRN ${scanResult.student.lrn_number}`
                    : ''}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoTile
                  icon={<GraduationCap className="h-4 w-4 text-blue-600" />}
                  label="Level"
                  value={
                    scanResult.student.level?.name ??
                    scanResult.student.room?.level?.name ??
                    'Not assigned'
                  }
                />
                <InfoTile
                  icon={<DoorOpen className="h-4 w-4 text-blue-600" />}
                  label="Room"
                  value={
                    scanResult.student.room
                      ? `${scanResult.student.room.name} (${scanResult.student.room.code})`
                      : 'Not assigned'
                  }
                />
                <InfoTile
                  icon={<Building2 className="h-4 w-4 text-blue-600" />}
                  label="Building"
                  value={scanResult.student.room?.building?.trim() || '—'}
                />
                <InfoTile
                  icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  label="Status"
                  value={
                    scanResult.student.enrollment_status_label ??
                    scanResult.student.status ??
                    '—'
                  }
                />
              </div>

              <p className="text-xs text-slate-500">
                {new Date(scanResult.scannedAt).toLocaleString()}
              </p>

              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  Ready for next scan in {countdown}s
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-linear"
                    style={{
                      width: `${(countdown / SCAN_MODAL_SECONDS) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={closeScanModal}
                className="flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Scan next student
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </SchoolAdminShell>
  )
}

function todayLocalDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDate(value: string, days: number) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  const nextYear = date.getFullYear()
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

function formatRecordDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatScanTime(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function directionBadgeClass(direction: string) {
  if (direction === 'in') return 'bg-emerald-50 text-emerald-700'
  if (direction === 'out') return 'bg-amber-50 text-amber-700'
  return 'bg-slate-100 text-slate-600'
}

function EntranceRecordsPanel({ refreshKey }: { refreshKey: number }) {
  const [date, setDate] = useState(todayLocalDate)
  const [records, setRecords] = useState<
    Awaited<ReturnType<typeof studentService.listEntrances>>['data']
  >([])
  const [summary, setSummary] = useState({ in: 0, out: 0, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRecords = useCallback(async (selectedDate: string) => {
    setLoading(true)
    setError('')
    try {
      const response = await studentService.listEntrances(selectedDate)
      setRecords(response.data)
      setSummary(response.meta.summary)
    } catch {
      setError('Unable to load scan records.')
      setRecords([])
      setSummary({ in: 0, out: 0, total: 0 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRecords(date)
  }, [date, refreshKey, loadRecords])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Scan records</h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Student QR scans for {formatRecordDate(date)}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDate((value) => shiftDate(value, -1))}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50"
            aria-label="Previous day"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
          <button
            type="button"
            onClick={() => setDate((value) => shiftDate(value, 1))}
            disabled={date >= todayLocalDate()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
            aria-label="Next day"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {(
          [
            { label: 'Entered', value: summary.in, className: 'text-emerald-700' },
            { label: 'Exited', value: summary.out, className: 'text-amber-700' },
            { label: 'Total', value: summary.total, className: 'text-slate-900' },
          ] as const
        ).map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-center"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className={`mt-1 text-lg font-bold ${item.className}`}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4">
        {loading ? (
          <p className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading records…
          </p>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        ) : null}

        {!loading && !error && records.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No QR scans recorded for this date.
          </p>
        ) : null}

        {!loading && records.length > 0 ? (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200">
            {records.map((record) => (
              <li
                key={record.uuid}
                className="flex items-start justify-between gap-3 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {record.student?.full_name ?? 'Unknown student'}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {record.student?.student_number ??
                      record.scanned_identifier ??
                      '—'}
                    {record.student?.level?.name
                      ? ` · ${record.student.level.name}`
                      : ''}
                    {record.student?.room
                      ? ` · ${record.student.room.name}`
                      : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${directionBadgeClass(
                      record.direction,
                    )}`}
                  >
                    {record.direction === 'in' ? 'In' : 'Out'}
                  </span>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {formatScanTime(record.scanned_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  )
}

function ScannerAccountsPanel() {
  const [scanners, setScanners] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<CreateScannerPayload>(emptyScannerForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadScanners = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await scannerService.list()
      setScanners(rows)
    } catch {
      setError('Unable to load scanner accounts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadScanners()
  }, [loadScanners])

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const created = await scannerService.create(form)
      setScanners((current) => [created, ...current])
      setForm(emptyScannerForm)
      setSuccess(
        `Scanner account created. They can sign in at /admin/login with ${created.email}.`,
      )
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const data = requestError.response?.data as
          | { message?: string; errors?: Record<string, string[]> }
          | undefined
        const firstFieldError = data?.errors
          ? Object.values(data.errors).flat()[0]
          : undefined
        setError(
          firstFieldError ?? data?.message ?? 'Unable to create scanner account.',
        )
      } else {
        setError('Unable to create scanner account.')
      }
    } finally {
      setSaving(false)
    }
  }

  const hasScanners = useMemo(() => scanners.length > 0, [scanners])

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-blue-600" />
        <h2 className="text-sm font-bold text-slate-900">Scanner accounts</h2>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Create a gate login that only opens Gate / Entrance after signing in at
        /admin/login.
      </p>

      <form className="mt-5 grid gap-3 sm:grid-cols-2" onSubmit={handleCreate}>
        <div>
          <label
            htmlFor="scanner_first_name"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            First name
          </label>
          <input
            id="scanner_first_name"
            required
            value={form.first_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                first_name: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="scanner_last_name"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Last name
          </label>
          <input
            id="scanner_last_name"
            required
            value={form.last_name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                last_name: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="scanner_email"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Email
          </label>
          <input
            id="scanner_email"
            type="email"
            required
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            placeholder="gate@school.edu"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="scanner_password"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Password
          </label>
          <input
            id="scanner_password"
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
        <div>
          <label
            htmlFor="scanner_password_confirmation"
            className="mb-1.5 block text-xs font-semibold text-slate-700"
          >
            Confirm password
          </label>
          <input
            id="scanner_password_confirmation"
            type="password"
            required
            minLength={8}
            value={form.password_confirmation}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                password_confirmation: event.target.value,
              }))
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 sm:col-span-2">
            {success}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:col-span-2"
        >
          {saving ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {saving ? 'Creating…' : 'Create scanner account'}
        </button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Existing scanners
        </p>
        {loading ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading…
          </p>
        ) : !hasScanners ? (
          <p className="mt-3 text-sm text-slate-500">No scanner accounts yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {scanners.map((scanner) => (
              <li
                key={scanner.uuid}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {scanner.full_name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {scanner.email}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                  Scanner
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}
