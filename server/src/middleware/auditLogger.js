const prisma = require('../config/db');

const logAudit = async (userId, action, entity, entityId = null, details = null, req = null) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entity,
        entityId,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
      },
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = logAudit;
