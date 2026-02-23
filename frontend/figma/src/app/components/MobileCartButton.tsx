import { ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';

interface MobileCartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function MobileCartButton({ itemCount, onClick }: MobileCartButtonProps) {
  return (
    <button
      onClick={onClick}
      className="xl:hidden fixed bottom-20 right-4 md:bottom-24 md:right-6 w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] flex items-center justify-center z-30"
    >
      <ShoppingCart className="w-6 h-6 md:w-7 md:h-7" />
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 md:w-7 md:h-7 rounded-full bg-red-500 border-2 border-[#0F0F14] flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]"
        >
          <span className="text-xs md:text-sm">{itemCount}</span>
        </motion.div>
      )}
    </button>
  );
}
