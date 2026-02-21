import { Minus, Plus, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CustomerSelector, Customer } from './CustomerSelector';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  selectedCustomer: Customer | null;
  discountType: '%' | 'Rp';
  discountValue: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSelectCustomer: () => void;
  onRemoveCustomer: () => void;
  onAddNewCustomer: () => void;
  onDiscountTypeChange: (type: '%' | 'Rp') => void;
  onDiscountValueChange: (value: number) => void;
  onCheckout: () => void;
  onClear: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Cart({
  items,
  selectedCustomer,
  discountType,
  discountValue,
  onUpdateQuantity,
  onRemoveItem,
  onSelectCustomer,
  onRemoveCustomer,
  onAddNewCustomer,
  onDiscountTypeChange,
  onDiscountValueChange,
  onCheckout,
  onClear,
  isOpen = true,
  onClose,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const discountAmount = discountType === '%' 
    ? (subtotal * discountValue) / 100 
    : discountValue;
  
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const CartContent = (
    <>
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-purple-500/20 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg md:text-xl text-gray-200">Current Order</h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{items.length} items</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="xl:hidden w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Customer Information */}
      <div className="p-4 md:p-6 border-b border-purple-500/20 shrink-0">
        <CustomerSelector
          selectedCustomer={selectedCustomer}
          onSelectCustomer={onSelectCustomer}
          onRemoveCustomer={onRemoveCustomer}
          onAddNewCustomer={onAddNewCustomer}
        />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 md:space-y-3">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="bg-white/5 border border-purple-500/20 rounded-xl p-3 md:p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm text-gray-200 line-clamp-1">{item.name}</h3>
                  <p className="text-xs text-blue-400 mt-1">Rp {item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="text-gray-500 hover:text-red-400 transition-colors ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-9 h-9 md:w-10 md:h-10 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                  <span className="w-10 text-center text-sm text-gray-300">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    className="w-9 h-9 md:w-10 md:h-10 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </div>
                <div className="text-sm text-gray-200">
                  Rp {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
            <p className="text-sm">Cart is empty</p>
            <p className="text-xs mt-1">Add products to start an order</p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="p-4 md:p-6 border-t border-purple-500/20 space-y-3 md:space-y-4 shrink-0">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Subtotal</span>
          <span className="text-gray-200">Rp {subtotal.toLocaleString()}</span>
        </div>

        {/* Discount */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Discount</span>
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
              <button
                onClick={() => onDiscountTypeChange('%')}
                className={`px-3 py-1 rounded text-xs transition-all min-h-[36px] ${
                  discountType === '%'
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                %
              </button>
              <button
                onClick={() => onDiscountTypeChange('Rp')}
                className={`px-3 py-1 rounded text-xs transition-all min-h-[36px] ${
                  discountType === 'Rp'
                    ? 'bg-gradient-to-r from-blue-500/30 to-purple-600/30 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Rp
              </button>
            </div>
          </div>
          <input
            type="number"
            value={discountValue}
            onChange={(e) => onDiscountValueChange(Number(e.target.value) || 0)}
            placeholder="0"
            className="w-full h-11 md:h-12 bg-white/5 border border-purple-500/20 rounded-lg px-4 text-gray-300 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
          />
          {discountAmount > 0 && (
            <p className="text-xs text-cyan-400">-Rp {discountAmount.toLocaleString()}</p>
          )}
        </div>

        {/* Grand Total */}
        <div className="pt-3 md:pt-4 border-t border-purple-500/20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 text-sm md:text-base">Grand Total</span>
            <div className="text-xl md:text-2xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Rp {grandTotal.toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 md:gap-3">
            <button
              onClick={onClear}
              disabled={items.length === 0}
              className="flex-1 h-11 md:h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              Batal
            </button>
            <button
              onClick={onCheckout}
              disabled={items.length === 0}
              className="flex-1 h-11 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            >
              Bayar
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop - Fixed Sidebar */}
      <div className="hidden xl:flex w-96 h-full bg-white/5 backdrop-blur-xl border-l border-purple-500/20 flex-col">
        {CartContent}
      </div>

      {/* Mobile/Tablet - Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="xl:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="xl:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[#0F0F14] backdrop-blur-xl border-l border-purple-500/20 flex flex-col z-50"
            >
              {CartContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}