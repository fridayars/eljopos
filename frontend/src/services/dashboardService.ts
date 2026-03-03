import api from './api'

// =============================================
// Helpers
// =============================================

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

// =============================================
// Types
// =============================================
export interface DashboardSummary {
    today_sales: number
    total_transactions: number
    total_new_customers: number
    low_stock_items: number
    sales_change: string
    transactions_change: string
    new_customers_change: string
    low_stock_change: string
    notes: string
}

export interface RecentTransaction {
    id: string
    invoice_number: string
    created_at: string
    customer_name: string | null
    total_amount: number
    payment_method: string[]
    items_count: number
}

export interface DashboardSummaryResponse {
    success: boolean
    data?: DashboardSummary
    message?: string
}

export interface RecentTransactionsResponse {
    success: boolean
    data?: RecentTransaction[]
    message?: string
}

export interface UpdateNotesResponse {
    success: boolean
    data?: { store_id: string; notes: string }
    message?: string
}

// =============================================
// Service Functions
// =============================================

/**
 * Ambil data ringkasan statistik dashboard hari ini
 */
export const getDashboardSummary = async (storeId?: string): Promise<DashboardSummaryResponse> => {
    const effectiveStoreId = storeId || getCurrentStoreId()
    const params: Record<string, string> = {}
    if (effectiveStoreId) params.store_id = effectiveStoreId
    const response = await api.get('/dashboard/summary', { params })
    return response.data
}

/**
 * Ambil daftar 5 transaksi terbaru
 */
export const getRecentTransactions = async (storeId?: string): Promise<RecentTransactionsResponse> => {
    const effectiveStoreId = storeId || getCurrentStoreId()
    const params: Record<string, string> = {}
    if (effectiveStoreId) params.store_id = effectiveStoreId
    const response = await api.get('/dashboard/recent-transactions', { params })
    return response.data
}

/**
 * Update catatan toko (notes)
 */
export const updateDashboardNotes = async (notes: string, storeId?: string): Promise<UpdateNotesResponse> => {
    const effectiveStoreId = storeId || getCurrentStoreId()
    const body: Record<string, string> = { notes }
    if (effectiveStoreId) body.store_id = effectiveStoreId
    const response = await api.put('/dashboard/notes', body)
    return response.data
}
