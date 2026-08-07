import { schoolAdminApi } from '@/lib/api'

export type LevelStatus = 'active' | 'inactive'
export type RoomStatus = 'active' | 'inactive'

export interface Level {
  uuid: string
  school_uuid: string
  name: string
  code: string
  sort_order: number
  description: string | null
  status: LevelStatus
  rooms_count?: number
  subjects_count?: number
  created_at: string
  updated_at: string
}

export interface Room {
  uuid: string
  school_uuid: string
  level_uuid: string
  name: string
  code: string
  capacity: number | null
  building: string | null
  start_time: string | null
  end_time: string | null
  description: string | null
  status: RoomStatus
  level: {
    uuid: string
    name: string
    code: string
  } | null
  created_at: string
  updated_at: string
}

export interface CreateLevelPayload {
  name: string
  code: string
  sort_order?: number
  description?: string
  status?: LevelStatus
}

export interface CreateRoomPayload {
  level_uuid: string
  name: string
  code: string
  capacity?: number
  building?: string
  start_time: string
  end_time: string
  description?: string
  status?: RoomStatus
}

export type UpdateRoomPayload = CreateRoomPayload

interface ResourceResponse<T> {
  data: T
}

export const levelService = {
  async list(): Promise<Level[]> {
    const response =
      await schoolAdminApi.get<ResourceResponse<Level[]>>('/levels')
    return response.data.data
  },

  async create(payload: CreateLevelPayload): Promise<Level> {
    const response = await schoolAdminApi.post<ResourceResponse<Level>>(
      '/levels',
      payload,
    )
    return response.data.data
  },
}

export const roomService = {
  async list(levelUuid?: string): Promise<Room[]> {
    const response = await schoolAdminApi.get<ResourceResponse<Room[]>>(
      '/rooms',
      {
        params: levelUuid ? { level_uuid: levelUuid } : undefined,
      },
    )
    return response.data.data
  },

  async get(uuid: string): Promise<Room> {
    const response = await schoolAdminApi.get<ResourceResponse<Room>>(
      `/rooms/${uuid}`,
    )
    return response.data.data
  },

  async create(payload: CreateRoomPayload): Promise<Room> {
    const response = await schoolAdminApi.post<ResourceResponse<Room>>(
      '/rooms',
      payload,
    )
    return response.data.data
  },

  async update(uuid: string, payload: UpdateRoomPayload): Promise<Room> {
    const response = await schoolAdminApi.put<ResourceResponse<Room>>(
      `/rooms/${uuid}`,
      payload,
    )
    return response.data.data
  },
}
