import { schoolAdminApi } from '@/lib/api'

export type SubjectStatus = 'active' | 'inactive'

export interface Subject {
  uuid: string
  school_uuid: string
  level_uuid: string
  faculty_uuid: string | null
  name: string
  code: string
  description: string | null
  status: SubjectStatus
  level: {
    uuid: string
    name: string
    code: string
  } | null
  faculty: {
    uuid: string
    name: string
    code: string
  } | null
  created_at: string
  updated_at: string
}

export interface CreateSubjectPayload {
  level_uuid: string
  faculty_uuid: string
  name: string
  code: string
  description?: string
  status?: SubjectStatus
}

export interface SubjectListFilters {
  levelUuid?: string
  facultyUuid?: string
}

interface ResourceResponse<T> {
  data: T
}

export const subjectService = {
  async list(filters?: SubjectListFilters): Promise<Subject[]> {
    const response = await schoolAdminApi.get<ResourceResponse<Subject[]>>(
      '/subjects',
      {
        params: {
          ...(filters?.levelUuid ? { level_uuid: filters.levelUuid } : {}),
          ...(filters?.facultyUuid
            ? { faculty_uuid: filters.facultyUuid }
            : {}),
        },
      },
    )
    return response.data.data
  },

  async create(payload: CreateSubjectPayload): Promise<Subject> {
    const response = await schoolAdminApi.post<ResourceResponse<Subject>>(
      '/subjects',
      payload,
    )
    return response.data.data
  },
}
