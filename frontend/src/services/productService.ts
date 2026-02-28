import api from './api'
import mockData from '../mocks/products.json'

const USE_MOCK_DATA_GET_PRODUCTS = true

export interface ProductItem {
    id: string
    kategori_produk_id: string
    name: string
    sku: string
    price: number
    cost_price: number
    stok: number
    category_name: string
    image: string
    item_type: 'product' | 'layanan'
}

export interface Category {
    id: string
    label: string
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
    sku: string
    linkedItems: { productId: string; productName: string; quantity: number }[]
    capitalPrice: number
    price: number
    categoryId: string
    categoryName: string
}

export interface GetProductsResponse {
    success: boolean
    data: {
        items: ProductItem[]
        meta: {
            page: number
            limit: number
            total: number
        }
    }
    message?: string
}

const LOCAL_STORAGE_PRODUCTS_KEY = 'mock_products_data'
const LOCAL_STORAGE_CATEGORIES_KEY = 'mock_categories_data'
const LOCAL_STORAGE_SERVICE_CATEGORIES_KEY = 'mock_service_categories_data'
const LOCAL_STORAGE_SERVICE_PRODUCTS_KEY = 'mock_service_products_data'

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
        sku: 'SVC-001',
        linkedItems: [
            { productId: 'mock-1', productName: 'LCD iPhone X Original', quantity: 1 }
        ],
        capitalPrice: 350000,
        price: 500000,
        categoryId: '1',
        categoryName: 'Cleaning Service',
    },
    {
        id: '2',
        name: 'Regular Cleaning',
        detailService: 'Standard cleaning service for regular maintenance',
        sku: 'SVC-002',
        linkedItems: [],
        capitalPrice: 150000,
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

export const getProducts = async (): Promise<GetProductsResponse> => {
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
                        meta: {
                            page: 1,
                            limit: 100,
                            total: items.length,
                        },
                    },
                })
            }, 500)
        })
    }

    try {
        const response = await api.get('/master/products')
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: { items: [], meta: { page: 1, limit: 10, total: 0 } },
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
        const response = await api.get('/master/categories')
        return response.data
    } catch (error: any) {
        return { success: false, data: [] }
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

export const importProducts = async (products: Omit<ProductItem, 'id'>[]): Promise<{ success: boolean; data?: ProductItem[] }> => {
    if (USE_MOCK_DATA_GET_PRODUCTS) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const itemsStr = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY) || '[]'
                const items: ProductItem[] = JSON.parse(itemsStr)

                const newProducts = products.map((p, index) => ({
                    ...p,
                    id: `mock-prod-import-${Date.now()}-${index}`
                }))

                const updatedItems = [...items, ...newProducts]
                localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(updatedItems))

                resolve({ success: true, data: newProducts })
            }, 800)
        })
    }

    try {
        const response = await api.post('/master/products/import', { products })
        return response.data
    } catch (error: any) {
        return { success: false }
    }
}

// ============================
// SERVICE INVENTORY OPERATIONS
// ============================

export const getServiceCategories = async (): Promise<{ success: boolean; data: ServiceCategory[] }> => {
    initMockData()
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY) || '[]'
            const items: ServiceCategory[] = JSON.parse(itemsStr)
            resolve({ success: true, data: items })
        }, 300)
    })
}

export const addServiceCategory = async (category: Omit<ServiceCategory, 'id'>): Promise<{ success: boolean; data?: ServiceCategory }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY) || '[]'
            const items: ServiceCategory[] = JSON.parse(itemsStr)

            const newObj: ServiceCategory = {
                ...category,
                id: `svc-cat-${Date.now()}`
            }

            items.push(newObj)
            localStorage.setItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY, JSON.stringify(items))

            resolve({ success: true, data: newObj })
        }, 500)
    })
}

export const updateServiceCategory = async (id: string, updates: Partial<ServiceCategory>): Promise<{ success: boolean; data?: ServiceCategory }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY) || '[]'
            const items: ServiceCategory[] = JSON.parse(itemsStr)

            const index = items.findIndex((p) => p.id === id)
            if (index === -1) {
                return resolve({ success: false })
            }

            items[index] = { ...items[index], ...updates }
            localStorage.setItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY, JSON.stringify(items))

            resolve({ success: true, data: items[index] })
        }, 500)
    })
}

export const deleteServiceCategory = async (id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY) || '[]'
            let items: ServiceCategory[] = JSON.parse(itemsStr)

            items = items.filter((p) => p.id !== id)
            localStorage.setItem(LOCAL_STORAGE_SERVICE_CATEGORIES_KEY, JSON.stringify(items))

            resolve({ success: true })
        }, 500)
    })
}

export const getServiceProducts = async (): Promise<{ success: boolean; data: ServiceProduct[] }> => {
    initMockData()
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY) || '[]'
            const items: ServiceProduct[] = JSON.parse(itemsStr)
            resolve({ success: true, data: items })
        }, 500)
    })
}

export const addServiceProduct = async (product: Omit<ServiceProduct, 'id'>): Promise<{ success: boolean; data?: ServiceProduct }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY) || '[]'
            const items: ServiceProduct[] = JSON.parse(itemsStr)

            const newService: ServiceProduct = {
                ...product,
                id: `svc-${Date.now()}`
            }

            items.push(newService)
            localStorage.setItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY, JSON.stringify(items))

            resolve({ success: true, data: newService })
        }, 500)
    })
}

export const updateServiceProduct = async (id: string, updates: Partial<ServiceProduct>): Promise<{ success: boolean; data?: ServiceProduct }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY) || '[]'
            const items: ServiceProduct[] = JSON.parse(itemsStr)

            const index = items.findIndex((p) => p.id === id)
            if (index === -1) {
                return resolve({ success: false })
            }

            items[index] = { ...items[index], ...updates }
            localStorage.setItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY, JSON.stringify(items))

            resolve({ success: true, data: items[index] })
        }, 500)
    })
}

export const deleteServiceProduct = async (id: string): Promise<{ success: boolean }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY) || '[]'
            let items: ServiceProduct[] = JSON.parse(itemsStr)

            items = items.filter((p) => p.id !== id)
            localStorage.setItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY, JSON.stringify(items))

            resolve({ success: true })
        }, 500)
    })
}

export const importServiceProducts = async (products: Omit<ServiceProduct, 'id'>[]): Promise<{ success: boolean; data?: ServiceProduct[] }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const itemsStr = localStorage.getItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY) || '[]'
            const items: ServiceProduct[] = JSON.parse(itemsStr)

            const newProducts = products.map((p, index) => ({
                ...p,
                id: `imported-svc-${Date.now()}-${index}`
            }))

            const updatedItems = [...items, ...newProducts]
            localStorage.setItem(LOCAL_STORAGE_SERVICE_PRODUCTS_KEY, JSON.stringify(updatedItems))

            resolve({ success: true, data: newProducts })
        }, 800)
    })
}
