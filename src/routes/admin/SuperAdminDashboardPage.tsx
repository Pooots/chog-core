import type { ComponentType } from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  CheckSquare,
  CircleUserRound,
  ClipboardCheck,
  Clock3,
  GraduationCap,
  Plus,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from 'lucide-react'
import { SuperAdminShell } from '@/components/admin/SuperAdminShell'

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
    value: '1,248',
    change: '4.2%',
    direction: 'up',
    icon: UsersRound,
    color: 'bg-blue-600',
  },
  {
    label: 'Total Teachers',
    value: '86',
    change: '2.1%',
    direction: 'up',
    icon: GraduationCap,
    color: 'bg-emerald-500',
  },
  {
    label: 'Total Parents',
    value: '1,180',
    change: '6.5%',
    direction: 'up',
    icon: CircleUserRound,
    color: 'bg-cyan-500',
  },
  {
    label: 'Active Classes',
    value: '42',
    change: '1.8%',
    direction: 'up',
    icon: CheckSquare,
    color: 'bg-orange-500',
  },
  {
    label: 'Present Today',
    value: '1,198',
    change: '3.1%',
    direction: 'up',
    icon: ClipboardCheck,
    color: 'bg-emerald-500',
  },
  {
    label: 'Absent Today',
    value: '50',
    change: '1.4%',
    direction: 'down',
    icon: CalendarDays,
    color: 'bg-rose-500',
  },
  {
    label: 'Pending Assignments',
    value: '34',
    change: '5.2%',
    direction: 'down',
    icon: BookOpenCheck,
    color: 'bg-orange-500',
  },
  {
    label: 'School Performance',
    value: '87.4%',
    change: '2.3%',
    direction: 'up',
    icon: TrendingUp,
    color: 'bg-blue-600',
  },
]

function MetricCard({
  metric,
}: {
  metric: (typeof metrics)[number]
}) {
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
            isPositive ? 'text-emerald-600' : 'text-rose-500'
          }`}
        >
          <ChangeIcon className="h-3 w-3" />
          {metric.change}
        </span>
        <span className="text-slate-400">vs last month</span>
      </div>
    </article>
  )
}

function LineChart({
  title,
  subtitle,
  data,
  labels,
  color,
  badge,
}: {
  title: string
  subtitle: string
  data: number[]
  labels: string[]
  color: string
  badge?: string
}) {
  const points = data
    .map((value, index) => {
      const x = 16 + (index * 318) / (data.length - 1)
      const y = 112 - ((value - 50) / 50) * 82
      return `${x},${y}`
    })
    .join(' ')
  const areaPoints = `16,120 ${points} 334,120`

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="text-[11px] text-slate-400">{subtitle}</p>
        </div>
        {badge ? (
          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600">
            {badge}
          </span>
        ) : null}
      </div>
      <div className="mt-3">
        <svg
          viewBox="0 0 350 145"
          className="h-40 w-full overflow-visible"
          role="img"
          aria-label={`${title} chart`}
        >
          <defs>
            <linearGradient id={`fill-${title.replaceAll(' ', '-')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[30, 60, 90, 120].map((y) => (
            <line
              key={y}
              x1="16"
              y1={y}
              x2="334"
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="0.7"
              strokeDasharray="3 3"
            />
          ))}
          <polygon
            points={areaPoints}
            fill={`url(#fill-${title.replaceAll(' ', '-')})`}
          />
          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {labels.map((label, index) => (
            <text
              key={label}
              x={16 + (index * 318) / (labels.length - 1)}
              y="140"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="8"
            >
              {label}
            </text>
          ))}
        </svg>
      </div>
    </article>
  )
}

function BarChart() {
  const bars = [
    { label: 'Math', value: 88 },
    { label: 'Science', value: 75 },
    { label: 'English', value: 92 },
    { label: 'History', value: 81 },
  ]

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        Assignment Completion
      </h3>
      <p className="text-[11px] text-slate-400">By subject</p>
      <div className="mt-4 grid h-40 grid-cols-4 items-end gap-4 border-b border-slate-100 px-3">
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="flex h-full flex-col items-center justify-end gap-2"
          >
            <div
              className="w-full max-w-16 rounded-t-lg bg-blue-600 shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
              style={{ height: `${bar.value}%` }}
              title={`${bar.value}%`}
            />
            <span className="pb-1 text-[9px] text-slate-400">{bar.label}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

export default function SuperAdminDashboardPage() {
  let displayName = 'Administrator'
  try {
    const storedAdmin = localStorage.getItem('admin_user')
    if (storedAdmin) {
      displayName =
        (JSON.parse(storedAdmin) as { first_name?: string }).first_name ||
        displayName
    }
  } catch {
    // Keep the fallback display name if storage is unavailable.
  }

  return (
    <SuperAdminShell>
      <main className="p-4 sm:p-6">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome back, {displayName}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Here&apos;s what&apos;s happening across your schools today.
                </p>
              </div>
              <button
                type="button"
                className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Quick Action
              </button>
            </div>

            <section
              aria-label="School overview"
              className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
            >
              {metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-2">
              <LineChart
                title="Attendance Trend"
                subtitle="Present vs absent this week"
                data={[93, 96, 90, 94, 96]}
                labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri']}
                color="#2563eb"
                badge="96% avg"
              />
              <BarChart />
              <LineChart
                title="Student Performance"
                subtitle="Average score over time"
                data={[68, 72, 77, 82, 86]}
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
                color="#10b981"
              />
              <LineChart
                title="Parent Engagement"
                subtitle="Active parents per month"
                data={[54, 61, 68, 79, 87]}
                labels={['Jan', 'Feb', 'Mar', 'Apr', 'May']}
                color="#f59e0b"
              />
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Recent Activity</h3>
                    <p className="text-[11px] text-slate-400">
                      Latest changes across the platform
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View all
                  </button>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {[
                    ['New student enrollment completed', '2 minutes ago'],
                    ['Teacher profile was updated', '18 minutes ago'],
                    ['Monthly attendance report generated', '1 hour ago'],
                  ].map(([activity, time]) => (
                    <div
                      key={activity}
                      className="flex items-center gap-3 py-3"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600">
                        <Clock3 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-slate-700">
                          {activity}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-lg">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </span>
                <h3 className="mt-5 text-base font-semibold">AI Weekly Brief</h3>
                <p className="mt-2 text-xs leading-5 text-slate-300">
                  Attendance improved by 3.1%. Three classes may need additional
                  academic support this week.
                </p>
                <button
                  type="button"
                  className="mt-5 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-900 hover:bg-blue-50"
                >
                  Open insights
                </button>
              </article>
            </section>
          </div>
      </main>
    </SuperAdminShell>
  )
}
