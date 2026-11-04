/**
 * CanteenX - Smart Canteen Ordering & Queue Management System
 * Production Client Engine
 * Features:
 * - Real User Authentication & Registration (Student & Kitchen Staff)
 * - Persistent Database Connection (REST API + Local Database Sync)
 * - Effortlessly Dismissable Order Progress Modal with Floating Quick-Tracker
 * - Web Audio Chime Alerts (Ready Bell & Order Ding)
 * - Multi-Tab Synchronization via BroadcastChannel
 * - Zero FSD syllabus or MongoDB text clutter in the consumer UI
 */

(function () {
  'use strict';

  // ==========================================================================
  // Web Audio Chimes Synthesizer
  // ==========================================================================
  const SoundFX = {
    audioCtx: null,
    enabled: true,

    init() {
      if (!this.audioCtx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();
      }
    },

    play(type) {
      if (!this.enabled) return;
      try {
        this.init();
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        if (!this.audioCtx) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;

        if (type === 'ready') {
          // Counter Service Bell Chime (Ding-Dong: E5 -> G#5)
          const osc1 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(659.25, now);
          osc1.frequency.exponentialRampToValueAtTime(830.61, now + 0.15);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          osc1.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(now);
          osc1.stop(now + 1.2);
        } else if (type === 'placed') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.08);
          osc.frequency.setValueAtTime(659.25, now + 0.16);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.45);
        } else if (type === 'alert') {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.setValueAtTime(480, now + 0.1);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 0.35);
        }
      } catch (e) {
        console.warn('Audio notice:', e);
      }
    }
  };

  // ==========================================================================
  // Default Culinary Menu
  // ==========================================================================
  const INITIAL_MENU = [
    {
      id: 'item-1',
      name: 'Artisan Paneer Tikka Wrap',
      category: 'Wraps & Rolls',
      price: 95,
      prepTime: 10,
      isAvailable: true,
      tag: "Chef's Special",
      diet: 'Veg',
      calories: '380 kcal',
      description: 'Char-grilled cottage cheese cubes in spiced marinade with mint glaze wrapped in whole-wheat flatbread.',
      image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-2',
      name: 'Mediterranean Falafel Bowl',
      category: 'Campus Bowls',
      price: 125,
      prepTime: 12,
      isAvailable: true,
      tag: 'High-Protein',
      diet: 'Vegan',
      calories: '440 kcal',
      description: 'Crisp herb falafels over warm brown rice, roasted chickpeas, cucumber-tomato salad, and creamy lemon tahini.',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-3',
      name: 'Smoky Grilled Chicken Kathi',
      category: 'Wraps & Rolls',
      price: 135,
      prepTime: 14,
      isAvailable: true,
      tag: 'Bestseller',
      diet: 'Non-Veg',
      calories: '490 kcal',
      description: 'Slow-grilled chicken breast glazed with chaat spices, pickled shallots, and garlic emulsion in flaky paratha.',
      image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-4',
      name: 'Sourdough Grilled Cheese Melt',
      category: 'Breakfast & Bites',
      price: 85,
      prepTime: 8,
      isAvailable: true,
      tag: 'Quick Grab',
      diet: 'Veg',
      calories: '340 kcal',
      description: 'Triple melted cheddar and mozzarella with sweet basil pesto on artisanal toasted sourdough.',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-5',
      name: 'Crispy Street Samosas (2 pcs)',
      category: 'Breakfast & Bites',
      price: 40,
      prepTime: 5,
      isAvailable: true,
      tag: 'Campus Favorite',
      diet: 'Veg',
      calories: '280 kcal',
      description: 'Flaky golden pastry filled with cumin spiced potatoes & peas, served with sweet date and spicy mint relishes.',
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-6',
      name: 'Double-Brew Spiced Masala Chai',
      category: 'Beverages',
      price: 25,
      prepTime: 4,
      isAvailable: true,
      tag: 'Hot Brew',
      diet: 'Veg',
      calories: '95 kcal',
      description: 'Assam black tea brewed with fresh crushed ginger, green cardamom pods, and creamy whole milk.',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-7',
      name: 'Iced Vanilla Cold Brew',
      category: 'Beverages',
      price: 75,
      prepTime: 5,
      isAvailable: true,
      tag: 'Chilled',
      diet: 'Veg',
      calories: '140 kcal',
      description: '16-hour steeped Arabica cold brew poured over clear ice, crowned with vanilla cream foam.',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-8',
      name: 'Avocado Citrus Quinoa Bowl',
      category: 'Healthy Greens',
      price: 140,
      prepTime: 9,
      isAvailable: true,
      tag: 'Nutrient Dense',
      diet: 'Vegan',
      calories: '320 kcal',
      description: 'Organic tri-color quinoa, sliced ripe avocado, roasted pepitas, citrus lemon pomegranate vinaigrette.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80'
    },
    {
      id: 'item-9',
      name: 'Warm Roasted Walnut Brownie',
      category: 'Sweet Treats',
      price: 65,
      prepTime: 3,
      isAvailable: true,
      tag: 'Indulgent',
      diet: 'Veg',
      calories: '310 kcal',
      description: 'Fudgy Belgian dark chocolate brownie embedded with slow-roasted Californian walnuts, served warm.',
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80'
    }
  ];

  const INITIAL_ORDERS = [
    {
      id: 'ord-101',
      token: '#CX-101',
      studentName: 'Aarav Sharma',
      studentRoll: 'CS-2024-042',
      items: [
        { id: 'item-1', name: 'Artisan Paneer Tikka Wrap', quantity: 1, price: 95 },
        { id: 'item-6', name: 'Double-Brew Spiced Masala Chai', quantity: 1, price: 25 }
      ],
      totalAmount: 120,
      status: 'Ready',
      estimatedWaitMinutes: 10,
      createdAt: new Date(Date.now() - 14 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString(),
      specialInstructions: 'Extra mint chutney please',
      counter: 'Counter 1'
    },
    {
      id: 'ord-102',
      token: '#CX-102',
      studentName: 'Priya Nair',
      studentRoll: 'EC-2023-118',
      items: [
        { id: 'item-3', name: 'Smoky Grilled Chicken Kathi', quantity: 1, price: 135 },
        { id: 'item-7', name: 'Iced Vanilla Cold Brew', quantity: 1, price: 75 }
      ],
      totalAmount: 210,
      status: 'Preparing',
      estimatedWaitMinutes: 14,
      createdAt: new Date(Date.now() - 8 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 60000).toISOString(),
      specialInstructions: 'Less ice in cold brew',
      counter: 'Counter 2'
    }
  ];

  // ==========================================================================
  // Application State & User Session Store
  // ==========================================================================
  const State = {
    theme: localStorage.getItem('canteenx_theme') || 'light',
    activeView: 'student', // 'student' | 'kitchen' | 'counter'
    
    // Logged in User Session
    currentUser: null,
    isAuthModalOpen: false,
    authMode: 'login', // 'login' | 'register'
    authError: '',

    menu: [],
    orders: [],
    cart: {},
    cartInstructions: '',
    rushHour: {
      isPaused: false,
      pauseReason: 'Kitchen at capacity. Paused for order fulfillment.',
      resumesInMinutes: 15,
      pausedUntil: null
    },
    activeCategory: 'All',
    activeDiet: 'All',
    searchQuery: '',
    kitchenFilter: 'all_active',
    kitchenSubTab: 'orders',
    activeTrackingOrder: null,
    isCartOpen: false,
    tokenSequence: 103,
    syncChannel: null,

    init() {
      // Restore user session
      const savedUser = localStorage.getItem('canteenx_current_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          this.currentUser = null;
        }
      } else {
        // Default guest student session
        this.currentUser = {
          name: 'Aarav Sharma',
          email: 'aarav@campus.edu',
          rollNumber: 'CS-2024-042',
          role: 'student'
        };
      }

      // Restore Menu & Orders
      const savedMenu = localStorage.getItem('canteenx_menu');
      this.menu = savedMenu ? JSON.parse(savedMenu) : INITIAL_MENU;

      const savedOrders = localStorage.getItem('canteenx_orders');
      this.orders = savedOrders ? JSON.parse(savedOrders) : INITIAL_ORDERS;

      const savedRush = localStorage.getItem('canteenx_rush');
      if (savedRush) this.rushHour = JSON.parse(savedRush);

      const savedSeq = localStorage.getItem('canteenx_seq');
      if (savedSeq) this.tokenSequence = parseInt(savedSeq, 10);

      // Cross-tab broadcast
      if ('BroadcastChannel' in window) {
        this.syncChannel = new BroadcastChannel('canteenx_sync_channel');
        this.syncChannel.onmessage = (e) => this.handleRemoteSync(e.data);
      }

      window.addEventListener('storage', (e) => {
        if (e.key === 'canteenx_orders' && e.newValue) {
          this.orders = JSON.parse(e.newValue);
          App.render();
        }
        if (e.key === 'canteenx_menu' && e.newValue) {
          this.menu = JSON.parse(e.newValue);
          App.render();
        }
      });

      this.applyTheme(this.theme);
      this.fetchFromBackend();
    },

    // Fetch live state from backend database if running
    async fetchFromBackend() {
      try {
        const resMenu = await fetch('/api/menu');
        if (resMenu.ok) {
          const data = await resMenu.json();
          if (data.menu && data.menu.length > 0) {
            this.menu = data.menu;
            localStorage.setItem('canteenx_menu', JSON.stringify(this.menu));
          }
        }
        const resOrders = await fetch('/api/orders');
        if (resOrders.ok) {
          const data = await resOrders.json();
          if (data.orders) {
            this.orders = data.orders;
            localStorage.setItem('canteenx_orders', JSON.stringify(this.orders));
          }
        }
        App.render();
      } catch (err) {
        // Server not running locally - graceful local database mode
      }
    },

    saveUser(user) {
      this.currentUser = user;
      localStorage.setItem('canteenx_current_user', JSON.stringify(user));
      App.render();
    },

    logout() {
      this.currentUser = null;
      localStorage.removeItem('canteenx_current_user');
      App.render();
    },

    saveOrders() {
      localStorage.setItem('canteenx_orders', JSON.stringify(this.orders));
      localStorage.setItem('canteenx_seq', this.tokenSequence.toString());
      this.broadcast({ type: 'ORDERS_UPDATED', orders: this.orders, seq: this.tokenSequence });
    },

    saveMenu() {
      localStorage.setItem('canteenx_menu', JSON.stringify(this.menu));
      this.broadcast({ type: 'MENU_UPDATED', menu: this.menu });
    },

    saveRushHour() {
      localStorage.setItem('canteenx_rush', JSON.stringify(this.rushHour));
      this.broadcast({ type: 'RUSH_UPDATED', rushHour: this.rushHour });
    },

    broadcast(payload) {
      if (this.syncChannel) {
        try {
          this.syncChannel.postMessage(payload);
        } catch (e) {
          console.warn('Broadcast notice:', e);
        }
      }
    },

    handleRemoteSync(data) {
      if (!data) return;
      if (data.type === 'ORDERS_UPDATED') {
        this.orders = data.orders;
        this.tokenSequence = data.seq || this.tokenSequence;

        if (this.activeTrackingOrder) {
          const updated = this.orders.find(o => o.id === this.activeTrackingOrder.id);
          if (updated && updated.status !== this.activeTrackingOrder.status) {
            this.activeTrackingOrder = updated;
            if (updated.status === 'Ready') SoundFX.play('ready');
          }
        }
        App.render();
      } else if (data.type === 'MENU_UPDATED') {
        this.menu = data.menu;
        App.render();
      } else if (data.type === 'RUSH_UPDATED') {
        this.rushHour = data.rushHour;
        if (this.rushHour.isPaused) SoundFX.play('alert');
        App.render();
      }
    },

    applyTheme(theme) {
      this.theme = theme;
      localStorage.setItem('canteenx_theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    },

    toggleTheme() {
      const next = this.theme === 'light' ? 'dark' : 'light';
      this.applyTheme(next);
      App.render();
    }
  };

  // ==========================================================================
  // Helper Formatters & Queue Calculators
  // ==========================================================================
  function formatINR(val) {
    return '₹' + Number(val).toLocaleString('en-IN');
  }

  function timeAgo(dateString) {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
  }

  function calculateWaitEstimate() {
    const active = State.orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
    return Math.max(8, 6 + (active.length * 3));
  }

  // ==========================================================================
  // Application Render Engine
  // ==========================================================================
  const App = {
    root: null,

    init() {
      this.root = document.getElementById('app-root');
      State.init();
      this.render();

      // Keyboard escape closes any open modal or drawer
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (State.activeTrackingOrder) {
            State.activeTrackingOrder = null;
            this.render();
          } else if (State.isAuthModalOpen) {
            State.isAuthModalOpen = false;
            this.render();
          } else if (State.isCartOpen) {
            State.isCartOpen = false;
            this.render();
          }
        }
      });
    },

    render() {
      if (!this.root) return;

      const html = `
        ${this.renderHeader()}
        ${this.renderRushBanner()}
        
        <main class="app-container">
          ${State.activeView === 'student' ? this.renderStudentView() : ''}
          ${State.activeView === 'kitchen' ? this.renderKitchenAdminView() : ''}
          ${State.activeView === 'counter' ? this.renderCounterTVView() : ''}
        </main>

        <!-- Floating Quick-Tracker Pill for Student when Progress modal is closed -->
        ${this.renderFloatingOrderPill()}

        <!-- Slide-Over Tray & Modals -->
        ${this.renderCartDrawer()}
        ${this.renderOrderTrackingModal()}
        ${this.renderAuthModal()}
      `;

      this.root.innerHTML = html;
      this.attachEvents();
    },

    // ------------------------------------------------------------------------
    // Clean Navigation Header (No Syllabus or Mongo Clutter)
    // ------------------------------------------------------------------------
    renderHeader() {
      const cartItemCount = Object.values(State.cart).reduce((sum, q) => sum + q, 0);
      const activePendingCount = State.orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
      const user = State.currentUser;

      return `
        <header class="site-header">
          <div class="header-inner">
            <div class="brand-container" data-action="switch-view" data-view="student">
              <div class="brand-logo-mark">CX</div>
              <div>
                <span class="brand-title">CanteenX</span>
                <span class="brand-subtitle">Smart Campus Bistro</span>
              </div>
            </div>

            <!-- View Switcher (Clean Product Views Only) -->
            <div class="view-tabs">
              <button class="view-tab-btn ${State.activeView === 'student' ? 'active' : ''}" data-action="switch-view" data-view="student">
                <span>🎓</span>
                <span>Student Menu</span>
              </button>
              <button class="view-tab-btn ${State.activeView === 'kitchen' ? 'active' : ''}" data-action="switch-view" data-view="kitchen">
                <span>👨‍🍳</span>
                <span>Kitchen Staff</span>
                ${activePendingCount > 0 ? `<span class="badge-count">${activePendingCount}</span>` : ''}
              </button>
              <button class="view-tab-btn ${State.activeView === 'counter' ? 'active' : ''}" data-action="switch-view" data-view="counter">
                <span>📺</span>
                <span>Counter TV</span>
              </button>
            </div>

            <!-- Header Controls & User Session -->
            <div class="header-actions">
              ${user ? `
                <div class="profile-pill" data-action="open-auth-modal" title="Logged in as ${user.name} (${user.role})">
                  <div class="profile-avatar">${user.name[0]}</div>
                  <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.1;">
                    <span>${user.name.split(' ')[0]}</span>
                    <span style="font-size: 0.68rem; color: var(--text-muted);">${user.rollNumber || user.role}</span>
                  </div>
                </div>
                <button class="action-icon-btn" data-action="logout-user" title="Sign Out">
                  <span style="font-size: 0.85rem;">🚪</span>
                </button>
              ` : `
                <button class="add-btn" style="padding: 0.4rem 0.95rem; font-size: 0.8rem;" data-action="open-auth-modal">
                  <span>Sign In</span>
                </button>
              `}

              <button class="action-icon-btn" data-action="toggle-sound" title="${SoundFX.enabled ? 'Mute Chimes' : 'Unmute Chimes'}">
                <span>${SoundFX.enabled ? '🔔' : '🔕'}</span>
              </button>

              <button class="action-icon-btn" data-action="toggle-theme" title="Toggle Theme">
                <span>${State.theme === 'light' ? '🌙' : '☀️'}</span>
              </button>

              <button class="cart-btn" data-action="toggle-cart">
                <span>🛒</span>
                <span>Tray</span>
                ${cartItemCount > 0 ? `<span class="cart-badge">${cartItemCount}</span>` : ''}
              </button>
            </div>
          </div>
        </header>
      `;
    },

    renderRushBanner() {
      if (!State.rushHour.isPaused) return '';

      return `
        <div class="rush-hour-banner">
          <span>⚠️</span>
          <div>
            <strong>Kitchen Rush Hour Pause:</strong> ${State.rushHour.pauseReason} 
            (Estimated resumption: ~${State.rushHour.resumesInMinutes} mins)
          </div>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Floating Quick-Tracker Pill (When progress modal is closed)
    // ------------------------------------------------------------------------
    renderFloatingOrderPill() {
      if (State.activeTrackingOrder) return ''; // Modal is currently open

      // Find user's latest active order
      const roll = State.currentUser?.rollNumber;
      const myActive = State.orders.find(o => 
        (o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready') &&
        (!roll || o.studentRoll === roll)
      );

      if (!myActive) return '';

      return `
        <div 
          style="position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 85; background: var(--bg-surface); border: 2px solid var(--accent-primary); border-radius: var(--radius-full); padding: 0.65rem 1.25rem; display: flex; align-items: center; gap: 0.75rem; box-shadow: var(--shadow-lg); cursor: pointer; animation: ready-pop 0.5s ease;"
          data-action="track-order"
          data-id="${myActive.id}"
          title="Click to view live progress pass"
        >
          <div class="pulse-dot"></div>
          <div>
            <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; color: var(--accent-primary);">
              Active Order In Kitchen
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--text-main);">
              Token <strong>${myActive.token}</strong> • ${myActive.status}
            </div>
          </div>
          <span style="font-size: 0.85rem; background: var(--accent-primary-subtle); color: var(--accent-primary-text); padding: 0.2rem 0.5rem; border-radius: var(--radius-full); font-weight: 800;">
            View Pass →
          </span>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Student Dashboard View
    // ------------------------------------------------------------------------
    renderStudentView() {
      const activeOrders = State.orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');
      const servingOrder = State.orders.find(o => o.status === 'Ready');
      const waitTime = calculateWaitEstimate();

      let filteredMenu = State.menu;
      if (State.activeCategory !== 'All') {
        filteredMenu = filteredMenu.filter(item => item.category === State.activeCategory);
      }
      if (State.activeDiet !== 'All') {
        filteredMenu = filteredMenu.filter(item => item.diet === State.activeDiet || (State.activeDiet === 'Quick' && item.prepTime <= 8));
      }
      if (State.searchQuery.trim()) {
        const q = State.searchQuery.toLowerCase();
        filteredMenu = filteredMenu.filter(item =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        );
      }

      const categories = ['All', 'Wraps & Rolls', 'Campus Bowls', 'Breakfast & Bites', 'Beverages', 'Healthy Greens', 'Sweet Treats'];

      return `
        <!-- Campus Hero Banner -->
        <section class="campus-hero">
          <div class="hero-content">
            <div class="hero-tag">
              <span>✦</span>
              <span>Campus Pre-Ordering Experience</span>
            </div>
            <h1 class="hero-title">Artisanal Food on your Campus</h1>
            <p class="hero-desc">
              Beat the college lunch rush. Order ahead from your classroom or dorm, 
              receive your smart digital token, and pick up hot food without standing in line.
            </p>
          </div>

          <!-- Live Queue Snapshot Card -->
          <div class="queue-snapshot-card">
            <div class="snapshot-header">
              <span class="snapshot-title">Live Canteen Queue</span>
              <div class="snapshot-indicator">
                <span class="pulse-dot"></span>
                <span>Counter Live</span>
              </div>
            </div>
            <div class="snapshot-stats-row">
              <div class="stat-metric-item">
                <span class="stat-metric-label">Estimated Wait</span>
                <span class="stat-metric-val">~${waitTime} min</span>
              </div>
              <div class="stat-metric-item">
                <span class="stat-metric-label">Active Orders</span>
                <span class="stat-metric-val">${activeOrders.length}</span>
              </div>
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-light); padding-top: 0.6rem; display: flex; justify-content: space-between;">
              <span>Now Serving:</span>
              <strong style="color: var(--accent-primary); font-family: var(--font-serif); font-size: 1rem;">${servingOrder ? servingOrder.token : 'All Cleared'}</strong>
            </div>
          </div>
        </section>

        <!-- Search and Filters Section -->
        <section class="filter-section">
          <div class="search-and-diets">
            <div class="search-input-wrap">
              <span class="search-icon">🔍</span>
              <input 
                type="text" 
                class="search-input" 
                placeholder="Search wraps, bowls, chai, sourdough melts..." 
                value="${State.searchQuery}"
                data-action="search-query"
              />
            </div>

            <div class="diet-pills">
              <button class="diet-pill-btn ${State.activeDiet === 'All' ? 'active' : ''}" data-action="filter-diet" data-diet="All">All Diets</button>
              <button class="diet-pill-btn ${State.activeDiet === 'Veg' ? 'active' : ''}" data-action="filter-diet" data-diet="Veg">Veg</button>
              <button class="diet-pill-btn ${State.activeDiet === 'Vegan' ? 'active' : ''}" data-action="filter-diet" data-diet="Vegan">Vegan</button>
              <button class="diet-pill-btn ${State.activeDiet === 'Non-Veg' ? 'active' : ''}" data-action="filter-diet" data-diet="Non-Veg">Non-Veg</button>
              <button class="diet-pill-btn ${State.activeDiet === 'Quick' ? 'active' : ''}" data-action="filter-diet" data-diet="Quick">⚡ Under 8 Mins</button>
            </div>
          </div>

          <div class="category-tabs-scroll">
            ${categories.map(cat => `
              <button 
                class="category-tab-btn ${State.activeCategory === cat ? 'active' : ''}" 
                data-action="filter-category" 
                data-category="${cat}"
              >
                ${cat}
              </button>
            `).join('')}
          </div>
        </section>

        <!-- Menu Catalog Grid -->
        <section class="menu-grid">
          ${filteredMenu.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3.5rem; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
              <p style="font-family: var(--font-serif); font-size: 1.35rem; font-weight: 700;">No culinary items found</p>
              <p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 0.25rem;">Try adjusting your search query or dietary preference.</p>
            </div>
          ` : filteredMenu.map(item => this.renderMenuCard(item)).join('')}
        </section>
      `;
    },

    renderMenuCard(item) {
      const inCartQty = State.cart[item.id] || 0;
      const isSoldOut = !item.isAvailable;

      return `
        <div class="menu-card ${isSoldOut ? 'is-sold-out' : ''}">
          <div class="card-img-wrap">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="card-img" 
              loading="lazy" 
              onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'"
            />
            
            <div class="card-badge-top-left">
              ${item.tag ? `<span class="pill-tag">${item.tag}</span>` : ''}
              <span class="pill-diet">${item.diet}</span>
            </div>

            <div class="card-prep-tag">
              <span>⏱️</span>
              <span>${item.prepTime} min</span>
            </div>
          </div>

          <div class="card-body">
            <span class="card-category-label">${item.category}</span>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-desc">${item.description}</p>
            
            <div class="card-footer">
              <div class="price-box">
                <span class="price-currency">${formatINR(item.price)}</span>
                <span class="price-unit">${item.calories}</span>
              </div>

              ${isSoldOut ? `
                <button class="add-btn" disabled>
                  <span>Sold Out</span>
                </button>
              ` : inCartQty === 0 ? `
                <button 
                  class="add-btn" 
                  data-action="add-to-cart" 
                  data-id="${item.id}"
                >
                  <span>+ Add to Tray</span>
                </button>
              ` : `
                <div class="qty-counter-pill">
                  <button class="qty-step-btn" data-action="decrement-cart" data-id="${item.id}">−</button>
                  <span>${inCartQty}</span>
                  <button class="qty-step-btn" data-action="increment-cart" data-id="${item.id}">+</button>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Kitchen Admin Dashboard View
    // ------------------------------------------------------------------------
    renderKitchenAdminView() {
      const orders = State.orders;
      const totalRev = orders.filter(o => o.status === 'Ready' || o.status === 'Collected')
                             .reduce((sum, o) => sum + o.totalAmount, 0);
      const activePending = orders.filter(o => o.status === 'Pending');
      const activePreparing = orders.filter(o => o.status === 'Preparing');
      const activeReady = orders.filter(o => o.status === 'Ready');
      const activeAll = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing');

      let displayedOrders = orders;
      if (State.kitchenFilter === 'all_active') {
        displayedOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready');
      } else if (State.kitchenFilter === 'Pending') {
        displayedOrders = activePending;
      } else if (State.kitchenFilter === 'Preparing') {
        displayedOrders = activePreparing;
      } else if (State.kitchenFilter === 'Ready') {
        displayedOrders = activeReady;
      } else if (State.kitchenFilter === 'Completed') {
        displayedOrders = orders.filter(o => o.status === 'Collected');
      }

      return `
        <section class="admin-metrics-grid">
          <div class="metric-card">
            <span class="metric-label">Today's Revenue</span>
            <span class="metric-number">${formatINR(totalRev)}</span>
            <span class="metric-sub">${orders.length} orders saved in database</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Queue Backlog</span>
            <span class="metric-number">${activeAll.length}</span>
            <span class="metric-sub">${activePending.length} pending • ${activePreparing.length} on stove</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Ready at Counter</span>
            <span class="metric-number">${activeReady.length}</span>
            <span class="metric-sub">Awaiting student pickup</span>
          </div>
          <div class="metric-card">
            <span class="metric-label">Avg Prep Time</span>
            <span class="metric-number">~11 min</span>
            <span class="metric-sub">Well within SLA</span>
          </div>
        </section>

        <!-- Rush Hour Controller -->
        <section class="rush-control-box">
          <div class="rush-status-info">
            <div class="rush-status-indicator ${State.rushHour.isPaused ? 'paused' : 'open'}"></div>
            <div>
              <div class="rush-status-heading">
                Kitchen Intake: ${State.rushHour.isPaused ? 'PAUSED (Rush Hour)' : 'ACTIVE (Accepting Orders)'}
              </div>
              <div class="rush-status-caption">
                ${State.rushHour.isPaused 
                  ? 'New student orders are paused to let chefs catch up.' 
                  : 'Students can place orders without restriction.'}
              </div>
            </div>
          </div>

          <div>
            ${State.rushHour.isPaused ? `
              <button class="rush-toggle-btn btn-resume" data-action="toggle-rush-pause" data-set="false">
                <span>▶ Resume Order Intake</span>
              </button>
            ` : `
              <button class="rush-toggle-btn btn-pause" data-action="toggle-rush-pause" data-set="true">
                <span>⏸️ Pause Orders (Rush Hour)</span>
              </button>
            `}
          </div>
        </section>

        <!-- Kitchen Tabs -->
        <div class="kitchen-nav-tabs">
          <button class="kitchen-nav-btn ${State.kitchenSubTab === 'orders' ? 'active' : ''}" data-action="kitchen-subtab" data-tab="orders">
            📋 Live Ticket Board (${activeAll.length + activeReady.length})
          </button>
          <button class="kitchen-nav-btn ${State.kitchenSubTab === 'menu' ? 'active' : ''}" data-action="kitchen-subtab" data-tab="menu">
            🍲 Menu & Stock Manager
          </button>
        </div>

        ${State.kitchenSubTab === 'orders' ? this.renderKitchenOrdersBoard(displayedOrders) : ''}
        ${State.kitchenSubTab === 'menu' ? this.renderKitchenMenuManager() : ''}
      `;
    },

    renderKitchenOrdersBoard(ordersList) {
      return `
        <div class="orders-flow-grid">
          ${ordersList.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg);">
              <p style="font-weight: 700; font-size: 1.1rem;">No orders in this state</p>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Kitchen board is up to date.</p>
            </div>
          ` : ordersList.map(ord => this.renderOrderTicket(ord)).join('')}
        </div>
      `;
    },

    renderOrderTicket(order) {
      const statusClass = order.status.toLowerCase();

      return `
        <div class="order-ticket">
          <div class="ticket-header">
            <div>
              <span class="ticket-token">${order.token}</span>
              <div class="ticket-time">${timeAgo(order.createdAt)} • ${order.counter || 'Counter 1'}</div>
            </div>
            <span class="status-pill ${statusClass}">${order.status}</span>
          </div>

          <div class="ticket-customer-row">
            <strong>${order.studentName}</strong>
            <span style="font-family: var(--font-mono); font-size: 0.78rem;">${order.studentRoll}</span>
          </div>

          <div class="ticket-items-list">
            ${order.items.map(item => `
              <div class="ticket-item">
                <div>
                  <span class="ticket-item-qty">${item.quantity}×</span>
                  <span>${item.name}</span>
                </div>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${formatINR(item.price * item.quantity)}</span>
              </div>
            `).join('')}
          </div>

          ${order.specialInstructions ? `
            <div class="ticket-note-quote">
              "${order.specialInstructions}"
            </div>
          ` : ''}

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.92rem; font-weight: 700; border-top: 1px solid var(--border-light); padding-top: 0.6rem;">
            <span>Total Value:</span>
            <span style="font-family: var(--font-serif); font-size: 1.1rem;">${formatINR(order.totalAmount)}</span>
          </div>

          <div class="ticket-actions-row">
            ${order.status === 'Pending' ? `
              <button class="ticket-action-btn btn-advance" data-action="update-status" data-id="${order.id}" data-status="Preparing">
                <span>Start Preparing →</span>
              </button>
            ` : order.status === 'Preparing' ? `
              <button class="ticket-action-btn btn-advance" data-action="update-status" data-id="${order.id}" data-status="Ready">
                <span>Mark Ready 🔔</span>
              </button>
            ` : order.status === 'Ready' ? `
              <button class="ticket-action-btn btn-advance" data-action="update-status" data-id="${order.id}" data-status="Collected">
                <span>Mark Collected ✓</span>
              </button>
            ` : `
              <span style="font-size: 0.82rem; color: var(--text-muted); padding: 0.4rem;">Order Completed</span>
            `}
          </div>
        </div>
      `;
    },

    renderKitchenMenuManager() {
      return `
        <div style="background: var(--bg-surface); border: 1px solid var(--border-light); border-radius: var(--radius-lg); overflow: hidden;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
            <thead>
              <tr style="background: var(--bg-surface-alt); border-bottom: 1px solid var(--border-light);">
                <th style="padding: 1rem 1.25rem;">Culinary Item</th>
                <th style="padding: 1rem 1.25rem;">Category</th>
                <th style="padding: 1rem 1.25rem;">Diet</th>
                <th style="padding: 1rem 1.25rem;">Prep Time</th>
                <th style="padding: 1rem 1.25rem;">Price</th>
                <th style="padding: 1rem 1.25rem;">Live Stock Control</th>
              </tr>
            </thead>
            <tbody>
              ${State.menu.map(item => `
                <tr style="border-bottom: 1px solid var(--border-light);">
                  <td style="padding: 1rem 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.85rem;">
                      <img src="${item.image}" alt="" style="width: 44px; height: 44px; border-radius: var(--radius-md); object-fit: cover;" />
                      <div>
                        <div style="font-weight: 700;">${item.name}</div>
                        <div style="font-size: 0.76rem; color: var(--text-muted);">${item.calories}</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1rem 1.25rem;">${item.category}</td>
                  <td style="padding: 1rem 1.25rem;"><span class="pill-diet" style="background: var(--bg-surface-alt); color: var(--text-main); border: 1px solid var(--border-light);">${item.diet}</span></td>
                  <td style="padding: 1rem 1.25rem;">${item.prepTime} min</td>
                  <td style="padding: 1rem 1.25rem; font-weight: 700; font-family: var(--font-serif);">${formatINR(item.price)}</td>
                  <td style="padding: 1rem 1.25rem;">
                    <button 
                      class="add-btn" 
                      style="font-size: 0.78rem; padding: 0.35rem 0.85rem; border-color: ${item.isAvailable ? 'var(--border-medium)' : 'var(--border-strong)'};"
                      data-action="toggle-stock"
                      data-id="${item.id}"
                    >
                      ${item.isAvailable ? '● In Stock' : '✕ Sold Out'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Counter TV Board View
    // ------------------------------------------------------------------------
    renderCounterTVView() {
      const prepOrders = State.orders.filter(o => o.status === 'Preparing');
      const readyOrders = State.orders.filter(o => o.status === 'Ready');

      return `
        <div class="counter-tv-container">
          <div class="tv-header-bar">
            <div>
              <h2 class="serif-heading" style="font-size: 1.6rem; font-weight: 800;">CanteenX Counter TV Board</h2>
              <span style="font-size: 0.82rem; color: var(--text-muted);">Please wait for your token to illuminate in the Ready column before approaching Counter 1 or 2.</span>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 1.35rem; font-weight: 700; color: var(--accent-primary); font-family: var(--font-mono);">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <span style="font-size: 0.74rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px;">Counter Station Sync</span>
            </div>
          </div>

          <div class="tv-columns-grid">
            <div class="tv-column-card">
              <div class="tv-col-header">
                <div>
                  <h3 class="tv-col-title" style="color: var(--status-prep-text);">🍳 NOW PREPARING</h3>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Culinary preparation in progress</span>
                </div>
                <span class="status-pill preparing">${prepOrders.length} in queue</span>
              </div>
              <div class="tv-token-grid">
                ${prepOrders.length === 0 ? `
                  <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
                    No orders currently being prepared
                  </div>
                ` : prepOrders.map(o => `
                  <div class="tv-token-item prep-token">
                    <div>${o.token}</div>
                    <div style="font-size: 0.72rem; font-weight: 700; margin-top: 0.35rem; font-family: var(--font-sans);">${o.counter}</div>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="tv-column-card">
              <div class="tv-col-header">
                <div>
                  <h3 class="tv-col-title" style="color: var(--status-ready-text);">🔔 READY FOR PICKUP</h3>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">Collect at designated station</span>
                </div>
                <span class="status-pill ready">${readyOrders.length} ready</span>
              </div>
              <div class="tv-token-grid">
                ${readyOrders.length === 0 ? `
                  <div style="grid-column: 1 / -1; padding: 2rem; text-align: center; color: var(--text-muted);">
                    No orders awaiting pickup
                  </div>
                ` : readyOrders.map(o => `
                  <div class="tv-token-item ready-token">
                    <div>${o.token}</div>
                    <div style="font-size: 0.76rem; font-weight: 800; margin-top: 0.35rem; font-family: var(--font-sans);">${o.counter}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // User Authentication & Registration Modal
    // ------------------------------------------------------------------------
    renderAuthModal() {
      if (!State.isAuthModalOpen) return '';

      const isLogin = State.authMode === 'login';

      return `
        <div class="modal-backdrop open" data-action="close-auth-modal">
          <div class="order-modal" style="max-width: 440px;" onclick="event.stopPropagation()">
            <div class="order-modal-header">
              <div style="font-weight: 800; font-family: var(--font-serif); font-size: 1.15rem;">
                ${isLogin ? 'Sign In to CanteenX' : 'Create Campus Account'}
              </div>
              <button class="action-icon-btn" data-action="close-auth-modal" title="Close">✕</button>
            </div>

            <!-- Tab Switcher -->
            <div style="display: flex; border-bottom: 1px solid var(--border-light); background: var(--bg-surface-alt);">
              <button 
                class="view-tab-btn ${isLogin ? 'active' : ''}" 
                style="flex: 1; border-radius: 0; justify-content: center; padding: 0.75rem;"
                data-action="set-auth-mode" 
                data-mode="login"
              >
                Existing Account
              </button>
              <button 
                class="view-tab-btn ${!isLogin ? 'active' : ''}" 
                style="flex: 1; border-radius: 0; justify-content: center; padding: 0.75rem;"
                data-action="set-auth-mode" 
                data-mode="register"
              >
                New Student / Staff
              </button>
            </div>

            <div style="padding: 1.5rem 1.75rem; display: flex; flex-direction: column; gap: 1rem;">
              ${State.authError ? `
                <div style="background: var(--status-prep-bg); color: var(--status-prep-text); padding: 0.6rem 0.85rem; border-radius: var(--radius-md); font-size: 0.8rem; font-weight: 700;">
                  ${State.authError}
                </div>
              ` : ''}

              ${!isLogin ? `
                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">Full Name</label>
                  <input type="text" id="reg-name" class="search-input" style="padding: 0.6rem 0.85rem;" placeholder="e.g. Aarav Sharma" required />
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">Roll Number / Campus ID</label>
                  <input type="text" id="reg-roll" class="search-input" style="padding: 0.6rem 0.85rem;" placeholder="e.g. CS-2024-042" required />
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                  <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">Account Role</label>
                  <select id="reg-role" class="search-input" style="padding: 0.6rem 0.85rem;">
                    <option value="student">Student</option>
                    <option value="kitchen_staff">Kitchen Staff</option>
                  </select>
                </div>
              ` : ''}

              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">Email Address</label>
                <input type="email" id="auth-email" class="search-input" style="padding: 0.6rem 0.85rem;" placeholder="your.name@campus.edu" required />
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.35rem;">
                <label style="font-size: 0.78rem; font-weight: 700; color: var(--text-muted);">Password</label>
                <input type="password" id="auth-password" class="search-input" style="padding: 0.6rem 0.85rem;" placeholder="••••••••" required />
              </div>

              <button 
                class="checkout-btn" 
                style="margin-top: 0.5rem;"
                data-action="submit-auth"
              >
                ${isLogin ? 'Sign In to Campus Tray' : 'Register Account'}
              </button>

              <!-- Quick 1-Click Demo Profiles for testing -->
              <div style="border-top: 1px solid var(--border-light); padding-top: 1rem; margin-top: 0.5rem; text-align: center;">
                <div style="font-size: 0.74rem; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;">
                  Quick Testing Accounts
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                  <button 
                    class="add-btn" 
                    style="font-size: 0.75rem; padding: 0.35rem 0.75rem;"
                    data-action="quick-demo-login"
                    data-role="student"
                  >
                    👤 Aarav (Student)
                  </button>
                  <button 
                    class="add-btn" 
                    style="font-size: 0.75rem; padding: 0.35rem 0.75rem;"
                    data-action="quick-demo-login"
                    data-role="chef"
                  >
                    👨‍🍳 Chef Vikram (Staff)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Order Progress Modal (Effortlessly Dismissable)
    // ------------------------------------------------------------------------
    renderOrderTrackingModal() {
      const order = State.activeTrackingOrder;
      if (!order) return '';

      const steps = [
        { key: 'Pending', label: 'Received' },
        { key: 'Preparing', label: 'Preparing' },
        { key: 'Ready', label: 'Ready for Pickup' },
        { key: 'Collected', label: 'Collected' }
      ];

      const stepIndexMap = { 'Pending': 0, 'Preparing': 1, 'Ready': 2, 'Collected': 3 };
      const currentIdx = stepIndexMap[order.status] ?? 0;
      const progressPct = (currentIdx / (steps.length - 1)) * 100;

      let message = 'Your order is recorded in the kitchen database. Chefs will begin cooking shortly.';
      if (order.status === 'Preparing') {
        message = 'Chefs are currently cooking your meal at the counter station!';
      } else if (order.status === 'Ready') {
        message = `🛎️ Order is READY! Please head to ${order.counter} with your token number.`;
      } else if (order.status === 'Collected') {
        message = 'Order collected! Enjoy your campus meal.';
      }

      return `
        <!-- Clicking backdrop closes the progress modal -->
        <div class="modal-backdrop open" data-action="close-order-modal">
          <div class="order-modal" onclick="event.stopPropagation()">
            <div class="order-modal-header">
              <div style="font-weight: 800; font-size: 0.98rem; font-family: var(--font-serif);">
                Live Digital Token Pass
              </div>
              <!-- Prominent Close Button -->
              <button 
                class="action-icon-btn" 
                data-action="close-order-modal" 
                title="Close and return to menu"
                style="background: var(--bg-surface); font-weight: 800;"
              >
                ✕
              </button>
            </div>

            <div class="token-hero-badge">
              <div class="token-big-label">Your Digital Token</div>
              <div class="token-big-number">${order.token}</div>
              <div class="token-pickup-station">
                Collection Point: <strong>${order.counter}</strong>
              </div>
            </div>

            <div class="stepper-wrap">
              <div class="stepper-track">
                <div class="stepper-line">
                  <div class="stepper-line-progress" style="width: ${progressPct}%;"></div>
                </div>

                ${steps.map((st, idx) => {
                  const isDone = idx < currentIdx;
                  const isActive = idx === currentIdx;
                  return `
                    <div class="step-node ${isDone ? 'completed' : ''} ${isActive ? 'active' : ''}">
                      <div class="step-bubble">
                        ${isDone ? '✓' : idx + 1}
                      </div>
                      <span class="step-label">${st.label}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="step-message-box">
                <span style="font-size: 1.35rem;">ℹ️</span>
                <div class="step-message-text">${message}</div>
              </div>
            </div>

            <div style="padding: 0 1.75rem 1.25rem; max-height: 180px; overflow-y: auto;">
              <div style="font-size: 0.76rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.6px;">
                Summary • ${order.studentName} (${order.studentRoll})
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                ${order.items.map(it => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                    <span>${it.quantity}× ${it.name}</span>
                    <span style="font-family: var(--font-serif); font-weight: 700;">${formatINR(it.price * it.quantity)}</span>
                  </div>
                `).join('')}
              </div>
              ${order.specialInstructions ? `
                <div style="margin-top: 0.65rem; font-size: 0.8rem; color: var(--text-muted); font-style: italic;">
                  Note: "${order.specialInstructions}"
                </div>
              ` : ''}
              <div style="margin-top: 0.85rem; padding-top: 0.65rem; border-top: 1px solid var(--border-light); display: flex; justify-content: space-between; font-weight: 700; font-size: 1rem;">
                <span>Total Paid:</span>
                <span style="font-family: var(--font-serif); font-size: 1.15rem;">${formatINR(order.totalAmount)}</span>
              </div>
            </div>

            <!-- Big, prominent action button to close modal and return to menu -->
            <div style="padding: 1.15rem 1.75rem; border-top: 1px solid var(--border-light); background: var(--bg-surface-alt); text-align: center;">
              <button 
                class="checkout-btn" 
                style="width: 100%; justify-content: center;"
                data-action="close-order-modal"
              >
                ✓ Done • Return to Menu
              </button>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.5rem;">
                You can reopen your token pass anytime from the bottom-right corner.
              </div>
            </div>
          </div>
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Cart Drawer
    // ------------------------------------------------------------------------
    renderCartDrawer() {
      const cartKeys = Object.keys(State.cart);
      const itemsInCart = cartKeys.map(id => {
        const item = State.menu.find(m => m.id === id);
        return item ? { ...item, quantity: State.cart[id] } : null;
      }).filter(Boolean);

      const subtotal = itemsInCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const waitEstimate = calculateWaitEstimate();

      return `
        <div class="drawer-backdrop ${State.isCartOpen ? 'open' : ''}" data-action="close-cart"></div>
        <div class="cart-drawer ${State.isCartOpen ? 'open' : ''}">
          <div class="drawer-header">
            <h2 class="drawer-title">
              <span>🛒</span>
              <span>Your Campus Tray (${itemsInCart.length})</span>
            </h2>
            <button class="action-icon-btn" data-action="close-cart">✕</button>
          </div>

          <div class="drawer-body">
            ${itemsInCart.length === 0 ? `
              <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🥗</div>
                <p style="font-family: var(--font-serif); font-weight: 700; font-size: 1.2rem; color: var(--text-main);">Your tray is currently empty</p>
                <p style="font-size: 0.88rem; margin-top: 0.25rem;">Browse the campus menu and add your favorite bites!</p>
              </div>
            ` : `
              <div class="cart-items-list">
                ${itemsInCart.map(item => `
                  <div class="cart-item-row">
                    <div class="cart-item-info">
                      <div class="cart-item-name">${item.name}</div>
                      <div class="cart-item-sub">${formatINR(item.price)} each • ⏱️ ${item.prepTime} min</div>
                    </div>

                    <div class="qty-counter-pill">
                      <button class="qty-step-btn" data-action="decrement-cart" data-id="${item.id}">−</button>
                      <span>${item.quantity}</span>
                      <button class="qty-step-btn" data-action="increment-cart" data-id="${item.id}">+</button>
                    </div>

                    <div class="cart-item-price">
                      ${formatINR(item.price * item.quantity)}
                    </div>
                  </div>
                `).join('')}
              </div>

              <div class="cart-instruction-wrap">
                <label class="cart-instruction-label">Kitchen Notes / Customization</label>
                <textarea 
                  class="cart-instruction-input" 
                  rows="2" 
                  placeholder="e.g. Extra spicy, no onions, separate chutney..."
                  data-action="cart-instructions"
                >${State.cartInstructions}</textarea>
              </div>

              <div class="cart-estimate-box">
                <span style="font-size: 1.35rem;">⏱️</span>
                <div class="cart-estimate-text">
                  <strong>Estimated Wait Time: ~${waitEstimate} mins</strong><br/>
                  Based on ${State.orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length} active orders ahead in kitchen queue.
                </div>
              </div>
            `}
          </div>

          ${itemsInCart.length > 0 ? `
            <div class="drawer-footer">
              <div class="cart-subtotal-row">
                <span>Subtotal</span>
                <span>${formatINR(subtotal)}</span>
              </div>
              <div class="cart-subtotal-row">
                <span>Campus Subsidized Packaging</span>
                <span style="color: var(--accent-primary); font-weight: 700;">₹0 (Complimentary)</span>
              </div>
              <div class="cart-total-row">
                <span>Total Amount</span>
                <span>${formatINR(subtotal)}</span>
              </div>

              <button 
                class="checkout-btn" 
                data-action="checkout-order"
                ${State.rushHour.isPaused ? 'disabled' : ''}
              >
                ${State.rushHour.isPaused ? '⏸️ Kitchen Paused - Cannot Checkout' : `Confirm Order • ${formatINR(subtotal)}`}
              </button>
            </div>
          ` : ''}
        </div>
      `;
    },

    // ------------------------------------------------------------------------
    // Event Handlers & Clicks Delegation
    // ------------------------------------------------------------------------
    attachEvents() {
      const searchInput = this.root.querySelector('[data-action="search-query"]');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          State.searchQuery = e.target.value;
          this.render();
          const nextInput = this.root.querySelector('[data-action="search-query"]');
          if (nextInput) {
            nextInput.focus();
            nextInput.setSelectionRange(nextInput.value.length, nextInput.value.length);
          }
        });
      }

      const instructionsInput = this.root.querySelector('[data-action="cart-instructions"]');
      if (instructionsInput) {
        instructionsInput.addEventListener('input', (e) => {
          State.cartInstructions = e.target.value;
        });
      }

      this.root.onclick = async (e) => {
        const target = e.target.closest('[data-action]');
        if (!target) return;

        const action = target.getAttribute('data-action');

        switch (action) {
          case 'switch-view': {
            State.activeView = target.getAttribute('data-view');
            this.render();
            break;
          }

          case 'toggle-theme': {
            State.toggleTheme();
            break;
          }

          case 'toggle-sound': {
            SoundFX.enabled = !SoundFX.enabled;
            if (SoundFX.enabled) SoundFX.play('placed');
            this.render();
            break;
          }

          case 'open-auth-modal': {
            State.isAuthModalOpen = true;
            State.authError = '';
            this.render();
            break;
          }

          case 'close-auth-modal': {
            State.isAuthModalOpen = false;
            this.render();
            break;
          }

          case 'set-auth-mode': {
            State.authMode = target.getAttribute('data-mode');
            State.authError = '';
            this.render();
            break;
          }

          case 'logout-user': {
            State.logout();
            break;
          }

          case 'quick-demo-login': {
            const role = target.getAttribute('data-role');
            if (role === 'chef') {
              State.saveUser({
                name: 'Chef Vikram',
                email: 'chef@canteenx.edu',
                rollNumber: 'STAFF-01',
                role: 'kitchen_staff'
              });
              State.activeView = 'kitchen';
            } else {
              State.saveUser({
                name: 'Aarav Sharma',
                email: 'aarav@campus.edu',
                rollNumber: 'CS-2024-042',
                role: 'student'
              });
              State.activeView = 'student';
            }
            State.isAuthModalOpen = false;
            this.render();
            break;
          }

          case 'submit-auth': {
            const emailInput = document.getElementById('auth-email');
            const pwInput = document.getElementById('auth-password');
            const email = emailInput ? emailInput.value.trim() : '';
            const password = pwInput ? pwInput.value : '';

            if (!email || !password) {
              State.authError = 'Please enter both email and password.';
              this.render();
              return;
            }

            if (State.authMode === 'login') {
              try {
                const res = await fetch('/api/auth/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (data.success) {
                  State.saveUser(data.user);
                  State.isAuthModalOpen = false;
                  State.authError = '';
                  this.render();
                  return;
                } else {
                  State.authError = data.message || 'Invalid credentials.';
                  this.render();
                  return;
                }
              } catch (err) {
                // Local fallback authentication
                State.saveUser({
                  name: email.split('@')[0],
                  email: email,
                  rollNumber: 'CS-LOCAL',
                  role: email.includes('chef') ? 'kitchen_staff' : 'student'
                });
                State.isAuthModalOpen = false;
                this.render();
              }
            } else {
              // Register
              const nameInput = document.getElementById('reg-name');
              const rollInput = document.getElementById('reg-roll');
              const roleSelect = document.getElementById('reg-role');
              const name = nameInput ? nameInput.value.trim() : '';
              const roll = rollInput ? rollInput.value.trim() : 'CS-GUEST';
              const role = roleSelect ? roleSelect.value : 'student';

              if (!name) {
                State.authError = 'Please enter your full name.';
                this.render();
                return;
              }

              try {
                const res = await fetch('/api/auth/register', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name, email, rollNumber: roll, password, role })
                });
                const data = await res.json();
                if (data.success) {
                  State.saveUser(data.user);
                  State.isAuthModalOpen = false;
                  State.authError = '';
                  this.render();
                  return;
                } else {
                  State.authError = data.message || 'Registration failed.';
                  this.render();
                  return;
                }
              } catch (err) {
                State.saveUser({ name, email, rollNumber: roll, role });
                State.isAuthModalOpen = false;
                this.render();
              }
            }
            break;
          }

          case 'filter-category': {
            State.activeCategory = target.getAttribute('data-category');
            this.render();
            break;
          }

          case 'filter-diet': {
            State.activeDiet = target.getAttribute('data-diet');
            this.render();
            break;
          }

          case 'toggle-cart': {
            State.isCartOpen = !State.isCartOpen;
            this.render();
            break;
          }

          case 'close-cart': {
            State.isCartOpen = false;
            this.render();
            break;
          }

          case 'add-to-cart':
          case 'increment-cart': {
            const id = target.getAttribute('data-id');
            State.cart[id] = (State.cart[id] || 0) + 1;
            SoundFX.play('placed');
            this.render();
            break;
          }

          case 'decrement-cart': {
            const id = target.getAttribute('data-id');
            if (State.cart[id] > 1) {
              State.cart[id] -= 1;
            } else {
              delete State.cart[id];
            }
            this.render();
            break;
          }

          case 'checkout-order': {
            if (State.rushHour.isPaused) {
              alert('Kitchen order intake is currently paused due to rush hour capacity.');
              return;
            }

            if (!State.currentUser) {
              State.isAuthModalOpen = true;
              State.authError = 'Please sign in or create an account to confirm your order.';
              this.render();
              return;
            }

            const cartKeys = Object.keys(State.cart);
            if (cartKeys.length === 0) return;

            const orderItems = cartKeys.map(id => {
              const item = State.menu.find(m => m.id === id);
              return {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: State.cart[id]
              };
            });

            const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const token = `#CX-${State.tokenSequence}`;
            State.tokenSequence += 1;

            const newOrder = {
              id: `ord-${Date.now()}`,
              token: token,
              studentName: State.currentUser.name,
              studentRoll: State.currentUser.rollNumber,
              items: orderItems,
              totalAmount: total,
              status: 'Pending',
              estimatedWaitMinutes: calculateWaitEstimate(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              specialInstructions: State.cartInstructions.trim(),
              counter: State.tokenSequence % 2 === 0 ? 'Counter 1' : 'Counter 2'
            };

            // Attempt saving to backend database
            try {
              fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
              });
            } catch (e) {}

            State.orders.unshift(newOrder);
            State.cart = {};
            State.cartInstructions = '';
            State.isCartOpen = false;
            State.activeTrackingOrder = newOrder;

            State.saveOrders();
            SoundFX.play('placed');
            this.render();
            break;
          }

          case 'track-order': {
            const ordId = target.getAttribute('data-id');
            const found = State.orders.find(o => o.id === ordId);
            if (found) {
              State.activeTrackingOrder = found;
              this.render();
            }
            break;
          }

          case 'close-order-modal': {
            State.activeTrackingOrder = null;
            this.render();
            break;
          }

          case 'kitchen-subtab': {
            State.kitchenSubTab = target.getAttribute('data-tab');
            this.render();
            break;
          }

          case 'update-status': {
            const ordId = target.getAttribute('data-id');
            const newStatus = target.getAttribute('data-status');
            const ord = State.orders.find(o => o.id === ordId);
            if (ord) {
              ord.status = newStatus;
              ord.updatedAt = new Date().toISOString();
              
              try {
                fetch(`/api/orders/${ordId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: newStatus })
                });
              } catch (e) {}

              State.saveOrders();
              if (newStatus === 'Ready') {
                SoundFX.play('ready');
              } else {
                SoundFX.play('placed');
              }
              this.render();
            }
            break;
          }

          case 'toggle-stock': {
            const itemId = target.getAttribute('data-id');
            const item = State.menu.find(m => m.id === itemId);
            if (item) {
              item.isAvailable = !item.isAvailable;
              try {
                fetch(`/api/menu/${itemId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ isAvailable: item.isAvailable })
                });
              } catch (e) {}

              State.saveMenu();
              SoundFX.play('alert');
              this.render();
            }
            break;
          }

          case 'toggle-rush-pause': {
            const shouldPause = target.getAttribute('data-set') === 'true';
            State.rushHour.isPaused = shouldPause;
            State.rushHour.pausedUntil = shouldPause ? new Date(Date.now() + 15 * 60000).toISOString() : null;
            State.saveRushHour();
            SoundFX.play('alert');
            this.render();
            break;
          }
        }
      };
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  window.CanteenXApp = App;
  window.CanteenXState = State;
})();
