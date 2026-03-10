import api from './api'

export interface AksesRole {
    id?: string
    role_id?: string
    permission: string
}

export interface Role {
    id: string
    name: string
    is_active: boolean
    permissions?: AksesRole[]
    created_at?: string
    updated_at?: string
}

export interface RolePagination {
    total_items: number
    total_pages: number
    current_page: number
    limit: number
    items: Role[]
}

export interface GetRolesResponse {
    success: boolean
    data: RolePagination
    message?: string
}

export interface GetRoleResponse {
    success: boolean
    data: Role
    message?: string
}

export interface GetRolesParams {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'ASC' | 'DESC'
}

export const getRoles = async (params: GetRolesParams = {}): Promise<GetRolesResponse> => {
    try {
        const response = await api.get('/roles', { params })
        return response.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], total_items: 0, total_pages: 0, current_page: 1, limit: 10 },
            message: error.response?.data?.message || 'Gagal memuat role',
        }
    }
}

export const getRoleById = async (id: string): Promise<GetRoleResponse> => {
    try {
        const response = await api.get(`/roles/${id}`)
        return response.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            data: {} as Role,
            message: error.response?.data?.message || 'Gagal memuat detail role'
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createRole = async (data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/roles', data)
        return { success: true, message: response.data.message }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal membuat role'
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateRole = async (id: string, data: any): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/roles/${id}`, data)
        return { success: true, message: response.data.message }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal memperbarui role'
        }
    }
}

export const toggleRoleStatus = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.patch(`/roles/${id}/toggle-status`)
        return { success: true, message: response.data.message }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal mengubah status role'
        }
    }
}

export const deleteRole = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/roles/${id}`)
        return { success: true, message: response.data.message }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus role'
        }
    }
}
