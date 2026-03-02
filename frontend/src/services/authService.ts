import api from './api'
import mockStores from '../mocks/stores.json'
import mockAuthResponse from '../mocks/auth.json'

// =============================================
// Mock data flags — set false saat integrasi
// =============================================
const USE_MOCK_DATA_GET_STORES = false
const USE_MOCK_DATA_LOGIN = false

// =============================================
// Types
// =============================================
export interface Store {
  id: string
  name: string
  address: string
}

export interface LoginPayload {
  username: string
  password: string
  store_id: string
}

export interface LoginResponse {
  success: boolean
  data?: {
    token: string
    user: {
      id: string
      username: string
      role: string
      store_id: string
    }
  }
  message?: string
  errors?: Array<{ field: string; message: string }>
}

export interface StoresResponse {
  success: boolean
  data?: Store[]
  message?: string
}

// =============================================
// Service Functions
// =============================================

/**
 * Ambil daftar store untuk dropdown login
 */
export const getStores = async (): Promise<StoresResponse> => {
  if (USE_MOCK_DATA_GET_STORES) {
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true, data: mockStores }), 300)
    })
  }

  const response = await api.get('/master/stores')
  return response.data
}

/**
 * Login user ke sistem
 * Mock: username "admin" + password "admin123" = success
 */
export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  if (USE_MOCK_DATA_LOGIN) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation
        if (payload.username === 'admin' && payload.password === 'admin123') {
          resolve({
            success: true,
            data: {
              ...mockAuthResponse,
              user: {
                ...mockAuthResponse.user,
                store_id: payload.store_id,
              },
            },
          })
        } else {
          resolve({
            success: false,
            message: 'Username atau password salah',
          })
        }
      }, 800)
    })
  }

  const response = await api.post('/auth/login', payload)
  return response.data
}

/**
 * Logout user — invalidate session on backend, then clear local state
 */
export const logout = async (): Promise<{ success: boolean }> => {
  try {
    await api.post('/auth/logout')
  } catch (error) {
    // Ignore API errors — still clear local state
    console.warn('Logout API call failed, clearing local state anyway')
  }

  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('store_name')

  return { success: true }
}
