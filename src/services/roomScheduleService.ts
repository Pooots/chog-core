import { schoolAdminApi } from '@/lib/api'

export type ScheduleDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export type ScheduleStatus = 'active' | 'inactive'

export type SchedulePeriodType = 'class' | 'break' | 'recess'

export interface RoomSchedule {
  uuid: string
  school_uuid: string
  room_uuid: string
  subject_uuid: string | null
  teacher_uuid: string | null
  period_type: SchedulePeriodType
  period_label: string
  day_of_week: ScheduleDay
  day_label: string
  start_time: string
  end_time: string
  notes: string | null
  status: ScheduleStatus
  subject: {
    uuid: string
    name: string
    code: string
  } | null
  teacher: {
    uuid: string
    full_name: string
    employee_id: string
  } | null
  created_at: string
  updated_at: string
}

export interface ScheduleDayOption {
  value: ScheduleDay
  label: string
}

export interface CreateRoomSchedulePayload {
  day_of_week: ScheduleDay
  start_time: string
  end_time: string
  period_type?: SchedulePeriodType
  subject_uuid?: string | null
  teacher_uuid?: string | null
  notes?: string | null
  status?: ScheduleStatus
}

export type UpdateRoomSchedulePayload = CreateRoomSchedulePayload

export interface CopyRoomSchedulePayload {
  source_day: ScheduleDay
  target_days: ScheduleDay[]
  replace_existing?: boolean
}

interface ResourceResponse<T> {
  data: T
}

export const roomScheduleService = {
  async list(roomUuid: string): Promise<RoomSchedule[]> {
    const response = await schoolAdminApi.get<
      ResourceResponse<RoomSchedule[]>
    >(`/rooms/${roomUuid}/schedules`)
    return response.data.data
  },

  async get(roomUuid: string, scheduleUuid: string): Promise<RoomSchedule> {
    const response = await schoolAdminApi.get<ResourceResponse<RoomSchedule>>(
      `/rooms/${roomUuid}/schedules/${scheduleUuid}`,
    )
    return response.data.data
  },

  async days(): Promise<ScheduleDayOption[]> {
    const response = await schoolAdminApi.get<
      ResourceResponse<ScheduleDayOption[]>
    >('/rooms/schedule-days')
    return response.data.data
  },

  async create(
    roomUuid: string,
    payload: CreateRoomSchedulePayload,
  ): Promise<RoomSchedule> {
    const response = await schoolAdminApi.post<
      ResourceResponse<RoomSchedule>
    >(`/rooms/${roomUuid}/schedules`, payload)
    return response.data.data
  },

  async copy(
    roomUuid: string,
    payload: CopyRoomSchedulePayload,
  ): Promise<RoomSchedule[]> {
    const response = await schoolAdminApi.post<ResourceResponse<RoomSchedule[]>>(
      `/rooms/${roomUuid}/schedules/copy`,
      payload,
    )
    return response.data.data
  },

  async update(
    roomUuid: string,
    scheduleUuid: string,
    payload: UpdateRoomSchedulePayload,
  ): Promise<RoomSchedule> {
    const response = await schoolAdminApi.put<ResourceResponse<RoomSchedule>>(
      `/rooms/${roomUuid}/schedules/${scheduleUuid}`,
      payload,
    )
    return response.data.data
  },

  async remove(roomUuid: string, scheduleUuid: string): Promise<void> {
    await schoolAdminApi.delete(
      `/rooms/${roomUuid}/schedules/${scheduleUuid}`,
    )
  },
}
