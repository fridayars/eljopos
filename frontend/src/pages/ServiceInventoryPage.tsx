import { useState, useEffect } from 'react';
import { Package, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import {
    getServiceCategories,
    getServiceProducts,
    addServiceCategory,
    deleteServiceProduct,
    addServiceProduct,
    updateServiceProduct,
    importServiceProducts,
    exportServiceProducts,
    getProducts,
    updateServiceStatus,
    getServiceDetail,
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
import { DeleteConfirmationModal } from '../components/inventory/DeleteConfirmationModal';

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

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    // Modals visibility
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
    const [isServiceDetailModalOpen, setIsServiceDetailModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected editable data
    const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
    const [selectedService, setSelectedService] = useState<ServiceProduct>({
        id: '',
        name: '',
        detailService: '',
        count_product: 0,
        capitalPrice: 0,
        biaya_overhead: 0,
        price: 0,
        categoryId: '',
        categoryName: '',
        linkedProducts: [],
    });
    const [serviceToView, setServiceToView] = useState<ServiceProduct | null>(null);
    const [serviceToDelete, setServiceToDelete] = useState<{ id: string; name: string } | null>(null);

    // Initial load
    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchServices();
    }, [currentPage, searchService, selectedCategoryFilter]);

    const fetchInitialData = async () => {
        try {
            const [catsRes, prodRes] = await Promise.all([
                getServiceCategories(),
                getProducts(),
            ]);

            if (catsRes.success) setCategories(catsRes.data);
            if (prodRes.success) setProducts(prodRes.data.items);
        } catch {
            toast.error('Gagal memuat data awal');
        }
    };

    const fetchServices = async () => {
        try {
            const servRes = await getServiceProducts({
                page: currentPage,
                limit: pageSize,
                search: searchService,
                kategori_layanan_id: selectedCategoryFilter === 'all' ? undefined : selectedCategoryFilter,
            });

            if (servRes.success) {
                setServices(servRes.data.items);
                setTotalPages(servRes.data.pagination.total_pages);
            }
        } catch {
            toast.error('Gagal memuat data layanan');
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

    const handleSaveCategory = async (id: string, updates: { name: string; description?: string }) => {
        try {
            if (id) {
                // TODO: backend update not implemented yet
                toast.error('Update kategori belum tersedia');
            } else {
                const res = await addServiceCategory({ name: updates.name, description: updates.description || '' });
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

    const handleDeleteCategory = async () => {
        toast.error('Hapus kategori belum tersedia');
    };

    // --- Service Actions ---
    const handleOpenAddService = () => {
        setSelectedService({
            id: '',
            name: '',
            detailService: '',
            count_product: 0,
            capitalPrice: 0,
            biaya_overhead: 0,
            price: 0,
            categoryId: categories[0]?.id || '',
            categoryName: categories[0]?.name || '',
            linkedProducts: [],
        });
        setIsEditServiceModalOpen(true);
    };

    const handleOpenEditService = async (service: ServiceProduct) => {
        // Show loading state or at least prevent double clicks here if necessary
        try {
            const res = await getServiceDetail(service.id);
            if (res.success && res.data) {
                setSelectedService(res.data);
            } else {
                setSelectedService({ ...service, linkedProducts: [] });
            }
        } catch {
            setSelectedService({ ...service, linkedProducts: [] });
        }
        setIsEditServiceModalOpen(true);
    };

    const handleSaveService = async () => {
        if (!selectedService.name) {
            toast.error('Mohon lengkapi nama layanan');
            return;
        }

        try {
            if (selectedService.id) {
                const res = await updateServiceProduct(selectedService.id, selectedService);
                if (res.success) {
                    toast.success('Layanan berhasil diperbarui');
                    fetchServices();
                } else {
                    toast.error('Gagal memperbarui layanan');
                }
            } else {
                const res = await addServiceProduct(selectedService);
                if (res.success) {
                    toast.success('Layanan berhasil ditambahkan');
                    fetchServices();
                } else {
                    toast.error('Gagal menambahkan layanan');
                }
            }
            setIsEditServiceModalOpen(false);
        } catch {
            toast.error('Terjadi kesalahan saat menyimpan layanan');
        }
    };

    const handleRequestDelete = (id: string) => {
        const svc = services.find(s => s.id === id);
        setServiceToDelete({ id, name: svc?.name || 'Layanan ini' });
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!serviceToDelete) return;
        try {
            const res = await deleteServiceProduct(serviceToDelete.id);
            if (res.success) {
                setServices(services.filter((s) => s.id !== serviceToDelete.id));
                toast.success('Layanan berhasil dihapus');
            } else {
                toast.error('Gagal menghapus layanan');
            }
        } catch {
            toast.error('Gagal menghapus layanan');
        }
        setIsDeleteModalOpen(false);
        setServiceToDelete(null);
    };

    const handleToggleStatus = async (id: string, newStatus: boolean) => {
        try {
            const res = await updateServiceStatus(id, newStatus);
            if (res.success) {
                setServices(services.map(s => s.id === id ? { ...s, is_active: newStatus } : s));
                toast.success(`Layanan ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`);
            } else {
                toast.error('Gagal mengubah status');
            }
        } catch {
            toast.error('Gagal mengubah status');
        }
    };

    const handleViewDetail = async (service: ServiceProduct) => {
        try {
            const res = await getServiceDetail(service.id);
            if (res.success && res.data) {
                setServiceToView(res.data);
            } else {
                setServiceToView(service);
            }
        } catch {
            setServiceToView(service);
        }
        setIsServiceDetailModalOpen(true);
    };

    // --- File Import / Export ---
    const handleExportServices = async () => {
        try {
            const res = await exportServiceProducts();
            if (res.success) {
                toast.success('Data layanan berhasil diekspor');
            } else {
                toast.error(res.message || 'Gagal mengekspor data layanan');
            }
        } catch {
            toast.error('Terjadi kesalahan saat mengekspor data layanan');
        }
    };

    const handleImportServices = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const res = await importServiceProducts(file);
            if (res.success) {
                toast.success(res.message || 'Layanan berhasil diimpor');
                fetchServices(); // Refresh list
            } else {
                toast.error(res.message || 'Gagal mengimpor layanan');
            }
        } catch {
            toast.error('Terjadi kesalahan saat mengimpor layanan');
        } finally {
            event.target.value = ''; // Reset input
        }
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden h-full">
            {/* Header and Tabs */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0 bg-[#0F0F14]/50">
                <div className="flex flex-col gap-4">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Inventaris Layanan / Jasa</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            Kelola kategori layanan dan produk layanan dengan barang fisik tertaut.
                        </p>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
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
            <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                    {/* --- CATEGORY TAB --- */}
                    {activeTab === 'service-category' && (
                        <motion.div
                            key="category-tab"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0 flex flex-col"
                        >
                            <ServiceCategoriesList
                                categories={categories}
                                searchQuery={searchCategory}
                                onSearchChange={setSearchCategory}
                                onAdd={handleOpenAddCategory}
                                onEdit={handleOpenEditCategory}
                                onDelete={handleDeleteCategory}
                            />
                        </motion.div>
                    )}

                    {/* --- SERVICES TAB --- */}
                    {activeTab === 'produk-service' && (
                        <motion.div
                            key="service-tab"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="absolute inset-0"
                        >
                            <ServicesTable
                                services={services}
                                categories={categories}
                                searchQuery={searchService}
                                onSearchChange={(val) => {
                                    setSearchService(val);
                                    setCurrentPage(1);
                                }}
                                selectedCategoryId={selectedCategoryFilter}
                                onCategoryChange={(val) => {
                                    setSelectedCategoryFilter(val);
                                    setCurrentPage(1);
                                }}
                                onAdd={handleOpenAddService}
                                onEdit={handleOpenEditService}
                                onDelete={handleRequestDelete}
                                onDetail={handleViewDetail}
                                onToggleStatus={handleToggleStatus}
                                onExport={handleExportServices}
                                onImport={handleImportServices}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Modals */}
            <EditCategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory ? { id: selectedCategory.id, name: selectedCategory.name, description: selectedCategory.description } : null}
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

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setServiceToDelete(null); }}
                onConfirm={handleConfirmDelete}
                itemName={serviceToDelete?.name || ''}
            />
        </div>
    );
}
