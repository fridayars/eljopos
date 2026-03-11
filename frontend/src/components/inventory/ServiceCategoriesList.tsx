import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import type { ServiceCategory } from '../../services/productService';

interface ServiceCategoriesListProps {
    categories: ServiceCategory[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onAdd: () => void;
    onEdit: (category: ServiceCategory) => void;
    onDelete: (id: string) => void;
}

export function ServiceCategoriesList({
    categories,
    searchQuery,
    onSearchChange,
    onAdd,
    onEdit,
    onDelete,
}: ServiceCategoriesListProps) {
    const filteredCategories = categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="absolute inset-0 flex flex-col">
            {/* Search and Add Button */}
            <div className="p-4 md:p-6 border-b border-purple-500/10 shrink-0">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Cari kategori layanan..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all cursor-pointer"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Kategori
                    </button>
                </div>
            </div>

            {/* Category Grid */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredCategories.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500">
                            Tidak ada kategori ditemukan.
                        </div>
                    ) : (
                        filteredCategories.map((category) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={category.id}
                                className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-5 hover:border-blue-500/40 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-medium text-gray-200">
                                                {category.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500 line-clamp-2">
                                            {category.description || 'Tidak ada deskripsi spesifik.'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-all cursor-pointer"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 hover:bg-red-500/20 transition-all cursor-pointer"
                                            title="Hapus"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
