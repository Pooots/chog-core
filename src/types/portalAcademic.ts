import type { PortalStudentProfile, PortalStudentRoom } from '@/types/auth'

export type ScheduleDay =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday'

export interface PortalScheduleItem {
  uuid: string
  day_of_week: ScheduleDay
  day_label: string
  start_time: string
  end_time: string
  notes?: string | null
  status?: string
  period_type?: 'class' | 'break' | 'recess' | string
  period_label?: string
  source?: 'teacher' | 'room' | string
  subject?: { uuid: string; name: string; code: string } | null
  teacher?: { uuid: string; full_name: string; employee_id?: string } | null
  room?: { uuid: string; name: string; code: string } | null
}

export interface PortalSubjectItem {
  uuid: string
  name: string
  code: string
}

export interface PortalGradeItem {
  uuid?: string | null
  subject_uuid?: string | null
  quarter: number
  quarter_label: string
  grade: number | null
  remarks?: string | null
  subject?: { uuid: string; name: string; code: string } | null
  teacher?: { uuid: string; full_name: string } | null
  room?: { uuid: string; name: string; code: string } | null
  student?: {
    uuid: string
    full_name: string
    student_number: string
  } | null
}

export interface PortalGradeQuarterGroup {
  quarter: number
  quarter_label: string
  average: number | null
  grades: PortalGradeItem[]
}

export interface PortalTaskItem {
  uuid: string
  title: string
  description?: string | null
  due_date?: string | null
  status: 'open' | 'completed' | 'cancelled' | string
  status_label: string
  subject?: { uuid: string; name: string; code: string } | null
  teacher?: { uuid: string; full_name: string } | null
  room?: { uuid: string; name: string; code: string } | null
  room_uuid: string
  subject_uuid: string
  teacher_uuid: string
}

export interface StudentAttendanceSummary {
  present: number
  late: number
  absent: number
  excused: number
  total: number
}

export interface StudentAttendancePayload {
  summary: StudentAttendanceSummary
  records: PortalAttendanceItem[]
}

export interface TeacherAttendanceRecordResponse {
  data: PortalAttendanceItem[]
  meta: {
    summary: StudentAttendanceSummary
  }
}

export interface StudentEntranceSummary {
  in: number
  out: number
  total: number
}

export interface PortalEntranceItem {
  uuid: string
  direction: 'in' | 'out' | string
  direction_label: string
  source?: string | null
  scanned_identifier?: string | null
  scanned_at?: string | null
}

export interface StudentEntrancePayload {
  summary: StudentEntranceSummary
  records: PortalEntranceItem[]
}

export interface StudentAcademicsResponse {
  student: PortalStudentProfile
  room: PortalStudentRoom | null
  schedules: PortalScheduleItem[]
  subjects?: PortalSubjectItem[]
  grades_by_quarter: Record<string, PortalGradeQuarterGroup>
  attendance?: StudentAttendancePayload
  entrances?: StudentEntrancePayload
  tasks: PortalTaskItem[]
}

export interface TeacherAssignment {
  room_uuid: string
  subject_uuid: string
  room: { uuid: string; name: string; code: string } | null
  subject: { uuid: string; name: string; code: string } | null
}

export interface TeacherRoomStudent {
  uuid: string
  full_name: string
  student_number: string
  first_name: string
  last_name: string
  lrn_number?: string | null
  email?: string | null
  phone_number?: string | null
  enrollment_status?: string | null
  enrollment_status_label?: string | null
  gender?: string | null
}

export interface CreateTeacherTaskPayload {
  room_uuid: string
  subject_uuid: string
  title: string
  description?: string
  due_date?: string
  status?: string
}

export interface UpdateTeacherTaskPayload {
  title?: string
  description?: string | null
  due_date?: string | null
  status?: string
}

export interface UpsertGradePayload {
  student_uuid: string
  room_uuid: string
  subject_uuid: string
  quarter: number
  grade: number
  remarks?: string
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused'

export interface PortalAttendanceItem {
  uuid: string
  student_uuid: string
  teacher_uuid: string
  subject_uuid: string
  room_uuid: string
  attendance_date: string
  status: AttendanceStatus | string
  status_label: string
  remarks?: string | null
  student?: {
    uuid: string
    full_name: string
    student_number: string
  } | null
  subject?: { uuid: string; name: string; code: string } | null
  room?: { uuid: string; name: string; code: string } | null
}

export interface UpsertAttendancePayload {
  room_uuid: string
  subject_uuid: string
  attendance_date: string
  records: Array<{
    student_uuid: string
    status: AttendanceStatus
    remarks?: string | null
  }>
}
