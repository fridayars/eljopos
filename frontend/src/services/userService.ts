import api from './api'

export interface Role {
    id: string
    name: string
    is_active?: boolean
}

export interface User {
    id: string
    username: string
    email: string
    is_active: boolean
    role_id: string
    role?: Role
    created_at?: string
    updated_at?: string
}

export interface UserPagination {
    total_items: number
    total_pages: number
    current_page: number
    limit: number
    items: User[]
}

export interface GetUsersResponse {
    success: boolean
    data: UserPagination
    message?: string
}

export interface GetRolesResponse {
    success: boolean
    data: Role[]
    message?: string
}

export interface GetUsersParams {
    page?: number
    limit?: number
    search?: string
    sort?: string
    order?: 'ASC' | 'DESC'
}

export const getUsers = async (params: GetUsersParams = {}): Promise<GetUsersResponse> => {
    try {
        const response = await api.get('/users', { params })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], total_items: 0, total_pages: 0, current_page: 1, limit: 10 },
            message: error.response?.data?.message || 'Gagal memuat user',
        }
    }
}

export const createUser = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/users', data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal membuat user'
        }
    }
}

export const updateUser = async (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/users/${id}`, data)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal memperbarui user'
        }
    }
}

export const toggleUserStatus = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.patch(`/users/${id}/toggle-status`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal mengubah status user'
        }
    }
}

export const deleteUser = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/users/${id}`)
        return { success: true, message: response.data.message }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus user'
        }
    }
}

export const getRoles = async (): Promise<GetRolesResponse> => {
    try {
        const response = await api.get('/roles/active')
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat role'
        }
    }
}
