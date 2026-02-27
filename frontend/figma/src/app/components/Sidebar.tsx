import { LayoutGrid, Users, Package, BarChart3, Settings, Home, Box, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', icon: Home, label: 'Dashboard' },
  { id: 'sales', icon: LayoutGrid, label: 'Sales' },
  { id: 'product-inventory', icon: Box, label: 'Product Inventory' },
  { id: 'service-inventory', icon: Briefcase, label: 'Service Inventory' },
  { id: 'customers', icon: Users, label: 'Customers' },
  { id: 'reports', icon: BarChart3, label: 'Reports' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-20 bg-white/5 backdrop-blur-xl border-r border-purple-500/20 flex-col items-center py-6 gap-4">
        {/* Logo */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.4)]">
          <span className="text-white text-xl">P</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col gap-2 w-full px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative w-full h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'
                }`}
                title={item.label}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl border border-blue-500/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] relative z-10">{item.label.slice(0, 4)}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F0F14] backdrop-blur-xl border-t border-purple-500/20 z-40 overflow-x-auto safe-area-inset-bottom">
        <div className="flex items-center justify-start h-full px-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-[44px] min-w-[70px] transition-all ${
                  isActive ? 'text-blue-400' : 'text-gray-500'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-5 h-5 relative z-10" />
                <span className="text-[10px] relative z-10 whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}