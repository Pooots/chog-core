import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
} from '@tanstack/react-query'
import { facultyService, type CreateFacultyPayload, type UpdateFacultyPayload } from '@/services/facultyService'
import {
  levelService,
  roomService,
  type CreateLevelPayload,
  type CreateRoomPayload,
  type UpdateRoomPayload,
} from '@/services/roomService'
import {
  roomScheduleService,
  type CopyRoomSchedulePayload,
  type CreateRoomSchedulePayload,
  type UpdateRoomSchedulePayload,
} from '@/services/roomScheduleService'
import { schoolService, type CreateSchoolPayload } from '@/services/schoolService'
import {
  subjectService,
  type CreateSubjectPayload,
} from '@/services/subjectService'
import {
  teacherService,
  type CreateTeacherPayload,
  type UpdateTeacherPayload,
} from '@/services/teacherService'
import {
  teacherScheduleService,
  type CreateTeacherSchedulePayload,
} from '@/services/teacherScheduleService'
import {
  studentService,
  type CreateStudentPayload,
  type UpdateStudentPayload,
} from '@/services/studentService'
import {
  queryKeys,
  SCHOOL_QUERY_GC_TIME,
  SCHOOL_QUERY_STALE_TIME,
} from '@/lib/queryKeys'

const listQueryOptions = {
  staleTime: SCHOOL_QUERY_STALE_TIME,
  gcTime: SCHOOL_QUERY_GC_TIME,
  refetchOnReconnect: false,
} as const

/**
 * Refetches cached lists before the mutation resolves so the page navigated to
 * right after creating already shows the new record.
 */
function refreshLists(queryClient: QueryClient, keys: QueryKey[]) {
  return Promise.all(
    keys.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey, refetchType: 'all' }),
    ),
  )
}

export function useSchoolsQuery() {
  return useQuery({
    queryKey: queryKeys.schools.list(),
    queryFn: () => schoolService.list(),
    ...listQueryOptions,
  })
}

export function useCreateSchoolMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSchoolPayload) => schoolService.create(payload),
    onSuccess: () => refreshLists(queryClient, [queryKeys.schools.all]),
  })
}

export function useFacultiesQuery() {
  return useQuery({
    queryKey: queryKeys.faculties.list(),
    queryFn: () => facultyService.list(),
    ...listQueryOptions,
  })
}

export function useFacultyQuery(uuid: string) {
  return useQuery({
    queryKey: queryKeys.faculties.detail(uuid),
    queryFn: () => facultyService.get(uuid),
    enabled: Boolean(uuid),
    ...listQueryOptions,
  })
}

export function useFacultyTypesQuery() {
  return useQuery({
    queryKey: queryKeys.faculties.types(),
    queryFn: () => facultyService.types(),
    ...listQueryOptions,
  })
}

export function useCreateFacultyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateFacultyPayload) =>
      facultyService.create(payload),
    onSuccess: () =>
      refreshLists(queryClient, [queryKeys.faculties.all, queryKeys.subjects.all]),
  })
}

export function useUpdateFacultyMutation(facultyUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateFacultyPayload) =>
      facultyService.update(facultyUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.faculties.all,
        queryKeys.faculties.detail(facultyUuid),
        queryKeys.subjects.all,
      ]),
  })
}

export function useLevelsQuery() {
  return useQuery({
    queryKey: queryKeys.levels.list(),
    queryFn: () => levelService.list(),
    ...listQueryOptions,
  })
}

export function useCreateLevelMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateLevelPayload) => levelService.create(payload),
    onSuccess: () => refreshLists(queryClient, [queryKeys.levels.all]),
  })
}

export function useRoomsQuery(levelUuid?: string) {
  return useQuery({
    queryKey: queryKeys.rooms.list(levelUuid),
    queryFn: () => roomService.list(levelUuid),
    ...listQueryOptions,
  })
}

export function useRoomQuery(uuid: string) {
  return useQuery({
    queryKey: queryKeys.rooms.detail(uuid),
    queryFn: () => roomService.get(uuid),
    enabled: Boolean(uuid),
    ...listQueryOptions,
  })
}

export function useCreateRoomMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomService.create(payload),
    onSuccess: () =>
      refreshLists(queryClient, [queryKeys.rooms.all, queryKeys.levels.all]),
  })
}

export function useUpdateRoomMutation(roomUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateRoomPayload) =>
      roomService.update(roomUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.rooms.all,
        queryKeys.rooms.detail(roomUuid),
        queryKeys.levels.all,
      ]),
  })
}

export function useRoomSchedulesQuery(roomUuid: string) {
  return useQuery({
    queryKey: queryKeys.rooms.schedules(roomUuid),
    queryFn: () => roomScheduleService.list(roomUuid),
    enabled: Boolean(roomUuid),
    ...listQueryOptions,
  })
}

export function useRoomScheduleDaysQuery() {
  return useQuery({
    queryKey: queryKeys.rooms.scheduleDays(),
    queryFn: () => roomScheduleService.days(),
    ...listQueryOptions,
  })
}

export function useCreateRoomScheduleMutation(roomUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRoomSchedulePayload) =>
      roomScheduleService.create(roomUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.rooms.schedules(roomUuid),
        queryKeys.teachers.all,
      ]),
  })
}

export function useCopyRoomScheduleMutation(roomUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CopyRoomSchedulePayload) =>
      roomScheduleService.copy(roomUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.rooms.schedules(roomUuid),
        queryKeys.teachers.all,
      ]),
  })
}

export function useRoomScheduleQuery(roomUuid: string, scheduleUuid: string) {
  return useQuery({
    queryKey: [...queryKeys.rooms.schedules(roomUuid), scheduleUuid],
    queryFn: () => roomScheduleService.get(roomUuid, scheduleUuid),
    enabled: Boolean(roomUuid && scheduleUuid),
    ...listQueryOptions,
  })
}

export function useUpdateRoomScheduleMutation(
  roomUuid: string,
  scheduleUuid: string,
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateRoomSchedulePayload) =>
      roomScheduleService.update(roomUuid, scheduleUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.rooms.schedules(roomUuid),
        queryKeys.teachers.all,
      ]),
  })
}

export function useDeleteRoomScheduleMutation(roomUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (scheduleUuid: string) =>
      roomScheduleService.remove(roomUuid, scheduleUuid),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.rooms.schedules(roomUuid),
        queryKeys.teachers.all,
      ]),
  })
}

export function useSubjectsQuery(filters?: {
  levelUuid?: string
  facultyUuid?: string
}) {
  return useQuery({
    queryKey: queryKeys.subjects.list(filters),
    queryFn: () => subjectService.list(filters),
    ...listQueryOptions,
  })
}

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSubjectPayload) =>
      subjectService.create(payload),
    onSuccess: () =>
      refreshLists(queryClient, [queryKeys.subjects.all, queryKeys.levels.all]),
  })
}

export function useTeachersQuery(
  filters?: string | { facultyUuid?: string; levelUuid?: string },
) {
  return useQuery({
    queryKey: queryKeys.teachers.list(filters),
    queryFn: () => teacherService.list(filters),
    ...listQueryOptions,
  })
}

export function useTeacherQuery(uuid: string) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(uuid),
    queryFn: () => teacherService.get(uuid),
    enabled: Boolean(uuid),
    ...listQueryOptions,
  })
}

export function useTeacherPositionsQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.positions(),
    queryFn: () => teacherService.positions(),
    ...listQueryOptions,
  })
}

export function useCreateTeacherMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTeacherPayload) =>
      teacherService.create(payload),
    onSuccess: () => refreshLists(queryClient, [queryKeys.teachers.all]),
  })
}

export function useUpdateTeacherMutation(teacherUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateTeacherPayload) =>
      teacherService.update(teacherUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.teachers.all,
        queryKeys.teachers.detail(teacherUuid),
      ]),
  })
}

export function useTeacherSchedulesQuery(teacherUuid: string) {
  return useQuery({
    queryKey: queryKeys.teachers.schedules(teacherUuid),
    queryFn: () => teacherScheduleService.list(teacherUuid),
    enabled: Boolean(teacherUuid),
    ...listQueryOptions,
  })
}

export function useScheduleDaysQuery() {
  return useQuery({
    queryKey: queryKeys.teachers.scheduleDays(),
    queryFn: () => teacherScheduleService.days(),
    ...listQueryOptions,
  })
}

export function useCreateTeacherScheduleMutation(teacherUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateTeacherSchedulePayload) =>
      teacherScheduleService.create(teacherUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [queryKeys.teachers.schedules(teacherUuid)]),
  })
}

export function useStudentsQuery(levelUuid?: string) {
  return useQuery({
    queryKey: queryKeys.students.list(levelUuid),
    queryFn: () => studentService.list(levelUuid),
    ...listQueryOptions,
  })
}

export function useStudentQuery(uuid: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(uuid),
    queryFn: () => studentService.get(uuid),
    enabled: Boolean(uuid),
    ...listQueryOptions,
  })
}

export function useCreateStudentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateStudentPayload) =>
      studentService.create(payload),
    onSuccess: () => refreshLists(queryClient, [queryKeys.students.all]),
  })
}

export function useUpdateStudentMutation(studentUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateStudentPayload) =>
      studentService.update(studentUuid, payload),
    onSuccess: () =>
      refreshLists(queryClient, [
        queryKeys.students.all,
        queryKeys.students.detail(studentUuid),
      ]),
  })
}
