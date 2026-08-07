import api from '@/lib/api'
import type {
  CreateTeacherTaskPayload,
  PortalAttendanceItem,
  PortalGradeItem,
  PortalScheduleItem,
  PortalTaskItem,
  StudentAcademicsResponse,
  StudentAttendanceSummary,
  TeacherAssignment,
  TeacherRoomStudent,
  UpdateTeacherTaskPayload,
  UpsertAttendancePayload,
  UpsertGradePayload,
} from '@/types/portalAcademic'

interface ResourceResponse<T> {
  data: T
}

export const portalAcademicService = {
  async getStudentAcademics(): Promise<StudentAcademicsResponse> {
    const { data } = await api.get<StudentAcademicsResponse>(
      '/portal/student/academics',
    )
    return data
  },

  async getParentStudentAcademics(
    studentUuid: string,
  ): Promise<StudentAcademicsResponse> {
    const { data } = await api.get<StudentAcademicsResponse>(
      `/portal/parent/students/${studentUuid}/academics`,
    )
    return data
  },

  async getTeacherAssignments(): Promise<TeacherAssignment[]> {
    const { data } = await api.get<ResourceResponse<TeacherAssignment[]>>(
      '/portal/teacher/assignments',
    )
    return data.data
  },

  async getTeacherSchedules(): Promise<PortalScheduleItem[]> {
    const { data } = await api.get<ResourceResponse<PortalScheduleItem[]>>(
      '/portal/teacher/schedules',
    )
    return data.data
  },

  async getTeacherTasks(params?: {
    room_uuid?: string
    subject_uuid?: string
    status?: string
  }): Promise<PortalTaskItem[]> {
    const { data } = await api.get<ResourceResponse<PortalTaskItem[]>>(
      '/portal/teacher/tasks',
      { params },
    )
    return data.data
  },

  async createTeacherTask(
    payload: CreateTeacherTaskPayload,
  ): Promise<PortalTaskItem> {
    const { data } = await api.post<ResourceResponse<PortalTaskItem>>(
      '/portal/teacher/tasks',
      payload,
    )
    return data.data
  },

  async updateTeacherTask(
    taskUuid: string,
    payload: UpdateTeacherTaskPayload,
  ): Promise<PortalTaskItem> {
    const { data } = await api.put<ResourceResponse<PortalTaskItem>>(
      `/portal/teacher/tasks/${taskUuid}`,
      payload,
    )
    return data.data
  },

  async deleteTeacherTask(taskUuid: string): Promise<void> {
    await api.delete(`/portal/teacher/tasks/${taskUuid}`)
  },

  async getRoomStudents(
    roomUuid: string,
    subjectUuid: string,
  ): Promise<TeacherRoomStudent[]> {
    const { data } = await api.get<ResourceResponse<TeacherRoomStudent[]>>(
      '/portal/teacher/room-students',
      {
        params: { room_uuid: roomUuid, subject_uuid: subjectUuid },
      },
    )
    return data.data
  },

  async getTeacherAttendance(params: {
    room_uuid: string
    subject_uuid: string
    attendance_date: string
  }): Promise<PortalAttendanceItem[]> {
    const { data } = await api.get<ResourceResponse<PortalAttendanceItem[]>>(
      '/portal/teacher/attendance',
      { params },
    )
    return data.data
  },

  async getTeacherAttendanceRecords(params: {
    room_uuid: string
    subject_uuid: string
  }): Promise<{
    records: PortalAttendanceItem[]
    summary: StudentAttendanceSummary
  }> {
    const { data } = await api.get<{
      data: PortalAttendanceItem[]
      meta: { summary: StudentAttendanceSummary }
    }>('/portal/teacher/attendance', { params })

    return {
      records: data.data,
      summary: data.meta.summary,
    }
  },

  async upsertAttendance(
    payload: UpsertAttendancePayload,
  ): Promise<PortalAttendanceItem[]> {
    const { data } = await api.put<ResourceResponse<PortalAttendanceItem[]>>(
      '/portal/teacher/attendance',
      payload,
    )
    return data.data
  },

  async getTeacherGrades(params: {
    room_uuid: string
    subject_uuid: string
    quarter: number
  }): Promise<PortalGradeItem[]> {
    const { data } = await api.get<ResourceResponse<PortalGradeItem[]>>(
      '/portal/teacher/grades',
      { params },
    )
    return data.data
  },

  async upsertGrade(payload: UpsertGradePayload): Promise<PortalGradeItem> {
    const { data } = await api.put<ResourceResponse<PortalGradeItem>>(
      '/portal/teacher/grades',
      payload,
    )
    return data.data
  },
}
