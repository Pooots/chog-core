import type { ComponentType } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  CheckSquare,
  ClipboardCheck,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import type { AdminUser } from '@/types/auth'

type Icon = ComponentType<{ className?: string }>

const metrics: Array<{
  label: string
  value: string
  change: string
  direction: 'up' | 'down'
  icon: Icon
  color: string
}> = [
  {
    label: 'Total Students',
    value: '0',
    change: '0%',
    direction: 'up',
    icon: UsersRound,
    color: 'bg-blue-600',
  },
  {
    label: 'Teachers',
    value: '0',
    change: '0%',
    direction: 'up',
    icon: GraduationCap,
    color: 'bg-emerald-500',
  },
  {
    label: 'Present Today',
    value: '0',
    change: '0%',
    direction: 'up',
    icon: ClipboardCheck,
    color: 'bg-cyan-500',
  },
  {
    label: 'Active Classes',
    value: '0',
    change: '0%',
    direction: 'up',
    icon: CheckSquare,
    color: 'bg-orange-500',
  },
]

function getStoredSchoolAdmin(): AdminUser | null {
  try {
    const value = localStorage.getItem('school_admin_user')
    return value ? (JSON.parse(value) as AdminUser) : null
  } catch {
    return null
  }
}

function MetricCard({ metric }: { metric: (typeof metrics)[number] }) {
  const MetricIcon = metric.icon
  const ChangeIcon = metric.direction === 'up' ? TrendingUp : TrendingDown
  const isPositive = metric.direction === 'up'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {metric.value}
          </p>
        </div>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-sm ${metric.color}`}
        >
          <MetricIcon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1 text-[11px]">
        <span
          className={`flex items-center gap-1 font-semibold ${
            isPositive ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          <ChangeIcon className="h-3.5 w-3.5" />
          {metric.change}
        </span>
        <span className="text-slate-400">vs last week</span>
      </div>
    </article>
  )
}

export default function SchoolAdminDashboardPage() {
  const admin = getStoredSchoolAdmin()
  const displayName = admin?.full_name || admin?.first_name || 'Principal'
  const schoolName = admin?.school?.name ?? 'Your school'
  const schoolCode = admin?.school?.code

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                School Portal
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Welcome back, {displayName}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {schoolName}
                {schoolCode ? ` · ${schoolCode}` : ''} — principal dashboard
              </p>
            </div>
          </div>

          <section
            aria-label="School metrics"
            className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {metrics.map((metric) => (
              <MetricCard key={metric.label} metric={metric} />
            ))}
          </section>

          <section className="mt-5 grid gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Today at a glance
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Campus activity overview for your school
                  </p>
                </div>
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  {
                    label: 'Attendance rate',
                    value: '—',
                    hint: 'No data yet',
                  },
                  {
                    label: 'Pending assignments',
                    value: '0',
                    hint: 'Awaiting review',
                  },
                  {
                    label: 'Messages',
                    value: '0',
                    hint: 'Unread inbox',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <p className="text-[11px] font-medium text-slate-400">
                      {item.label}
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {item.value}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">{item.hint}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <BookOpenCheck className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Quick actions
                </h2>
              </div>
              <ul className="mt-4 space-y-2">
                {[
                  'Add students',
                  'Create class schedule',
                  'Record attendance',
                  'Post announcement',
                ].map((action) => (
                  <li
                    key={action}
                    className="rounded-xl border border-slate-100 px-3 py-2.5 text-sm text-slate-600"
                  >
                    {action}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[11px] leading-4 text-slate-400">
                School modules will unlock here as they are added to your
                campus.
              </p>
            </article>
          </section>
        </div>
      </main>
    </SchoolAdminShell>
  )
}
