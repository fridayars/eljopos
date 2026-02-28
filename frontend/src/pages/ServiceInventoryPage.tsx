import { useState, useEffect } from 'react';
import { Package, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

import {
    getServiceCategories,
    getServiceProducts,
    addServiceCategory,
    updateServiceCategory,
    deleteServiceCategory,
    addServiceProduct,
    updateServiceProduct,
    deleteServiceProduct,
    importServiceProducts,
    getProducts,
} from '../services/productService';
import type {
    ServiceCategory,
    ServiceProduct,
    ProductItem,
} from '../services/productService';

import { ServiceCategoriesList } from '../components/inventory/ServiceCategoriesList';
import { ServicesTable } from '../components/inventory/ServicesTable';
import { EditServiceModal } from '../components/inventory/EditServiceModal';
import { ServiceDetailModal } from '../components/inventory/ServiceDetailModal';

// Reusing EditCategoryModal from Product Inventory
import { EditCategoryModal } from '../components/inventory/EditCategoryModal';

type ServiceInventoryTab = 'service-category' | 'produk-service';

export function ServiceInventoryPage() {
    const [activeTab, setActiveTab] = useState<ServiceInventoryTab>('service-category');

    // Data states
    const [categories, setCategories] = useState<ServiceCategory[]>([]);
    const [services, setServices] = useState<ServiceProduct[]>([]);
    const [products, setProducts] = useState<ProductItem[]>([]); // For linked items

    // Search and Filters
    const [searchCategory, setSearchCategory] = useState('');
    const [searchService, setSearchService] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
    const [productSearchQuery, setProductSearchQuery] = useState('');

    // Modals visibility
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] = useState(false);

    // Selected editable data
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceProduct>({
        id: '',
        name: '',
        detailService: '',
        sku: '',
        linkedItems: [],
        capitalPrice: 0,
        price: 0,
        categoryId: '',
        categoryName: '',
    });
    const [serviceToView, setServiceToView] = useState<ServiceProduct | null>(null);

    // Initial load
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [catsRes, servRes, prodRes] = await Promise.all([
                getServiceCategories(),
                getServiceProducts(),
                getProducts(),
            ]);

            if (catsRes.success) setCategories(catsRes.data);
            if (servRes.success) setServices(servRes.data);
            if (prodRes.success) setProducts(prodRes.data.items);
        } catch (error) {
            toast.error('Gagal memuat data inventaris layanan');
        }
    };

    // --- Category Actions ---
    const handleOpenAddCategory = () => {
        setSelectedCategory(null);
        setIsCategoryModalOpen(true);
    };

    const handleOpenEditCategory = (cat: ServiceCategory) => {
        setSelectedCategory(cat);
        setIsCategoryModalOpen(true);
    };

    const handleSaveCategory = async (id: string, updates: { label: string; description?: string }) => {
        try {
            if (id) {
                const res = await updateServiceCategory(id, { name: updates.label, description: updates.description || '' });
                if (res.success && res.data) {
                    setCategories(categories.map((c) => (c.id === id ? res.data! : c)));
                    toast.success('Kategori layanan berhasil diperbarui');
                } else {
                    toast.error(res.data?.name ? 'Gagal memperbarui kategori' : 'Kategori tidak ditemukan');
                }
            } else {
                const res = await addServiceCategory({ name: updates.label, description: updates.description || '' });
                if (res.success && res.data) {
                    setCategories([...categories, res.data]);
                    toast.success('Kategori layanan berhasil ditambahkan');
                } else {
                    toast.error('Gagal menambahkan kategori');
                }
            }
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan kategori layanan');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori layanan ini?')) {
            const res = await deleteServiceCategory(id);
            if (res.success) {
                setCategories(categories.filter((c) => c.id !== id));
                toast.success('Kategori layanan dihapus');
            } else {
                toast.error('Gagal menghapus kategori layanan');
            }
        }
    };

    // --- Service Actions ---
    const handleOpenAddService = () => {
        setSelectedService({
            id: '',
            name: '',
            detailService: '',
            sku: '',
            linkedItems: [],
            capitalPrice: 0,
            price: 0,
            categoryId: categories[0]?.id || '',
            categoryName: categories[0]?.name || '',
        });
        setProductSearchQuery('');
        setIsEditServiceModalOpen(true);
    };

    const handleOpenEditService = (service: ServiceProduct) => {
        setSelectedService({ ...service });
        setProductSearchQuery('');
        setIsEditServiceModalOpen(true);
    };

    const handleSaveService = async () => {
        if (!selectedService.name || !selectedService.sku || !selectedService.categoryId) {
            toast.error('Mohon lengkapi kolom wajib (Nama Layanan, SKU, Kategori)');
            return;
        }

        try {
            if (selectedService.id) {
                const res = await updateServiceProduct(selectedService.id, selectedService);
                if (res.success && res.data) {
                    setServices(services.map((s) => (s.id === selectedService.id ? res.data! : s)));
                    toast.success('Layanan berhasil diperbarui');
                }
            } else {
                const res = await addServiceProduct(selectedService);
                if (res.success && res.data) {
                    setServices([...services, res.data]);
                    toast.success('Layanan berhasil ditambahkan');
                }
            }
            setIsEditServiceModalOpen(false);
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan layanan');
        }
    };

    const handleDeleteService = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus layanan ini?')) {
            const res = await deleteServiceProduct(id);
            if (res.success) {
                setServices(services.filter((s) => s.id !== id));
                toast.success('Layanan dihapus');
            } else {
                toast.error('Gagal menghapus layanan');
            }
        }
    };

    // --- File Import / Export ---
    const handleExportServices = () => {
        const exportData = services.map(s => ({
            ...s,
            linkedItems: JSON.stringify(s.linkedItems)
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Products');
        XLSX.writeFile(workbook, 'service_products.xlsx');
        toast.success('Data layanan berhasil diekspor');
    };

    const handleImportServices = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json<any>(worksheet);

                const parsedServices: Omit<ServiceProduct, 'id'>[] = json.map((row) => ({
                    name: row.name || 'Unknown',
                    detailService: row.detailService || '',
                    sku: row.sku || '',
                    linkedItems: row.linkedItems ? JSON.parse(row.linkedItems) : [],
                    capitalPrice: Number(row.capitalPrice) || 0,
                    price: Number(row.price) || 0,
                    categoryId: row.categoryId || categories[0]?.id || '',
                    categoryName: row.categoryName || categories[0]?.name || '',
                }));

                const res = await importServiceProducts(parsedServices);
                if (res.success && res.data) {
                    setServices([...services, ...res.data]);
                    toast.success(`${res.data.length} layanan berhasil diimpor`);
                } else {
                    toast.error('Gagal mengimpor layanan');
                }
            } catch (error) {
                toast.error('Format file excel tidak valid');
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = ''; // Reset input
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header and Tabs */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Inventaris Layanan / Jasa</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Kelola kategori layanan dan produk layanan dengan barang fisik tertaut.
                        </p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                        <button
                            onClick={() => setActiveTab('service-category')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${activeTab === 'service-category'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <Package className="w-4 h-4" />
                            Kategori Layanan
                        </button>
                        <button
                            onClick={() => setActiveTab('produk-service')}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${activeTab === 'produk-service'
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                                : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
                                }`}
                        >
                            <Briefcase className="w-4 h-4" />
                            Produk Layanan
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'service-category' ? (
                    <ServiceCategoriesList
                        categories={categories}
                        searchQuery={searchCategory}
                        onSearchChange={setSearchCategory}
                        onAdd={handleOpenAddCategory}
                        onEdit={handleOpenEditCategory}
                        onDelete={handleDeleteCategory}
                    />
                ) : (
                    <ServicesTable
                        services={services}
                        categories={categories}
                        searchQuery={searchService}
                        onSearchChange={setSearchService}
                        selectedCategoryId={selectedCategoryFilter}
                        onCategoryChange={setSelectedCategoryFilter}
                        onAdd={handleOpenAddService}
                        onEdit={handleOpenEditService}
                        onDelete={handleDeleteService}
                        onDetail={(s) => {
                            setServiceToView(s);
                            setIsServiceDetailModalOpen(true);
                        }}
                        onExport={handleExportServices}
                        onImport={handleImportServices}
                    />
                )}
            </div>

            {/* Modals */}
            <EditCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory ? { id: selectedCategory.id, label: selectedCategory.name, description: selectedCategory.description } : null}
                onSave={handleSaveCategory}
                modalTitle={selectedCategory ? "Edit Kategori Layanan" : "Tambah Kategori Layanan"}
            />

            <EditServiceModal
                isOpen={isEditServiceModalOpen}
                onClose={() => setIsEditServiceModalOpen(false)}
                service={selectedService}
                categories={categories}
                products={products}
                onChange={setSelectedService}
                onSave={handleSaveService}
                productSearchQuery={productSearchQuery}
                onProductSearchChange={setProductSearchQuery}
            />

            {serviceToView && (
                <ServiceDetailModal
                    isOpen={isServiceDetailModalOpen}
                    onClose={() => setIsServiceDetailModalOpen(false)}
                    service={serviceToView}
                    onEdit={() => {
                        setIsServiceDetailModalOpen(false);
                        handleOpenEditService(serviceToView);
                    }}
                />
            )}
        </div>
    );
}
