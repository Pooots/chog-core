import { schoolAdminApi } from '@/lib/api'

export type FacultyType =
  | 'academic'
  | 'senior_high'
  | 'special_program'
  | 'support'
  | 'other'

export type FacultyStatus = 'active' | 'inactive'

export interface Faculty {
  uuid: string
  school_uuid: string
  name: string
  code: string
  type: FacultyType
  type_label: string
  description: string | null
  status: FacultyStatus
  subjects_count?: number
  created_at: string
  updated_at: string
}

export interface FacultyTypeOption {
  value: FacultyType
  label: string
}

export interface CreateFacultyPayload {
  name: string
  code: string
  type: FacultyType
  description?: string
  status?: FacultyStatus
  subject_uuids?: string[]
}

export type UpdateFacultyPayload = CreateFacultyPayload

interface ResourceResponse<T> {
  data: T
}

export const facultyService = {
  async list(): Promise<Faculty[]> {
    const response =
      await schoolAdminApi.get<ResourceResponse<Faculty[]>>('/faculties')
    return response.data.data
  },

  async get(uuid: string): Promise<Faculty> {
    const response = await schoolAdminApi.get<ResourceResponse<Faculty>>(
      `/faculties/${uuid}`,
    )
    return response.data.data
  },

  async types(): Promise<FacultyTypeOption[]> {
    const response =
      await schoolAdminApi.get<ResourceResponse<FacultyTypeOption[]>>(
        '/faculties/types',
      )
    return response.data.data
  },

  async create(payload: CreateFacultyPayload): Promise<Faculty> {
    const response = await schoolAdminApi.post<ResourceResponse<Faculty>>(
      '/faculties',
      payload,
    )
    return response.data.data
  },

  async update(uuid: string, payload: UpdateFacultyPayload): Promise<Faculty> {
    const response = await schoolAdminApi.put<ResourceResponse<Faculty>>(
      `/faculties/${uuid}`,
      payload,
    )
    return response.data.data
  },
}
