import { schoolAdminApi } from '@/lib/api'

export type TeacherPosition =
  | 'student_teacher'
  | 'regular_teacher'
  | 'mid_level_teacher'
  | 'senior_teacher'
  | 'supervisor'
  | 'head'

export type TeacherStatus = 'active' | 'inactive'

export interface Teacher {
  uuid: string
  school_uuid: string
  faculty_uuid: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  email: string
  phone_number: string | null
  employee_id: string
  prc_license: string | null
  position: TeacherPosition
  position_label: string
  hire_date: string | null
  notes: string | null
  status: TeacherStatus
  user_uuid?: string | null
  has_portal_account?: boolean
  portal_email?: string | null
  faculty: {
    uuid: string
    name: string
    code: string
  } | null
  created_at: string
  updated_at: string
}

export interface TeacherPositionOption {
  value: TeacherPosition
  label: string
}

export interface CreateTeacherPayload {
  first_name: string
  middle_name?: string
  last_name: string
  email: string
  phone_number?: string
  employee_id: string
  prc_license?: string | null
  position: TeacherPosition
  faculty_uuid?: string | null
  hire_date?: string | null
  notes?: string | null
  status?: TeacherStatus
  create_portal_account?: boolean
  portal_password?: string
}

export type UpdateTeacherPayload = CreateTeacherPayload

export interface TeacherListFilters {
  facultyUuid?: string
  levelUuid?: string
}

interface ResourceResponse<T> {
  data: T
}

export const teacherService = {
  async list(filters?: string | TeacherListFilters): Promise<Teacher[]> {
    const normalized =
      typeof filters === 'string' ? { facultyUuid: filters } : filters

    const response = await schoolAdminApi.get<ResourceResponse<Teacher[]>>(
      '/teachers',
      {
        params: {
          ...(normalized?.facultyUuid
            ? { faculty_uuid: normalized.facultyUuid }
            : {}),
          ...(normalized?.levelUuid
            ? { level_uuid: normalized.levelUuid }
            : {}),
        },
      },
    )
    return response.data.data
  },

  async get(uuid: string): Promise<Teacher> {
    const response = await schoolAdminApi.get<ResourceResponse<Teacher>>(
      `/teachers/${uuid}`,
    )
    return response.data.data
  },

  async positions(): Promise<TeacherPositionOption[]> {
    const response = await schoolAdminApi.get<
      ResourceResponse<TeacherPositionOption[]>
    >('/teachers/positions')
    return response.data.data
  },

  async create(payload: CreateTeacherPayload): Promise<Teacher> {
    const response = await schoolAdminApi.post<ResourceResponse<Teacher>>(
      '/teachers',
      payload,
    )
    return response.data.data
  },

  async update(uuid: string, payload: UpdateTeacherPayload): Promise<Teacher> {
    const response = await schoolAdminApi.put<ResourceResponse<Teacher>>(
      `/teachers/${uuid}`,
      payload,
    )
    return response.data.data
  },
}
