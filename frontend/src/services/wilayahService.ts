import api from './api'

export interface WilayahItem {
    code: string
    name: string
}

export interface WilayahResponse {
    success: boolean
    data: WilayahItem[]
    message?: string
}

/**
 * GET /wilayah/provinces
 */
export const getProvinces = async (): Promise<WilayahResponse> => {
    try {
        const response = await api.get('/wilayah/provinces')
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat data provinsi',
        }
    }
}

/**
 * GET /wilayah/regencies?province_code=xx
 */
export const getRegencies = async (province_code: string): Promise<WilayahResponse> => {
    try {
        const response = await api.get('/wilayah/regencies', { params: { province_code } })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat data kabupaten/kota',
        }
    }
}

/**
 * GET /wilayah/districts?regency_code=xx.xx
 */
export const getDistricts = async (regency_code: string): Promise<WilayahResponse> => {
    try {
        const response = await api.get('/wilayah/districts', { params: { regency_code } })
        return response.data
    } catch (error: any) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Gagal memuat data kecamatan',
        }
    }
}
