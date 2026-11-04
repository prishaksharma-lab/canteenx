// Vercel Serverless Function: /api/menu  (GET list, PATCH /api/menu/:id)
const { getDb } = require('./_db');
const { ROLES, requireRole } = require('./_auth');
const seedMenu = require('./_menuSeed');

let memoryMenu = seedMenu.map(i => ({ ...i }));

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const db = await getDb();
    const col = db ? db.collection('menu') : null;

    if (req.method === 'PATCH') {
      if (!(await requireRole(req, res, ROLES.STAFF))) return;
      const id = req.query && req.query.id;
      const { isAvailable } = req.body || {};
      if (!id || typeof isAvailable !== 'boolean') {
        return res.status(400).json({ success: false, message: 'id and boolean isAvailable required' });
      }
      if (col) {
        const r = await col.updateOne({ id }, { $set: { isAvailable } });
        if (!r.matchedCount) return res.status(404).json({ success: false, message: 'Item not found' });
      } else {
        const item = memoryMenu.find(m => m.id === id);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
        item.isAvailable = isAvailable;
      }
      return res.status(200).json({ success: true });
    }

    if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed' });

    let menu;
    if (col) {
      // Idempotent seeding: upsert by id, so concurrent cold-start requests can't insert twice.
      await col.bulkWrite(seedMenu.map(i => ({
        updateOne: { filter: { id: i.id }, update: { $setOnInsert: { ...i } }, upsert: true }
      })));
      // Clean up duplicates left by the old non-idempotent seeding, then enforce uniqueness.
      const all = await col.find({}, { projection: { _id: 1, id: 1 } }).toArray();
      const seen = new Set();
      const extras = [];
      for (const d of all) {
        if (seen.has(d.id)) extras.push(d._id);
        else seen.add(d.id);
      }
      if (extras.length) await col.deleteMany({ _id: { $in: extras } });
      await col.createIndex({ id: 1 }, { unique: true }).catch(() => {});
      menu = await col.find({}, { projection: { _id: 0 } }).toArray();
    } else {
      menu = memoryMenu;
    }
    return res.status(200).json({ success: true, count: menu.length, menu });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
