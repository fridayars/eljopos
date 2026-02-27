import { useState } from 'react';
import { Edit, Download, Upload, ArrowRightLeft, Search, Plus, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from './ProductGrid';
import { EditProductModal } from './EditProductModal';
import { StockTransferModal } from './StockTransferModal';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface ProductsPageProps {
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onImportProducts: (products: Product[]) => void;
}

interface Branch {
  id: string;
  name: string;
}

const mockBranches: Branch[] = [
  { id: '1', name: 'Main Store - Jakarta Pusat' },
  { id: '2', name: 'Branch 1 - Jakarta Selatan' },
  { id: '3', name: 'Branch 2 - Jakarta Utara' },
  { id: '4', name: 'Branch 3 - Tangerang' },
];

export function ProductsPage({ products, onUpdateProduct, onImportProducts }: ProductsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    sku: '',
    price: 0,
    capitalPrice: 0,
    stock: 0,
    category: 'beverages',
    image: '',
  });

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const handleSaveProduct = (updatedProduct: Product) => {
    onUpdateProduct(updatedProduct);
    toast.success('Product updated successfully');
  };

  const handleExport = () => {
    const exportData = products.map((product) => ({
      SKU: product.sku,
      Name: product.name,
      Price: product.price,
      Stock: product.stock,
      Category: product.category,
      Image: product.image,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Generate Excel file
    XLSX.writeFile(workbook, `products_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Products exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const importedProducts: Product[] = jsonData.map((row: any, index: number) => ({
          id: `imported-${Date.now()}-${index}`,
          sku: row.SKU || `SKU-${Date.now()}-${index}`,
          name: row.Name || 'Unnamed Product',
          price: Number(row.Price) || 0,
          stock: Number(row.Stock) || 0,
          category: row.Category || 'beverages',
          image: row.Image || 'https://via.placeholder.com/300',
        }));

        onImportProducts(importedProducts);
        toast.success(`${importedProducts.length} products imported successfully`);
      } catch (error) {
        console.error('Import error:', error);
        toast.error('Failed to import products. Please check the file format.');
      }
    };

    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset input
  };

  const handleTransfer = (data: {
    sourceBranch: string;
    destinationBranch: string;
    items: Array<{
      id: string;
      productId: string;
      productName: string;
      productSku: string;
      productImage: string;
      quantity: number;
    }>;
  }) => {
    const sourceBranchName = mockBranches.find((b) => b.id === data.sourceBranch)?.name;
    const destBranchName = mockBranches.find((b) => b.id === data.destinationBranch)?.name;

    // Build success message
    const itemsList = data.items.map((item) => `${item.quantity}x ${item.productName}`).join(', ');
    
    toast.success(
      `Transferred ${data.items.length} item(s) from ${sourceBranchName} to ${destBranchName}: ${itemsList}`
    );
  };

  const handleAddProduct = () => {
    // Validate required fields
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      toast.error('Please fill all required fields');
      return;
    }

    // Create new product with unique ID
    const productToAdd: Product = {
      id: `product-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku,
      price: newProduct.price || 0,
      capitalPrice: newProduct.capitalPrice || 0,
      stock: newProduct.stock || 0,
      category: (newProduct.category as any) || 'beverages',
      image: newProduct.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop',
    };

    // Add to products list
    onImportProducts([...products, productToAdd]);
    
    // Reset form
    setNewProduct({
      name: '',
      sku: '',
      price: 0,
      capitalPrice: 0,
      stock: 0,
      category: 'beverages',
      image: '',
    });

    // Close modal
    setIsAddModalOpen(false);
    
    toast.success('Product added successfully');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl text-gray-200 mb-2">Products</h1>
              <p className="text-sm md:text-base text-gray-500">Manage your product inventory</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all cursor-pointer">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Import</span>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-purple-500/20 text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm">Export</span>
              </button>

              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                <ArrowRightLeft className="w-5 h-5" />
                <span className="text-sm">Transfer Stock</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm">Add Product</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
            />
          </div>

          {/* Products Table */}
          <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5 border-b border-purple-500/20">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm text-gray-400">Image</th>
                    <th className="px-4 py-4 text-left text-sm text-gray-400">SKU</th>
                    <th className="px-4 py-4 text-left text-sm text-gray-400">Name</th>
                    <th className="px-4 py-4 text-left text-sm text-gray-400">Category</th>
                    <th className="px-4 py-4 text-right text-sm text-gray-400">Price</th>
                    <th className="px-4 py-4 text-right text-sm text-gray-400">Stock</th>
                    <th className="px-4 py-4 text-center text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-500/10">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-400">{product.sku}</td>
                        <td className="px-4 py-4 text-sm text-gray-200">{product.name}</td>
                        <td className="px-4 py-4 text-sm text-gray-400 capitalize">
                          {product.category}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-200 text-right">
                          Rp {product.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-sm text-right">
                          <span
                            className={`${
                              product.stock < 10
                                ? 'text-red-400'
                                : product.stock < 20
                                ? 'text-orange-400'
                                : 'text-green-400'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-lg bg-white/5 border border-purple-500/20 text-blue-400 hover:border-blue-500/50 hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Products</p>
              <p className="text-2xl text-gray-200">{products.length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Low Stock</p>
              <p className="text-2xl text-orange-400">{products.filter((p) => p.stock < 10).length}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Total Value</p>
              <p className="text-2xl text-gray-200">
                Rp {products.reduce((sum, p) => sum + p.price * p.stock, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm text-gray-400 mb-1">Categories</p>
              <p className="text-2xl text-gray-200">
                {new Set(products.map((p) => p.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />

      {/* Stock Transfer Modal */}
      <StockTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        products={products}
        branches={mockBranches}
        onTransfer={handleTransfer}
      />

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
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
              <div className="bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_40px_rgba(139,92,246,0.3)] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-purple-500/20 flex items-center justify-between shrink-0">
                  <div>
                    <h2 className="text-xl md:text-2xl text-gray-200">Add New Product</h2>
                    <p className="text-sm text-gray-500 mt-1">Create a new product item</p>
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(false)}
                    className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-4">
                    {/* Product Name */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
                      <input
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                        placeholder="Enter product name"
                      />
                    </div>

                    {/* SKU and Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">SKU *</label>
                        <input
                          type="text"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          placeholder="PRD-001"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Category *</label>
                        <select
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50"
                        >
                          <option value="beverages">Beverages</option>
                          <option value="pastries">Pastries</option>
                          <option value="meals">Meals</option>
                          <option value="desserts">Desserts</option>
                          <option value="healthy">Healthy</option>
                        </select>
                      </div>
                    </div>

                    {/* Capital Price and Sale Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Capital Price (Rp)</label>
                        <input
                          type="number"
                          value={newProduct.capitalPrice}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, capitalPrice: Number(e.target.value) })
                          }
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Sale Price (Rp) *</label>
                        <input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                          className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    {/* Stock */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Initial Stock</label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                        min="0"
                        placeholder="0"
                      />
                    </div>

                    {/* Image URL */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Image URL (Optional)</label>
                      <input
                        type="text"
                        value={newProduct.image}
                        onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50"
                        placeholder="https://example.com/image.jpg"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use default image
                      </p>
                    </div>

                    {/* Preview */}
                    {newProduct.image && (
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Image Preview</label>
                        <img
                          src={newProduct.image}
                          alt="Preview"
                          className="w-32 h-32 rounded-lg object-cover border border-purple-500/20"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                  >
                    <Save className="w-5 h-5" />
                    Add Product
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