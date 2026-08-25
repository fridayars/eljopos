import api from './api'

export interface TeknisiUpload {
    id: string
    image_url: string
    uploaded_by_name: string
    created_at: string
}

export interface TeknisiTransactionDetail {
    id: string
    item_name: string
    kategori_name: string
    price: string
    quantity: number
    subtotal: string
    staff_name: string | null
    insentif_per_item: number
    uploads: TeknisiUpload[]
}

export interface TeknisiTransaction {
    id: string
    receipt_number: string
    transaction_date: string
    customer_name: string
    total_layanan: number
    uploaded_count: number
    upload_status: 'none' | 'partial' | 'complete'
    uploads?: { id: string, image_url: string }[]
}

export interface TeknisiTransactionsResponse {
    success: boolean
    data: {
        items: TeknisiTransaction[]
        total_items: number
        total_pages: number
        current_page: number
        limit: number
    }
}

export interface TeknisiTransactionDetailResponse {
    success: boolean
    data: {
        id: string
        receipt_number: string
        transaction_date: string
        customer_name: string
        details: TeknisiTransactionDetail[]
    }
}

export interface GetTeknisiTransactionsParams {
    page?: number
    limit?: number
    search?: string
    store_id?: string
    start_date?: string
    end_date?: string
}

export const getTeknisiTransactions = async (params: GetTeknisiTransactionsParams = {}): Promise<TeknisiTransactionsResponse> => {
    try {
        const response = await api.get('/teknisi/transactions', { params })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat daftar transaksi teknisi')
    }
}

export const getTeknisiTransactionDetail = async (id: string): Promise<TeknisiTransactionDetailResponse> => {
    try {
        const response = await api.get(`/teknisi/transactions/${id}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat detail transaksi teknisi')
    }
}

export const getTeknisiInsentifTotal = async (params: {
    start_date?: string
    end_date?: string
    store_id?: string
}): Promise<{ success: boolean; data: { total_insentif: number } }> => {
    try {
        const response = await api.get('/teknisi/insentif-total', { params })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat total insentif')
    }
}

export const uploadTeknisiImage = async (transaksiDetailId: string, file: File): Promise<{ success: boolean; data: TeknisiUpload; message?: string }> => {
    try {
        const formData = new FormData()
        formData.append('image', file)

        const response = await api.post(`/teknisi/upload/${transaksiDetailId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal mengupload gambar')
    }
}

export const deleteTeknisiImage = async (uploadId: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/teknisi/upload/${uploadId}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal menghapus gambar')
    }
}
