import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const CanteenContext = createContext(null);

export const CanteenProvider = ({ children }) => {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState({});
  const [rushHour, setRushHour] = useState({ isPaused: false, pauseReason: '', resumesInMinutes: 15 });
  const [currentStudent, setCurrentStudent] = useState({ name: 'Aarav Sharma', roll: 'CS-2024-042' });
  const [theme, setTheme] = useState('light');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('order_status_updated', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    newSocket.on('item_stock_changed', ({ itemId, isAvailable }) => {
      setMenu(prev => prev.map(item => item._id === itemId ? { ...item, isAvailable } : item));
    });

    newSocket.on('rush_hour_changed', (state) => {
      setRushHour(state);
    });

    return () => newSocket.close();
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[itemId] > 1) copy[itemId] -= 1;
      else delete copy[itemId];
      return copy;
    });
  };

  return (
    <CanteenContext.Provider value={{
      menu,
      orders,
      cart,
      rushHour,
      currentStudent,
      theme,
      toggleTheme,
      addToCart,
      removeFromCart,
      setOrders,
      setRushHour
    }}>
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => useContext(CanteenContext);
