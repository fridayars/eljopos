import { DollarSign, ShoppingCart, Users, Package, Clock, Edit3, Save, StickyNote } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export function Dashboard() {
  const [notes, setNotes] = useState('• Follow up with supplier for low stock items\n• Schedule staff meeting for tomorrow\n• Review promotional pricing for weekend');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(notes);

  const handleEditNotes = () => {
    setTempNotes(notes);
    setIsEditingNotes(true);
  };

  const handleSaveNotes = () => {
    setNotes(tempNotes);
    setIsEditingNotes(false);
  };

  const handleCancelEdit = () => {
    setTempNotes(notes);
    setIsEditingNotes(false);
  };

  // Mock dashboard data
  const stats = [
    {
      id: 1,
      label: 'Today\'s Sales',
      value: 'Rp 2,450,000',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
    },
    {
      id: 2,
      label: 'Transactions',
      value: '48',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'purple',
    },
    {
      id: 3,
      label: 'Customers',
      value: '32',
      change: '+5.1%',
      trend: 'up',
      icon: Users,
      color: 'cyan',
    },
    {
      id: 4,
      label: 'Low Stock Items',
      value: '7',
      change: '-2',
      trend: 'down',
      icon: Package,
      color: 'orange',
    },
  ];

  const recentTransactions = [
    { id: '1', customer: 'Sarah Williams', amount: 75000, time: '10:30 AM', items: 3 },
    { id: '2', customer: 'Michael Chen', amount: 125000, time: '10:15 AM', items: 5 },
    { id: '3', customer: 'Amanda Rodriguez', amount: 45000, time: '09:45 AM', items: 2 },
    { id: '4', customer: 'David Kim', amount: 98000, time: '09:20 AM', items: 4 },
    { id: '5', customer: 'Walk-in Customer', amount: 52000, time: '08:55 AM', items: 2 },
  ];

  const topProducts = [
    { id: '1', name: 'Premium Coffee', sold: 24, revenue: 840000 },
    { id: '2', name: 'Club Sandwich', sold: 18, revenue: 810000 },
    { id: '3', name: 'Butter Croissant', sold: 15, revenue: 420000 },
    { id: '4', name: 'Berry Smoothie', sold: 12, revenue: 384000 },
  ];

  return (
    <div className="flex-1 overflow-auto pb-20 lg:pb-0">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl text-gray-200 mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500">Welcome back! Here's your sales overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: stat.id * 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl p-4 md:p-5 hover:border-blue-500/40 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-${stat.color}-500/20 to-${stat.color}-600/20 border border-${stat.color}-500/30 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 text-${stat.color}-400`} />
                  </div>
                  <span className={`text-xs md:text-sm ${stat.trend === 'up' ? 'text-green-400' : 'text-orange-400'}`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl md:text-2xl text-gray-200">{stat.value}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden"
          >
            <div className="p-4 md:p-5 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                <h3 className="text-base md:text-lg text-gray-200">Recent Transactions</h3>
              </div>
            </div>
            <div className="divide-y divide-purple-500/10">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 md:p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm md:text-base text-gray-200">{transaction.customer}</p>
                    <p className="text-sm md:text-base text-blue-400">Rp {transaction.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
                    <span>{transaction.items} items</span>
                    <span>{transaction.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-purple-500/20 rounded-xl overflow-hidden"
          >
            <div className="p-4 md:p-5 border-b border-purple-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-base md:text-lg text-gray-200">Notes</h3>
                </div>
                {!isEditingNotes && (
                  <button
                    onClick={handleEditNotes}
                    className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-purple-500/20 hover:border-blue-500/40 text-gray-400 hover:text-blue-400 transition-all text-sm"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span className="hidden md:inline">Edit</span>
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 md:p-5">
              {isEditingNotes ? (
                <>
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="w-full min-h-[200px] md:min-h-[240px] resize-none bg-white/5 border border-purple-500/20 rounded-xl p-4 text-sm md:text-base text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                    placeholder="Add your notes here..."
                  />
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      onClick={handleSaveNotes}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 rounded-lg border border-purple-500/30 text-gray-400 hover:text-gray-200 hover:border-purple-500/50 transition-all text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-sm md:text-base text-gray-300 whitespace-pre-line min-h-[200px] md:min-h-[240px]">
                  {notes || <span className="text-gray-600 italic">No notes yet. Click Edit to add notes.</span>}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}