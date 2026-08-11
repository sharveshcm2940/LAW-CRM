const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { generateTokens, REFRESH_SECRET } = require('../middleware/auth');
const logAudit = require('../middleware/auditLogger');

const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const loginIdentifier = email || username;

    if (!loginIdentifier || !password) {
      return res.status(400).json({ error: 'Username/Email and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginIdentifier },
          { email: `${loginIdentifier}@lexos.in` },
        ],
      },
      include: { firm: true, clients: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated' });
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Store refresh token in DB
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    await logAudit(user.id, 'LOGIN', 'User', user.id, 'Successful login via JWT', req);

    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const savedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!savedToken || savedToken.expiresAt < new Date()) {
      if (savedToken) {
        await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      }
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    try {
      jwt.verify(refreshToken, REFRESH_SECRET);
    } catch (e) {
      await prisma.refreshToken.delete({ where: { id: savedToken.id } });
      return res.status(401).json({ error: 'Invalid refresh token verification' });
    }

    // Delete old refresh token (rotation)
    await prisma.refreshToken.delete({ where: { id: savedToken.id } });

    const newTokens = generateTokens(savedToken.userId, savedToken.user.role);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.refreshToken.create({
      data: {
        token: newTokens.refreshToken,
        userId: savedToken.userId,
        expiresAt: newExpiresAt,
      },
    });

    res.json({
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Server error refreshing token' });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    if (req.user) {
      await logAudit(req.user.id, 'LOGOUT', 'User', req.user.id, 'User logged out', req);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Logout error' });
  }
};

const getMe = async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json({ user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, role: true, email: true } },
      },
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

const toggleMfa = async (req, res) => {
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { mfaEnabled: !req.user.mfaEnabled },
    });
    res.json({ message: `MFA set to ${updated.mfaEnabled}`, mfaEnabled: updated.mfaEnabled });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle MFA' });
  }
};

module.exports = {
  login,
  refresh,
  logout,
  getMe,
  getAuditLogs,
  toggleMfa,
};
