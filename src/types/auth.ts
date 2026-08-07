export interface PortalSchool {
  uuid: string
  name: string
  code: string
  status: string
}

export interface PortalUser {
  uuid: string
  school_uuid: string | null
  email: string
  login_identifier: string | null
  first_name: string
  middle_name?: string | null
  last_name: string
  full_name: string
  phone_number?: string | null
  status?: string
  is_first_time_login?: boolean
  role?: {
    uuid: string
    name: string
    code: string
    is_admin: boolean
  } | null
  school?: PortalSchool | null
  created_at: string
  updated_at: string
}

export type PortalRole = 'student' | 'parent' | 'teacher'

export interface PortalLoginPayload {
  role: PortalRole
  password: string
  student_number?: string
  email?: string
}

export interface PortalRegisterPayload {
  role: PortalRole
  password: string
  password_confirmation: string
  student_number?: string
  lrn_number?: string
  employee_id?: string
  prc_license?: string
  email?: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

export interface PortalAuthResponse {
  access_token: string
  token_type: string
  expires_in: string | number
  user: PortalUser
  role: PortalRole
  school: PortalSchool | null
  profile: unknown
}

export interface PortalParentStudent {
  uuid: string
  first_name: string
  middle_name?: string | null
  last_name: string
  full_name?: string
  student_number: string
  lrn_number: string
  email?: string | null
  phone_number?: string | null
  gender?: string | null
  birth_date?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  enrollment_date?: string | null
  enrollment_status?: string
  enrollment_status_label?: string
  notes?: string | null
  status?: string
  has_portal_account?: boolean
  level?: {
    uuid: string
    name: string
    code: string
  } | null
  room?: PortalStudentRoom | null
}

export interface PortalStudentRoom {
  uuid: string
  name: string
  code: string
  capacity?: number | null
  building?: string | null
  description?: string | null
  start_time?: string | null
  end_time?: string | null
  status?: string
  level?: {
    uuid: string
    name: string
    code: string
  } | null
}

export interface PortalStudentProfile {
  uuid: string
  full_name: string
  student_number: string
  lrn_number: string
  enrollment_status?: string
  enrollment_status_label?: string
  level?: {
    uuid: string
    name: string
    code: string
  } | null
  room?: PortalStudentRoom | null
}

export interface PortalParentProfile {
  uuid: string
  full_name: string
  phone_number?: string | null
  status?: string
  students: PortalParentStudent[]
}

export interface PortalTeacherProfile {
  uuid: string
  full_name: string
  first_name: string
  middle_name?: string | null
  last_name: string
  email: string
  phone_number?: string | null
  employee_id: string
  prc_license?: string | null
  position?: string
  position_label?: string
  hire_date?: string | null
  notes?: string | null
  status?: string
  faculty?: {
    uuid: string
    name: string
    code: string
  } | null
}

export interface PortalLinkStudentPayload {
  student_number: string
  lrn_number: string
  relationship?: string
}

export interface PortalLinkStudentResponse {
  message: string
  user: PortalUser
  role: PortalRole
  school: PortalSchool | null
  profile: PortalParentProfile
}

export interface PortalMeResponse {
  user: PortalUser
  role: PortalRole
  school: PortalSchool | null
  profile: unknown
}

/** @deprecated Prefer PortalUser for portal auth */
export interface User {
  uuid: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string | null
  birth_date?: string
  email_verified_at?: string
  role?: string
  created_at: string
  updated_at: string
}

export interface AdminUser {
  uuid: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number?: string
  status?: string
  school_uuid?: string | null
  email_verified_at?: string
  last_login_at?: string
  created_at: string
  updated_at: string
  role?: {
    uuid: string
    name: string
    code: string
    description?: string
    is_admin: boolean
  }
  school?: {
    uuid: string
    name: string
    code: string
    status: string
  } | null
}

export interface LoginCredentials {
  email: string
  password: string
  is_admin?: boolean
}

export interface RegisterData {
  email: string
  first_name: string
  last_name: string
  birth_date?: string
  phone_number?: string
  password: string
  password_confirmation?: string
  role?: PortalRole
}

export interface AuthResponse {
  access_token: string
  token_type: string
  expires_in: string | number
  user: User
  role?: string
}

export interface AdminAuthResponse {
  access_token: string
  token_type: string
  expires_in: string | number
  admin_user: AdminUser
  role?: string
  is_admin?: boolean
}

export interface JWTPayload {
  iss: string
  iat: number
  exp: number
  nbf: number
  jti: string
  sub: string
  prv: string
  role: string
  permissions: string[]
  user_uuid: string
  role_uuid: string
  school_uuid?: string
  is_admin: boolean
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
