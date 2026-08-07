import api from '@/lib/api'
import type {
  PortalNotificationItem,
  PortalNotificationsResponse,
} from '@/types/portalNotification'

export const portalNotificationService = {
  async list(limit = 30): Promise<PortalNotificationsResponse> {
    const { data } = await api.get<PortalNotificationsResponse>(
      '/portal/notifications',
      { params: { limit } },
    )
    return data
  },

  async markRead(notificationUuid: string): Promise<PortalNotificationItem> {
    const { data } = await api.post<{ data: PortalNotificationItem }>(
      `/portal/notifications/${notificationUuid}/read`,
    )
    return data.data
  },

  async markAllRead(): Promise<void> {
    await api.post('/portal/notifications/read-all')
  },
}
