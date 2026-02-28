import { Grid3x3, List } from 'lucide-react'
import { motion } from 'motion/react'

interface ViewToggleProps {
    view: 'grid' | 'list'
    onViewChange: (view: 'grid' | 'list') => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-2 p-1 bg-white/5 border border-purple-500/20 rounded-xl">
            <button
                onClick={() => onViewChange('grid')}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${view === 'grid' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
            >
                {view === 'grid' && (
                    <motion.div
                        layoutId="viewToggle"
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <Grid3x3 className="w-5 h-5 relative z-10" />
            </button>
            <button
                onClick={() => onViewChange('list')}
                className={`relative px-4 py-2 rounded-lg transition-all duration-300 ${view === 'list' ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                    }`}
            >
                {view === 'list' && (
                    <motion.div
                        layoutId="viewToggle"
                        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                )}
                <List className="w-5 h-5 relative z-10" />
            </button>
        </div>
    )
}
