import api from './api'

export interface Supplier {
    id: string
    name: string
}

export const getSuppliers = async (search?: string): Promise<{ success: boolean; data: Supplier[] }> => {
    try {
        const response = await api.get('/master/suppliers', { params: { search } })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat supplier')
    }
}

export const createSupplier = async (data: { name: string }): Promise<{ success: boolean; data: Supplier }> => {
    try {
        const response = await api.post('/master/suppliers', data)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal menambah supplier')
    }
}
