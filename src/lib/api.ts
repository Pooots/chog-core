import axios from 'axios'
import { isTokenValid } from './tokenUtils'
import { getIntlLocaleFromStorage } from './format'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

export const schoolAdminApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

function attachLocaleHeader(config: import('axios').InternalAxiosRequestConfig) {
  const locale = getIntlLocaleFromStorage()
  config.headers['Accept-Language'] = locale === 'fil' ? 'fil' : 'en'
  return config
}

// A rejected login is a form error, not an expired session. Without this the
// session handlers below would redirect and discard the message.
function isLoginRequest(error: { config?: { url?: string } }): boolean {
  return (error.config?.url ?? '').includes('login')
}

api.interceptors.request.use(
  (config) => {
    attachLocaleHeader(config)
    const token = localStorage.getItem('auth_token')

    if (token) {
      if (!isTokenValid(token)) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_role')
        localStorage.removeItem('auth_school')
        localStorage.removeItem('auth_profile')
        window.dispatchEvent(new CustomEvent('tokenExpired'))
        return Promise.reject(new Error('Token expired'))
      }

      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

adminApi.interceptors.request.use(
  (config) => {
    attachLocaleHeader(config)
    const adminToken = localStorage.getItem('admin_token')

    if (adminToken) {
      if (!isTokenValid(adminToken)) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        localStorage.removeItem('admin_role')
        window.location.href = '/admin/super/login'
        return Promise.reject(new Error('Admin token expired'))
      }

      config.headers.Authorization = `Bearer ${adminToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

schoolAdminApi.interceptors.request.use(
  (config) => {
    attachLocaleHeader(config)
    const schoolToken = localStorage.getItem('school_admin_token')

    if (schoolToken) {
      if (!isTokenValid(schoolToken)) {
        localStorage.removeItem('school_admin_token')
        localStorage.removeItem('school_admin_user')
        localStorage.removeItem('school_admin_role')
        localStorage.removeItem('school_is_admin')
        window.location.href = '/admin/login'
        return Promise.reject(new Error('School admin token expired'))
      }

      config.headers.Authorization = `Bearer ${schoolToken}`
    }

    return config
  },
  (error) => Promise.reject(error),
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isLoginRequest(error)) {
      return Promise.reject(error)
    }

    const status = error.response?.status
    const message = error.response?.data?.message

    if (status === 401 || message === 'Unauthenticated') {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_role')
      localStorage.removeItem('auth_school')
      localStorage.removeItem('auth_profile')
      window.dispatchEvent(new CustomEvent('tokenExpired'))
    }

    return Promise.reject(error)
  },
)

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (isLoginRequest(error)) {
      return Promise.reject(error)
    }

    if (status === 401 || message === 'Unauthenticated') {
      if (status === 403) {
        return Promise.reject(error)
      }

      if (
        message &&
        (message.toLowerCase().includes('permission') ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('forbidden'))
      ) {
        return Promise.reject(error)
      }

      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      localStorage.removeItem('admin_role')
      localStorage.removeItem('is_admin')

      window.location.href = '/admin/super/login'
    }

    return Promise.reject(error)
  },
)

schoolAdminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    if (isLoginRequest(error)) {
      return Promise.reject(error)
    }

    if (status === 401 || message === 'Unauthenticated') {
      if (status === 403) {
        return Promise.reject(error)
      }

      localStorage.removeItem('school_admin_token')
      localStorage.removeItem('school_admin_user')
      localStorage.removeItem('school_admin_role')
      localStorage.removeItem('school_is_admin')

      window.location.href = '/admin/login'
    }

    return Promise.reject(error)
  },
)

export default api
