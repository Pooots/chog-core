import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import './styles.css'
import '@/i18n'
import { AppProviders } from './AppProviders'
import { isTokenValid } from '@/lib/tokenUtils'
import SuperAdminLoginPage from '@/routes/admin/SuperAdminLoginPage'
import SuperAdminDashboardPage from '@/routes/admin/SuperAdminDashboardPage'
import SchoolAdminLoginPage from '@/routes/admin/SchoolAdminLoginPage'
import SchoolAdminDashboardPage from '@/routes/admin/SchoolAdminDashboardPage'
import SchoolComingSoonPage from '@/routes/admin/SchoolComingSoonPage'
import FacultiesPage from '@/routes/admin/FacultiesPage'
import CreateFacultyPage from '@/routes/admin/CreateFacultyPage'
import EditFacultyPage from '@/routes/admin/EditFacultyPage'
import FacultyTeachersPage from '@/routes/admin/FacultyTeachersPage'
import RoomsPage from '@/routes/admin/RoomsPage'
import CreateLevelPage from '@/routes/admin/CreateLevelPage'
import CreateRoomPage from '@/routes/admin/CreateRoomPage'
import EditRoomPage from '@/routes/admin/EditRoomPage'
import RoomSchedulesPage from '@/routes/admin/RoomSchedulesPage'
import CreateRoomSchedulePage from '@/routes/admin/CreateRoomSchedulePage'
import EditRoomSchedulePage from '@/routes/admin/EditRoomSchedulePage'
import SubjectsPage from '@/routes/admin/SubjectsPage'
import CreateSubjectPage from '@/routes/admin/CreateSubjectPage'
import TeachersPage from '@/routes/admin/TeachersPage'
import CreateTeacherPage from '@/routes/admin/CreateTeacherPage'
import EditTeacherPage from '@/routes/admin/EditTeacherPage'
import TeacherSchedulesPage from '@/routes/admin/TeacherSchedulesPage'
import CreateTeacherSchedulePage from '@/routes/admin/CreateTeacherSchedulePage'
import RegistrarPage from '@/routes/admin/RegistrarPage'
import EnrollStudentPage from '@/routes/admin/EnrollStudentPage'
import EditStudentPage from '@/routes/admin/EditStudentPage'
import GateScanPage from '@/routes/admin/GateScanPage'
import ComingSoonPage from '@/routes/admin/ComingSoonPage'
import SchoolsPage from '@/routes/admin/SchoolsPage'
import CreateSchoolPage from '@/routes/admin/CreateSchoolPage'
import HomeLoginPage from '@/routes/HomeLoginPage'
import SignupPage from '@/routes/SignupPage'
import PortalHomePage from '@/routes/portal/PortalHomePage'
import { authService } from '@/services/authService'
import { schoolAuthService } from '@/services/schoolAuthService'
import type { PortalRole } from '@/types/auth'

const schoolAdminHomePath = () =>
  schoolAuthService.isScanner() ? '/admin/gate' : '/admin/dashboard'

const rootRoute = createRootRoute({
  component: () => <Outlet />,
})

const requirePortal = (role: PortalRole) => {
  if (!isTokenValid(localStorage.getItem('auth_token'))) {
    throw redirect({ to: '/' })
  }
  if (authService.getRole() !== role) {
    throw redirect({ to: authService.homeForRole(authService.getRole()) })
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const role = authService.getRole()
    if (role && isTokenValid(localStorage.getItem('auth_token'))) {
      throw redirect({ to: authService.homeForRole(role) })
    }
  },
  component: HomeLoginPage,
})

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  beforeLoad: () => {
    throw redirect({ to: '/signup/student' })
  },
})

const signupStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup/student',
  beforeLoad: () => {
    const role = authService.getRole()
    if (role && isTokenValid(localStorage.getItem('auth_token'))) {
      throw redirect({ to: authService.homeForRole(role) })
    }
  },
  component: () => <SignupPage role="student" />,
})

const signupParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup/parent',
  beforeLoad: () => {
    const role = authService.getRole()
    if (role && isTokenValid(localStorage.getItem('auth_token'))) {
      throw redirect({ to: authService.homeForRole(role) })
    }
  },
  component: () => <SignupPage role="parent" />,
})

const signupTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup/teacher',
  beforeLoad: () => {
    const role = authService.getRole()
    if (role && isTokenValid(localStorage.getItem('auth_token'))) {
      throw redirect({ to: authService.homeForRole(role) })
    }
  },
  component: () => <SignupPage role="teacher" />,
})

const portalStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/student',
  beforeLoad: () => requirePortal('student'),
  component: () => <PortalHomePage role="student" />,
})

const portalParentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/parent',
  beforeLoad: () => requirePortal('parent'),
  component: () => <PortalHomePage role="parent" />,
})

const portalTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal/teacher',
  beforeLoad: () => requirePortal('teacher'),
  component: () => <PortalHomePage role="teacher" />,
})

const schoolAdminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  beforeLoad: () => {
    if (isTokenValid(localStorage.getItem('school_admin_token'))) {
      throw redirect({ to: schoolAdminHomePath() })
    }
  },
  component: SchoolAdminLoginPage,
})

const requireSchoolAdmin = () => {
  if (!isTokenValid(localStorage.getItem('school_admin_token'))) {
    throw redirect({ to: '/admin/login' })
  }
}

const requireSchoolAdminPrincipal = () => {
  requireSchoolAdmin()
  if (schoolAuthService.isScanner()) {
    throw redirect({ to: '/admin/gate' })
  }
}

const schoolAdminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  beforeLoad: requireSchoolAdminPrincipal,
  component: SchoolAdminDashboardPage,
})

const schoolFacultiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/faculties',
  beforeLoad: requireSchoolAdminPrincipal,
  component: FacultiesPage,
})

const createFacultyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/faculties/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateFacultyPage,
})

const editFacultyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/faculties/$facultyUuid/edit',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EditFacultyPage,
})

const facultyTeachersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/faculties/$facultyUuid',
  beforeLoad: requireSchoolAdminPrincipal,
  component: FacultyTeachersPage,
})

const schoolRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms',
  beforeLoad: requireSchoolAdminPrincipal,
  component: RoomsPage,
})

const createLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/levels/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateLevelPage,
})

const createRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateRoomPage,
})

const editRoomRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/$roomUuid/edit',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EditRoomPage,
})

const roomSchedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/$roomUuid/schedules',
  beforeLoad: requireSchoolAdminPrincipal,
  component: RoomSchedulesPage,
})

const createRoomScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/$roomUuid/schedules/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateRoomSchedulePage,
})

const editRoomScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/rooms/$roomUuid/schedules/$scheduleUuid/edit',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EditRoomSchedulePage,
})

const schoolSubjectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/subjects',
  beforeLoad: requireSchoolAdminPrincipal,
  component: SubjectsPage,
})

const createSubjectLevelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/subjects/levels/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateLevelPage,
})

const createSubjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/subjects/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateSubjectPage,
})

const schoolTeachersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/teachers',
  beforeLoad: requireSchoolAdminPrincipal,
  component: TeachersPage,
})

const createTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/teachers/create',
  beforeLoad: requireSchoolAdminPrincipal,
  validateSearch: (search: Record<string, unknown>) => ({
    faculty: typeof search.faculty === 'string' ? search.faculty : undefined,
  }),
  component: CreateTeacherPage,
})

const editTeacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/teachers/$teacherUuid/edit',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EditTeacherPage,
})

const teacherSchedulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/teachers/$teacherUuid/schedules',
  beforeLoad: requireSchoolAdminPrincipal,
  component: TeacherSchedulesPage,
})

const createTeacherScheduleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/teachers/$teacherUuid/schedules/create',
  beforeLoad: requireSchoolAdminPrincipal,
  component: CreateTeacherSchedulePage,
})

const schoolRegistrarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/registrar',
  beforeLoad: requireSchoolAdminPrincipal,
  component: RegistrarPage,
})

const enrollStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/registrar/enroll',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EnrollStudentPage,
})

const editStudentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/registrar/$studentUuid/edit',
  beforeLoad: requireSchoolAdminPrincipal,
  component: EditStudentPage,
})

const schoolGateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/gate',
  beforeLoad: requireSchoolAdmin,
  component: GateScanPage,
})

const schoolStaffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/staff',
  beforeLoad: requireSchoolAdminPrincipal,
  component: () => <SchoolComingSoonPage title="Staff" />,
})

const schoolSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  beforeLoad: requireSchoolAdminPrincipal,
  component: () => <SchoolComingSoonPage title="Settings" />,
})

const superAdminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/login',
  beforeLoad: () => {
    if (isTokenValid(localStorage.getItem('admin_token'))) {
      throw redirect({ to: '/admin/super/dashboard' })
    }
  },
  component: SuperAdminLoginPage,
})

const requireSuperAdmin = () => {
  if (!isTokenValid(localStorage.getItem('admin_token'))) {
    throw redirect({ to: '/admin/super/login' })
  }
}

const superAdminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/dashboard',
  beforeLoad: requireSuperAdmin,
  component: SuperAdminDashboardPage,
})

const schoolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/school',
  beforeLoad: requireSuperAdmin,
  component: SchoolsPage,
})

const createSchoolRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/school/create',
  beforeLoad: requireSuperAdmin,
  component: CreateSchoolPage,
})

const studentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/student',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Students" />,
})

const attendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/attendance',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Attendance" />,
})

const assignmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/assignment',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Assignments" />,
})

const behaviorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/behavior',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Behavior" />,
})

const performanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/performance',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Performance" />,
})

const calendarRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/calendar',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Calendar" />,
})

const messageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/message',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Messages" />,
})

const parentPortalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/parent-portal',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Parent Portal" />,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/super/settings',
  beforeLoad: requireSuperAdmin,
  component: () => <ComingSoonPage title="Settings" />,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  signupRoute,
  signupStudentRoute,
  signupParentRoute,
  signupTeacherRoute,
  portalStudentRoute,
  portalParentRoute,
  portalTeacherRoute,
  schoolAdminLoginRoute,
  schoolAdminDashboardRoute,
  schoolFacultiesRoute,
  createFacultyRoute,
  editFacultyRoute,
  facultyTeachersRoute,
  schoolRoomsRoute,
  createLevelRoute,
  createRoomRoute,
  editRoomRoute,
  roomSchedulesRoute,
  createRoomScheduleRoute,
  editRoomScheduleRoute,
  schoolSubjectsRoute,
  createSubjectLevelRoute,
  createSubjectRoute,
  schoolTeachersRoute,
  createTeacherRoute,
  editTeacherRoute,
  teacherSchedulesRoute,
  createTeacherScheduleRoute,
  schoolRegistrarRoute,
  enrollStudentRoute,
  editStudentRoute,
  schoolGateRoute,
  schoolStaffRoute,
  schoolSettingsRoute,
  superAdminLoginRoute,
  superAdminDashboardRoute,
  schoolRoute,
  createSchoolRoute,
  studentRoute,
  attendanceRoute,
  assignmentRoute,
  behaviorRoute,
  performanceRoute,
  calendarRoute,
  messageRoute,
  parentPortalRoute,
  settingsRoute,
])

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}
