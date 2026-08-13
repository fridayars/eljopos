import api from './api'

export interface Store {
    id: string
    name: string
    address?: string
    phone?: string
    notes?: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface StorePagination {
    total_items: number
    total_pages: number
    current_page: number
    limit: number
    items: Store[]
}

export interface GetStoresResponse {
    success: boolean
    data: StorePagination
    message?: string
}

export interface GetStoresParams {
    page?: number
    limit?: number
    search?: string
}

export const getStores = async (params: GetStoresParams = {}): Promise<GetStoresResponse> => {
    try {
        const response = await api.get('/master/stores', { params })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], total_items: 0, total_pages: 0, current_page: 1, limit: 10 },
            message: error.response?.data?.message || 'Gagal memuat cabang',
        }
    }
}

// Keep the old API for dropdown compatibility if needed
export const getActiveStores = async (): Promise<{ success: boolean; data: Store[]; message?: string }> => {
    try {
        const response = await api.get('/master/stores/active')
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat daftar cabang',
        }
    }
}

export const createStore = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/master/stores', data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal membuat cabang'
        }
    }
}

export const updateStore = async (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/master/stores/${id}`, data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal memperbarui cabang'
        }
    }
}

export const toggleStoreStatus = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.patch(`/master/stores/${id}/status`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal mengubah status cabang'
        }
    }
}

export const deleteStore = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/master/stores/${id}`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus cabang'
        }
    }
}
