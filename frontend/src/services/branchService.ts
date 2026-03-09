import api from './api'

const USE_MOCK_DATA_GET_BRANCHES = false

export interface Branch {
    id: string
    name: string
    address?: string
}

export const getBranches = async (): Promise<{ success: boolean; data: Branch[] }> => {
    if (USE_MOCK_DATA_GET_BRANCHES) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    data: [
                        { id: '1', name: 'Main Store - Jakarta Pusat', address: 'Jl. Jend. Sudirman No. 1' },
                        { id: '2', name: 'Branch 1 - Jakarta Selatan', address: 'Jl. Kemang Raya No. 15' },
                        { id: '3', name: 'Branch 2 - Jakarta Utara', address: 'Jl. Pluit Karang No. 8' },
                        { id: '4', name: 'Branch 3 - Tangerang', address: 'Jl. BSD Grand Boulevard' },
                    ],
                })
            }, 300)
        })
    }

    try {
        const response = await api.get('/master/stores')
        return response.data
    } catch (error: any) {
        return { success: false, data: [] }
    }
}
