import api from './api'

export interface TipeHp {
    id: string
    name: string
}

export const getTipeHp = async (search?: string): Promise<{ success: boolean; data: TipeHp[] }> => {
    try {
        const response = await api.get('/tipe-hp', { params: { search } })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat tipe HP')
    }
}

export const createTipeHp = async (data: { name: string }): Promise<{ success: boolean; data: TipeHp }> => {
    try {
        const response = await api.post('/tipe-hp', data)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal menambah tipe HP')
    }
}
