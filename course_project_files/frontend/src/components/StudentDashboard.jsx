import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { Clock, Plus, Minus, Search, ShieldCheck } from 'lucide-react';

export default function StudentDashboard() {
  const { menu, cart, addToCart, removeFromCart } = useCanteen();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', 'Wraps & Rolls', 'Campus Bowls', 'Breakfast & Bites', 'Beverages', 'Healthy Greens'];

  const filtered = menu.filter(item => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-white dark:bg-[#1C1B19] p-8 rounded-2xl border border-[#E5DFD5] dark:border-[#332F2A] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#C55A33] bg-[#FBEFEA] dark:bg-[#301F18] px-3 py-1 rounded-full">
            Campus Bites Pre-Order
          </span>
          <h2 className="text-3xl font-extrabold mt-2 tracking-tight">Food on your Campus</h2>
          <p className="text-sm text-[#6E685F] dark:text-[#A8A196] mt-1 max-w-lg">
            Order before your break ends, receive a live digital token, and collect without queueing.
          </p>
        </div>
        <div className="bg-[#FAF7F2] dark:bg-[#252320] p-4 rounded-xl border border-[#E5DFD5] dark:border-[#332F2A] min-w-[240px]">
          <span className="text-xs font-bold text-[#6E685F] uppercase">Live Canteen Queue</span>
          <div className="flex justify-between items-baseline mt-2">
            <span className="text-sm text-[#6E685F]">Estimated Wait</span>
            <span className="text-xl font-black">~12 min</span>
          </div>
          <div className="flex justify-between items-baseline mt-1 text-xs">
            <span className="text-[#6E685F]">Current Token</span>
            <span className="font-bold text-[#C55A33]">#CX-102</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#C55A33] text-white' : 'bg-white dark:bg-[#1C1B19] border border-[#E5DFD5] dark:border-[#332F2A] text-[#6E685F]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-3 text-[#6E685F]" />
          <input 
            type="text" 
            placeholder="Search food item..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1C1B19] border border-[#E5DFD5] dark:border-[#332F2A] rounded-full text-xs focus:outline-none focus:border-[#C55A33]"
          />
        </div>
      </div>

      {/* Menu Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filtered.map(item => {
          const qty = cart[item._id] || 0;
          return (
            <div key={item._id} className="bg-white dark:bg-[#1C1B19] border border-[#E5DFD5] dark:border-[#332F2A] rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="relative h-44 bg-gray-100 dark:bg-gray-800">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 px-2.5 py-1 rounded-full text-[10px] font-bold">
                  {item.diet}
                </div>
                <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-black/80 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                  <Clock size={10} /> {item.prepTime} min
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base leading-snug">{item.name}</h3>
                  <p className="text-xs text-[#6E685F] dark:text-[#A8A196] mt-1 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E5DFD5] dark:border-[#332F2A]">
                  <span className="font-extrabold text-base">₹{item.price}</span>
                  {!item.isAvailable ? (
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                      Sold Out
                    </span>
                  ) : qty === 0 ? (
                    <button 
                      onClick={() => addToCart(item._id)}
                      className="bg-[#FAF7F2] dark:bg-[#252320] border border-[#D4CCC0] dark:border-[#454039] text-xs font-bold px-4 py-1.5 rounded-full hover:bg-[#C55A33] hover:text-white transition-colors"
                    >
                      + Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#C55A33] text-white px-3 py-1 rounded-full text-xs font-bold">
                      <button onClick={() => removeFromCart(item._id)}><Minus size={12} /></button>
                      <span>{qty}</span>
                      <button onClick={() => addToCart(item._id)}><Plus size={12} /></button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
