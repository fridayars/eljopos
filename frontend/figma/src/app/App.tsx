import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './components/Dashboard';
import { ProductInventoryPage } from './components/ProductInventoryPage';
import { ServiceInventoryPage } from './components/ServiceInventoryPage';
import { ReportsPage } from './components/ReportsPage';
import { ViewToggle } from './components/ViewToggle';
import { CategoryFilter, CategoryType } from './components/CategoryFilter';
import { ProductGrid, Product } from './components/ProductGrid';
import { ProductList } from './components/ProductList';
import { Cart, CartItem } from './components/Cart';
import { MobileCartButton } from './components/MobileCartButton';
import { PaymentModal } from './components/PaymentModal';
import { SelectCustomerModal } from './components/SelectCustomerModal';
import { AddCustomerModal } from './components/AddCustomerModal';
import { Customer } from './components/CustomerSelector';
import { toast } from 'sonner';
import { Toaster } from './components/ui/sonner';
import { AnimatePresence } from 'motion/react';

// Mock product data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Premium Coffee',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1646535179522-637d4162cb48?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBjdXAlMjBwcm9kdWN0fGVufDF8fHx8MTc3MTY1MTkzNXww&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-001',
    stock: 25,
    category: 'beverages',
  },
  {
    id: '2',
    name: 'Butter Croissant',
    price: 28000,
    image: 'https://images.unsplash.com/photo-1712723247648-64a03ba7c333?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm9pc3NhbnQlMjBwYXN0cnl8ZW58MXx8fHwxNzcxNjUxOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-002',
    stock: 15,
    category: 'pastries',
  },
  {
    id: '3',
    name: 'Club Sandwich',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1721980743593-9ff30ba867b8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYW5kd2ljaCUyMGZvb2R8ZW58MXx8fHwxNzcxNjUxOTM2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-003',
    stock: 12,
    category: 'meals',
  },
  {
    id: '4',
    name: 'Berry Smoothie',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1655992590262-aeadeef445b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGhpZSUyMGRyaW5rfGVufDF8fHx8MTc3MTUyNTQzOXww&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-004',
    stock: 20,
    category: 'beverages',
  },
  {
    id: '5',
    name: 'Chocolate Cake',
    price: 38000,
    image: 'https://images.unsplash.com/photo-1679942262057-d5732f732841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYWtlJTIwZGVzc2VydHxlbnwxfHx8fDE3NzE1NjIwMTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-005',
    stock: 8,
    category: 'desserts',
  },
  {
    id: '6',
    name: 'Beef Burger',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1688246780164-00c01647e78c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJnZXIlMjBmb29kfGVufDF8fHx8MTc3MTY1MTkzN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-006',
    stock: 18,
    category: 'meals',
  },
  {
    id: '7',
    name: 'Fresh Salad Bowl',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxhZCUyMGJvd2x8ZW58MXx8fHwxNzcxNjE5Mjc1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-007',
    stock: 14,
    category: 'healthy',
  },
  {
    id: '8',
    name: 'Green Tea',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1599767431130-41b1c51d9a7b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWElMjBiZXZlcmFnZXxlbnwxfHx8fDE3NzE2NTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    sku: 'PRD-008',
    stock: 30,
    category: 'beverages',
  },
];

// Mock customer data
const initialCustomers: Customer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    phone: '+62 812-3456-7890',
    email: 'sarah.johnson@email.com',
    address: 'Jl. Sudirman No. 123, Jakarta',
  },
  {
    id: '2',
    name: 'Michael Chen',
    phone: '+62 813-9876-5432',
    email: 'michael.chen@email.com',
    address: 'Jl. Gatot Subroto No. 45, Jakarta',
  },
  {
    id: '3',
    name: 'Amanda Rodriguez',
    phone: '+62 821-5555-1234',
    email: 'amanda.r@email.com',
    address: 'Jl. Thamrin No. 78, Jakarta',
  },
  {
    id: '4',
    name: 'David Kim',
    phone: '+62 822-7777-8888',
    email: 'david.kim@email.com',
    address: 'Jl. Kuningan No. 90, Jakarta',
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    phone: '+62 823-4444-9999',
    email: 'lisa.anderson@email.com',
    address: 'Jl. Senayan No. 12, Jakarta',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [discountType, setDiscountType] = useState<'%' | 'Rp'>('%');
  const [discountValue, setDiscountValue] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSelectCustomerModalOpen, setIsSelectCustomerModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(mockProducts);

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  const handleAddToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.info('Item removed from cart');
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountValue(0);
    toast.info('Cart cleared');
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    toast.success(`${customer.name} selected`);
  };

  const handleRemoveCustomer = () => {
    setSelectedCustomer(null);
    toast.info('Customer removed - switched to Walk-in');
  };

  const handleAddCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      id: Date.now().toString(),
      ...customerData,
    };
    setCustomers((prev) => [...prev, newCustomer]);
    setSelectedCustomer(newCustomer);
    toast.success(`${newCustomer.name} added and selected`);
  };

  const handleCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = (data: { date: string; cashbox: string; cashPaid: number }) => {
    console.log('Payment confirmed:', data);
    console.log('Customer:', selectedCustomer?.name || 'Walk-in Customer');
    toast.success('Payment successful!');
    setIsPaymentModalOpen(false);
    setCart([]);
    setDiscountValue(0);
    setSelectedCustomer(null);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((product) => (product.id === updatedProduct.id ? updatedProduct : product))
    );
  };

  const handleImportProducts = (importedProducts: Product[]) => {
    setProducts((prev) => [...prev, ...importedProducts]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = discountType === '%' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  return (
    <div className="h-screen bg-[#0F0F14] flex overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar showSearchAndScanner={activeTab === 'sales'} />
        
        <main className="flex-1 flex overflow-hidden">
          {activeTab === 'dashboard' ? (
            <Dashboard />
          ) : activeTab === 'product-inventory' ? (
            <ProductInventoryPage
              products={products}
              onUpdateProduct={handleUpdateProduct}
              onImportProducts={handleImportProducts}
            />
          ) : activeTab === 'service-inventory' ? (
            <ServiceInventoryPage />
          ) : activeTab === 'sales' ? (
            <>
              {/* Products Section */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* View Toggle */}
                <div className="p-4 md:p-6 border-b border-purple-500/10 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg md:text-xl text-gray-200">Sales</h2>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">Browse and add items to cart</p>
                  </div>
                  <ViewToggle view={view} onViewChange={setView} />
                </div>

                {/* Category Filter */}
                <div className="p-4 md:p-6 border-b border-purple-500/10">
                  <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                </div>

                {/* Product Display */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
                  <AnimatePresence mode="wait">
                    {view === 'grid' ? (
                      <ProductGrid key="grid" products={filteredProducts} onAddToCart={handleAddToCart} />
                    ) : (
                      <ProductList key="list" products={filteredProducts} onAddToCart={handleAddToCart} />
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Cart Section */}
              <Cart
                items={cart}
                selectedCustomer={selectedCustomer}
                discountType={discountType}
                discountValue={discountValue}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onSelectCustomer={() => setIsSelectCustomerModalOpen(true)}
                onRemoveCustomer={handleRemoveCustomer}
                onAddNewCustomer={() => setIsAddCustomerModalOpen(true)}
                onDiscountTypeChange={setDiscountType}
                onDiscountValueChange={setDiscountValue}
                onCheckout={handleCheckout}
                onClear={handleClearCart}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
              />
            </>
          ) : activeTab === 'reports' ? (
            <ReportsPage />
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-xl text-gray-400">Coming Soon</p>
                <p className="text-sm text-gray-600 mt-2">This feature is under development</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Cart Button - Only show on sales page */}
      {activeTab === 'sales' && (
        <MobileCartButton
          itemCount={cart.length}
          onClick={() => setIsCartOpen(true)}
        />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={grandTotal}
        onConfirm={handleConfirmPayment}
      />

      {/* Select Customer Modal */}
      <SelectCustomerModal
        isOpen={isSelectCustomerModalOpen}
        onClose={() => setIsSelectCustomerModalOpen(false)}
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddCustomerModalOpen}
        onClose={() => setIsAddCustomerModalOpen(false)}
        onAddCustomer={handleAddCustomer}
      />

      <Toaster position="top-right" />
    </div>
  );
}