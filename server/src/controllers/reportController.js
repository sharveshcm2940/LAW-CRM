const prisma = require('../config/db');

const getCaseloadReport = async (req, res) => {
  try {
    const lawyers = await prisma.user.findMany({
      where: { role: { in: ['PARTNER', 'ASSOCIATE'] } },
      include: {
        casesLed: {
          select: { id: true, status: true, caseType: true },
        },
      },
    });

    const report = lawyers.map(l => {
      const activeCases = l.casesLed.filter(c => c.status !== 'DISPOSED').length;
      const disposedCases = l.casesLed.filter(c => c.status === 'DISPOSED').length;

      return {
        lawyerId: l.id,
        lawyerName: l.fullName,
        role: l.role,
        totalCases: l.casesLed.length,
        activeCases,
        disposedCases,
        civilCount: l.casesLed.filter(c => c.caseType === 'CIVIL').length,
        criminalCount: l.casesLed.filter(c => c.caseType === 'CRIMINAL').length,
        corporateCount: l.casesLed.filter(c => c.caseType === 'CORPORATE').length,
        iprCount: l.casesLed.filter(c => c.caseType === 'IPR').length,
      };
    });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate caseload report' });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        case: { select: { caseType: true } },
        client: { select: { name: true, companyName: true } },
      },
    });

    const totalBilled = invoices.reduce((acc, inv) => acc + inv.netPayable, 0);
    const totalCollected = invoices.filter(i => i.status === 'PAID').reduce((acc, inv) => acc + inv.netPayable, 0);
    const totalPending = totalBilled - totalCollected;
    const totalGst = invoices.reduce((acc, inv) => acc + (inv.cgst + inv.sgst + inv.igst), 0);
    const totalTds = invoices.reduce((acc, inv) => acc + inv.tdsAmount, 0);

    // Revenue by practice area
    const practiceAreaRevenue = {};
    invoices.forEach(inv => {
      const type = inv.case?.caseType || 'GENERAL';
      practiceAreaRevenue[type] = (practiceAreaRevenue[type] || 0) + inv.netPayable;
    });

    res.json({
      summary: {
        totalBilled,
        totalCollected,
        totalPending,
        totalGst,
        totalTds,
        invoiceCount: invoices.length,
      },
      practiceAreaRevenue,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate revenue report' });
  }
};

const getAgingReport = async (req, res) => {
  try {
    const unpaid = await prisma.invoice.findMany({
      where: { status: { in: ['ISSUED', 'PARTIAL', 'OVERDUE'] } },
      include: { client: { select: { name: true, companyName: true } }, case: { select: { title: true } } },
    });

    const now = new Date();
    const buckets = {
      current: [],     // 0-30 days
      thirtyToSixty: [], // 31-60 days
      sixtyToNinety: [], // 61-90 days
      overNinety: [],   // >90 days
    };

    unpaid.forEach(inv => {
      const diffTime = Math.abs(now - new Date(inv.dueDate));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 30) buckets.current.push(inv);
      else if (diffDays <= 60) buckets.thirtyToSixty.push(inv);
      else if (diffDays <= 90) buckets.sixtyToNinety.push(inv);
      else buckets.overNinety.push(inv);
    });

    res.json({
      summary: {
        currentTotal: buckets.current.reduce((a, b) => a + b.netPayable, 0),
        thirtyToSixtyTotal: buckets.thirtyToSixty.reduce((a, b) => a + b.netPayable, 0),
        sixtyToNinetyTotal: buckets.sixtyToNinety.reduce((a, b) => a + b.netPayable, 0),
        overNinetyTotal: buckets.overNinety.reduce((a, b) => a + b.netPayable, 0),
      },
      buckets,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate aging report' });
  }
};

module.exports = {
  getCaseloadReport,
  getRevenueReport,
  getAgingReport,
};
