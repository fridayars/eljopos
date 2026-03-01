import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Package, Box } from 'lucide-react';
import { ProductsPage, Product } from './ProductsPage';
import { toast } from 'sonner';

type ProductInventoryTab = 'product-category' | 'produk-barang';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

interface ProductInventoryPageProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onImportProducts: (products: Product[]) => void;
}

// Mock product categories
const initialProductCategories: ProductCategory[] = [
  { id: '1', name: 'Beverages', description: 'Hot and cold drinks' },
  { id: '2', name: 'Pastries', description: 'Baked goods and pastries' },
  { id: '3', name: 'Meals', description: 'Main course dishes' },
  { id: '4', name: 'Desserts', description: 'Sweet treats and desserts' },
  { id: '5', name: 'Healthy', description: 'Healthy food options' },
];

export function ProductInventoryPage({ products, onUpdateProduct, onImportProducts }: ProductInventoryPageProps) {
  const [activeTab, setActiveTab] = useState<ProductInventoryTab>('product-category');
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(initialProductCategories);
  const [searchCategory, setSearchCategory] = useState('');

  // Filter categories by search
  const filteredCategories = productCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchCategory.toLowerCase())
  );

  const handleDeleteCategory = (id: string) => {
    setProductCategories((prev) => prev.filter((cat) => cat.id !== id));
    toast.success('Product category deleted');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg md:text-xl text-gray-200">Product Inventory</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Manage product categories and goods
            </p>
          </div>

          {/* Product Inventory Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab('product-category')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeTab === 'product-category'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <Package className="w-4 h-4" />
              Product Category
            </button>
            <button
              onClick={() => setActiveTab('produk-barang')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm whitespace-nowrap transition-all ${
                activeTab === 'produk-barang'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50'
              }`}
            >
              <Box className="w-4 h-4" />
              Produk Barang
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Product Category Tab */}
        {activeTab === 'product-category' && (
          <div className="h-full flex flex-col">
            {/* Search and Add Button */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search product categories..."
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
                <button
                  onClick={() => toast.info('Add product category modal coming soon')}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
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
                    className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg text-gray-200">{category.name}</h3>
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs">
                            Product
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{category.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => toast.info('Edit product category modal coming soon')}
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

        {/* Produk Barang Tab */}
        {activeTab === 'produk-barang' && (
          <div className="h-full">
            <ProductsPage
              products={products}
              onUpdateProduct={onUpdateProduct}
              onImportProducts={onImportProducts}
            />
          </div>
        )}
      </div>
    </div>
  );
}