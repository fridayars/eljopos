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
