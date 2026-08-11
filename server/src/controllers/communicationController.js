const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const getCommunications = async (req, res) => {
  try {
    const { caseId, clientId, leadId, channel } = req.query;
    let where = {};
    if (caseId) where.caseId = caseId;
    if (clientId) where.clientId = clientId;
    if (leadId) where.leadId = leadId;
    if (channel) where.channel = channel;

    const comms = await prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true, email: true, phone: true } },
        case: { select: { caseNumber: true, title: true } },
        lead: { select: { name: true } },
      },
    });

    res.json(comms);
  } catch (err) {
    console.error('getCommunications error:', err);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
};

const logCommunication = async (req, res) => {
  try {
    const { caseId, clientId, leadId, channel, direction, subject, body, sender, recipient } = req.body;

    const comm = await prisma.communication.create({
      data: {
        caseId: caseId || null,
        clientId: clientId || null,
        leadId: leadId || null,
        channel: channel || 'EMAIL',
        direction: direction || 'OUTBOUND',
        subject,
        body,
        sender: sender || req.user.fullName,
        recipient,
        loggedBy: req.user.fullName,
      },
      include: {
        client: { select: { name: true } },
        case: { select: { caseNumber: true } },
      },
    });

    await logAudit(req.user.id, 'LOG_COMMUNICATION', 'Communication', comm.id, `Logged ${channel} communication`, req);

    res.status(201).json(comm);
  } catch (err) {
    console.error('logCommunication error:', err);
    res.status(500).json({ error: 'Failed to log communication' });
  }
};

const sendBulkCommunication = async (req, res) => {
  try {
    const { recipientType, channel, subject, body } = req.body;

    // Fetch active clients / leads
    const clients = await prisma.client.findMany({ select: { id: true, name: true, email: true, phone: true } });

    const created = [];
    for (const c of clients) {
      const comm = await prisma.communication.create({
        data: {
          clientId: c.id,
          channel: channel || 'EMAIL',
          direction: 'OUTBOUND',
          subject: subject || 'Notice from LexOS Chambers',
          body,
          sender: req.user.fullName,
          recipient: channel === 'WHATSAPP' || channel === 'SMS' ? c.phone : c.email,
          loggedBy: req.user.fullName,
        },
      });
      created.push(comm);
    }

    await logAudit(req.user.id, 'SEND_BULK_COMMUNICATION', 'Communication', null, `Sent bulk ${channel} to ${created.length} clients`, req);

    res.status(201).json({ success: true, count: created.length });
  } catch (err) {
    console.error('sendBulkCommunication error:', err);
    res.status(500).json({ error: 'Bulk communication failed' });
  }
};

module.exports = {
  getCommunications,
  logCommunication,
  sendBulkCommunication,
};
