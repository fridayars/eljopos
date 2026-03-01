import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Package, Briefcase, X, Save, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

type ServiceInventoryTab = 'service-category' | 'produk-service';

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
}

interface ServiceProduct {
  id: string;
  name: string;
  detailService: string;
  sku: string;
  linkedItems: { productId: string; productName: string; quantity: number }[];
  capitalPrice: number;
  price: number;
  categoryId: string;
  categoryName: string;
}

// Mock products for linking
const mockProducts = [
  { id: '1', name: 'Premium Coffee', sku: 'PRD-001' },
  { id: '2', name: 'Butter Croissant', sku: 'PRD-002' },
  { id: '3', name: 'Club Sandwich', sku: 'PRD-003' },
  { id: '4', name: 'Berry Smoothie', sku: 'PRD-004' },
  { id: '5', name: 'Chocolate Cake', sku: 'PRD-005' },
  { id: '6', name: 'Beef Burger', sku: 'PRD-006' },
  { id: '7', name: 'Fresh Salad Bowl', sku: 'PRD-007' },
  { id: '8', name: 'Green Tea', sku: 'PRD-008' },
];

// Mock service categories
const initialServiceCategories: ServiceCategory[] = [
  { id: '1', name: 'Cleaning Service', description: 'Professional cleaning services' },
  { id: '2', name: 'Consulting', description: 'Business and tax consulting services' },
  { id: '3', name: 'Maintenance', description: 'Equipment and facility maintenance' },
  { id: '4', name: 'Training', description: 'Professional training and workshops' },
];

// Mock service products
const initialServiceProducts: ServiceProduct[] = [
  {
    id: '1',
    name: 'Deep Cleaning Service',
    detailService: 'Complete deep cleaning for home or office including floor, windows, and furniture',
    sku: 'SVC-001',
    linkedItems: [
      { productId: '1', productName: 'Premium Coffee', quantity: 2 },
      { productId: '2', productName: 'Butter Croissant', quantity: 2 },
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
  },
  {
    id: '3',
    name: 'Business Consultation',
    detailService: 'Strategic business consultation for growth and development',
    sku: 'SVC-003',
    linkedItems: [
      { productId: '1', productName: 'Premium Coffee', quantity: 5 },
      { productId: '5', productName: 'Chocolate Cake', quantity: 3 },
    ],
    capitalPrice: 1000000,
    price: 1500000,
    categoryId: '2',
    categoryName: 'Consulting',
  },
  {
    id: '4',
    name: 'Tax Consultation',
    detailService: 'Tax planning and advisory services',
    sku: 'SVC-004',
    linkedItems: [],
    capitalPrice: 500000,
    price: 800000,
    categoryId: '2',
    categoryName: 'Consulting',
  },
];

export function ServiceInventoryPage() {
  const [activeTab, setActiveTab] = useState<ServiceInventoryTab>('service-category');
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(initialServiceCategories);
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>(initialServiceProducts);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchService, setSearchService] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modal states
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false);
  const [isDetailServiceOpen, setIsDetailServiceOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceProduct | null>(null);
  const [serviceFormData, setServiceFormData] = useState<ServiceProduct>({
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
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Filter categories by search
  const filteredCategories = serviceCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  // Filter service products by search and category
  const filteredServiceProducts = serviceProducts.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchService.toLowerCase()) ||
      service.sku.toLowerCase().includes(searchService.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'all' || service.categoryId === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter products for search in service modal
  const filteredProductsForService = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const handleDeleteCategory = (id: string) => {
    setServiceCategories((prev) => prev.filter((cat) => cat.id !== id));
    toast.success('Service category deleted');
  };

  const handleDeleteService = (id: string) => {
    setServiceProducts((prev) => prev.filter((service) => service.id !== id));
    toast.success('Service deleted');
  };

  const handleAddService = () => {
    setServiceFormData({
      id: Date.now().toString(),
      name: '',
      detailService: '',
      sku: '',
      linkedItems: [],
      capitalPrice: 0,
      price: 0,
      categoryId: serviceCategories[0]?.id || '',
      categoryName: serviceCategories[0]?.name || '',
    });
    setIsAddServiceOpen(true);
  };

  const handleEditService = (service: ServiceProduct) => {
    setServiceFormData({ ...service });
    setSelectedService(service);
    setIsEditServiceOpen(true);
  };

  const handleViewServiceDetail = (service: ServiceProduct) => {
    setSelectedService(service);
    setIsDetailServiceOpen(true);
  };

  const handleSaveService = () => {
    if (!serviceFormData.name || !serviceFormData.sku || !serviceFormData.categoryId) {
      toast.error('Please fill all required fields');
      return;
    }

    if (isEditServiceOpen) {
      setServiceProducts((prev) =>
        prev.map((service) => (service.id === serviceFormData.id ? serviceFormData : service))
      );
      toast.success('Service updated successfully');
    } else {
      setServiceProducts((prev) => [...prev, serviceFormData]);
      toast.success('Service added successfully');
    }

    setIsAddServiceOpen(false);
    setIsEditServiceOpen(false);
    setServiceFormData({
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
  };

  const handleAddProductToService = (product: typeof mockProducts[0]) => {
    const existingItem = serviceFormData.linkedItems.find((item) => item.productId === product.id);
    if (existingItem) {
      toast.info('Product already linked to this service');
      return;
    }

    setServiceFormData({
      ...serviceFormData,
      linkedItems: [
        ...serviceFormData.linkedItems,
        { productId: product.id, productName: product.name, quantity: 1 },
      ],
    });
    toast.success(`${product.name} linked to service`);
  };

  const handleUpdateServiceItemQuantity = (productId: string, quantity: number) => {
    setServiceFormData({
      ...serviceFormData,
      linkedItems: serviceFormData.linkedItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ),
    });
  };

  const handleRemoveProductFromService = (productId: string) => {
    setServiceFormData({
      ...serviceFormData,
      linkedItems: serviceFormData.linkedItems.filter((item) => item.productId !== productId),
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = serviceCategories.find((cat) => cat.id === categoryId);
    setServiceFormData({
      ...serviceFormData,
      categoryId,
      categoryName: category?.name || '',
    });
  };

  const handleExportServiceProducts = () => {
    const worksheet = XLSX.utils.json_to_sheet(serviceProducts);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Service Products');
    XLSX.writeFile(workbook, 'service_products.xlsx');
    toast.success('Service products exported successfully');
  };

  const handleImportServiceProducts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json<ServiceProduct>(worksheet);

      setServiceProducts(json);
      toast.success('Service products imported successfully');
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg md:text-xl text-gray-200">Service Inventory</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Manage service categories and service products
            </p>
          </div>

          {/* Service Inventory Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab('service-category')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeTab === 'service-category'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Service Category
            </button>
            <button
              onClick={() => setActiveTab('produk-service')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeTab === 'produk-service'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Produk Service
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Service Category Tab */}
        {activeTab === 'service-category' && (
          <div className="h-full flex flex-col">
            {/* Search and Add Button */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search service categories..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button
                  onClick={() => toast.info('Add service category modal coming soon')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add New Category
                </button>
              </div>
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid gap-4">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-200">{category.name}</h3>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                            Service
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toast.info('Edit service category modal coming soon')}
                          className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Produk Service Tab */}
        {activeTab === 'produk-service' && (
          <div className="h-full flex flex-col">
            {/* Category Filter, Search and Add Button */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
              <div className="flex flex-col gap-4">
                {/* Category Filter */}
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Filter by Category</label>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full md:w-64 px-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 focus:outline-none focus:border-blue-500/50"
                  >
                    <option value="all">All Categories</option>
                    {serviceCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search and Add */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search services..."
                      value={searchService}
                      onChange={(e) => setSearchService(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm">Import</span>
                      <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleImportServiceProducts}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={handleExportServiceProducts}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-sm">Export</span>
                    </button>

                    <button
                      onClick={handleAddService}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      <span className="text-sm">Add Service</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Service List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="grid gap-4">
                {filteredServiceProducts.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-200">{service.name}</h3>
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                            {service.categoryName}
                          </span>
                          <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                            {service.sku}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-3">{service.detailService}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div>
                            <p className="text-xs text-gray-500">Capital Price</p>
                            <p className="text-sm text-gray-400">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(service.capitalPrice)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Sale Price</p>
                            <p className="text-lg text-cyan-400">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                              }).format(service.price)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Linked Items</p>
                            <p className="text-sm text-gray-300">{service.linkedItems.length} items</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleViewServiceDetail(service)}
                          className="px-3 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-all text-sm"
                        >
                          Detail
                        </button>
                        <button
                          onClick={() => handleEditService(service)}
                          className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteService(service.id)}
                          className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Service Modal */}
      <AnimatePresence>
        {(isAddServiceOpen || isEditServiceOpen) && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddServiceOpen(false);
                setIsEditServiceOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl md:text-2xl text-gray-200">
                      {isEditServiceOpen ? 'Edit Service' : 'Add New Service'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {isEditServiceOpen ? 'Update service information' : 'Create a new service product'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsAddServiceOpen(false);
                      setIsEditServiceOpen(false);
                    }}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    {/* Service Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Service Name *</label>
                        <input
                          type="text"
                          value={serviceFormData.name}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          placeholder="Enter service name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">SKU *</label>
                        <input
                          type="text"
                          value={serviceFormData.sku}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, sku: e.target.value })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          placeholder="SVC-001"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Category *</label>
                        <select
                          value={serviceFormData.categoryId}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50"
                        >
                          {serviceCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2">Detail Service</label>
                        <textarea
                          value={serviceFormData.detailService}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, detailService: e.target.value })}
                          className="w-full h-24 bg-white/5 border border-purple-500/20 rounded-xl px-4 py-3 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 resize-none"
                          placeholder="Enter service description and details..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Capital Price (Rp) *</label>
                        <input
                          type="number"
                          value={serviceFormData.capitalPrice}
                          onChange={(e) =>
                            setServiceFormData({ ...serviceFormData, capitalPrice: Number(e.target.value) })
                          }
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Sale Price (Rp) *</label>
                        <input
                          type="number"
                          value={serviceFormData.price}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, price: Number(e.target.value) })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Linked Items */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-3">Link Product Items (Optional)</label>
                      
                      {/* Selected Items */}
                      {serviceFormData.linkedItems.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {serviceFormData.linkedItems.map((item) => (
                            <div
                              key={item.productId}
                              className="flex items-center gap-3 bg-white/5 border border-purple-500/20 rounded-lg p-3"
                            >
                              <div className="flex-1">
                                <p className="text-sm text-gray-200">{item.productName}</p>
                              </div>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateServiceItemQuantity(item.productId, Number(e.target.value))
                                }
                                className="w-20 h-8 bg-white/5 border border-purple-500/20 rounded-lg px-2 text-gray-200 text-center focus:outline-none focus:border-blue-500/50"
                                min="1"
                              />
                              <button
                                onClick={() => handleRemoveProductFromService(item.productId)}
                                className="p-1.5 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Product Search */}
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          placeholder="Search products to link..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                      </div>

                      {/* Product List */}
                      {productSearchQuery && (
                        <div className="max-h-64 overflow-y-auto bg-white/5 border border-purple-500/20 rounded-xl">
                          {filteredProductsForService.map((product) => (
                            <button
                              key={product.id}
                              onClick={() => handleAddProductToService(product)}
                              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-all border-b border-purple-500/10 last:border-0 text-left"
                            >
                              <div>
                                <p className="text-sm text-gray-200">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.sku}</p>
                              </div>
                              <Plus className="w-4 h-4 text-cyan-400" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddServiceOpen(false);
                      setIsEditServiceOpen(false);
                    }}
                    className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveService}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {isEditServiceOpen ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Service Detail Modal */}
      <AnimatePresence>
        {isDetailServiceOpen && selectedService && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailServiceOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl md:text-2xl text-gray-200">{selectedService.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                        {selectedService.categoryName}
                      </span>
                      <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                        {selectedService.sku}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsDetailServiceOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                  {/* Detail Service */}
                  <div className="mb-6">
                    <h3 className="text-sm text-gray-400 mb-2">Service Details</h3>
                    <p className="text-sm text-gray-300">{selectedService.detailService || 'No description provided'}</p>
                  </div>

                  {/* Price Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Capital Price</p>
                      <p className="text-lg text-gray-300">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(selectedService.capitalPrice)}
                      </p>
                    </div>
                    <div className="bg-white/5 border border-purple-500/20 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">Sale Price</p>
                      <p className="text-lg text-cyan-400">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0,
                        }).format(selectedService.price)}
                      </p>
                    </div>
                  </div>

                  {/* Linked Items */}
                  <div>
                    <h3 className="text-sm text-gray-400 mb-3">
                      Linked Product Items ({selectedService.linkedItems.length})
                    </h3>
                    {selectedService.linkedItems.length > 0 ? (
                      <div className="space-y-2">
                        {selectedService.linkedItems.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white/5 border border-purple-500/20 rounded-lg p-3"
                          >
                            <p className="text-sm text-gray-200">{item.productName}</p>
                            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-xs">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No products linked to this service</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end">
                  <button
                    onClick={() => setIsDetailServiceOpen(false)}
                    className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setIsDetailServiceOpen(false);
                      handleEditService(selectedService);
                    }}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                  >
                    <Edit className="w-5 h-5" />
                    Edit Service
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}