import { Search, ScanBarcode, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export function TopBar() {
  const [searchExpanded, setSearchExpanded] = useState(false);

  return (
    <header className="h-16 md:h-20 bg-white/5 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-4 md:px-8 shrink-0">
      {/* Logo - Mobile Only */}
      <div className="lg:hidden flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
          <span className="text-white text-lg">P</span>
        </div>
        <div className="hidden sm:block">
          <h1 className="text-base text-gray-200">POS System</h1>
          <p className="text-xs text-gray-500">Modern Retail</p>
        </div>
      </div>

      {/* Search Bar - Desktop Always Visible */}
      <div className="hidden md:flex flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search products, SKU, barcode..."
            className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
          />
        </div>
      </div>

      {/* Spacer for mobile */}
      <div className="flex-1 md:hidden" />

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setSearchExpanded(!searchExpanded)}
          className="md:hidden w-11 h-11 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Barcode Scanner */}
        <button className="w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
          <ScanBarcode className="w-5 h-5" />
        </button>

        {/* Notifications - Now visible on mobile */}
        <button className="relative w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </button>

        {/* User Profile - Compact on mobile, full on desktop */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-purple-500/20">
          <div className="hidden lg:block text-right">
            <p className="text-sm text-gray-200">Admin User</p>
            <p className="text-xs text-gray-500">Cashier</p>
          </div>
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
            <span className="text-white text-sm">AU</span>
          </div>
          <ChevronDown className="hidden lg:block w-4 h-4 text-gray-500" />
        </div>
      </div>

      {/* Expanded Mobile Search */}
      {searchExpanded && (
        <div className="md:hidden absolute top-16 left-0 right-0 p-4 bg-[#0F0F14] backdrop-blur-xl border-b border-purple-500/20 z-30">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              autoFocus
              className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
            />
          </div>
        </div>
      )}
    </header>
  );
}