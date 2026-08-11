const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'LEXOS_ACCESS_SECRET_KEY_2026';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'LEXOS_REFRESH_SECRET_KEY_2026';

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token missing or invalid' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { firm: true, clients: true },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account is inactive or not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', expired: true });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
};

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ userId, role }, ACCESS_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId, role }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

module.exports = {
  verifyToken,
  generateTokens,
  ACCESS_SECRET,
  REFRESH_SECRET,
};
