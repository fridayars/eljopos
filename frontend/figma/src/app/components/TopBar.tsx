import { Search, ScanBarcode, Bell, ChevronDown, Store } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TopBarProps {
  showSearchAndScanner?: boolean;
}

interface Branch {
  id: string;
  name: string;
  address: string;
}

const branches: Branch[] = [
  { id: '1', name: 'Main Store', address: 'Jakarta Pusat' },
  { id: '2', name: 'Branch 1', address: 'Jakarta Selatan' },
  { id: '3', name: 'Branch 2', address: 'Jakarta Utara' },
  { id: '4', name: 'Branch 3', address: 'Tangerang' },
  { id: '5', name: 'Branch 4', address: 'Bekasi' },
];

export function TopBar({ showSearchAndScanner = true }: TopBarProps) {
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch>(branches[0]);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="h-16 md:h-20 bg-white/5 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50">
      {/* Left Section - Logo */}
      <div className="flex items-center gap-3">
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
        {showSearchAndScanner && (
          <div className="hidden md:flex md:ml-8 lg:ml-12">
            <div className="relative w-64 lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products, SKU, barcode..."
                className="w-full h-12 bg-white/5 border border-purple-500/20 rounded-xl pl-12 pr-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
              />
            </div>
          </div>
        )}
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Search Toggle */}
        {showSearchAndScanner && (
          <button
            onClick={() => setSearchExpanded(!searchExpanded)}
            className="md:hidden w-11 h-11 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/50 transition-all"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        {/* Barcode Scanner */}
        {showSearchAndScanner && (
          <button className="w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
            <ScanBarcode className="w-5 h-5" />
          </button>
        )}

        {/* Notifications */}
        <button className="relative w-11 h-11 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-white/5 border border-purple-500/20 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        </button>

        {/* Branch Selector Dropdown */}
        <div className="relative flex items-center gap-3 pl-2 md:pl-4 border-l border-purple-500/20">
          <button
            onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
            onBlur={() => setTimeout(() => setIsBranchDropdownOpen(false), 200)}
            className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg bg-white/5 border border-purple-500/20 hover:border-blue-500/50 transition-all group"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center">
              <Store className="w-4 h-4 text-purple-400" />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs text-gray-500">Branch</p>
              <p className="text-sm text-gray-200">{selectedBranch.name}</p>
            </div>
            <ChevronDown
              className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${
                isBranchDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Branch Dropdown Menu */}
          <AnimatePresence>
            {isBranchDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-72 bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] overflow-hidden z-50"
              >
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-purple-500/20">
                    <p className="text-xs text-gray-500">Select Branch</p>
                  </div>
                  <div className="mt-2 max-h-80 overflow-y-auto space-y-1">
                    {branches.map((branch) => (
                      <button
                        key={branch.id}
                        onClick={() => {
                          setSelectedBranch(branch);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          selectedBranch.id === branch.id
                            ? 'bg-gradient-to-r from-purple-500/20 to-pink-600/20 border border-purple-500/30'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedBranch.id === branch.id
                              ? 'bg-gradient-to-br from-purple-500/30 to-pink-600/30 border border-purple-500/40'
                              : 'bg-white/5 border border-purple-500/20'
                          }`}
                        >
                          <Store
                            className={`w-5 h-5 ${
                              selectedBranch.id === branch.id ? 'text-purple-400' : 'text-gray-400'
                            }`}
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p
                            className={`text-sm ${
                              selectedBranch.id === branch.id ? 'text-gray-200' : 'text-gray-300'
                            }`}
                          >
                            {branch.name}
                          </p>
                          <p className="text-xs text-gray-500">{branch.address}</p>
                        </div>
                        {selectedBranch.id === branch.id && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative flex items-center gap-3 pl-2 md:pl-4 border-l border-purple-500/20">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 200)}
            className="flex items-center gap-2 hover:opacity-80 transition-all"
          >
            <div className="hidden lg:block text-right">
              <p className="text-sm text-gray-200">Admin User</p>
              <p className="text-xs text-gray-500">Cashier</p>
            </div>
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center cursor-pointer hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all">
              <span className="text-white text-sm">AU</span>
            </div>
            <ChevronDown
              className={`hidden lg:block w-4 h-4 text-gray-500 transition-transform ${
                isUserDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          <AnimatePresence>
            {isUserDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-56 bg-[#0F0F14]/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.3)] overflow-hidden z-50"
              >
                <div className="p-2">
                  <button
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left"
                  >
                    <span className="text-sm text-gray-300">Profile Settings</span>
                  </button>
                  <button
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all text-left"
                  >
                    <span className="text-sm text-gray-300">Change Password</span>
                  </button>
                  <div className="border-t border-purple-500/20 my-2" />
                  <button
                    onClick={() => setIsUserDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/10 transition-all text-left"
                  >
                    <span className="text-sm text-red-400">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expanded Mobile Search */}
      {showSearchAndScanner && searchExpanded && (
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