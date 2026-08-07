export const queryKeys = {
  schools: {
    all: ['schools'] as const,
    list: () => [...queryKeys.schools.all, 'list'] as const,
  },
  faculties: {
    all: ['faculties'] as const,
    list: () => [...queryKeys.faculties.all, 'list'] as const,
    detail: (uuid: string) =>
      [...queryKeys.faculties.all, 'detail', uuid] as const,
    types: () => [...queryKeys.faculties.all, 'types'] as const,
  },
  levels: {
    all: ['levels'] as const,
    list: () => [...queryKeys.levels.all, 'list'] as const,
  },
  rooms: {
    all: ['rooms'] as const,
    list: (levelUuid?: string) =>
      [...queryKeys.rooms.all, 'list', levelUuid ?? 'all'] as const,
    detail: (uuid: string) =>
      [...queryKeys.rooms.all, 'detail', uuid] as const,
    schedules: (roomUuid: string) =>
      [...queryKeys.rooms.all, 'schedules', roomUuid] as const,
    scheduleDays: () => [...queryKeys.rooms.all, 'schedule-days'] as const,
  },
  subjects: {
    all: ['subjects'] as const,
    list: (filters?: { levelUuid?: string; facultyUuid?: string }) =>
      [
        ...queryKeys.subjects.all,
        'list',
        filters?.levelUuid ?? 'all',
        filters?.facultyUuid ?? 'all',
      ] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    list: (filters?: string | { facultyUuid?: string; levelUuid?: string }) => {
      const normalized =
        typeof filters === 'string' ? { facultyUuid: filters } : filters
      return [
        ...queryKeys.teachers.all,
        'list',
        normalized?.facultyUuid ?? 'all',
        normalized?.levelUuid ?? 'all',
      ] as const
    },
    detail: (uuid: string) =>
      [...queryKeys.teachers.all, 'detail', uuid] as const,
    positions: () => [...queryKeys.teachers.all, 'positions'] as const,
    schedules: (teacherUuid: string) =>
      [...queryKeys.teachers.all, 'schedules', teacherUuid] as const,
    scheduleDays: () => [...queryKeys.teachers.all, 'schedule-days'] as const,
  },
  students: {
    all: ['students'] as const,
    list: (levelUuid?: string) =>
      [...queryKeys.students.all, 'list', levelUuid ?? 'all'] as const,
    detail: (uuid: string) =>
      [...queryKeys.students.all, 'detail', uuid] as const,
  },
} as const

/** School portal list data stays fresh for 5 minutes. */
export const SCHOOL_QUERY_STALE_TIME = 5 * 60 * 1000

/** Keep unused cache for 30 minutes. */
export const SCHOOL_QUERY_GC_TIME = 30 * 60 * 1000
