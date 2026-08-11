const prisma = require('../config/db');

const getReferrals = async (req, res) => {
  try {
    const sources = await prisma.referralSource.findMany({
      orderBy: { revenueGenerated: 'desc' },
    });

    const totalRevenue = sources.reduce((a, s) => a + s.revenueGenerated, 0);
    const totalLeads = sources.reduce((a, s) => a + s.totalLeads, 0);

    res.json({
      summary: { totalSources: sources.length, totalLeads, totalRevenue },
      sources,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch referral sources' });
  }
};

const createReferral = async (req, res) => {
  try {
    const { name, type, email, phone } = req.body;
    const source = await prisma.referralSource.create({
      data: {
        name,
        type: type || 'PARTNER_FIRM',
        email,
        phone,
      },
    });
    res.status(201).json(source);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create referral partner' });
  }
};

const getMarketingCampaigns = async (req, res) => {
  try {
    const campaigns = [
      { id: 'c1', name: 'Google Ads - Delhi High Court Commercial Suits', channel: 'PPC', leads: 24, converted: 8, cost: 45000, revenue: 1800000 },
      { id: 'c2', name: 'LinkedIn Legal Advisory Newsletter', channel: 'CONTENT', leads: 15, converted: 5, cost: 12000, revenue: 950000 },
      { id: 'c3', name: 'CA Referral Network Quarter 2', channel: 'PARTNER', leads: 9, converted: 6, cost: 0, revenue: 1200000 },
    ];

    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch marketing campaigns' });
  }
};

const getRepeatClientStats = async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      include: {
        cases: { select: { id: true } },
        invoices: { select: { netPayable: true } },
      },
    });

    const repeatClients = clients.filter(c => c.cases.length > 1);
    const repeatRatio = clients.length > 0 ? ((repeatClients.length / clients.length) * 100).toFixed(1) : 0;

    res.json({
      totalClients: clients.length,
      repeatClientsCount: repeatClients.length,
      repeatClientRatioPercent: `${repeatRatio}%`,
      topClientsByLifetimeValue: clients.map(c => ({
        id: c.id,
        name: c.companyName || c.name,
        totalCases: c.cases.length,
        lifetimeValue: c.invoices.reduce((a, i) => a + i.netPayable, 0),
      })).sort((a, b) => b.lifetimeValue - a.lifetimeValue),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate client retention metrics' });
  }
};

module.exports = {
  getReferrals,
  createReferral,
  getMarketingCampaigns,
  getRepeatClientStats,
};
