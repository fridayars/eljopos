import api from './api'
import mockCustomers from '../mocks/customers.json'

const USE_MOCK_DATA_CUSTOMERS = true

export interface Customer {
    id: string
    name: string
    phone: string
    email?: string
    address?: string
}

export interface GetCustomersResponse {
    success: boolean
    data: Customer[]
    message?: string
}

export interface CreateCustomerResponse {
    success: boolean
    data?: Customer
    message?: string
}

export const getCustomers = async (): Promise<GetCustomersResponse> => {
    if (USE_MOCK_DATA_CUSTOMERS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: mockCustomers,
                })
            }, 500)
        })
    }

    try {
        const response = await api.get('/master/customers') // Asumsi rutanya nanti master/customers
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat pelanggan',
        }
    }
}

export const createCustomer = async (data: Omit<Customer, 'id'>): Promise<CreateCustomerResponse> => {
    if (USE_MOCK_DATA_CUSTOMERS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newCustomer = {
                    ...data,
                    id: `cust-mock-${Date.now()}`,
                }
                resolve({
                    success: true,
                    data: newCustomer,
                })
            }, 600)
        })
    }

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
