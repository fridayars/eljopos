import api from './api'

export interface Staff {
    id: string
    name: string
    is_active: boolean
    created_at?: string
    updated_at?: string
}

export interface StaffPagination {
    total_items: number
    total_pages: number
    current_page: number
    limit: number
    items: Staff[]
}

export interface GetStaffResponse {
    success: boolean
    data: StaffPagination
    message?: string
}

export interface GetStaffParams {
    page?: number
    limit?: number
    search?: string
}

export const getStaff = async (params: GetStaffParams = {}): Promise<GetStaffResponse> => {
    try {
        const response = await api.get('/staff', { params })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], total_items: 0, total_pages: 0, current_page: 1, limit: 10 },
            message: error.response?.data?.message || 'Gagal memuat staff',
        }
    }
}

export const getAllActiveStaff = async (): Promise<{ success: boolean; data: Staff[]; message?: string }> => {
    try {
        const response = await api.get('/staff/active')
        return { success: true, data: response.data.data }
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat staff aktif',
        }
    }
}

export const createStaff = async (data: { name: string }): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/staff', data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal membuat staff',
        }
    }
}

export const updateStaff = async (id: string, data: { name: string }): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/staff/${id}`, data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal memperbarui staff',
        }
    }
}

export const toggleStaffStatus = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.patch(`/staff/${id}/status`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal mengubah status staff',
        }
    }
}

export const deleteStaff = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/staff/${id}`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus staff',
        }
    }
}
