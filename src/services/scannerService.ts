import { schoolAdminApi } from '@/lib/api'
import type { AdminUser } from '@/types/auth'

export type CreateScannerPayload = {
  first_name: string
  last_name: string
  email: string
  password: string
  password_confirmation: string
  phone_number?: string
}

export const scannerService = {
  async list(): Promise<AdminUser[]> {
    const response = await schoolAdminApi.get<{ data: AdminUser[] }>('/scanners')
    return response.data.data
  },

  async create(payload: CreateScannerPayload): Promise<AdminUser> {
    const response = await schoolAdminApi.post<{ data: AdminUser }>(
      '/scanners',
      payload,
    )
    return response.data.data
  },
}
