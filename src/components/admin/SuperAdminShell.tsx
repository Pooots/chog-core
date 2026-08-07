import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  Bot,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleUserRound,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react'
import { adminAuthService } from '@/services/adminAuthService'
import type { AdminUser } from '@/types/auth'

type Icon = ComponentType<{ className?: string }>

export const superAdminNavigation: Array<{
  label: string
  path:
    | '/admin/super/dashboard'
    | '/admin/super/school'
    | '/admin/super/student'
    | '/admin/super/attendance'
    | '/admin/super/assignment'
    | '/admin/super/behavior'
    | '/admin/super/performance'
    | '/admin/super/calendar'
    | '/admin/super/message'
    | '/admin/super/parent-portal'
    | '/admin/super/settings'
  icon: Icon
}> = [
  {
    label: 'Dashboard',
    path: '/admin/super/dashboard',
    icon: LayoutDashboard,
  },
  { label: 'Schools', path: '/admin/super/school', icon: Building2 },
  { label: 'Students', path: '/admin/super/student', icon: UsersRound },
  {
    label: 'Attendance',
    path: '/admin/super/attendance',
    icon: ClipboardCheck,
  },
  {
    label: 'Assignments',
    path: '/admin/super/assignment',
    icon: BookOpenCheck,
  },
  { label: 'Behavior', path: '/admin/super/behavior', icon: ShieldCheck },
  { label: 'Performance', path: '/admin/super/performance', icon: BarChart3 },
  { label: 'Calendar', path: '/admin/super/calendar', icon: CalendarDays },
  { label: 'Messages', path: '/admin/super/message', icon: MessageSquare },
  {
    label: 'Parent Portal',
    path: '/admin/super/parent-portal',
    icon: CircleUserRound,
  },
  { label: 'Settings', path: '/admin/super/settings', icon: Settings },
]

function getStoredAdmin(): AdminUser | null {
  try {
    const value = localStorage.getItem('admin_user')
    return value ? (JSON.parse(value) as AdminUser) : null
  } catch {
    return null
  }
}

function SuperAdminSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      ) : null}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
              <GraduationCap className="h-5 w-5" />
            </span>
            <div>
              <p className="text-base font-bold leading-none text-slate-950">
                Chog
              </p>
              <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                School Platform
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3">
          <p className="px-3 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Main
          </p>
          <div className="space-y-1">
            {superAdminNavigation.map((item) => {
              const NavIcon = item.icon
              const active =
                pathname === item.path ||
                (item.path === '/admin/super/school' &&
                  pathname.startsWith('/admin/super/school/'))
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={onClose}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                  }`}
                >
                  <NavIcon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="m-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-4 text-white shadow-lg shadow-blue-600/15">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Bot className="h-4 w-4" />
            AI Insights
          </div>
          <p className="mt-2 text-[11px] leading-4 text-blue-100">
            Weekly performance reports and risk detection are ready.
          </p>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-white/15 py-2 text-[10px] font-semibold transition hover:bg-white/25"
          >
            View Reports
          </button>
        </div>
      </aside>
    </>
  )
}

export function SuperAdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const admin = useMemo(getStoredAdmin, [])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = admin?.first_name || 'Administrator'
  const fullName = admin?.full_name || 'Chog Administrator'

  const handleLogout = async () => {
    adminAuthService.logout()
    await navigate({ to: '/admin/super/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SuperAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Search"
                placeholder="Search students, classes..."
                className="h-10 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 md:flex"
            >
              Super Administrator
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Toggle dark mode"
              className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Notifications"
              className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((value) => !value)}
                className="flex items-center gap-2 rounded-xl p-1.5 text-left hover:bg-slate-50"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {displayName.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:block">
                  <span className="block max-w-32 truncate text-xs font-semibold">
                    {fullName}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    Super Admin
                  </span>
                </span>
              </button>

              {profileOpen ? (
                <div className="absolute right-0 top-12 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <div className="border-b border-slate-100 px-3 py-2">
                    <p className="truncate text-xs font-semibold">{fullName}</p>
                    <p className="truncate text-[10px] text-slate-400">
                      {admin?.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
