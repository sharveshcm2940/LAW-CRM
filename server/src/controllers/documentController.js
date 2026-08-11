const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const TEMPLATES = [
  {
    id: 'tpl-1',
    title: 'Vakalatnama (Delhi High Court Format)',
    category: 'Pleadings & Powers',
    description: 'Standard High Court Vakalatnama authorizing advocate to act, plead and sign documents.',
    content: `IN THE HIGH COURT OF DELHI AT NEW DELHI\nVAKALATNAMA\n\nIn the matter of: [CASE TITLE]\n...\nI/We [CLIENT NAME] do hereby appoint Adv. Rajesh Sharma / Adv. Priya Nair of LexOS Chambers & Partners to appear and act for me/us...`,
  },
  {
    id: 'tpl-2',
    title: 'Legal Demand Notice u/s 138 NI Act',
    category: 'Notices',
    description: 'Statutory 15-day notice for cheque dishonour due to insufficient funds under Negotiable Instruments Act.',
    content: `BY REGISTERED AD / SPEED POST\nLEGAL NOTICE\n\nTo,\n[OPPOSING PARTY NAME]\n\nUnder instructions from our Client [CLIENT NAME], we hereby serve you this notice under Section 138 of Negotiable Instruments Act 1881...\nCheque No: [CHEQUE NO], Amount: Rs. [AMOUNT], Return Memo Date: [DATE]...`,
  },
  {
    id: 'tpl-3',
    title: 'Caveat Petition u/s 148A CPC',
    category: 'Civil Procedure',
    description: 'Pre-emptive Caveat Petition to ensure no ex-parte order is passed without prior notice to advocate.',
    content: `IN THE COURT OF THE CIVIL JUDGE / HIGH COURT\nCAVEAT PETITION NO. ___ OF 2026\n\n[CAVEATOR NAME] ... CAVEATOR\nVERSUS\n[EXPECTED PLAINTIFF] ... EXPECTED PLAINTIFF\n...`,
  },
  {
    id: 'tpl-4',
    title: 'Board Resolution for Legal Representation',
    category: 'Corporate',
    description: 'Company Board Resolution authorizing director/officer to institute and defend litigation.',
    content: `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE BOARD OF DIRECTORS MEETING OF [COMPANY NAME]\n\n"RESOLVED THAT Mr./Ms. [NAME] be and is hereby authorized to sign pleadings, affidavits, and appoint Advocates..."`,
  },
];

const getDocuments = async (req, res) => {
  try {
    const { caseId, docType, search } = req.query;
    let where = {};

    if (req.user.role === 'CLIENT') {
      where.isClientVisible = true;
      const userClients = await prisma.client.findMany({ where: { userId: req.user.id }, select: { id: true } });
      const clientIds = userClients.map(c => c.id);
      where.case = { clientId: { in: clientIds } };
    }

    if (caseId) where.caseId = caseId;
    if (docType) where.docType = docType;
    if (search) {
      where.title = { contains: search };
    }

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        case: { select: { id: true, caseNumber: true, title: true } },
        uploadedBy: { select: { fullName: true } },
      },
    });

    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

const createDocument = async (req, res) => {
  try {
    const { caseId, title, docType, fileUrl, isClientVisible, accessLevel } = req.body;

    const doc = await prisma.document.create({
      data: {
        caseId,
        title,
        docType: docType || 'OTHER',
        fileUrl: fileUrl || `/uploads/${Date.now()}_${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        isClientVisible: isClientVisible !== undefined ? Boolean(isClientVisible) : true,
        accessLevel: accessLevel || 'ALL',
        uploadedById: req.user.id,
      },
    });

    await logAudit(req.user.id, 'CREATE_DOCUMENT', 'Document', doc.id, `Uploaded document ${doc.title} for case ID ${caseId}`, req);

    res.status(201).json(doc);
  } catch (err) {
    console.error('createDocument error:', err);
    res.status(500).json({ error: 'Failed to upload document' });
  }
};

const getTemplates = async (req, res) => {
  try {
    res.json(TEMPLATES);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch legal templates' });
  }
};

module.exports = {
  getDocuments,
  createDocument,
  getTemplates,
};
