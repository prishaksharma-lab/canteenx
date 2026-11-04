import React from 'react';
import { useCanteen } from '../context/CanteenContext';

export default function CounterBoard() {
  const { orders } = useCanteen();

  const preparing = orders.filter(o => o.status === 'Preparing');
  const ready = orders.filter(o => o.status === 'Ready');

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1C1B19] p-6 rounded-2xl border border-[#E5DFD5] dark:border-[#332F2A] flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">Canteen Live Counter TV</h2>
          <p className="text-xs text-[#6E685F]">Please wait until your token is displayed in the Ready column before approaching the pickup counter.</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[#C55A33]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <span className="text-[10px] text-[#6E685F] uppercase font-bold">Counter Status Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preparing Column */}
        <div className="bg-white dark:bg-[#1C1B19] p-6 rounded-2xl border border-[#E5DFD5] dark:border-[#332F2A]">
          <div className="flex justify-between items-center pb-4 border-b border-[#E5DFD5] dark:border-[#332F2A]">
            <h3 className="text-lg font-bold text-[#9A3412]">🍳 NOW PREPARING</h3>
            <span className="text-xs font-bold bg-[#FFEDD5] text-[#9A3412] px-2.5 py-1 rounded-full">
              {preparing.length} in progress
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {preparing.map(o => (
              <div key={o._id || o.id} className="bg-[#FAF7F2] dark:bg-[#252320] border border-[#FED7AA] p-4 rounded-xl text-center">
                <div className="text-xl font-black text-[#9A3412]">{o.token}</div>
                <div className="text-[10px] text-[#6E685F] mt-1">{o.counter || 'Counter 1'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ready for Pickup Column */}
        <div className="bg-white dark:bg-[#1C1B19] p-6 rounded-2xl border border-[#E5DFD5] dark:border-[#332F2A]">
          <div className="flex justify-between items-center pb-4 border-b border-[#E5DFD5] dark:border-[#332F2A]">
            <h3 className="text-lg font-bold text-[#3730A3] dark:text-[#A5B4FC]">🔔 READY FOR PICKUP</h3>
            <span className="text-xs font-bold bg-[#EEF2FF] text-[#3730A3] px-2.5 py-1 rounded-full">
              {ready.length} ready
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {ready.map(o => (
              <div key={o._id || o.id} className="bg-[#EEF2FF] dark:bg-[#1E1E3F] border border-[#C7D2FE] p-4 rounded-xl text-center animate-pulse">
                <div className="text-xl font-black text-[#3730A3] dark:text-[#A5B4FC]">{o.token}</div>
                <div className="text-[10px] font-bold text-[#3730A3] dark:text-[#A5B4FC] mt-1">{o.counter || 'Counter 1'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
