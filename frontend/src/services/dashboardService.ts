import api from './api'

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
    const params: Record<string, string> = {}
    if (storeId) params.store_id = storeId
    const response = await api.get('/dashboard/summary', { params })
    return response.data
}

/**
 * Ambil daftar 5 transaksi terbaru
 */
export const getRecentTransactions = async (storeId?: string): Promise<RecentTransactionsResponse> => {
    const params: Record<string, string> = {}
    if (storeId) params.store_id = storeId
    const response = await api.get('/dashboard/recent-transactions', { params })
    return response.data
}

/**
 * Update catatan toko (notes)
 */
export const updateDashboardNotes = async (notes: string, storeId?: string): Promise<UpdateNotesResponse> => {
    const body: Record<string, string> = { notes }
    if (storeId) body.store_id = storeId
    const response = await api.put('/dashboard/notes', body)
    return response.data
}
