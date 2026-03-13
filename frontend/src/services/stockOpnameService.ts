import api from './api';

export interface StockOpnameItem {
    id: string;
    product_id: string;
    product_name?: string;
    sku?: string;
    stok_sistem: number;
    stok_fisik: number;
    selisih: number;
    keterangan?: string;
}

export interface StockOpname {
    id: string;
    opname_number: string;
    store_id: string;
    user_id: string;
    tanggal: string;
    status: 'DRAFT' | 'COMPLETED' | 'CANCELLED';
    keterangan?: string;
    created_at: string;
    user?: {
        username: string;
    };
    details?: StockOpnameItem[];
}

export interface StockOpnameResponse {
    success: boolean;
    data: {
        items: StockOpname[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            total_pages: number;
        };
    };
}

export const stockOpnameService = {
    getAll: async (params: { page?: number; limit?: number; search?: string; status?: string }) => {
        const response = await api.get('/stock-opname', { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/stock-opname/${id}`);
        return response.data;
    },

    create: async (data: {
        opname_number: string;
        tanggal?: string;
        keterangan?: string;
        status?: 'DRAFT' | 'COMPLETED';
        items: {
            product_id: string;
            stok_fisik: number;
            keterangan?: string;
        }[];
    }) => {
        const response = await api.post('/stock-opname', data);
        return response.data;
    },

    complete: async (id: string) => {
        const response = await api.post(`/stock-opname/${id}/complete`);
        return response.data;
    },

    cancel: async (id: string) => {
        const response = await api.post(`/stock-opname/${id}/cancel`);
        return response.data;
    },

    update: async (id: string, data: {
        opname_number?: string;
        tanggal?: string;
        keterangan?: string;
        status?: 'DRAFT' | 'COMPLETED';
        items: {
            product_id: string;
            stok_fisik: number;
            keterangan?: string;
        }[];
    }) => {
        const response = await api.put(`/stock-opname/${id}`, data);
        return response.data;
    }
};
