import React, { useState } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import StudentDashboard from './components/StudentDashboard';
import KitchenAdminDashboard from './components/KitchenAdminDashboard';
import CounterBoard from './components/CounterBoard';
import { Moon, Sun, ShoppingBag, Utensils, Monitor } from 'lucide-react';

function MainApp() {
  const [view, setView] = useState('student'); // 'student' | 'kitchen' | 'counter'
  const { theme, toggleTheme, cart, rushHour } = useCanteen();
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-[#131211] text-[#24211D] dark:text-[#F3EFE9] transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1C1B19]/90 backdrop-blur border-b border-[#E5DFD5] dark:border-[#332F2A]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('student')}>
            <div className="w-9 h-9 rounded-lg bg-[#C55A33] text-white flex items-center justify-center font-bold text-lg">
              CX
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">CanteenX</h1>
              <p className="text-xs text-[#6E685F] dark:text-[#A8A196]">Smart Campus Bistro & Queue</p>
            </div>
          </div>

          {/* View Switcher */}
          <div className="flex bg-[#F3EFE9] dark:bg-[#252320] p-1 rounded-full text-xs font-semibold">
            <button 
              onClick={() => setView('student')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${view === 'student' ? 'bg-white dark:bg-[#1C1B19] shadow-sm text-[#24211D] dark:text-white' : 'text-[#6E685F]'}`}
            >
              <Utensils size={14} /> Student View
            </button>
            <button 
              onClick={() => setView('kitchen')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${view === 'kitchen' ? 'bg-white dark:bg-[#1C1B19] shadow-sm text-[#24211D] dark:text-white' : 'text-[#6E685F]'}`}
            >
              Kitchen Dashboard
            </button>
            <button 
              onClick={() => setView('counter')}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${view === 'counter' ? 'bg-white dark:bg-[#1C1B19] shadow-sm text-[#24211D] dark:text-white' : 'text-[#6E685F]'}`}
            >
              <Monitor size={14} /> Counter TV
            </button>
          </div>

          {/* Theme & Tray Trigger */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#E5DFD5] dark:border-[#332F2A] hover:bg-[#F3EFE9] dark:hover:bg-[#252320]"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>
            <button className="flex items-center gap-2 bg-[#C55A33] text-white px-4 py-2 rounded-full text-xs font-bold shadow-sm hover:bg-[#AA4723]">
              <ShoppingBag size={14} />
              <span>Tray</span>
              {cartCount > 0 && <span className="bg-white text-[#C55A33] px-1.5 py-0.5 rounded-full text-[10px]">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Rush Hour Warning */}
      {rushHour.isPaused && (
        <div className="bg-[#FFEDD5] border-b border-[#FED7AA] text-[#9A3412] px-4 py-2.5 text-center text-xs font-semibold">
          ⚠️ Kitchen Rush Hour: {rushHour.pauseReason} (Resumes in ~{rushHour.resumesInMinutes} mins)
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {view === 'student' && <StudentDashboard />}
        {view === 'kitchen' && <KitchenAdminDashboard />}
        {view === 'counter' && <CounterBoard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <CanteenProvider>
      <MainApp />
    </CanteenProvider>
  );
}
