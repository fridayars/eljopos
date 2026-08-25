import api from './api'

export interface KlaimGaransiBukti {
    id: string
    image_url: string
}

export interface KlaimGaransi {
    id: string
    tanggal_klaim: string
    tindakan: string
    kendala: string | null
    merk: string | null
    supplier?: { id: string, name: string }
    tipe_hp?: { id: string, name: string }
    detail_tindakan?: string | null
    bukti: KlaimGaransiBukti[]
}

export interface LaporanKlaimGaransiItem {
    id: string
    tanggal_klaim: string
    tindakan: string
    kendala: string | null
    merk: string | null
    detail_tindakan: string | null
    supplier: { id: string; name: string } | null
    tipe_hp: { id: string; name: string } | null
    bukti: KlaimGaransiBukti[]
    user: { id: string; username: string } | null
    transaksiDetail: {
        id: string
        item_name: string
        item_type: string
        transaksi: {
            id: string
            receipt_number: string
            created_at: string
            customer: { id: string; name: string } | null
            store: { id: string; name: string } | null
        }
        staff: { id: string; name: string } | null
    }
}

export const getKlaimDetail = async (transaksiDetailId: string): Promise<{ success: boolean; data: KlaimGaransi }> => {
    try {
        const response = await api.get(`/garansi/klaim/${transaksiDetailId}`)
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat detail klaim')
    }
}

export const getLaporanKlaimGaransi = async (params: {
    start_date?: string
    end_date?: string
    page?: number
    limit?: number
    store_id?: string
}): Promise<{ success: boolean; data: { items: LaporanKlaimGaransiItem[]; meta: { total: number; page: number; limit: number; total_pages: number } } }> => {
    try {
        const response = await api.get('/garansi/laporan', { params })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal memuat laporan klaim garansi')
    }
}

export const submitKlaimGaransi = async (
    transaksiDetailId: string, 
    data: { tindakan: string; kendala: string; supplier_id?: string; merk?: string; tanggal_klaim?: string; tipe_hp_id?: string; detail_tindakan?: string },
    files: File[]
): Promise<{ success: boolean; data: KlaimGaransi }> => {
    try {
        const formData = new FormData()
        formData.append('tindakan', data.tindakan)
        formData.append('kendala', data.kendala)
        if (data.supplier_id) formData.append('supplier_id', data.supplier_id)
        if (data.merk) formData.append('merk', data.merk)
        if (data.tipe_hp_id) formData.append('tipe_hp_id', data.tipe_hp_id)
        if (data.detail_tindakan) formData.append('detail_tindakan', data.detail_tindakan)
        if (data.tanggal_klaim) formData.append('tanggal_klaim', data.tanggal_klaim)
        
        files.forEach(file => {
            formData.append('images', file)
        })

        const response = await api.post(`/garansi/klaim/${transaksiDetailId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Gagal menyimpan klaim garansi')
    }
}

