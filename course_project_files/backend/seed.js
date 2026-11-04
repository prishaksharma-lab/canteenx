/**
 * CanteenX - Database Seeder Script (Module 6: MongoDB + Mongoose)
 * Seeds campus menu items, student credentials, and initial orders.
 * Run with: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const MenuItem = require('./models/MenuItem');
const Order = require('./models/Order');

const SAMPLE_MENU = [
  {
    name: 'Artisan Paneer Tikka Wrap',
    category: 'Wraps & Rolls',
    price: 95,
    prepTime: 10,
    isAvailable: true,
    tag: "Chef's Special",
    diet: 'Veg',
    calories: '380 kcal',
    description: 'Char-grilled cottage cheese cubes tossed in tandoori marinade, mint glaze, wrapped in toasted multigrain roti.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Mediterranean Falafel Bowl',
    category: 'Campus Bowls',
    price: 125,
    prepTime: 12,
    isAvailable: true,
    tag: 'High-Protein',
    diet: 'Vegan',
    calories: '440 kcal',
    description: 'Crisp herb falafels over warm brown rice, roasted chickpeas, heirloom tomatoes, and creamy lemon tahini.',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Smoky Grilled Chicken Kathi',
    category: 'Wraps & Rolls',
    price: 135,
    prepTime: 14,
    isAvailable: true,
    tag: 'Bestseller',
    diet: 'Non-Veg',
    calories: '490 kcal',
    description: 'Slow-grilled chicken breast glazed with chaat masala, pickled shallots, and roasted garlic emulsion.',
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Sourdough Grilled Cheese Melt',
    category: 'Breakfast & Bites',
    price: 85,
    prepTime: 8,
    isAvailable: true,
    tag: 'Quick Grab',
    diet: 'Veg',
    calories: '340 kcal',
    description: 'Aged sharp cheddar and mozzarella blended with fresh sweet basil pesto on toasted sourdough.',
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Crispy Street Samosas (2 pcs)',
    category: 'Breakfast & Bites',
    price: 40,
    prepTime: 5,
    isAvailable: true,
    tag: 'Campus Favorite',
    diet: 'Veg',
    calories: '280 kcal',
    description: 'Flaky golden hand-rolled pastry stuffed with cumin spiced potatoes & green peas, served with sweet date chutney.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Double-Brew Spiced Masala Chai',
    category: 'Beverages',
    price: 25,
    prepTime: 4,
    isAvailable: true,
    tag: 'Hot Brew',
    diet: 'Veg',
    calories: '95 kcal',
    description: 'Assam leaf tea slow-simmered with crushed ginger, green cardamom pods, and creamy fresh milk.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Iced Vanilla Cold Brew',
    category: 'Beverages',
    price: 75,
    prepTime: 5,
    isAvailable: true,
    tag: 'Chilled',
    diet: 'Veg',
    calories: '140 kcal',
    description: '16-hour steeped Arabica cold brew poured over clear ice, finished with light Madagascar vanilla foam.',
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Avocado Citrus Quinoa Bowl',
    category: 'Healthy Greens',
    price: 140,
    prepTime: 9,
    isAvailable: true,
    tag: 'Nutrient Dense',
    diet: 'Vegan',
    calories: '320 kcal',
    description: 'Organic tri-color quinoa, sliced ripe avocado, roasted pepitas, citrus pomegranate reduction.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80'
  },
  {
    name: 'Warm Roasted Walnut Brownie',
    category: 'Sweet Treats',
    price: 65,
    prepTime: 3,
    isAvailable: true,
    tag: 'Indulgent',
    diet: 'Veg',
    calories: '310 kcal',
    description: 'Fudgy Belgian dark chocolate brownie embedded with buttery toasted walnuts, served gently warmed.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=80'
  }
];

const seedData = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/canteenx';
    await mongoose.connect(mongoURI);
    console.log('[Seed] Connected to MongoDB.');

    // Clear existing collections
    await User.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seed] Cleared old collections.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('campus123', salt);

    const studentUser = await User.create({
      name: 'Aarav Sharma',
      email: 'aarav.sharma@campus.edu',
      rollNumber: 'CS-2024-042',
      password: hashedPassword,
      role: 'student'
    });

    const adminUser = await User.create({
      name: 'Chef Vikram (Kitchen Head)',
      email: 'kitchen.head@canteenx.edu',
      rollNumber: 'STAFF-01',
      password: hashedPassword,
      role: 'kitchen_staff'
    });

    console.log('[Seed] Seeded Student & Admin Users.');

    // Seed Menu Items
    const insertedMenu = await MenuItem.insertMany(SAMPLE_MENU);
    console.log(`[Seed] Seeded ${insertedMenu.length} Menu Items.`);

    // Seed Sample Orders
    await Order.create([
      {
        token: '#CX-101',
        student: studentUser._id,
        studentName: studentUser.name,
        studentRoll: studentUser.rollNumber,
        items: [
          { menuItem: insertedMenu[0]._id, name: insertedMenu[0].name, price: insertedMenu[0].price, quantity: 1 },
          { menuItem: insertedMenu[5]._id, name: insertedMenu[5].name, price: insertedMenu[5].price, quantity: 1 }
        ],
        totalAmount: 120,
        status: 'Ready',
        estimatedWaitMinutes: 10,
        specialInstructions: 'Extra mint chutney please',
        counter: 'Counter 1'
      },
      {
        token: '#CX-102',
        student: studentUser._id,
        studentName: 'Priya Nair',
        studentRoll: 'EC-2023-118',
        items: [
          { menuItem: insertedMenu[2]._id, name: insertedMenu[2].name, price: insertedMenu[2].price, quantity: 1 },
          { menuItem: insertedMenu[6]._id, name: insertedMenu[6].name, price: insertedMenu[6].price, quantity: 1 }
        ],
        totalAmount: 210,
        status: 'Preparing',
        estimatedWaitMinutes: 14,
        specialInstructions: 'Less ice in cold brew',
        counter: 'Counter 2'
      }
    ]);

    console.log('[Seed] Seeded initial orders.');
    console.log('[Seed] Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedData();
