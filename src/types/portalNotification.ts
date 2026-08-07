export type PortalNotificationType =
  | 'attendance'
  | 'grade_posted'
  | 'school_entrance'
  | string

export interface PortalNotificationItem {
  uuid: string
  school_uuid: string
  student_uuid?: string | null
  type: PortalNotificationType
  type_label: string
  title: string
  body: string
  data?: Record<string, unknown> | null
  read_at?: string | null
  is_unread: boolean
  student?: {
    uuid: string
    full_name: string
    student_number: string
  } | null
  created_at?: string | null
}

export interface PortalNotificationsResponse {
  data: PortalNotificationItem[]
  meta: {
    unread_count: number
  }
}
