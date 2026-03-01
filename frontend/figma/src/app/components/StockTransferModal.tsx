import { X, ArrowRightLeft, Plus, Minus, Trash2, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { Product } from './ProductGrid';

interface Branch {
  id: string;
  name: string;
}

interface TransferQueueItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productImage: string;
  quantity: number;
}

interface StockTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  branches: Branch[];
  onTransfer: (data: {
    sourceBranch: string;
    destinationBranch: string;
    items: TransferQueueItem[];
  }) => void;
}

export function StockTransferModal({
  isOpen,
  onClose,
  products,
  branches,
  onTransfer,
}: StockTransferModalProps) {
  const [sourceBranch, setSourceBranch] = useState('');
  const [destinationBranch, setDestinationBranch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [transferQueue, setTransferQueue] = useState<TransferQueueItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Filter products by search query
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Get available stock for selected product at source branch
  const getAvailableStock = (): number => {
    if (!selectedProduct || !sourceBranch) return 0;
    const product = products.find((p) => p.id === selectedProduct);
    return product ? product.stock : 0;
  };

  const availableStock = getAvailableStock();

  const resetProductForm = () => {
    setSelectedProduct('');
    setProductSearch('');
    setQuantity(1);
    setShowProductDropdown(false);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProduct(productId);
    const product = products.find((p) => p.id === productId);
    if (product) {
      setProductSearch(`${product.name} - ${product.sku}`);
    }
    setShowProductDropdown(false);
    setQuantity(1);
  };

  const handleAddToQueue = () => {
    if (!selectedProduct || quantity <= 0 || !sourceBranch) {
      return;
    }

    if (quantity > availableStock) {
      alert(`Cannot transfer more than available stock (${availableStock} units)`);
      return;
    }

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;

    const queueItem: TransferQueueItem = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productImage: product.image,
      quantity,
    };

    setTransferQueue((prev) => [...prev, queueItem]);
    resetProductForm();
  };

  const handleRemoveFromQueue = (id: string) => {
    setTransferQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sourceBranch || !destinationBranch || transferQueue.length === 0) {
      return;
    }

    if (sourceBranch === destinationBranch) {
      alert('Source and destination branches must be different');
      return;
    }

    onTransfer({
      sourceBranch,
      destinationBranch,
      items: transferQueue,
    });

    // Reset form
    setSourceBranch('');
    setDestinationBranch('');
    setTransferQueue([]);
    resetProductForm();
    onClose();
  };

  const handleClose = () => {
    setSourceBranch('');
    setDestinationBranch('');
    setTransferQueue([]);
    resetProductForm();
    onClose();
  };

  const incrementQuantity = () => {
    if (availableStock > 0 && quantity < availableStock) {
      setQuantity((prev) => prev + 1);
    }
  };
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl text-gray-200">Stock Transfer</h2>
                    <p className="text-sm text-gray-500 mt-1">Transfer stock between branches</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                <div className="space-y-5">
                  {/* Branch Selection */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Source Branch */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Source Branch</label>
                      <select
                        value={sourceBranch}
                        onChange={(e) => setSourceBranch(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                        required
                      >
                        <option value="">Select source branch</option>
                        {branches.map((branch) => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Destination Branch */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Destination Branch</label>
                      <select
                        value={destinationBranch}
                        onChange={(e) => setDestinationBranch(e.target.value)}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                        required
                      >
                        <option value="">Select destination branch</option>
                        {branches
                          .filter((branch) => branch.id !== sourceBranch)
                          .map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Product</label>
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onFocus={() => setShowProductDropdown(true)}
                        onBlur={() => setTimeout(() => setShowProductDropdown(false), 200)}
                        className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                        placeholder="Search product by name or SKU..."
                        disabled={!sourceBranch}
                      />
                      {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A24] border border-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] max-h-60 overflow-y-auto z-10">
                          {filteredProducts.map((product) => {
                            return (
                              <div
                                key={product.id}
                                className="px-4 py-3 cursor-pointer hover:bg-white/5 border-b border-purple-500/10 last:border-b-0 transition-colors text-gray-200"
                                onClick={() => handleProductSelect(product.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-sm">{product.name}</p>
                                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                  </div>
                                  <p className="text-xs text-blue-400">Stock: {product.stock}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {showProductDropdown && filteredProducts.length === 0 && productSearch && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1A24] border border-purple-500/30 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.3)] p-4 z-10">
                          <p className="text-sm text-gray-500 text-center">No products found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Selected Product Info */}
                  {selectedProductData && (
                    <div className="p-4 bg-white/5 border border-purple-500/20 rounded-xl">
                      <div className="flex items-center gap-4">
                        <img
                          src={selectedProductData.image}
                          alt={selectedProductData.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-gray-200">{selectedProductData.name}</p>
                          <p className="text-sm text-gray-500">SKU: {selectedProductData.sku}</p>
                          <p className="text-sm text-blue-400">Available: {availableStock} units</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Transfer Quantity</label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={decrementQuantity}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className="flex-1 h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-center text-gray-200 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all text-lg"
                        min="1"
                        max={availableStock}
                        required
                      />
                      <button
                        type="button"
                        onClick={incrementQuantity}
                        className="w-12 h-12 rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-blue-500/50 transition-all"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Add to Queue */}
                  <div>
                    <button
                      type="button"
                      onClick={handleAddToQueue}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Add to Queue
                    </button>
                  </div>

                  {/* Transfer Queue */}
                  {transferQueue.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl">
                      <p className="text-sm text-gray-400 mb-2">Transfer Queue</p>
                      <div className="space-y-3">
                        {transferQueue.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-gray-200">
                            <div className="flex items-center gap-4">
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <p className="text-gray-200">{item.productName}</p>
                                <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                                <p className="text-sm text-blue-400">Quantity: {item.quantity} units</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFromQueue(item.id)}
                              className="w-10 h-10 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:border-red-500/50 transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div className="p-6 border-t border-purple-500/20 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
                >
                  <ArrowRightLeft className="w-5 h-5" />
                  Transfer Stock
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}