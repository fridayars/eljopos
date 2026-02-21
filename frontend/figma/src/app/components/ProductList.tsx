import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { Product } from './ProductGrid';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export function ProductList({ products, onAddToCart }: ProductListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2 md:space-y-3"
    >
      {products.map((product) => (
        <motion.div
          key={product.id}
          layout
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="group bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl md:rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] transition-all"
        >
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
            {/* Product Image */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/10 to-purple-600/10 shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm md:text-base text-gray-200 mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                {product.name}
              </h3>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-gray-500">
                <span>SKU: {product.sku}</span>
                <span className="text-cyan-400">{product.stock} in stock</span>
              </div>
            </div>

            {/* Price & Action */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">
              <div className="text-base md:text-lg bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
                Rp {product.price.toLocaleString()}
              </div>
              <button
                onClick={() => onAddToCart(product)}
                className="w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center justify-center"
              >
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}