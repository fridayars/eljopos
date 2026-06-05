import api from './api';
import reportsMock from '../mocks/reports.json';

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
// Types — General Reports (tetap mock)
// =============================================
export interface SalesReportItem {
    label: string;
    sales: number;
}

export interface CashFlowItem {
    no: number;
    description: string;
    income: number;
    outcome: number;
}

export interface SalesTableItem {
    date: string;
    profit: number;
    revenue: number;
}

// =============================================
// Types — Transaction History (real API)
// =============================================
export interface TransactionHistoryItem {
    id: string;
    invoice_number: string;
    created_at: string;
    customer_name: string | null;
    total_amount: number;
    type: string | null;
    kasir: string | null;
    store: string | null;
}

export interface TransactionHistorySummary {
    total_revenue: number;
    total_transactions: number;
    payment_summary: { method: string; total: number }[];
}

export interface TransactionHistoryMeta {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface TransactionHistoryResponse {
    success: boolean;
    data: {
        summary: TransactionHistorySummary;
        items: TransactionHistoryItem[];
        meta: TransactionHistoryMeta;
    };
    message?: string;
}

export interface TransactionHistoryParams {
    start_date: string;
    end_date: string;
    store_id?: string;
    page?: number;
    limit?: number;
}

// =============================================
// Types — Transaction Detail (real API)
// =============================================
export interface TransactionDetailItem {
    item_type: string;
    item_name: string;
    kategori_name: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface TransactionDetailPayment {
    method: string;
    amount: number;
}

export interface TransactionDetailData {
    id: string;
    receipt_number: string;
    subtotal: number;
    discount_type: 'percentage' | 'amount' | null;
    discount: number;
    total_amount: number;
    created_at: string;
    customer: { name: string; phone: string } | null;
    user: { username: string } | null;
    store?: { name: string } | null;
    details: TransactionDetailItem[];
    payments: TransactionDetailPayment[];
}

export interface TransactionDetailResponse {
    success: boolean;
    data: TransactionDetailData;
    message?: string;
}

// =============================================
// Types — Ranking Reports (real API)
// =============================================
export interface ProductRankingItem {
    id: string;
    name: string;
    total_qty: number;
    total_value: number;
}

export interface CustomerRankingItem {
    id: string;
    name: string;
    total_transactions: number;
    total_value: number;
}

export interface RankingResponse<T> {
    success: boolean;
    data: {
        items: T[];
        meta: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    };
    message?: string;
}

// =============================================
// General Report Services (mock)
// =============================================
const USE_MOCK_DATA = true;

export const getSalesReport = async (params: {
    start_date: string;
    end_date: string;
    period: 'daily' | 'monthly' | 'yearly';
    store_id?: string;
}): Promise<{ success: boolean; data: SalesReportItem[] }> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/grafik-penjualan', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: []
        };
    }
};

export const getCashFlow = async (params: {
    start_date: string;
    end_date: string;
    store_id?: string;
}): Promise<{ success: boolean; data: CashFlowItem[] }> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/arus-uang', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: []
        };
    }
};

export const getSalesTable = async (params: {
    start_date: string;
    end_date: string;
    period: 'daily' | 'monthly' | 'yearly';
    store_id?: string;
}): Promise<{ success: boolean; data: SalesTableItem[] }> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/tabel-penjualan', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: []
        };
    }
};

// =============================================
// Ranking Services (real API)
// =============================================

/**
 * GET /api/laporan/ranking-produk
 */
export const getProductRanking = async (params: { start_date: string; end_date: string; store_id?: string; page?: number; limit?: number }): Promise<RankingResponse<ProductRankingItem>> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/ranking-produk', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: {
                items: [],
                meta: { page: 1, limit: 10, total: 0, total_pages: 0 }
            },
            message: error.response?.data?.message || 'Gagal memuat peringkat produk'
        };
    }
};

/**
 * GET /api/laporan/ranking-customer
 */
export const getCustomerRanking = async (params: { start_date: string; end_date: string; store_id?: string; page?: number; limit?: number }): Promise<RankingResponse<CustomerRankingItem>> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/ranking-customer', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: {
                items: [],
                meta: { page: 1, limit: 10, total: 0, total_pages: 0 }
            },
            message: error.response?.data?.message || 'Gagal memuat peringkat customer'
        };
    }
};

// =============================================
// Transaction History (real API)
// =============================================

/**
 * GET /api/laporan/penjualan — Riwayat Transaksi dengan pagination
 */
export const getTransactionHistory = async (params: TransactionHistoryParams): Promise<TransactionHistoryResponse> => {
    try {
        const effectiveParams = { ...params }
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId()
        }
        const response = await api.get('/laporan/penjualan', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: {
                summary: { total_revenue: 0, total_transactions: 0, payment_summary: [] },
                items: [],
                meta: { page: 1, limit: 20, total: 0, total_pages: 0 },
            },
            message: error.response?.data?.message || 'Gagal memuat riwayat transaksi',
        };
    }
};

/**
 * GET /api/transaksi/:id — Detail Transaksi
 */
export const getTransactionDetail = async (id: string): Promise<TransactionDetailResponse> => {
    try {
        const response = await api.get(`/transaksi/${id}`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: {} as TransactionDetailData,
            message: error.response?.data?.message || 'Gagal memuat detail transaksi',
        };
    }
};

/**
 * DELETE /api/transaksi/:id — Delete Transaksi
 */
export const deleteTransaction = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete(`/transaksi/${id}`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Gagal menghapus transaksi',
        };
    }
};

export interface SummaryCardsResponse {
    success: boolean;
    data: {
        total_income: number;
        total_outcome: number;
        estimated_profit: number;
    };
    message?: string;
}

export const getSummaryCards = async (params: {
    start_date: string;
    end_date: string;
    store_id?: string;
}): Promise<SummaryCardsResponse> => {
    try {
        const effectiveParams = { ...params };
        if (!effectiveParams.store_id) {
            effectiveParams.store_id = getCurrentStoreId();
        }
        const response = await api.get('/laporan/summary-kartu', { params: effectiveParams });
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            data: {
                total_income: 0,
                total_outcome: 0,
                estimated_profit: 0
            },
            message: error.response?.data?.message || 'Gagal memuat ringkasan kartu'
        };
    }
};
