import { adminApi } from '@/lib/api'

export interface SchoolPrincipal {
  uuid: string
  full_name: string
  email: string
}

export interface School {
  uuid: string
  name: string
  code: string
  address: string
  city: string | null
  province: string | null
  phone: string | null
  status: 'active' | 'pending'
  principal: SchoolPrincipal | null
  created_at: string
  updated_at: string
}

export interface CreateSchoolPayload {
  name: string
  code: string
  address: string
  city?: string
  province?: string
  phone?: string
  principal_name: string
  principal_email: string
  password: string
  password_confirmation: string
}

interface ResourceResponse<T> {
  data: T
}

export const schoolService = {
  async list(): Promise<School[]> {
    const response =
      await adminApi.get<ResourceResponse<School[]>>('/schools')
    return response.data.data
  },

  async create(payload: CreateSchoolPayload): Promise<School> {
    const response = await adminApi.post<ResourceResponse<School>>(
      '/schools',
      payload,
    )
    return response.data.data
  },
}
