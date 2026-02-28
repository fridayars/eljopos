import api from './api'
import mockDashboard from '../mocks/dashboard.json'

// =============================================
// Mock data flags — set false saat integrasi
// =============================================
const USE_MOCK_DATA = true

// =============================================
// Types
// =============================================
export interface DashboardSummary {
    today_sales: number
    total_transactions: number
    total_customers: number
    low_stock_items: number
    sales_change: string
    transactions_change: string
    customers_change: string
    low_stock_change: string
}

export interface RecentTransaction {
    invoice_number: string
    created_at: string
    customer_name: string
    total_amount: number
    payment_method: string
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

// =============================================
// Service Functions
// =============================================

/**
 * Ambil data ringkasan statistik dashboard hari ini
 */
export const getDashboardSummary = async (): Promise<DashboardSummaryResponse> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, data: mockDashboard.summary }), 400)
        })
    }

    const response = await api.get('/dashboard/summary')
    return response.data
}

/**
 * Ambil daftar 5 transaksi terbaru
 */
export const getRecentTransactions = async (): Promise<RecentTransactionsResponse> => {
    if (USE_MOCK_DATA) {
        return new Promise((resolve) => {
            setTimeout(() => resolve({ success: true, data: mockDashboard.recent_transactions }), 400)
        })
    }

    const response = await api.get('/dashboard/recent-transactions')
    return response.data
}
