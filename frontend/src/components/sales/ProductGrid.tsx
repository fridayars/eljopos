import { motion } from 'motion/react'
import { Plus, Wrench } from 'lucide-react'
import type { ProductItem } from '../../services/productService'

interface ProductGridProps {
    products: ProductItem[]
    onAddToCart: (product: ProductItem) => void
}

export function ProductGrid({ products, onAddToCart }: ProductGridProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
            {products.map((product) => (
                <motion.div
                    key={product.id}
                    layoutId={`product-${product.id}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="group bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all flex flex-col"
                >
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-600/10 shrink-0">
                        {product.image ? (
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-500/5 group-hover:scale-110 transition-transform duration-500">
                                <Wrench className="w-12 h-12 text-purple-500/40" />
                            </div>
                        )}
                        <div className="absolute top-2 md:top-3 right-2 md:right-3 px-2 md:px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg border border-cyan-400/30">
                            <span className="text-xs md:text-sm text-cyan-400">
                                {product.item_type === 'layanan' ? 'Jasa' : `${product.stok} left`}
                            </span>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 md:p-4 space-y-2 md:space-y-3 flex-1 flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm md:text-base text-gray-200 mb-1 group-hover:text-blue-400 transition-colors line-clamp-2">
                                {product.name}
                            </h3>
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2">
                            <div className="text-lg md:text-xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent font-medium">
                                Rp {product.price.toLocaleString('id-ID')}
                            </div>
                            <button
                                onClick={() => onAddToCart(product)}
                                className="w-10 h-10 md:w-11 md:h-11 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center shrink-0"
                            >
                                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
