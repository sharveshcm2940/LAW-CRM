const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const getTimesheets = async (req, res) => {
  try {
    const timesheets = await prisma.timesheet.findMany({
      orderBy: { date: 'desc' },
      include: {
        case: { select: { caseNumber: true, title: true, client: { select: { name: true } } } },
        user: { select: { fullName: true, role: true, hourlyRate: true } },
      },
    });
    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
};

const createTimesheet = async (req, res) => {
  try {
    const { caseId, description, hours, isBillable, ratePerHour, date } = req.body;
    const userRate = ratePerHour || req.user.hourlyRate || 3500.0;

    const timesheet = await prisma.timesheet.create({
      data: {
        caseId,
        userId: req.user.id,
        description,
        hours: parseFloat(hours),
        ratePerHour: parseFloat(userRate),
        isBillable: isBillable !== undefined ? Boolean(isBillable) : true,
        date: date ? new Date(date) : new Date(),
      },
    });

    await logAudit(req.user.id, 'CREATE_TIMESHEET', 'Timesheet', timesheet.id, `Logged ${hours} hrs for case ID ${caseId}`, req);

    res.status(201).json(timesheet);
  } catch (err) {
    res.status(500).json({ error: 'Failed to log timesheet entry' });
  }
};

const getInvoices = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'CLIENT') {
      const userClients = await prisma.client.findMany({ where: { userId: req.user.id }, select: { id: true } });
      const clientIds = userClients.map(c => c.id);
      where.clientId = { in: clientIds };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { issueDate: 'desc' },
      include: {
        case: { select: { caseNumber: true, title: true } },
        client: { select: { id: true, name: true, companyName: true, email: true, phone: true, gstNo: true, address: true } },
        items: true,
      },
    });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        case: { select: { caseNumber: true, title: true, courtName: true } },
        client: true,
        items: true,
      },
    });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch invoice details' });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { caseId, clientId, items, dueDate, notes, isInterState } = req.body;

    let subtotal = 0;
    const itemsData = (items || []).map(item => {
      const qty = parseFloat(item.quantity || 1);
      const rate = parseFloat(item.rate || 0);
      const amt = qty * rate;
      subtotal += amt;
      return {
        description: item.description,
        sacCode: item.sacCode || '998211',
        quantity: qty,
        rate,
        amount: amt,
      };
    });

    // Indian GST calculation
    let cgst = 0, sgst = 0, igst = 0;
    if (isInterState) {
      igst = subtotal * 0.18; // 18% IGST
    } else {
      cgst = subtotal * 0.09; // 9% CGST
      sgst = subtotal * 0.09; // 9% SGST
    }

    const totalAmount = subtotal + cgst + sgst + igst;
    const tdsAmount = subtotal * 0.10; // 10% TDS Sec 194J Professional Services
    const netPayable = totalAmount - tdsAmount;

    const count = await prisma.invoice.count();
    const invoiceNumber = `LEX-2026-${String(count + 1).padStart(3, '0')}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        caseId,
        clientId,
        issueDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ISSUED',
        subtotal,
        cgst,
        sgst,
        igst,
        totalAmount,
        tdsAmount,
        netPayable,
        sacCode: '998211',
        notes: notes || 'GST Legal Professional Services Invoice',
        items: {
          create: itemsData,
        },
      },
      include: { items: true, client: true },
    });

    await logAudit(req.user.id, 'CREATE_INVOICE', 'Invoice', invoice.id, `Created GST Invoice ${invoice.invoiceNumber}`, req);

    res.status(201).json(invoice);
  } catch (err) {
    console.error('createInvoice error:', err);
    res.status(500).json({ error: 'Failed to create GST invoice' });
  }
};

const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await prisma.invoice.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update invoice status' });
  }
};

// Razorpay / PayU payment checkout simulator stub
const processPayment = async (req, res) => {
  try {
    const { invoiceId, paymentMethod, transactionRef } = req.body;
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'PAID' },
    });

    await logAudit(req.user?.id || null, 'PAYMENT_RECEIVED', 'Invoice', invoiceId, `Razorpay/PayU payment received for ${invoice.invoiceNumber}. Ref: ${transactionRef || 'RZP_STUB_998811'}`, req);

    res.json({
      success: true,
      message: `Payment of ₹${invoice.netPayable.toLocaleString('en-IN')} successfully verified via ${paymentMethod || 'Razorpay UPI/NetBanking'}.`,
      invoice: updated,
      transactionId: transactionRef || `PAY_${Date.now()}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
};

module.exports = {
  getTimesheets,
  createTimesheet,
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  processPayment,
};
