import api from './api'

/**
 * Get the current store_id from localStorage (reflects admin store switching)
 */
const getCurrentStoreId = (): string | undefined => {
    try {
        const userRaw = localStorage.getItem('user')
        if (userRaw) {
            const user = JSON.parse(userRaw)
            return user.store_id || undefined
        }
    } catch {
        // ignore
    }
    return undefined
}

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
    transaction_date?: string  // custom date (YYYY-MM-DD), used when casier.changedate permission granted
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
        const effectivePayload = { ...payload }
        if (!effectivePayload.store_id) {
            effectivePayload.store_id = getCurrentStoreId() || ''
        }
        const response = await api.post('/transaksi', effectivePayload)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Transaksi gagal diproses',
        }
    }
}
