// Vercel Serverless Function: /api/auth/login and /api/auth/register
const bcrypt = require('bcryptjs');
const { getDb } = require('./_db');
const { ROLES, issueToken, memoryUsers } = require('./_auth');

const DEMO_USERS = [
  { name: 'Aarav Sharma', email: 'aarav@campus.edu', password: 'campus123', rollNumber: 'CS-2024-042', role: ROLES.STUDENT },
  { name: 'Head Chef', email: 'chef@canteenx.edu', password: 'chef123', rollNumber: 'STAFF-001', role: ROLES.STAFF }
];

function demoUserDocs() {
  return DEMO_USERS.map((u, i) => ({
    id: `usr-demo-${i + 1}`, name: u.name, email: u.email, rollNumber: u.rollNumber, role: u.role,
    passwordHash: bcrypt.hashSync(u.password, 10), createdAt: new Date().toISOString()
  }));
}

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, rollNumber: u.rollNumber, role: u.role, token: issueToken(u.id) };
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed' });

  const { email, password, name, rollNumber } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

  const action = (req.query && req.query.action) || (req.url || '').split('?')[0].split('/').filter(Boolean).pop();
  const isRegister = action === 'register';
  const cleanEmail = String(email).toLowerCase().trim();

  try {
    const db = await getDb();

    // Storage abstraction: MongoDB when configured, otherwise in-memory.
    let findByEmail, insertUser;
    if (db) {
      const users = db.collection('users');
      await users.createIndex({ email: 1 }, { unique: true });
      if ((await users.countDocuments()) === 0) await users.insertMany(demoUserDocs());
      findByEmail = (e) => users.findOne({ email: e });
      insertUser = (u) => users.insertOne({ ...u });
    } else {
      if (memoryUsers.length === 0) memoryUsers.push(...demoUserDocs());
      findByEmail = async (e) => memoryUsers.find(u => u.email === e) || null;
      insertUser = async (u) => { memoryUsers.push(u); };
    }

    if (isRegister) {
      if (!name) return res.status(400).json({ success: false, message: 'Name required' });
      if (await findByEmail(cleanEmail)) {
        return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      }
      // Self-service sign-up only ever creates students. Staff accounts are provisioned
      // by the canteen and the role is never taken from the request body.
      const user = {
        id: `usr-${Date.now()}`, name, email: cleanEmail, rollNumber: rollNumber || 'CS-GUEST',
        role: ROLES.STUDENT,
        passwordHash: await bcrypt.hash(password, 10), createdAt: new Date().toISOString()
      };
      await insertUser(user);
      return res.status(201).json({ success: true, user: publicUser(user) });
    }

    const user = await findByEmail(cleanEmail);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    return res.status(200).json({ success: true, user: publicUser(user) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
