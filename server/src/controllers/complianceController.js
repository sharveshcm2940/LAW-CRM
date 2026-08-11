const prisma = require('../config/db');

const STATUTORY_RULES = [
  { act: 'Limitation Act 1963', section: 'Art 113', description: 'Suit for breach of contract / civil damages', statutoryDays: 1095, category: 'Civil' },
  { act: 'Limitation Act 1963', section: 'Art 116', description: 'Appeal to High Court from lower court decree', statutoryDays: 90, category: 'Appeals' },
  { act: 'Negotiable Instruments Act 1881', section: 'Sec 138 / Sec 142', description: 'Statutory demand notice after cheque dishonour memo', statutoryDays: 30, category: 'Criminal NI Act' },
  { act: 'Arbitration and Conciliation Act 1996', section: 'Sec 34(3)', description: 'Filing application for setting aside Arbitral Award', statutoryDays: 90, category: 'Arbitration' },
  { act: 'Insolvency & Bankruptcy Code 2016', section: 'Sec 61', description: 'Appeal to NCLAT against NCLT order', statutoryDays: 30, category: 'Corporate / IBC' },
];

const STATE_COURT_FEE_RATES = {
  Delhi: { adValoremBasePercent: 1.25, maxFee: 200000, fixedPetitionFee: 500, vakalatnamaFee: 15 },
  Maharashtra: { adValoremBasePercent: 2.0, maxFee: 300000, fixedPetitionFee: 1000, vakalatnamaFee: 25 },
  Karnataka: { adValoremBasePercent: 2.5, maxFee: 250000, fixedPetitionFee: 750, vakalatnamaFee: 20 },
  TamilNadu: { adValoremBasePercent: 3.0, maxFee: 400000, fixedPetitionFee: 800, vakalatnamaFee: 20 },
  UttarPradesh: { adValoremBasePercent: 1.75, maxFee: 150000, fixedPetitionFee: 400, vakalatnamaFee: 10 },
};

const getLimitationAlerts = async (req, res) => {
  try {
    const alerts = await prisma.limitationAlert.findMany({
      include: {
        case: { select: { id: true, caseNumber: true, title: true, courtName: true, status: true } },
      },
      orderBy: { deadlineDate: 'asc' },
    });
    res.json({ alerts, statutoryRules: STATUTORY_RULES });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch limitation alerts' });
  }
};

const createLimitationAlert = async (req, res) => {
  try {
    const { caseId, actName, section, triggerEvent, triggerDate, statutoryDays, notes } = req.body;
    const trigDate = new Date(triggerDate);
    const days = parseInt(statutoryDays || 90);
    const deadlineDate = new Date(trigDate.getTime() + days * 24 * 60 * 60 * 1000);

    const alert = await prisma.limitationAlert.create({
      data: {
        caseId,
        actName,
        section,
        triggerEvent,
        triggerDate: trigDate,
        statutoryDays: days,
        deadlineDate,
        alertStatus: 'NORMAL',
        notes,
      },
    });

    res.status(201).json(alert);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create limitation alert' });
  }
};

const calculateCourtFee = async (req, res) => {
  try {
    const { state, claimAmount, suitType } = req.query;
    const stateName = state || 'Delhi';
    const amount = parseFloat(claimAmount || 0);

    const rates = STATE_COURT_FEE_RATES[stateName] || STATE_COURT_FEE_RATES.Delhi;

    let courtFee = rates.fixedPetitionFee;
    if (suitType === 'MONEY_SUIT' || amount > 0) {
      const calculated = (amount * rates.adValoremBasePercent) / 100;
      courtFee = Math.min(Math.max(calculated, rates.fixedPetitionFee), rates.maxFee);
    }

    res.json({
      state: stateName,
      claimAmount: amount,
      suitType: suitType || 'MONEY_SUIT',
      adValoremPercent: `${rates.adValoremBasePercent}%`,
      calculatedCourtFee: Math.round(courtFee),
      vakalatnamaStampFee: rates.vakalatnamaFee,
      advocateWelfareFundStamp: 25,
      totalStampDuty: Math.round(courtFee) + rates.vakalatnamaFee + 25,
    });
  } catch (err) {
    res.status(500).json({ error: 'Court fee calculation failed' });
  }
};

const getBarCouncilRegistry = async (req, res) => {
  try {
    const lawyers = await prisma.user.findMany({
      where: { role: { in: ['PARTNER', 'ASSOCIATE'] } },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        barCouncilNo: true,
        phone: true,
        isActive: true,
      },
    });

    const registry = lawyers.map(l => ({
      ...l,
      stateBarCouncil: l.barCouncilNo?.startsWith('D/') ? 'Bar Council of Delhi' : 'Bar Council of Maharashtra & Goa',
      copVerified: true,
      copValidity: '31-DEC-2028',
      status: 'ACTIVE_PRACTITIONER',
    }));

    res.json(registry);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Bar Council registry' });
  }
};

const getDpdpSettings = async (req, res) => {
  try {
    res.json({
      act: 'Digital Personal Data Protection Act 2023 (DPDP)',
      dataFiduciary: 'LexOS Chambers & Partners',
      retentionPolicyMonths: 84, // 7 years as per Bar Council & Tax rules
      clientConsentEnabled: true,
      encryptionAtRest: 'AES-256-GCM',
      rightToErasureSupported: true,
      auditLogRetentionDays: 365,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch DPDP compliance settings' });
  }
};

module.exports = {
  getLimitationAlerts,
  createLimitationAlert,
  calculateCourtFee,
  getBarCouncilRegistry,
  getDpdpSettings,
};
