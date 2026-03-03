import api from './api'

export interface TransactionItemPayload {
    item_type: 'product' | 'layanan'
    item_id: string
    item_name: string
    kategori_name: string
    price: number
    quantity: number
    subtotal: number
}

export interface PaymentMethodPayload {
    method: string
    amount: number
}

export interface CreateTransactionPayload {
    store_id: string
    customer_id?: string
    total_amount: number
    subtotal: number
    discount_type?: 'percentage' | 'amount'
    discount?: number
    payment_method: PaymentMethodPayload[]
    items: TransactionItemPayload[]
}

export interface CreateTransactionResponse {
    success: boolean
    data?: {
        transaksi_id: string
        invoice_number: string
    }
    message?: string
}

export const createTransaction = async (
    payload: CreateTransactionPayload,
): Promise<CreateTransactionResponse> => {
    try {
        const response = await api.post('/transaksi', payload)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Transaksi gagal diproses',
        }
    }
}
