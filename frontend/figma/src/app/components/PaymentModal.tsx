import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Wallet, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  onConfirm: (data: { date: string; cashbox: string; cashPaid: number }) => void;
}

export function PaymentModal({ isOpen, onClose, grandTotal, onConfirm }: PaymentModalProps) {
  const [date, setDate] = useState('');
  const [cashPaid, setCashPaid] = useState<number>(0);
  const [cashbox, setCashbox] = useState('main');

  useEffect(() => {
    // Set current date when modal opens
    if (isOpen) {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setCashPaid(0);
    }
  }, [isOpen]);

  const change = Math.max(0, cashPaid - grandTotal);
  const isValid = cashPaid >= grandTotal;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm({ date, cashbox, cashPaid });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:relative md:inset-auto w-auto md:max-w-md max-h-[90vh] z-50 flex flex-col"
          >
            <div className="bg-[#0F0F14] backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.3)] overflow-hidden flex flex-col h-full">
              {/* Header */}
              <div className="relative p-4 md:p-6 border-b border-purple-500/20 shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10" />
                <div className="relative flex items-center justify-between">
                  <h2 className="text-lg md:text-xl text-gray-200">Payment</h2>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
                {/* Grand Total Display */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-4 md:p-5">
                  <p className="text-xs md:text-sm text-gray-400 mb-2">Grand Total</p>
                  <div className="text-2xl md:text-3xl bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Rp {grandTotal.toLocaleString()}
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 md:h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-300 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                  />
                </div>

                {/* Cashbox */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <Wallet className="w-4 h-4" />
                    Cashbox
                  </label>
                  <select
                    value={cashbox}
                    onChange={(e) => setCashbox(e.target.value)}
                    className="w-full h-11 md:h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-300 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                  >
                    <option value="main">Main Cash Register</option>
                    <option value="secondary">Secondary Register</option>
                    <option value="online">Online Payments</option>
                  </select>
                </div>

                {/* Cash Paid */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign className="w-4 h-4" />
                    Cash Paid
                  </label>
                  <input
                    type="number"
                    value={cashPaid}
                    onChange={(e) => setCashPaid(Number(e.target.value))}
                    placeholder="Enter amount..."
                    className="w-full h-11 md:h-12 bg-white/5 border border-purple-500/20 rounded-xl px-4 text-gray-300 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                  />
                </div>

                {/* Change Display */}
                {change > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-500/10 to-cyan-600/10 border border-green-500/30 rounded-xl p-4 md:p-5"
                  >
                    <p className="text-xs md:text-sm text-gray-400 mb-2">Change</p>
                    <div className="text-xl md:text-2xl text-green-400">
                      Rp {change.toLocaleString()}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 md:p-6 border-t border-purple-500/20 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-11 md:h-12 rounded-xl border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleConfirm}
                  disabled={!cashPaid || cashPaid < grandTotal}
                  className="flex-1 h-11 md:h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  Confirm
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}