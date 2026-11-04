// Shared role-based access control for the serverless API.
// Tokens are stateless HMAC-signed values: base64url(payload).base64url(signature).
// Set SESSION_SECRET in production; the dev fallback is only for local use.
const crypto = require('crypto');
const { getDb } = require('./_db');

const ROLES = { STUDENT: 'student', STAFF: 'kitchen_staff' };
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

if (!process.env.SESSION_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[canteenx] SESSION_SECRET is not set - using an insecure default. Set it in your environment.');
}
const SECRET = process.env.SESSION_SECRET || 'canteenx-dev-secret-change-me';

// Used only when no MONGODB_URI is configured (users live in memory, like orders/menu).
const memoryUsers = [];

const b64 = (buf) => Buffer.from(buf).toString('base64url');
const sign = (payload) => b64(crypto.createHmac('sha256', SECRET).update(payload).digest());

function issueToken(userId) {
  const payload = b64(JSON.stringify({ sub: userId, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

function verifyToken(token) {
  if (typeof token !== 'string' || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expected = sign(payload);
  const a = Buffer.from(sig || '');
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.exp > Date.now() ? data.sub : null;
  } catch (e) {
    return null;
  }
}

async function findUserById(id) {
  const db = await getDb();
  if (db) return db.collection('users').findOne({ id }, { projection: { _id: 0, passwordHash: 0 } });
  const u = memoryUsers.find(x => x.id === id);
  return u ? { ...u, passwordHash: undefined } : null;
}

// Returns the signed-in user (role read fresh from storage) or null.
async function getUser(req) {
  const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  if (!header.startsWith('Bearer ')) return null;
  const id = verifyToken(header.slice(7).trim());
  return id ? findUserById(id) : null;
}

// Resolves the user and enforces allowed roles. On failure it sends 401/403 and returns null.
async function requireRole(req, res, ...roles) {
  const user = await getUser(req);
  if (!user) {
    res.status(401).json({ success: false, message: 'Authentication required' });
    return null;
  }
  if (roles.length && !roles.includes(user.role)) {
    res.status(403).json({ success: false, message: 'You do not have permission to do that' });
    return null;
  }
  return user;
}

module.exports = { ROLES, issueToken, getUser, requireRole, findUserById, memoryUsers };
