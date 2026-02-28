import api from './api'

const USE_MOCK_DATA_TRANSACTION = true

export interface TransactionItemPayload {
    item_type: 'product' | 'layanan'
    item_id: string
    item_name: string
    kategori_name: string
    price: number
    quantity: number
    subtotal: number
}

export interface CreateTransactionPayload {
    store_id: string
    customer_id?: string // walk-in = undefined/null
    total_amount: number
    payment_method: 'CASH' | 'TRANSFER' | 'CARD'
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
    if (USE_MOCK_DATA_TRANSACTION) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const invoiceNum = `INV/${new Date().toISOString().slice(0, 10).replace(/-/g, '')}/${String(
                    Math.floor(Math.random() * 1000),
                ).padStart(3, '0')}`

                resolve({
                    success: true,
                    data: {
                        transaksi_id: `txn-mock-${Date.now()}`,
                        invoice_number: invoiceNum,
                    },
                })
            }, 800)
        })
    }

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
