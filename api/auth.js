// Vercel Serverless Function: /api/auth/login and /api/auth/register
const bcrypt = require('bcryptjs');
const { getDb } = require('./_db');

const DEMO_USERS = [
  { name: 'Aarav Sharma', email: 'aarav@campus.edu', password: 'campus123', rollNumber: 'CS-2024-042', role: 'student' },
  { name: 'Head Chef', email: 'chef@canteenx.edu', password: 'chef123', rollNumber: 'STAFF-001', role: 'kitchen_staff' }
];

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, rollNumber: u.rollNumber, role: u.role, token: `token-${Date.now()}` };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { email, password, name, rollNumber, role } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const action = (req.query && req.query.action) || (req.url || '').split('?')[0].split('/').filter(Boolean).pop();
  const isRegister = action === 'register';
  const cleanEmail = String(email).toLowerCase().trim();

  try {
    const db = await getDb();

    // No database configured: keep the old permissive demo behaviour.
    if (!db) {
      return res.status(200).json({
        success: true,
        user: publicUser({
          id: `usr-${Date.now()}`,
          name: name || cleanEmail.split('@')[0],
          email: cleanEmail,
          rollNumber: rollNumber || 'CS-2024-042',
          role: role || (cleanEmail.includes('chef') ? 'kitchen_staff' : 'student')
        })
      });
    }

    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });
    if ((await users.countDocuments()) === 0) {
      await users.insertMany(DEMO_USERS.map((u, i) => ({
        id: `usr-demo-${i + 1}`, name: u.name, email: u.email, rollNumber: u.rollNumber, role: u.role,
        passwordHash: bcrypt.hashSync(u.password, 10), createdAt: new Date().toISOString()
      })));
    }

    if (isRegister) {
      if (!name) return res.status(400).json({ success: false, message: 'Name required' });
      if (await users.findOne({ email: cleanEmail })) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      const user = {
        id: `usr-${Date.now()}`, name, email: cleanEmail, rollNumber: rollNumber || 'CS-GUEST',
        role: role === 'kitchen_staff' ? 'kitchen_staff' : 'student',
        passwordHash: await bcrypt.hash(password, 10), createdAt: new Date().toISOString()
      };
      await users.insertOne({ ...user });
      return res.status(201).json({ success: true, user: publicUser(user) });
    }

    const user = await users.findOne({ email: cleanEmail });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
