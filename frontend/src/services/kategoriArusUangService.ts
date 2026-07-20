import api from './api'

export interface KategoriArusUang {
    id: string
    type: 'IN' | 'OUT'
    name: string
    description?: string
}

export const kategoriArusUangService = {
    getAll: async (type?: 'IN' | 'OUT') => {
        const response = await api.get('/kategori-arus-uang', { params: { type } })
        return response.data.data as KategoriArusUang[]
    },
    create: async (data: { type: 'IN' | 'OUT', name: string, description?: string }) => {
        const response = await api.post('/kategori-arus-uang', data)
        return response.data.data as KategoriArusUang
    }
}
