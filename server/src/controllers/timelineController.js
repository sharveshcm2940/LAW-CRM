const prisma = require('../config/db');

const getCaseTimeline = async (req, res) => {
  try {
    const { caseId } = req.params;

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        client: true,
        leadLawyer: true,
        hearings: { orderBy: { hearingDate: 'asc' } },
        documents: { orderBy: { createdAt: 'asc' } },
        tasks: { orderBy: { createdAt: 'asc' } },
        invoices: { orderBy: { issueDate: 'asc' } },
        communications: { orderBy: { createdAt: 'asc' } },
        expenses: { orderBy: { date: 'asc' } },
      },
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const events = [];

    // 1. Lead / Engagement Event
    events.push({
      id: `evt-filing-${caseItem.id}`,
      timestamp: caseItem.filingDate || caseItem.createdAt,
      type: 'CASE_FILED',
      stage: 'Filing',
      title: `Matter Filed: ${caseItem.caseNumber}`,
      description: `Formal petition filed before ${caseItem.courtName}. Lead Advocate: ${caseItem.leadLawyer?.fullName || 'Assigned Counsel'}.`,
      icon: 'file-text',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      payload: { caseNumber: caseItem.caseNumber, cnr: caseItem.cnrNumber },
    });

    // 2. Hearings Events
    caseItem.hearings.forEach(h => {
      events.push({
        id: `evt-hearing-${h.id}`,
        timestamp: h.hearingDate,
        type: 'COURT_HEARING',
        stage: h.status === 'COMPLETED' ? 'Hearing Order' : 'Hearing',
        title: `Court Hearing: ${h.purpose || 'Proceedings'}`,
        description: `Status: ${h.status}. Judge Notes: ${h.judgeNotes || 'Recorded in proceedings.'}`,
        icon: 'gavel',
        badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        payload: h,
      });
    });

    // 3. Document Events
    caseItem.documents.forEach(d => {
      events.push({
        id: `evt-doc-${d.id}`,
        timestamp: d.createdAt,
        type: 'DOCUMENT_UPLOADED',
        stage: 'Filing',
        title: `Document Uploaded: ${d.title}`,
        description: `Type: ${d.docType} (Version v${d.version}). Client Access: ${d.isClientVisible ? 'Visible' : 'Restricted'}.`,
        icon: 'folder',
        badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        payload: d,
      });
    });

    // 4. Task Events
    caseItem.tasks.forEach(t => {
      events.push({
        id: `evt-task-${t.id}`,
        timestamp: t.createdAt,
        type: 'TASK_CREATED',
        stage: 'Action Item',
        title: `Task: ${t.title}`,
        description: `Priority: ${t.priority} | Status: ${t.status} | Due: ${new Date(t.dueDate).toLocaleDateString()}`,
        icon: 'check-square',
        badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        payload: t,
      });
    });

    // 5. Communications Events
    caseItem.communications.forEach(c => {
      events.push({
        id: `evt-comm-${c.id}`,
        timestamp: c.createdAt,
        type: 'COMMUNICATION',
        stage: 'Communication',
        title: `${c.channel} (${c.direction}): ${c.subject || 'Client Interaction'}`,
        description: c.body,
        icon: 'message-square',
        badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
        payload: c,
      });
    });

    // 6. Invoices & Expenses
    caseItem.invoices.forEach(i => {
      events.push({
        id: `evt-inv-${i.id}`,
        timestamp: i.issueDate,
        type: 'INVOICE_ISSUED',
        stage: 'Billing',
        title: `Invoice Issued: ${i.invoiceNumber}`,
        description: `Net Payable: INR ${i.netPayable.toLocaleString('en-IN')} (Status: ${i.status})`,
        icon: 'dollar-sign',
        badgeColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
        payload: i,
      });
    });

    // Sort all merged events in strict chronological order
    events.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    res.json({
      caseId,
      caseNumber: caseItem.caseNumber,
      title: caseItem.title,
      clientName: caseItem.client?.name,
      totalEvents: events.length,
      stages: [
        'Lead',
        'Consultation',
        'Engagement',
        'Filing',
        'Hearing 1',
        'Hearing 2',
        'Order',
        'Appeal',
        'Closure',
      ],
      events,
    });
  } catch (err) {
    console.error('getCaseTimeline error:', err);
    res.status(500).json({ error: 'Failed to build case timeline' });
  }
};

module.exports = {
  getCaseTimeline,
};
