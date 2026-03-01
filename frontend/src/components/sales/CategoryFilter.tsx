import { motion } from 'motion/react'
import { Coffee, Croissant, Sandwich, IceCream, Salad, UtensilsCrossed, Monitor, Cpu } from 'lucide-react'

// Menyesuaikan kategori dengan data mock kita
export type CategoryType = 'all' | 'hardware' | 'accessories' | 'software' | 'services' | 'beverages' | 'pastries' | 'meals' | 'desserts' | 'healthy'

interface Category {
    id: CategoryType
    label: string
    icon: React.ComponentType<{ className?: string }>
}

const categories: Category[] = [
    { id: 'all', label: 'Semua Items', icon: UtensilsCrossed },
    { id: 'hardware', label: 'Hardware', icon: Cpu },
    { id: 'accessories', label: 'Aksesoris', icon: Monitor },
    { id: 'software', label: 'Software', icon: Monitor },
    { id: 'services', label: 'Layanan', icon: UtensilsCrossed },
    // Menambahkan contoh kategori lama dari figma kalau perlu dipakai
    { id: 'beverages', label: 'Minuman', icon: Coffee },
    { id: 'pastries', label: 'Pastries', icon: Croissant },
]

interface CategoryFilterProps {
    selectedCategory: CategoryType
    onCategoryChange: (category: CategoryType) => void
}

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {categories.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id

                return (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id)}
                        className={`
              relative flex items-center gap-2 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl border transition-all duration-300 whitespace-nowrap min-h-[44px]
              ${isActive
                                ? 'border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'border-purple-500/20 text-gray-400 hover:text-gray-300 hover:border-purple-500/40'
                            }
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="categoryGlow"
                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg md:rounded-xl"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <Icon className="w-4 h-4 md:w-5 md:h-5 relative z-10 shrink-0" />
                        <span className="text-xs md:text-sm relative z-10">{category.label}</span>
                        {isActive && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="relative z-10 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
