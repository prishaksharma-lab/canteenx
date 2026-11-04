// Vercel Serverless Function: /api/auth
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { email, password, name, rollNumber, role } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = {
    id: `usr-${Date.now()}`,
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    rollNumber: rollNumber || 'CS-2024-042',
    role: role || (email.includes('chef') ? 'kitchen_staff' : 'student'),
    token: `token-${Date.now()}`
  };

  return res.status(200).json({ success: true, user });
};
