import { jwtDecode } from 'jwt-decode'
import type { JWTPayload } from '@/types/auth'

/**
 * Decode a JWT token
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch (error) {
    console.error('Error decoding token:', error)
    return null
  }
}

/**
 * Check if a JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) {
      return true
    }

    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch (error) {
    console.error('Error checking token expiration:', error)
    return true
  }
}

/**
 * Get token expiration date
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) {
      return null
    }

    return new Date(decoded.exp * 1000)
  } catch (error) {
    console.error('Error getting token expiration:', error)
    return null
  }
}

/**
 * Check if token is valid (not expired and properly formatted)
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false

  const parts = token.split('.')
  if (parts.length !== 3) return false

  return !isTokenExpired(token)
}

/**
 * Get user UUID from token
 */
export function getUserUuidFromToken(token: string): string | null {
  try {
    const decoded = decodeToken(token)
    return decoded?.user_uuid || null
  } catch (error) {
    console.error('Error getting user UUID from token:', error)
    return null
  }
}

/**
 * Get user role from token
 */
export function getUserRoleFromToken(token: string): string | null {
  try {
    const decoded = decodeToken(token)
    return decoded?.role || null
  } catch (error) {
    console.error('Error getting user role from token:', error)
    return null
  }
}

/**
 * Get user permissions from token
 */
export function getUserPermissionsFromToken(token: string): string[] {
  try {
    const decoded = decodeToken(token)
    return decoded?.permissions || []
  } catch (error) {
    console.error('Error getting user permissions from token:', error)
    return []
  }
}
