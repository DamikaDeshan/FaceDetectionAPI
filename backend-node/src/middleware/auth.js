import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
  const requireAuth = (process.env.REQUIRE_AUTH || 'false').toLowerCase() === 'true';
  if (!requireAuth) return next();

  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
    req.user = { id: payload.sub, ...payload };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}


