// Vercel Serverless Function: /api/menu
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const menu = [
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
      description: 'Slow-grilled chicken breast glazed with chaat spices, pickled shallots, and garlic emulsion.',
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

  return res.status(200).json({ success: true, count: menu.length, menu });
};
