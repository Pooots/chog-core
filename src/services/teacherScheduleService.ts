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

export type TeacherScheduleSource = 'teacher' | 'room'
export type TeacherSchedulePeriodType = 'class' | 'break' | 'recess'

export interface TeacherSchedule {
  uuid: string
  school_uuid: string
  teacher_uuid: string
  subject_uuid: string | null
  room_uuid: string | null
  source?: TeacherScheduleSource
  period_type?: TeacherSchedulePeriodType
  period_label?: string
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
  room: {
    uuid: string
    name: string
    code: string
  } | null
  created_at: string
  updated_at: string
}

export interface ScheduleDayOption {
  value: ScheduleDay
  label: string
}

export interface CreateTeacherSchedulePayload {
  day_of_week: ScheduleDay
  start_time: string
  end_time: string
  subject_uuid?: string
  room_uuid?: string
  notes?: string
  status?: ScheduleStatus
}

interface ResourceResponse<T> {
  data: T
}

export const teacherScheduleService = {
  async list(teacherUuid: string): Promise<TeacherSchedule[]> {
    const response = await schoolAdminApi.get<
      ResourceResponse<TeacherSchedule[]>
    >(`/teachers/${teacherUuid}/schedules`)
    return response.data.data
  },

  async days(): Promise<ScheduleDayOption[]> {
    const response = await schoolAdminApi.get<
      ResourceResponse<ScheduleDayOption[]>
    >('/teachers/schedule-days')
    return response.data.data
  },

  async create(
    teacherUuid: string,
    payload: CreateTeacherSchedulePayload,
  ): Promise<TeacherSchedule> {
    const response = await schoolAdminApi.post<
      ResourceResponse<TeacherSchedule>
    >(`/teachers/${teacherUuid}/schedules`, payload)
    return response.data.data
  },
}
