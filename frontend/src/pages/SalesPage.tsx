import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

import { ViewToggle } from '../components/sales/ViewToggle'
import { CategoryFilter, type CategoryType } from '../components/sales/CategoryFilter'
import { ProductGrid } from '../components/sales/ProductGrid'
import { ProductList } from '../components/sales/ProductList'
import { Cart, type CartItem } from '../components/sales/Cart'
import { MobileCartButton } from '../components/sales/MobileCartButton'
import { PaymentModal } from '../components/sales/PaymentModal'
import { SelectCustomerModal } from '../components/sales/SelectCustomerModal'
import { AddCustomerModal } from '../components/sales/AddCustomerModal'

import { getProducts, type ProductItem } from '../services/productService'
import { getCustomers, createCustomer, type Customer } from '../services/customerService'
import { createTransaction, type CreateTransactionPayload, type TransactionItemPayload } from '../services/transactionService'
// Define basic user data structure from login
interface UserData {
    store_id: string
}

export function SalesPage() {
    const [view, setView] = useState<'grid' | 'list'>('grid')
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [discountType, setDiscountType] = useState<'%' | 'Rp'>('%')
    const [discountValue, setDiscountValue] = useState(0)

    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isSelectCustomerModalOpen, setIsSelectCustomerModalOpen] = useState(false)
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)

    // Data State
    const [products, setProducts] = useState<ProductItem[]>([])
    const [customers, setCustomers] = useState<Customer[]>([])
    const [isLoadingProducts, setIsLoadingProducts] = useState(true)
    const [isTransacting, setIsTransacting] = useState(false)

    // Auth Info for transaction payload
    const [storeId, setStoreId] = useState('')

    // Fetch Initial Data
    useEffect(() => {
        const loadInitialData = async () => {
            const [productsRes, customersRes] = await Promise.all([getProducts(), getCustomers()])

            if (productsRes.success) {
                setProducts(productsRes.data.items)
            } else {
                toast.error(productsRes.message || 'Gagal mengambil produk')
            }

            if (customersRes.success) {
                setCustomers(customersRes.data)
            }

            setIsLoadingProducts(false)
        }

        loadInitialData()

        // Get store ID from localStorage
        const userStr = localStorage.getItem('user')
        if (userStr) {
            try {
                const userObj: UserData = JSON.parse(userStr)
                setStoreId(userObj.store_id)
            } catch (e) {
                console.error(e)
            }
        }
    }, [])

    // Filter products by category
    const filteredProducts =
        selectedCategory === 'all' ? products : products.filter((product) => product.category_name === selectedCategory)

    // Cart Actions
    const handleAddToCart = (product: ProductItem) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item.id === product.id)
            if (existingItem) {
                return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
            }
            return [
                ...prevCart,
                {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    item_type: product.item_type,
                    kategori_name: product.category_name,
                },
            ]
        })
        toast.success(`${product.name} ditambahkan ke keranjang`)
    }

    const handleUpdateQuantity = (id: string, quantity: number) => {
        setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }

    const handleRemoveItem = (id: string) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id))
        toast.info('Item dihapus dari keranjang')
    }

    const handleClearCart = () => {
        setCart([])
        setDiscountValue(0)
        toast.info('Keranjang dibersihkan')
    }

    // Customer Actions
    const handleSelectCustomer = (customer: Customer) => {
        setSelectedCustomer(customer)
        toast.success(`${customer.name} dipilih sebagai pelanggan`)
    }

    const handleRemoveCustomer = () => {
        setSelectedCustomer(null)
        toast.info('Customer dihapus - transaksi akan dicatat sebagai Walk-in')
    }

    const handleAddCustomer = async (customerData: Omit<Customer, 'id'>) => {
        const response = await createCustomer(customerData)
        if (response.success && response.data) {
            setCustomers((prev) => [...prev, response.data!])
            setSelectedCustomer(response.data)
            toast.success(`${response.data.name} berhasil ditambahkan dan dipilih`)
        } else {
            toast.error(response.message || 'Gagal menambahkan customer')
        }
    }

    // Checkout & Payment
    const handleCheckout = () => {
        setIsPaymentModalOpen(true)
    }

    const handleConfirmPayment = async (data: { date: string; cashbox: string; cashPaid: number }) => {
        setIsTransacting(true)

        // Hitung Grand Total
        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const discountAmount = discountType === '%' ? (subtotal * discountValue) / 100 : discountValue
        const grandTotal = Math.max(0, subtotal - discountAmount)

        // Siapkan Payload Transaksi
        const transactionItems: TransactionItemPayload[] = cart.map((item) => ({
            item_type: item.item_type,
            item_id: item.id,
            item_name: item.name,
            kategori_name: item.kategori_name,
            price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
        }))

        const payload: CreateTransactionPayload = {
            store_id: storeId,
            customer_id: selectedCustomer?.id, // undefined kalau walk-in
            total_amount: grandTotal,
            payment_method: 'CASH', // Saat ini statis dari props (TODO: ambil dari modal)
            items: transactionItems,
        }

        const response = await createTransaction(payload)

        setIsTransacting(false)

        if (response.success) {
            toast.success(`Transaksi berhasil! Invoice: ${response.data?.invoice_number}`)
            setIsPaymentModalOpen(false)
            setCart([])
            setDiscountValue(0)
            setSelectedCustomer(null)
        } else {
            toast.error(response.message || 'Gagal memproses transaksi')
        }
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Content (Products) */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* View Toggle */}
                <div className="p-4 md:p-6 border-b border-purple-500/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Kasir / Penjualan</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Pilih dan tambahkan produk ke keranjang</p>
                    </div>
                    <ViewToggle view={view} onViewChange={setView} />
                </div>

                {/* Category Filter */}
                <div className="p-4 md:p-6 border-b border-purple-500/10">
                    <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                </div>

                {/* Product Display */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
                    {isLoadingProducts ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400">Memuat katalog...</p>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <p>Tidak ada produk untuk kategori ini.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {view === 'grid' ? (
                                <ProductGrid key="grid" products={filteredProducts} onAddToCart={handleAddToCart} />
                            ) : (
                                <ProductList key="list" products={filteredProducts} onAddToCart={handleAddToCart} />
                            )}
                        </AnimatePresence>
                    )}
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
                isLoading={isTransacting}
            />

            {/* Mobile Cart Button */}
            <MobileCartButton itemCount={cart.length} onClick={() => setIsCartOpen(true)} />

            {/* Modals */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                grandTotal={Math.max(
                    0,
                    cart.reduce((sum, item) => sum + item.price * item.quantity, 0) -
                    (discountType === '%'
                        ? (cart.reduce((sum, item) => sum + item.price * item.quantity, 0) * discountValue) / 100
                        : discountValue),
                )}
                onConfirm={handleConfirmPayment}
            />

            <SelectCustomerModal
                isOpen={isSelectCustomerModalOpen}
                onClose={() => setIsSelectCustomerModalOpen(false)}
                customers={customers}
                onSelectCustomer={handleSelectCustomer}
            />

            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onAddCustomer={handleAddCustomer}
            />

            <Toaster position="top-right" theme="dark" />
        </div>
    )
}

export default SalesPage
