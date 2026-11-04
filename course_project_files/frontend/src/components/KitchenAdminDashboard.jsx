import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { AlertCircle, CheckCircle2, Clock, Flame, Play } from 'lucide-react';

export default function KitchenAdminDashboard() {
  const { orders, setOrders, rushHour, setRushHour } = useCanteen();
  const [filter, setFilter] = useState('All');

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? data.order : o));
      }
    } catch (e) {
      console.warn('Backend update notice:', e);
      // Fallback local update
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const toggleRush = () => {
    setRushHour(prev => ({
      ...prev,
      isPaused: !prev.isPaused,
      pauseReason: 'Kitchen overloaded. Clearing active order backlog.'
    }));
  };

  const activeOrders = orders.filter(o => filter === 'All' ? o.status !== 'Collected' : o.status === filter);

  return (
    <div className="space-y-6">
      {/* Rush Controls & Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1C1B19] p-4 rounded-xl border border-[#E5DFD5] dark:border-[#332F2A]">
          <span className="text-xs text-[#6E685F] uppercase font-bold">Active Orders</span>
          <div className="text-2xl font-black mt-1">
            {orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1B19] p-4 rounded-xl border border-[#E5DFD5] dark:border-[#332F2A]">
          <span className="text-xs text-[#6E685F] uppercase font-bold">Ready for Pickup</span>
          <div className="text-2xl font-black mt-1 text-[#4338CA] dark:text-[#818CF8]">
            {orders.filter(o => o.status === 'Ready').length}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C1B19] p-4 rounded-xl border border-[#E5DFD5] dark:border-[#332F2A] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#6E685F] uppercase font-bold">Kitchen Intake</span>
            <div className="text-sm font-bold mt-1">
              {rushHour.isPaused ? '⏸️ Paused (Rush)' : 'Active (Open)'}
            </div>
          </div>
          <button 
            onClick={toggleRush}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border ${rushHour.isPaused ? 'bg-[#C55A33] text-white border-[#C55A33]' : 'bg-[#FAF7F2] text-[#9A3412] border-[#FED7AA]'}`}
          >
            {rushHour.isPaused ? 'Resume Intake' : 'Pause Orders'}
          </button>
        </div>
      </div>

      {/* Orders Filter Tabs */}
      <div className="flex gap-2">
        {['All', 'Pending', 'Preparing', 'Ready'].map(st => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-4 py-2 rounded-full text-xs font-bold border ${filter === st ? 'bg-[#24211D] text-white border-[#24211D]' : 'bg-white dark:bg-[#1C1B19] border-[#E5DFD5] dark:border-[#332F2A] text-[#6E685F]'}`}
          >
            {st} ({st === 'All' ? orders.filter(o => o.status !== 'Collected').length : orders.filter(o => o.status === st).length})
          </button>
        ))}
      </div>

      {/* Order Cards Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeOrders.map(order => (
          <div key={order._id || order.id} className="bg-white dark:bg-[#1C1B19] p-5 rounded-2xl border border-[#E5DFD5] dark:border-[#332F2A] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center pb-2 border-b border-[#E5DFD5] dark:border-[#332F2A]">
                <span className="text-xl font-extrabold tracking-tight">{order.token}</span>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  order.status === 'Pending' ? 'bg-[#FEF3C7] text-[#92400E]' :
                  order.status === 'Preparing' ? 'bg-[#FFEDD5] text-[#9A3412]' :
                  'bg-[#EEF2FF] text-[#3730A3]'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#6E685F] mt-2">
                <span>{order.studentName}</span>
                <span>{order.studentRoll}</span>
              </div>
              <div className="mt-3 space-y-1">
                {order.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{it.quantity}× {it.name}</span>
                    <span className="font-semibold">₹{it.price * it.quantity}</span>
                  </div>
                ))}
              </div>
              {order.specialInstructions && (
                <div className="mt-3 text-[11px] italic bg-[#FAF7F2] dark:bg-[#252320] p-2 rounded-lg border-l-2 border-[#C55A33]">
                  "{order.specialInstructions}"
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#E5DFD5] dark:border-[#332F2A] flex gap-2">
              {order.status === 'Pending' && (
                <button 
                  onClick={() => updateStatus(order._id || order.id, 'Preparing')}
                  className="w-full bg-[#C55A33] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#AA4723]"
                >
                  Start Preparing →
                </button>
              )}
              {order.status === 'Preparing' && (
                <button 
                  onClick={() => updateStatus(order._id || order.id, 'Ready')}
                  className="w-full bg-[#4338CA] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#3730A3]"
                >
                  Mark Ready 🔔
                </button>
              )}
              {order.status === 'Ready' && (
                <button 
                  onClick={() => updateStatus(order._id || order.id, 'Collected')}
                  className="w-full bg-gray-700 text-white py-2 rounded-lg text-xs font-bold"
                >
                  Mark Collected ✓
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
