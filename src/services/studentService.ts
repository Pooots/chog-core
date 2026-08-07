import { schoolAdminApi } from '@/lib/api'

export type StudentEnrollmentStatus = 'enrolled' | 'pending' | 'withdrawn'
export type StudentStatus = 'active' | 'inactive'
export type StudentGender = 'male' | 'female' | 'other'

export interface Student {
  uuid: string
  school_uuid: string
  level_uuid: string | null
  room_uuid: string | null
  first_name: string
  middle_name: string | null
  last_name: string
  full_name: string
  lrn_number: string
  student_number: string
  email: string | null
  phone_number: string | null
  gender: StudentGender | null
  birth_date: string | null
  guardian_name: string | null
  guardian_phone: string | null
  enrollment_date: string | null
  enrollment_status: StudentEnrollmentStatus
  enrollment_status_label: string
  notes: string | null
  status: StudentStatus
  user_uuid?: string | null
  has_portal_account?: boolean
  portal_email?: string | null
  parents?: Array<{
    uuid: string
    full_name: string
    phone_number: string | null
    email?: string | null
  }>
  level: {
    uuid: string
    name: string
    code: string
  } | null
  room: {
    uuid: string
    name: string
    code: string
    capacity?: number | null
    building?: string | null
    level?: {
      uuid: string
      name: string
      code: string
    } | null
  } | null
  created_at: string
  updated_at: string
}

export interface CreateStudentPayload {
  first_name: string
  middle_name?: string
  last_name: string
  lrn_number: string
  student_number: string
  email?: string | null
  phone_number?: string | null
  gender?: StudentGender | null
  birth_date?: string | null
  guardian_name?: string | null
  guardian_phone?: string | null
  level_uuid?: string | null
  room_uuid?: string | null
  enrollment_date?: string | null
  enrollment_status?: StudentEnrollmentStatus
  notes?: string | null
  status?: StudentStatus
  create_portal_account?: boolean
  portal_password?: string
  create_parent_portal_account?: boolean
  parent_portal_email?: string
  parent_portal_password?: string
}

export type UpdateStudentPayload = CreateStudentPayload

export interface EntranceScanRecord {
  uuid: string
  direction: string
  direction_label: string
  source: string
  scanned_identifier: string | null
  scanned_at: string
  student: {
    uuid: string
    full_name: string
    student_number: string
    lrn_number?: string | null
    level?: { uuid: string; name: string } | null
    room?: { uuid: string; name: string; code: string } | null
  } | null
}

interface ResourceResponse<T> {
  data: T
}

export const studentService = {
  async list(levelUuid?: string): Promise<Student[]> {
    const response = await schoolAdminApi.get<ResourceResponse<Student[]>>(
      '/students',
      {
        params: levelUuid ? { level_uuid: levelUuid } : undefined,
      },
    )
    return response.data.data
  },

  async get(uuid: string): Promise<Student> {
    const response = await schoolAdminApi.get<ResourceResponse<Student>>(
      `/students/${uuid}`,
    )
    return response.data.data
  },

  async create(payload: CreateStudentPayload): Promise<Student> {
    const response = await schoolAdminApi.post<ResourceResponse<Student>>(
      '/students',
      payload,
    )
    return response.data.data
  },

  async update(uuid: string, payload: UpdateStudentPayload): Promise<Student> {
    const response = await schoolAdminApi.put<ResourceResponse<Student>>(
      `/students/${uuid}`,
      payload,
    )
    return response.data.data
  },

  async listEntrances(date?: string): Promise<{
    data: EntranceScanRecord[]
    meta: {
      date: string
      timezone: string
      summary: {
        in: number
        out: number
        total: number
      }
    }
  }> {
    const response = await schoolAdminApi.get<{
      data: EntranceScanRecord[]
      meta: {
        date: string
        timezone: string
        summary: {
          in: number
          out: number
          total: number
        }
      }
    }>('/students/entrance', {
      params: date ? { date } : undefined,
    })
    return response.data
  },

  async recordEntrance(payload: {
    student_number: string
    direction?: 'in' | 'out'
  }): Promise<{
    uuid: string
    direction: string
    direction_label: string
    scanned_at: string
    student: Student
  }> {
    const response = await schoolAdminApi.post<{
      data: {
        uuid: string
        direction: string
        direction_label: string
        scanned_at: string
        student: Student
      }
    }>('/students/entrance', payload)
    return response.data.data
  },
}
