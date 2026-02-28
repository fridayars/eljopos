import { Search, Plus, Edit, Trash2 } from 'lucide-react';
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
        <div className="h-full flex flex-col">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-purple-500/20 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>
                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Kategori Layanan
                    </button>
                </div>
            </div>

            {/* Category List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="grid gap-4">
                    {filteredCategories.length > 0 ? (
                        filteredCategories.map((category) => (
                            <div
                                key={category.id}
                                className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-4 hover:border-purple-500/40 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg text-gray-200">{category.name}</h3>
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs">
                                                Service
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">{category.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => onEdit(category)}
                                            className="p-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 hover:bg-blue-500/30 transition-all"
                                            title="Edit Kategori"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(category.id)}
                                            className="p-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/30 transition-all"
                                            title="Hapus Kategori"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-400">Tidak ada kategori layanan ditemukan</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
