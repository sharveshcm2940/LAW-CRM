const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const getCases = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'CLIENT') {
      const userClients = await prisma.client.findMany({
        where: { userId: req.user.id },
        select: { id: true },
      });
      const clientIds = userClients.map(c => c.id);
      where = { clientId: { in: clientIds } };
    }

    const { status, caseType, search } = req.query;
    if (status) where.status = status;
    if (caseType) where.caseType = caseType;
    if (search) {
      where.OR = [
        { caseNumber: { contains: search } },
        { cnrNumber: { contains: search } },
        { title: { contains: search } },
        { courtName: { contains: search } },
        { opposingParty: { contains: search } },
      ];
    }

    const cases = await prisma.case.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, companyName: true, email: true, phone: true } },
        leadLawyer: { select: { id: true, fullName: true, role: true, email: true } },
        hearings: { orderBy: { hearingDate: 'asc' } },
        tasks: { select: { id: true, title: true, status: true, dueDate: true } },
        documents: { select: { id: true, title: true, isClientVisible: true } },
        limitationAlerts: true,
      },
    });

    res.json(cases);
  } catch (err) {
    console.error('getCases error:', err);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
};

const getCaseById = async (req, res) => {
  try {
    const { id } = req.params;

    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        client: true,
        leadLawyer: { select: { id: true, fullName: true, email: true, phone: true, barCouncilNo: true } },
        firm: { select: { name: true, address: true, gstNo: true } },
        hearings: { orderBy: { hearingDate: 'desc' } },
        documents: {
          orderBy: { createdAt: 'desc' },
          include: { uploadedBy: { select: { fullName: true } } },
        },
        tasks: {
          orderBy: { dueDate: 'asc' },
          include: { assignedTo: { select: { fullName: true } } },
        },
        timesheets: {
          orderBy: { date: 'desc' },
          include: { user: { select: { fullName: true } } },
        },
        invoices: { orderBy: { issueDate: 'desc' } },
        limitationAlerts: { orderBy: { deadlineDate: 'asc' } },
        parentCase: { select: { id: true, caseNumber: true, title: true } },
        childCases: { select: { id: true, caseNumber: true, title: true, status: true } },
      },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Filter non-client visible docs if user is CLIENT
    if (req.user.role === 'CLIENT') {
      caseItem.documents = caseItem.documents.filter(d => d.isClientVisible);
    }

    await logAudit(req.user.id, 'READ_CASE', 'Case', caseItem.id, `Viewed case ${caseItem.caseNumber}`, req);

    res.json(caseItem);
  } catch (err) {
    console.error('getCaseById error:', err);
    res.status(500).json({ error: 'Failed to fetch case details' });
  }
};

const createCase = async (req, res) => {
  try {
    const {
      caseNumber,
      cnrNumber,
      title,
      caseType,
      status,
      courtName,
      judgeName,
      opposingParty,
      opposingCounsel,
      description,
      filingDate,
      clientId,
      leadLawyerId,
      parentCaseId,
    } = req.body;

    const lawyerId = leadLawyerId || req.user.id;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        cnrNumber: cnrNumber || null,
        title,
        caseType: caseType || 'CIVIL',
        status: status || 'UNDER_TRIAL',
        courtName,
        judgeName,
        opposingParty,
        opposingCounsel,
        description,
        filingDate: filingDate ? new Date(filingDate) : new Date(),
        clientId,
        leadLawyerId: lawyerId,
        firmId: req.user.firmId,
        parentCaseId: parentCaseId || null,
      },
    });

    await logAudit(req.user.id, 'CREATE_CASE', 'Case', newCase.id, `Created case ${newCase.caseNumber}: ${newCase.title}`, req);

    res.status(201).json(newCase);
  } catch (err) {
    console.error('createCase error:', err);
    res.status(500).json({ error: 'Failed to create case' });
  }
};

const updateCase = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    if (updateData.filingDate) updateData.filingDate = new Date(updateData.filingDate);

    const updated = await prisma.case.update({
      where: { id },
      data: updateData,
    });

    await logAudit(req.user.id, 'UPDATE_CASE', 'Case', id, `Updated case ${updated.caseNumber}`, req);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update case' });
  }
};

const addHearing = async (req, res) => {
  try {
    const { id: caseId } = req.params;
    const { hearingDate, purpose, summary, judgeNotes, nextSteps, status } = req.body;

    const hearing = await prisma.hearing.create({
      data: {
        caseId,
        hearingDate: new Date(hearingDate),
        purpose,
        summary,
        judgeNotes,
        nextSteps,
        status: status || 'SCHEDULED',
      },
    });

    // Update case status if adjourned or trial stage modified
    if (status === 'ADJOURNED') {
      await prisma.case.update({
        where: { id: caseId },
        data: { status: 'ADJOURNED' },
      });
    }

    await logAudit(req.user.id, 'ADD_HEARING', 'Hearing', hearing.id, `Added hearing date for case ID ${caseId}`, req);

    res.status(201).json(hearing);
  } catch (err) {
    console.error('addHearing error:', err);
    res.status(500).json({ error: 'Failed to add hearing date' });
  }
};

const getHearings = async (req, res) => {
  try {
    const hearings = await prisma.hearing.findMany({
      orderBy: { hearingDate: 'asc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
            courtName: true,
            judgeName: true,
            client: { select: { name: true } },
            leadLawyer: { select: { fullName: true } },
          },
        },
      },
    });
    res.json(hearings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch master hearing schedule' });
  }
};

const exportICal = async (req, res) => {
  try {
    const hearings = await prisma.hearing.findMany({
      include: { case: { select: { title: true, courtName: true, caseNumber: true } } },
    });

    let icsContent = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LexOS Law CRM//Legal Calendar//EN\r\n`;

    hearings.forEach(h => {
      const dt = new Date(h.hearingDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      icsContent += `BEGIN:VEVENT\r\nSUMMARY:Court Hearing: ${h.case?.title || 'Legal Matter'}\r\nDESCRIPTION:Case Number: ${h.case?.caseNumber || 'N/A'}\\nPurpose: ${h.purpose || 'Proceedings'}\r\nLOCATION:${h.case?.courtName || 'Courtroom'}\r\nDTSTART:${dt}\r\nDTEND:${dt}\r\nEND:VEVENT\r\n`;
    });

    icsContent += `END:VCALENDAR`;

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', 'attachment; filename="lexos_hearings.ics"');
    res.send(icsContent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to export iCal calendar' });
  }
};

module.exports = {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  addHearing,
  getHearings,
  exportICal,
};

