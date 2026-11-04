// Vercel Serverless Function: /api/orders  (GET list, POST create, PATCH /api/orders/:id)
const { getDb } = require('./_db');
const { ROLES, getUser, requireRole } = require('./_auth');

const ORDER_STATUSES = ['Pending', 'Preparing', 'Ready', 'Collected', 'Completed'];

// Staff see everything, students see their own orders in full, everyone else (guests,
// Counter TV) gets status-only entries without personal details.
function redact(o) {
  return { ...o, userId: undefined, studentName: '', studentRoll: '', items: [], specialInstructions: '' };
}

let memoryOrders = [];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const db = await getDb();
    const col = db ? db.collection('orders') : null;

    if (req.method === 'GET') {
      const orders = col
        ? await col.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).limit(200).toArray()
        : memoryOrders;
      const viewer = await getUser(req);
      const visible = orders.map(o => (viewer && (viewer.role === ROLES.STAFF || o.userId === viewer.id)) ? o : redact(o));
      return res.status(200).json({ success: true, count: visible.length, orders: visible });
    }

    if (req.method === 'POST') {
      const user = await requireRole(req, res, ROLES.STUDENT, ROLES.STAFF);
      if (!user) return;
      const body = req.body || {};
      const count = col ? await col.countDocuments() : memoryOrders.length;
      const nextNum = 101 + count;
      const now = new Date().toISOString();
      const order = {
        id: body.id || `ord-${Date.now()}`,
        token: `#CX-${nextNum}`,
        userId: user.id,
        // Identity comes from the verified token, not the request body
        studentName: user.name,
        studentRoll: user.rollNumber,
        items: body.items || [],
        totalAmount: body.totalAmount || 0,
        status: 'Pending',
        estimatedWaitMinutes: Math.max(8, 6 + count * 3),
        specialInstructions: body.specialInstructions || '',
        counter: nextNum % 2 === 1 ? 'Counter 1' : 'Counter 2',
        createdAt: now,
        updatedAt: now
      };
      if (col) await col.insertOne({ ...order });
      else memoryOrders.unshift(order);
      return res.status(201).json({ success: true, order });
    }

    if (req.method === 'PATCH') {
      if (!(await requireRole(req, res, ROLES.STAFF))) return;
      const id = req.query && req.query.id;
      const status = (req.body || {}).status;
      if (!id || !ORDER_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'id and a valid status required' });
      const updatedAt = new Date().toISOString();
      if (col) {
        const r = await col.updateOne({ id }, { $set: { status, updatedAt } });
        if (!r.matchedCount) return res.status(404).json({ success: false, message: 'Order not found' });
      } else {
        const o = memoryOrders.find(x => x.id === id);
        if (!o) return res.status(404).json({ success: false, message: 'Order not found' });
        o.status = status;
        o.updatedAt = updatedAt;
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
