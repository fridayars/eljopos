import api from './api'

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    address?: string
    province_code?: string
    province_name?: string
    regency_code?: string
    regency_name?: string
    district_code?: string
    district_name?: string
    is_active?: boolean
    created_at?: string
    transaction_count?: number
}

export interface CustomerPagination {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
}

export interface GetCustomersResponse {
    success: boolean
    data: {
        items: Customer[]
        pagination: CustomerPagination
    }
    message?: string
}

export interface CreateCustomerResponse {
    success: boolean
    data?: {
        id: string
        name: string
    }
    message?: string
}

export interface GetCustomersParams {
    page?: number
    limit?: number
    search?: string
    sort?: string
}


/**
 * GET /api/master/customers — dengan pagination dan search
 */
export const getCustomers = async (params: GetCustomersParams = {}): Promise<GetCustomersResponse> => {
    try {
        const response = await api.get('/master/customers', { params })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } },
            message: error.response?.data?.message || 'Gagal memuat pelanggan',
        }
    }
}

/**
 * POST /api/master/customers — buat customer baru
 */
export const createCustomer = async (data: Omit<Customer, 'id'>): Promise<CreateCustomerResponse> => {
    try {
        const response = await api.post('/master/customers', data)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menambah pelanggan',
}
    }
}

/**
 * PUT /api/master/customers/:id - update customer
 */
export const updateCustomer = async (id: string, data: Partial<Omit<Customer, 'id'>>): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.put(`/master/customers/${id}`, data)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal mengubah pelanggan',
        }
    }
}

/**
 * DELETE /api/master/customers/:id - delete customer
 */
export const deleteCustomer = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/master/customers/${id}`)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus pelanggan',
        }
    }
}

/**
 * GET /api/master/customers/:id/transactions - get customer transaction history
 */
export const getCustomerTransactions = async (id: string, params: { page?: number, limit?: number } = {}) => {
    try {
        const response = await api.get(`/master/customers/${id}/transactions`, { params })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { customer: null, items: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } },
            message: error.response?.data?.message || 'Gagal memuat riwayat transaksi pelanggan',
        }
    }
}

