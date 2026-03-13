import { useState, useEffect } from 'react'
import { AnimatePresence } from 'motion/react'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

import { ViewToggle } from '../components/sales/ViewToggle'
import { ProductGrid } from '../components/sales/ProductGrid'
import { ProductList } from '../components/sales/ProductList'
import { Cart, type CartItem } from '../components/sales/Cart'
import { MobileCartButton } from '../components/sales/MobileCartButton'
import { PaymentModal } from '../components/sales/PaymentModal'
import { SelectCustomerModal } from '../components/sales/SelectCustomerModal'
import { AddCustomerModal } from '../components/sales/AddCustomerModal'
import { BarcodeScannerModal } from '../components/sales/BarcodeScannerModal'
import { TransactionSuccessModal } from '../components/sales/TransactionSuccessModal'
import { Search, Loader2, ScanLine, ChevronDown } from 'lucide-react'
import { useRef } from 'react'

import { getProducts, getServiceProducts, getCategories, getServiceCategories, type ProductItem, type Category, type ServiceCategory } from '../services/productService'
import { createCustomer, type Customer } from '../services/customerService'
import { createTransaction, type CreateTransactionPayload, type TransactionItemPayload } from '../services/transactionService'

// Define basic user data structure from login
interface UserData {
    store_id: string
}

function CategoryFilterSelect({
    value,
    categories,
    onChange
}: {
    value: string;
    categories: { id: string, name: string }[];
    onChange: (val: string) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedCategory = value === 'all'
        ? { id: 'all', name: 'Semua Kategori' }
        : categories.find(c => c.id === value);

    const allOptions = [
        { id: 'all', name: 'Semua Kategori' },
        ...categories
    ];

    return (
        <div className="relative w-full sm:w-48 md:w-56" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-10 bg-white/5 border rounded-xl px-4 text-sm flex items-center justify-between cursor-pointer focus:outline-none transition-all ${isOpen ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
            >
                <span className="text-gray-200 truncate pr-2">{selectedCategory?.name || 'Semua Kategori'}</span>
                <span className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                </span>
            </div>

            {isOpen && (
                <div
                    className="absolute left-0 right-0 top-[calc(100%+4px)] py-1 rounded-xl z-[60] overflow-hidden shadow-2xl animate-[fadeIn_0.15s_ease-out] bg-[#1a1625] border border-purple-500/20"
                >
                    <ul className="max-h-60 overflow-y-auto">
                        {allOptions.map((cat) => (
                            <li
                                key={cat.id}
                                className={`px-4 py-3 text-sm cursor-pointer transition-colors ${value === cat.id ? 'text-purple-400 bg-purple-500/10' : 'text-gray-300 hover:bg-white/5'
                                    }`}
                                onClick={() => {
                                    onChange(cat.id);
                                    setIsOpen(false);
                                }}
                            >
                                {cat.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function SalesPage() {
    const [view, setView] = useState<'grid' | 'list'>(() => window.innerWidth < 1024 ? 'list' : 'grid')
    const [activeTab, setActiveTab] = useState<'produk' | 'layanan'>('layanan')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState('all')
    const [cart, setCart] = useState<CartItem[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
    const [discountType, setDiscountType] = useState<'%' | 'Rp'>('%')
    const [discountValue, setDiscountValue] = useState(0)

    // Modals
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [isSelectCustomerModalOpen, setIsSelectCustomerModalOpen] = useState(false)
    const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false)
    const [isScannerOpen, setIsScannerOpen] = useState(false)
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
    const [successTransactionInfo, setSuccessTransactionInfo] = useState<{ id: string, invoiceNumber: string, totalAmount: number, customerName?: string, customerPhone?: string } | null>(null)

    // Data State
    const [displayItems, setDisplayItems] = useState<ProductItem[]>([])
    const [productCategories, setProductCategories] = useState<Category[]>([])
    const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])

    const [isLoading, setIsLoading] = useState(false)
    const [isTransacting, setIsTransacting] = useState(false)

    // Pagination
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const ITEMS_PER_PAGE = 20

    // Auth Info for transaction payload — initialized synchronously to avoid race condition
    const [storeId] = useState(() => {
        try {
            const userStr = localStorage.getItem('user')
            if (userStr) {
                const userObj: UserData = JSON.parse(userStr)
                return userObj.store_id || ''
            }
        } catch (e) {
            console.error(e)
        }
        return ''
    })

    // Fetch Items with Pagination and Search
    const fetchItems = async (targetPage: number, reset: boolean = false) => {
        if (isLoading) return
        setIsLoading(true)

        try {
            if (activeTab === 'produk') {
                const response = await getProducts({
                    page: targetPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchQuery,
                    store_id: storeId || undefined,
                    status: 'true',
                    kategori_id: selectedCategoryId !== 'all' ? selectedCategoryId : undefined
                })

                if (response.success) {
                    const newItems = response.data.items.map(item => ({
                        ...item,
                        item_type: 'product' as const,
                        image: item.image_url || item.image || ''
                    }))
                    setDisplayItems(prev => reset ? newItems : [...prev, ...newItems])
                    setHasMore(response.data.pagination.has_next)
                    setPage(targetPage)
                }
            } else {
                const response = await getServiceProducts({
                    page: targetPage,
                    limit: ITEMS_PER_PAGE,
                    search: searchQuery,
                    store_id: storeId || undefined,
                    status: 'true',
                    kategori_layanan_id: selectedCategoryId !== 'all' ? selectedCategoryId : undefined
                })

                if (response.success) {
                    const mappedServices: ProductItem[] = response.data.items.map(s => ({
                        id: s.id,
                        name: s.name,
                        sku: "",
                        price: s.price,
                        cost_price: s.capitalPrice,
                        stock: s.count_product,
                        kategori_produk_id: s.categoryId,
                        kategori_name: s.categoryName,
                        image: '',
                        image_url: '',
                        item_type: 'layanan'
                    }))
                    setDisplayItems(prev => reset ? mappedServices : [...prev, ...mappedServices])
                    setHasMore(response.data.pagination.has_next)
                    setPage(targetPage)
                }
            }
        } catch (error) {
            console.error('Error fetching items:', error)
            toast.error('Gagal memuat data')
        } finally {
            setIsLoading(false)
        }
    }

    // Effects for initial data
    useEffect(() => {
        const fetchCategoriesData = async () => {
            try {
                const [pCats, sCats] = await Promise.all([
                    getCategories(),
                    getServiceCategories()
                ])
                if (pCats.success) setProductCategories(pCats.data)
                if (sCats.success) setServiceCategories(sCats.data)
            } catch (error) {
                console.error('Error fetching categories:', error)
            }
        }
        fetchCategoriesData()
    }, [])

    // Effect for activeTab, searchQuery, or selectedCategoryId changes
    useEffect(() => {
        setDisplayItems([])
        fetchItems(1, true)
    }, [activeTab, searchQuery, selectedCategoryId, storeId])

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    fetchItems(page + 1)
                }
            },
            { threshold: 0.1 }
        )

        const loadMoreTrigger = document.getElementById('load-more-trigger')
        if (loadMoreTrigger) observer.observe(loadMoreTrigger)

        return () => observer.disconnect()
    }, [hasMore, isLoading, page])

    const handleTabChange = (tab: 'produk' | 'layanan') => {
        setActiveTab(tab)
        setSearchQuery('')
        setSelectedCategoryId('all')
    }

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
                    item_type: (product.item_type || 'product') as 'product' | 'layanan',
                    kategori_name: product.kategori_name,
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
            // Set as selected customer with id and name from API response
            setSelectedCustomer({
                id: response.data.id,
                name: response.data.name,
                phone: customerData.phone,
                email: customerData.email,
                address: customerData.address,
            })
            toast.success(`${response.data.name} berhasil ditambahkan dan dipilih`)
        } else {
            toast.error(response.message || 'Gagal menambahkan customer')
            throw new Error(response.message)
        }
    }

    // Checkout & Payment
    const handleCheckout = () => {
        setIsPaymentModalOpen(true)
    }

    const handleConfirmPayment = async (data: { date: string; cashbox: string; cashPaid: number; payments: { method: string; amount: number }[] }) => {
        setIsTransacting(true)

        const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const discountAmount = discountType === '%' ? (subtotal * discountValue) / 100 : discountValue
        const grandTotal = Math.max(0, subtotal - discountAmount)

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
            customer_id: selectedCustomer?.id,
            subtotal,
            discount_type: discountValue > 0 ? (discountType === '%' ? 'percentage' : 'amount') : undefined,
            discount: discountValue > 0 ? discountValue : undefined,
            total_amount: grandTotal,
            payment_method: data.payments.map(p => ({ method: p.method, amount: p.amount })),
            items: transactionItems,
        }

        const response = await createTransaction(payload)

        setIsTransacting(false)

        if (response.success && response.data) {
            toast.success(`Transaksi berhasil! Invoice: ${response.data.invoice_number}`)
            setIsPaymentModalOpen(false)
            setCart([])
            setDiscountValue(0)
            setSelectedCustomer(null)

            setSuccessTransactionInfo({
                id: response.data.transaksi_id,
                invoiceNumber: response.data.invoice_number,
                totalAmount: grandTotal,
                customerName: selectedCustomer?.name,
                customerPhone: selectedCustomer?.phone
            })
            setIsSuccessModalOpen(true)
        } else {
            toast.error(response.message || 'Gagal memproses transaksi')
        }
    }

    const handleNewTransaction = () => {
        setIsSuccessModalOpen(false)
        setActiveTab('produk')
        setIsCartOpen(false)
        // Reset view mode to default based on screen size
        setView(window.innerWidth < 1024 ? 'list' : 'grid')
    }

    return (
        <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="p-4 md:p-6 border-b border-purple-500/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg md:text-xl text-gray-200">Kasir / Penjualan</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">Pilih dan tambahkan produk/layanan ke keranjang</p>
                    </div>
                    <ViewToggle view={view} onViewChange={setView} />
                </div>

                <div className="p-4 md:p-6 border-b border-purple-500/10 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="flex p-1 bg-white/5 border border-purple-500/20 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => handleTabChange('produk')}
                                className={`flex-1 sm:w-32 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'produk'
                                    ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Produk
                            </button>
                            <button
                                onClick={() => handleTabChange('layanan')}
                                className={`flex-1 sm:w-32 py-2 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === 'layanan'
                                    ? 'bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                    : 'text-gray-400 hover:text-gray-200'
                                    }`}
                            >
                                Layanan
                            </button>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
                            <CategoryFilterSelect
                                value={selectedCategoryId}
                                categories={activeTab === 'produk' ? productCategories : serviceCategories}
                                onChange={setSelectedCategoryId}
                            />

                            <div className="relative w-full sm:w-64 md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-50" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={`Cari ${activeTab === 'produk' ? 'produk...' : 'layanan...'}`}
                                    className="w-full pl-10 pr-10 py-2 bg-white/5 border border-purple-500/20 rounded-xl text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-all h-10"
                                />
                                <button
                                    onClick={() => setIsScannerOpen(true)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-500 hover:text-purple-400 hover:bg-purple-500/10 transition-all"
                                    title="Scan Barcode"
                                >
                                    <ScanLine className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
                    {displayItems.length === 0 && !isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-2">
                            <Search className="w-12 h-12 opacity-20" />
                            <p>Tidak ada {activeTab} yang ditemukan.</p>
                        </div>
                    ) : (
                        <>
                            <AnimatePresence mode="wait">
                                {view === 'grid' ? (
                                    <ProductGrid key="grid" products={displayItems} onAddToCart={handleAddToCart} />
                                ) : (
                                    <ProductList key="list" products={displayItems} onAddToCart={handleAddToCart} />
                                )}
                            </AnimatePresence>

                            <div id="load-more-trigger" className="h-20 flex items-center justify-center">
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="text-sm">Memuat lebih banyak...</span>
                                    </div>
                                )}
                                {!hasMore && displayItems.length > 0 && (
                                    <p className="text-xs text-gray-600 italic">Semua data telah dimuat</p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

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

            <MobileCartButton itemCount={cart.length} onClick={() => setIsCartOpen(true)} />

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
                onSelectCustomer={handleSelectCustomer}
            />

            <BarcodeScannerModal
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                onScanSuccess={(decodedText) => {
                    setSearchQuery(decodedText)
                    toast.success(`Barcode terdeteksi: ${decodedText}`)
                }}
            />

            <AddCustomerModal
                isOpen={isAddCustomerModalOpen}
                onClose={() => setIsAddCustomerModalOpen(false)}
                onAddCustomer={handleAddCustomer}
            />

            <TransactionSuccessModal
                isOpen={isSuccessModalOpen}
                onClose={handleNewTransaction}
                transactionId={successTransactionInfo?.id || ''}
                invoiceNumber={successTransactionInfo?.invoiceNumber || ''}
                totalAmount={successTransactionInfo?.totalAmount || 0}
                customerName={successTransactionInfo?.customerName}
                customerPhone={successTransactionInfo?.customerPhone}
            />

            <Toaster position="top-right" theme="dark" />
        </div>
    )
}

export default SalesPage
