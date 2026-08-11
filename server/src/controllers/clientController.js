const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const getClients = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'CLIENT') {
      where = { userId: req.user.id };
    }

    const clients = await prisma.client.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cases: {
          select: { id: true, caseNumber: true, title: true, status: true, caseType: true, courtName: true },
        },
        invoices: {
          select: { id: true, invoiceNumber: true, totalAmount: true, status: true, netPayable: true },
        },
      },
    });

    res.json(clients);
  } catch (err) {
    console.error('getClients error:', err);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            leadLawyer: { select: { fullName: true, email: true } },
            hearings: { orderBy: { hearingDate: 'desc' }, take: 5 },
          },
        },
        invoices: { orderBy: { issueDate: 'desc' } },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch client details' });
  }
};

const createClient = async (req, res) => {
  try {
    const { clientType, name, companyName, email, phone, pan, gstNo, cin, address, kycStatus, kycDetails } = req.body;

    const newClient = await prisma.client.create({
      data: {
        clientType: clientType || 'INDIVIDUAL',
        name,
        companyName,
        email,
        phone,
        pan,
        gstNo,
        cin,
        address,
        kycStatus: kycStatus || 'VERIFIED',
        kycDetails: typeof kycDetails === 'object' ? JSON.stringify(kycDetails) : kycDetails,
      },
    });

    await logAudit(req.user.id, 'CREATE_CLIENT', 'Client', newClient.id, `Created client ${newClient.name}`, req);

    res.status(201).json(newClient);
  } catch (err) {
    console.error('createClient error:', err);
    res.status(500).json({ error: 'Failed to create client' });
  }
};

const conflictSearch = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim().length < 2) {
      return res.json({ matches: [], conflictFound: false });
    }

    const searchTerm = query.trim().toLowerCase();

    // 1. Search existing clients
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { companyName: { contains: searchTerm } },
          { pan: { contains: searchTerm } },
          { gstNo: { contains: searchTerm } },
        ],
      },
      select: { id: true, name: true, companyName: true, clientType: true },
    });

    // 2. Search opposing parties & opposing counsel in existing cases
    const cases = await prisma.case.findMany({
      where: {
        OR: [
          { opposingParty: { contains: searchTerm } },
          { opposingCounsel: { contains: searchTerm } },
          { title: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        opposingParty: true,
        opposingCounsel: true,
        client: { select: { name: true } },
      },
    });

    const matches = [
      ...clients.map(c => ({
        type: 'EXISTING_CLIENT',
        name: c.companyName ? `${c.name} (${c.companyName})` : c.name,
        details: `Already registered as ${c.clientType} client.`,
      })),
      ...cases.map(cs => ({
        type: 'OPPOSING_PARTY_OR_COUNSEL',
        name: `Case: ${cs.title} (${cs.caseNumber})`,
        details: `Opposing Party: ${cs.opposingParty || 'N/A'} | Counsel: ${cs.opposingCounsel || 'N/A'} (Representing client: ${cs.client?.name})`,
      })),
    ];

    await logAudit(req.user.id, 'CONFLICT_SEARCH', 'Client', null, `Executed conflict search query: "${query}"`, req);

    res.json({
      query: searchTerm,
      conflictFound: matches.length > 0,
      matchesCount: matches.length,
      matches,
    });
  } catch (err) {
    console.error('conflictSearch error:', err);
    res.status(500).json({ error: 'Conflict search failed' });
  }
};

const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

const createLead = async (req, res) => {
  try {
    const { name, companyName, phone, email, practiceArea, stage, estimatedValue, notes } = req.body;
    const lead = await prisma.lead.create({
      data: {
        name,
        companyName,
        phone,
        email,
        practiceArea: practiceArea || 'Litigation',
        stage: stage || 'NEW',
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        notes,
      },
    });
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create lead' });
  }
};

const updateLeadStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;
    const updated = await prisma.lead.update({
      where: { id },
      data: { stage },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
};

const convertLeadToClientAndCase = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await prisma.lead.findUnique({ where: { id } });

    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    // 1. Create Client record
    const client = await prisma.client.create({
      data: {
        clientType: lead.companyName ? 'CORPORATE' : 'INDIVIDUAL',
        name: lead.name,
        companyName: lead.companyName || null,
        email: lead.email,
        phone: lead.phone,
        kycStatus: 'PENDING',
        notes: lead.notes,
      },
    });

    // 2. Create Initial Case record
    const caseNumber = `MAT-${Date.now().toString().slice(-6)}/${new Date().getFullYear()}`;
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title: `${lead.name} - ${lead.practiceArea} Matter`,
        caseType: (lead.practiceArea || 'CIVIL').toUpperCase(),
        status: 'FILED',
        courtName: 'District & Sessions Court',
        description: lead.notes || `Matter initialized from lead conversion of ${lead.name}`,
        filingDate: new Date(),
        clientId: client.id,
        leadLawyerId: req.user.id,
        firmId: req.user.firmId,
      },
    });

    // 3. Mark lead as CONVERTED
    await prisma.lead.update({
      where: { id },
      data: { stage: 'CONVERTED' },
    });

    await logAudit(req.user.id, 'CONVERT_LEAD', 'Lead', id, `Converted lead ${lead.name} to Client (${client.id}) & Case (${newCase.id})`, req);

    res.json({
      success: true,
      message: 'Lead converted successfully',
      client,
      case: newCase,
    });
  } catch (err) {
    console.error('convertLeadToClientAndCase error:', err);
    res.status(500).json({ error: 'Failed to convert lead' });
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  conflictSearch,
  getLeads,
  createLead,
  updateLeadStage,
  convertLeadToClientAndCase,
};

