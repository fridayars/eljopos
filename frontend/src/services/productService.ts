import api from './api'
import mockData from '../mocks/products.json'

const USE_MOCK_DATA_GET_PRODUCTS = false

export interface ProductItem {
    id: string
    kategori_produk_id: string
    name: string
    sku: string
    price: number
    cost_price: number
    stock: number
    kategori_name: string
    image: string
    image_url?: string
    item_type?: 'product' | 'layanan'
    is_active?: boolean
    jasa_pasang?: number
    ongkir_asuransi?: number
    biaya_overhead?: number
}

export interface Category {
    id: string
    name: string
    description?: string
}

export interface ServiceCategory {
    id: string
    name: string
    description: string
}

export interface ServiceProduct {
    id: string
    name: string
    detailService: string
    count_product: number
    capitalPrice: number
    biaya_overhead: number
    price: number
    categoryId: string
    categoryName: string
    is_active?: boolean
    linkedProducts?: { id: string; sku: string; name: string }[]
}

export interface GetProductsResponse {
    success: boolean
    data: {
        items: ProductItem[]
        pagination: {
            page: number
            limit: number
            total: number
            total_pages: number
            has_next: boolean
            has_prev: boolean
        }
    }
    message?: string
}

const LOCAL_STORAGE_PRODUCTS_KEY = 'mock_products_data'
const LOCAL_STORAGE_CATEGORIES_KEY = 'mock_categories_data'
const LOCAL_STORAGE_SERVICE_CATEGORIES_KEY = 'mock_service_categories_data'
const LOCAL_STORAGE_SERVICE_PRODUCTS_KEY = 'mock_service_products_data'

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

// Mock service categories
const initialServiceCategories: ServiceCategory[] = [
    { id: '1', name: 'Cleaning Service', description: 'Professional cleaning services' },
    { id: '2', name: 'Consulting', description: 'Business and tax consulting services' },
    { id: '3', name: 'Maintenance', description: 'Equipment and facility maintenance' },
    { id: '4', name: 'Training', description: 'Professional training and workshops' },
]

// Mock service products
const initialServiceProducts: ServiceProduct[] = [
    {
        id: '1',
        name: 'Deep Cleaning Service',
        detailService: 'Complete deep cleaning for home or office including floor, windows, and furniture',
        count_product: 1,
        capitalPrice: 350000,
        biaya_overhead: 0,
        price: 500000,
        categoryId: '1',
        categoryName: 'Cleaning Service',
    },
    {
        id: '2',
        name: 'Regular Cleaning',
        detailService: 'Standard cleaning service for regular maintenance',
        count_product: 0,
        capitalPrice: 150000,
        biaya_overhead: 0,
        price: 250000,
        categoryId: '1',
        categoryName: 'Cleaning Service',
    }
]

// Initialize mock data to localStorage if it doesn't exist
const initMockData = () => {
    if (!localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(mockData.products))
    }
    if (!localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(mockData.categories))
    }
    if (!localStorage.getItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY, JSON.stringify(initialServiceCategories))
    }
    if (!localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY, JSON.stringify(initialServiceProducts))
    }
}

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    store_id?: string;
    status?: string | boolean;
}

export const getProducts = async (params: GetProductsParams = {}): Promise<GetProductsResponse> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        initMockData()
        return new Promise((resolve) => {
            setTimeout(() => {
                let items: ProductItem[] = []
                try {
                    items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY) || '[]')
                } catch (e) {
                    console.error('Failed to parse mock products', e)
                }

                resolve({
                    success: true,
                    data: {
                        items,
                        pagination: {
                            page: 1,
                            limit: 100,
                            total: items.length,
                            total_pages: 1,
                            has_next: false,
                            has_prev: false,
                        },
                    },
                })
            }, 500)
        })
    }

    try {
        const storeId = params.store_id || getCurrentStoreId()

        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        if (params.sort) searchParams.append('sort', params.sort)
        if (storeId) searchParams.append('store_id', storeId)
        if (params.status !== undefined) searchParams.append('status', String(params.status))

        const queryStr = searchParams.toString()
        const url = `/master/products${queryStr ? `?${queryStr}` : ''}`

        const response = await api.get(url)
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } },
            message: error.response?.data?.message || 'Gagal memuat produk',
        }
    }
}

export const getCategories = async (): Promise<{ success: boolean; data: Category[] }> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        initMockData()
        let items: Category[] = []
        try {
            items = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY) || '[]')
        } catch (e) {
            console.error('Failed to parse mock categories', e)
        }
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: items,
                })
            }, 200)
        })
    }

    try {
        const response = await api.get('/master/products/categories')

        // Map backend response matching `items` into the `data` array expected by frontend
        const items = response.data?.data?.items || []
        const mappedCategories: Category[] = items.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || ''
        }))

        return { success: true, data: mappedCategories }
    } catch (error: any) {
        console.error('DEBUG CATCH getCategories:', error.response?.data || error.message);
        return { success: false, data: [] }
    }
}

export const addCategory = async (category: Omit<Category, 'id'>): Promise<{ success: boolean; data?: Category; message?: string }> => {
    try {
        const storeId = getCurrentStoreId()
        const payload: any = {
            ...category,
            store_id: storeId,
        }
        const response = await api.post('/master/products/categories', payload)
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal menambahkan kategori' }
    }
}

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<{ success: boolean; data?: Category; message?: string }> => {
    try {
        const storeId = getCurrentStoreId()
        const payload: any = {
            ...updates,
            store_id: storeId,
        }
        const response = await api.put(`/master/products/categories/${id}`, payload)
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal memperbarui kategori' }
    }
}

export const deleteCategory = async (id: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/products/categories/${id}?store_id=${storeId}` : `/master/products/categories/${id}`
        const response = await api.delete(url)
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal menghapus kategori' }
    }
}

export const addProduct = async (product: Omit<ProductItem, 'id'>): Promise<{ success: boolean; data?: ProductItem }> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const itemsStr = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY) || '[]'
                const items: ProductItem[] = JSON.parse(itemsStr)

                const newProduct: ProductItem = {
                    ...product,
                    id: `mock-prod-${Date.now()}`
                }

                items.push(newProduct)
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(items))

                resolve({ success: true, data: newProduct })
            }, 500)
        })
    }

    try {
        const response = await api.post('/master/products', product)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const updateProduct = async (id: string, updates: Partial<ProductItem>): Promise<{ success: boolean; data?: ProductItem }> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const itemsStr = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY) || '[]'
                const items: ProductItem[] = JSON.parse(itemsStr)

                const index = items.findIndex((p) => p.id === id)
                if (index === -1) {
                    return resolve({ success: false })
                }

                items[index] = { ...items[index], ...updates }
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(items))

                resolve({ success: true, data: items[index] })
            }, 500)
        })
    }

    try {
        const response = await api.put(`/master/products/${id}`, updates)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const deleteProduct = async (id: string): Promise<{ success: boolean }> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const itemsStr = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY) || '[]'
                let items: ProductItem[] = JSON.parse(itemsStr)

                items = items.filter((p) => p.id !== id)
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(items))

                resolve({ success: true })
            }, 500)
        })
    }

    try {
        const response = await api.delete(`/master/products/${id}`)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const updateProductStatus = async (id: string, is_active: boolean): Promise<{ success: boolean; message?: string }> => {
    try {
        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/products/${id}/status?store_id=${storeId}` : `/master/products/${id}/status`
        const response = await api.put(url, { is_active })
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal mengubah status produk' }
    }
}

export const uploadImage = async (file: File, folder?: string): Promise<{ success: boolean; data?: { url: string; key: string }; message?: string }> => {
    try {
        const formData = new FormData()
        formData.append('image', file)
        if (folder) formData.append('folder', folder)
        const response = await api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal mengupload gambar' }
    }
}

export const deleteImage = async (url: string): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.delete('/upload/image', { data: { url } })
        return response.data
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal menghapus gambar' }
    }
}

export const importProductsFile = async (file: File): Promise<{ success: boolean, message?: string }> => {
    try {
        const formData = new FormData()
        formData.append('file', file)

        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/products/import?store_id=${storeId}` : '/master/products/import'

        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })

        if (response.data && response.data.success) {
            return { success: true, message: response.data.data?.message || 'Produk berhasil diimport' }
        }
        return { success: false, message: response.data?.message || 'Gagal import produk' }
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || 'Terjadi kesalahan saat mengimport Excel'
        }
    }
}

export const exportProductsFile = async (storeId?: string): Promise<{ success: boolean, message?: string }> => {
    try {
        const effectiveStoreId = storeId || getCurrentStoreId()
        const url = effectiveStoreId ? `/master/products/export?store_id=${effectiveStoreId}` : '/master/products/export'
        const response = await api.get(url, {
            responseType: 'blob', // Important: tell Axios to tell Axios to handle binary data
        })

        // Extract filename from content-disposition header if present
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        let filename = `product_${timestamp}.xlsx`
        const contentDisposition = response.headers['content-disposition']
        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/)
            if (filenameMatch && filenameMatch.length > 1) {
                filename = filenameMatch[1]
            }
        }

        // Create download link and click it
        const downloadUrl = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = downloadUrl
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()

        // Cleanup
        link.parentNode?.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)

        return { success: true }
    } catch (error: any) {
        return { success: false, message: 'Gagal mengekspor file produk' }
    }
}

// ============================
// SERVICE INVENTORY OPERATIONS
// ============================

export const getServiceCategories = async (): Promise<{ success: boolean; data: ServiceCategory[] }> => {
    try {
        const response = await api.get('/master/layanan/categories')
        const items = response.data?.data?.items || []
        const mapped: ServiceCategory[] = items.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            description: cat.description || '',
            is_active: cat.is_active
        }))
        return { success: true, data: mapped }
    } catch (error: any) {
        return { success: false, data: [] }
    }
}

export const addServiceCategory = async (category: Omit<ServiceCategory, 'id'>): Promise<{ success: boolean; data?: ServiceCategory }> => {
    try {
        const response = await api.post('/master/layanan/categories', category)
        const cat = response.data?.data
        if (cat) {
            return { success: true, data: { id: cat.id, name: cat.name, description: cat.description || '' } }
        }
        return { success: false }
    } catch (error: any) {
        return { success: false }
    }
}

export const handleDeleteCategoryAsync = async (_id: string) => {
    console.warn('Hbagai ini belum tersedia');
};
export const updateServiceCategory = async (_id: string, _updates: Partial<ServiceCategory>): Promise<{ success: boolean; data?: ServiceCategory }> => {
    // TODO: implement backend update kategori layanan endpoint
    return { success: false }
}

export const removeServiceCategory = async (_id: string): Promise<{ success: boolean }> => {
    // TODO: implement backend delete kategori layanan endpoint
    return { success: false }
}

interface GetServiceProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    kategori_layanan_id?: string;
    store_id?: string;
    status?: string | boolean;
}

export interface GetServiceProductsResponse {
    success: boolean
    data: {
        items: ServiceProduct[]
        pagination: {
            page: number
            limit: number
            total: number
            total_pages: number
            has_next: boolean
            has_prev: boolean
        }
    }
    message?: string
}

export const getServiceProducts = async (params: GetServiceProductsParams = {}): Promise<GetServiceProductsResponse> => {
    try {
        const storeId = params.store_id || getCurrentStoreId()
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        if (params.sort) searchParams.append('sort', params.sort)
        if (params.kategori_layanan_id && params.kategori_layanan_id !== 'all') {
            searchParams.append('kategori_layanan_id', params.kategori_layanan_id)
        }
        if (storeId) searchParams.append('store_id', storeId)
        if (params.status !== undefined) searchParams.append('status', String(params.status))

        const queryStr = searchParams.toString()
        const url = `/master/layanan${queryStr ? `?${queryStr}` : ''}`

        const response = await api.get(url)
        const items = response.data?.data?.items || []
        const mapped: ServiceProduct[] = items.map((s: any) => ({
            id: s.id,
            name: s.name,
            detailService: s.description || '',
            count_product: s.count_product || 0,
            capitalPrice: s.cost_price || 0,
            biaya_overhead: s.biaya_overhead || 0,
            price: s.price || 0,
            categoryId: s.kategori_layanan_id || '',
            categoryName: s.kategori_name || '',
            is_active: s.is_active
        }))

        return {
            success: true,
            data: {
                items: mapped,
                pagination: response.data?.data?.pagination || {
                    page: 1,
                    limit: 10,
                    total: 0,
                    total_pages: 0,
                    has_next: false,
                    has_prev: false
                }
            }
        }
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], pagination: { page: 1, limit: 10, total: 0, total_pages: 0, has_next: false, has_prev: false } },
            message: error.response?.data?.message || 'Gagal memuat layanan',
        }
    }
}

export const getServiceDetail = async (id: string): Promise<{ success: boolean; data?: ServiceProduct }> => {
    try {
        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/layanan/${id}?store_id=${storeId}` : `/master/layanan/${id}`
        const response = await api.get(url)
        console.log('getServiceDetail response:', response.data)
        const s = response.data?.data
        if (!s) return { success: false }

        return {
            success: true,
            data: {
                id: s.id,
                name: s.name,
                detailService: s.description || '',
                count_product: (s.produkLayanan || []).length,
                capitalPrice: s.cost_price || 0,
                biaya_overhead: s.biaya_overhead || 0,
                price: s.price || 0,
                categoryId: s.kategori_layanan_id || '',
                categoryName: s.kategori_name || '',
                is_active: s.is_active,
                linkedProducts: (s.produkLayanan || []).map((pl: any) => ({
                    id: pl.id,
                    sku: pl.sku || '',
                    name: pl.name || ''
                }))
            }
        }
    } catch (error: any) {
        return { success: false }
    }
}

export const addServiceProduct = async (service: Omit<ServiceProduct, 'id'>): Promise<{ success: boolean; data?: { id: string; name: string } }> => {
    try {
        const storeId = getCurrentStoreId()
        const payload: any = {
            kategori_layanan_id: service.categoryId || undefined,
            store_id: storeId,
            name: service.name,
            price: service.price,
            cost_price: service.capitalPrice,
            biaya_overhead: service.biaya_overhead || 0,
            description: service.detailService || undefined,
            is_active: service.is_active !== undefined ? service.is_active : true,
        }
        if (service.linkedProducts && service.linkedProducts.length > 0) {
            payload.products = service.linkedProducts.map(p => ({ sku: p.sku }))
        }
        const response = await api.post('/master/layanan', payload)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const updateServiceProduct = async (id: string, service: Partial<ServiceProduct>): Promise<{ success: boolean; data?: { id: string; name: string } }> => {
    try {
        const storeId = getCurrentStoreId()
        const payload: any = {
            kategori_layanan_id: service.categoryId || undefined,
            store_id: storeId,
            name: service.name,
            price: service.price,
            cost_price: service.capitalPrice,
            biaya_overhead: service.biaya_overhead || 0,
            description: service.detailService || undefined,
            is_active: service.is_active !== undefined ? service.is_active : true,
        }
        if (service.linkedProducts !== undefined) {
            payload.products = (service.linkedProducts || []).map(p => ({ sku: p.sku }))
        }
        const response = await api.put(`/master/layanan/${id}`, payload)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const deleteServiceProduct = async (id: string): Promise<{ success: boolean }> => {
    try {
        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/layanan/${id}?store_id=${storeId}` : `/master/layanan/${id}`
        const response = await api.delete(url)
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const updateServiceStatus = async (id: string, is_active: boolean): Promise<{ success: boolean }> => {
    try {
        const storeId = getCurrentStoreId()
        const url = storeId ? `/master/layanan/${id}/status?store_id=${storeId}` : `/master/layanan/${id}/status`
        const response = await api.put(url, { is_active })
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

export const importServiceProducts = async (file: File): Promise<{ success: boolean, message?: string }> => {
    // Reuse importProductsFile logic as requested
    return importProductsFile(file)
}

export const exportServiceProducts = async (): Promise<{ success: boolean, message?: string }> => {
    // Reuse exportProductsFile logic as requested
    return exportProductsFile()
}

export const executeStockTransfer = async (sourceBranch: string, destinationBranch: string, items: { productId: string; quantity: number }[]): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await api.post('/master/products/transfer', {
            sourceBranch,
            destinationBranch,
            items
        });
        return response.data;
    } catch (error: any) {
        return { success: false, message: error.response?.data?.message || 'Gagal mengeksekusi transfer stok' };
    }
}

