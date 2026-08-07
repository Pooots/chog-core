import { useMemo, useState, type ComponentType, type ReactNode } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardList,
  DoorOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ScanLine,
  Search,
  Settings,
  UserCog,
  X,
} from 'lucide-react'
import { schoolAuthService } from '@/services/schoolAuthService'
import type { AdminUser } from '@/types/auth'

type Icon = ComponentType<{ className?: string }>

type SchoolAdminPath =
  | '/admin/dashboard'
  | '/admin/faculties'
  | '/admin/faculties/create'
  | '/admin/faculties/$facultyUuid'
  | '/admin/faculties/$facultyUuid/edit'
  | '/admin/rooms'
  | '/admin/rooms/create'
  | '/admin/rooms/levels/create'
  | '/admin/rooms/$roomUuid/schedules'
  | '/admin/rooms/$roomUuid/schedules/create'
  | '/admin/subjects'
  | '/admin/subjects/create'
  | '/admin/subjects/levels/create'
  | '/admin/teachers'
  | '/admin/teachers/create'
  | '/admin/teachers/$teacherUuid/edit'
  | '/admin/teachers/$teacherUuid/schedules'
  | '/admin/teachers/$teacherUuid/schedules/create'
  | '/admin/registrar'
  | '/admin/registrar/enroll'
  | '/admin/registrar/$studentUuid/edit'
  | '/admin/gate'
  | '/admin/staff'
  | '/admin/settings'

export const schoolAdminNavigation: Array<{
  label: string
  path: SchoolAdminPath
  icon: Icon
}> = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Faculties',
    path: '/admin/faculties',
    icon: Building2,
  },
  {
    label: 'Rooms',
    path: '/admin/rooms',
    icon: DoorOpen,
  },
  {
    label: 'Subjects',
    path: '/admin/subjects',
    icon: BookOpen,
  },
  {
    label: 'Teachers',
    path: '/admin/teachers',
    icon: GraduationCap,
  },
  {
    label: 'Registrar',
    path: '/admin/registrar',
    icon: ClipboardList,
  },
  {
    label: 'Gate',
    path: '/admin/gate',
    icon: ScanLine,
  },
]

export const schoolAdminComingSoon: Array<{
  label: string
  path: SchoolAdminPath
  icon: Icon
}> = [
  { label: 'Staff', path: '/admin/staff', icon: UserCog },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
]

function getStoredSchoolAdmin(): AdminUser | null {
  try {
    const value = localStorage.getItem('school_admin_user')
    return value ? (JSON.parse(value) as AdminUser) : null
  } catch {
    return null
  }
}

function SchoolAdminSidebar({
  isOpen,
  onClose,
  schoolName,
  roleCode,
}: {
  isOpen: boolean
  onClose: () => void
  schoolName: string
  roleCode: string
}) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const isScanner = roleCode === 'scanner'
  const navigation = isScanner
    ? schoolAdminNavigation.filter((item) => item.path === '/admin/gate')
    : schoolAdminNavigation

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
              <p className="mt-1 max-w-[9rem] truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                {schoolName}
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
            {navigation.map((item) => {
              const NavIcon = item.icon
              const active =
                pathname === item.path ||
                (item.path === '/admin/faculties' &&
                  pathname.startsWith('/admin/faculties/')) ||
                (item.path === '/admin/rooms' &&
                  pathname.startsWith('/admin/rooms/')) ||
                (item.path === '/admin/subjects' &&
                  pathname.startsWith('/admin/subjects/')) ||
                (item.path === '/admin/teachers' &&
                  pathname.startsWith('/admin/teachers/')) ||
                (item.path === '/admin/registrar' &&
                  pathname.startsWith('/admin/registrar/'))
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

          {!isScanner ? (
            <>
              <p className="mt-5 px-3 pb-2 pt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Coming soon
              </p>
              <div className="space-y-1">
                {schoolAdminComingSoon.map((item) => {
                  const NavIcon = item.icon
                  const active = pathname === item.path
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={onClose}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                        active
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <NavIcon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </>
          ) : null}
        </nav>
      </aside>
    </>
  )
}

export function SchoolAdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const admin = useMemo(getStoredSchoolAdmin, [])
  const roleCode = useMemo(
    () =>
      schoolAuthService.getRole() ??
      admin?.role?.code ??
      'principal',
    [admin],
  )
  const isScanner = roleCode === 'scanner'
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const displayName = admin?.first_name || (isScanner ? 'Scanner' : 'Principal')
  const fullName =
    admin?.full_name || (isScanner ? 'Gate Scanner' : 'School Principal')
  const schoolName = admin?.school?.name ?? 'School Portal'
  const roleLabel = isScanner ? 'Scanner' : 'Principal'

  const handleLogout = async () => {
    schoolAuthService.logout()
    await navigate({ to: '/admin/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <SchoolAdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        schoolName={schoolName}
        roleCode={roleCode}
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
            {!isScanner ? (
              <div className="relative hidden sm:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  aria-label="Search"
                  placeholder="Search students, classes..."
                  className="h-10 w-72 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            ) : (
              <p className="hidden text-sm font-semibold text-slate-600 sm:block">
                Gate / Entrance
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="hidden items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 md:flex"
            >
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              {roleLabel}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {!isScanner ? (
              <button
                type="button"
                aria-label="Notifications"
                className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />
              </button>
            ) : null}

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
                  <span className="block max-w-32 truncate text-[10px] text-slate-400">
                    {schoolName}
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
