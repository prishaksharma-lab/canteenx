// Vercel Serverless Function: /api/orders
let memoryOrders = [
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    specialInstructions: 'Extra mint chutney please',
    counter: 'Counter 1'
  }
];

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ success: true, count: memoryOrders.length, orders: memoryOrders });
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const nextNum = 100 + memoryOrders.length + 1;
    const token = `#CX-${nextNum}`;

    const newOrder = {
      id: `ord-${Date.now()}`,
      token,
      studentName: body.studentName || 'Campus Student',
      studentRoll: body.studentRoll || 'CS-2024-042',
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      status: 'Pending',
      estimatedWaitMinutes: Math.max(8, 6 + (memoryOrders.length * 3)),
      specialInstructions: body.specialInstructions || '',
      counter: nextNum % 2 === 1 ? 'Counter 1' : 'Counter 2',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryOrders.unshift(newOrder);
    return res.status(201).json({ success: true, order: newOrder });
  }

  if (req.method === 'PATCH') {
    const id = (req.query && req.query.id) || '';
    const order = memoryOrders.find(o => o.id === id);
    const status = (req.body || {}).status;
    if (order && status) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
    }
    // Serverless memory is not shared between instances; the client keeps its own copy.
    return res.status(200).json({ success: true, order: order || null });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
