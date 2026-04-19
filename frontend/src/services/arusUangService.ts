import api from './api'

export interface ArusUang {
    id: string
    store_id: string
    type: 'IN' | 'OUT'
    source: 'TRANSAKSI' | 'PEMBELIAN' | 'MANUAL'
    reference_id: string | null
    payment_method: string
    amount: string | number
    description: string
    date: string
    created_at: string
    updated_at: string
    creator?: {
        username: string
    }
}

export interface ArusUangSummary {
    total_in: number
    total_out: number
    current_balance: number
}

interface ArusUangResponse {
    success: boolean
    data: {
        summary: ArusUangSummary
        items: ArusUang[]
        meta: {
            page: number
            limit: number
            total: number
            total_pages: number
        }
    }
}

export const arusUangService = {
    getList: async (params?: { page?: number; limit?: number; start_date?: string; end_date?: string; type?: string }) => {
        const response = await api.get<ArusUangResponse>('/arus-uang', { params })
        return response.data.data
    },

    createManual: async (data: { type: 'IN' | 'OUT'; payment_method: string; amount: number; description: string; date: string }) => {
        const response = await api.post('/arus-uang', data)
        return response.data
    },

    deleteManual: async (id: string) => {
        const response = await api.delete(`/arus-uang/${id}`)
        return response.data
    },

    syncData: async () => {
        const response = await api.post('/arus-uang/sync')
        return response.data
    }
}
