const express = require('express');
const router = express.Router();

const { verifyToken } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const authCtrl = require('../controllers/authController');
const clientCtrl = require('../controllers/clientController');
const caseCtrl = require('../controllers/caseController');
const docCtrl = require('../controllers/documentController');
const billCtrl = require('../controllers/billingController');
const compCtrl = require('../controllers/complianceController');
const repCtrl = require('../controllers/reportController');
const taskCtrl = require('../controllers/taskController');
const aiCtrl = require('../controllers/aiController');
const timelineCtrl = require('../controllers/timelineController');
const commCtrl = require('../controllers/communicationController');
const researchCtrl = require('../controllers/legalResearchController');
const esignCtrl = require('../controllers/esignController');
const bdCtrl = require('../controllers/businessDevController');

// 1. Auth & Audit
router.post('/auth/login', authCtrl.login);
router.post('/auth/refresh', authCtrl.refresh);
router.post('/auth/logout', authCtrl.logout);
router.get('/auth/me', verifyToken, authCtrl.getMe);
router.get('/auth/audit-logs', verifyToken, roleCheck(['PARTNER', 'ADMIN']), authCtrl.getAuditLogs);
router.post('/auth/toggle-mfa', verifyToken, authCtrl.toggleMfa);

// 2. Client Management & Lead Auto-Conversion
router.get('/clients', verifyToken, clientCtrl.getClients);
router.get('/clients/conflict/search', verifyToken, clientCtrl.conflictSearch);
router.get('/clients/leads', verifyToken, clientCtrl.getLeads);
router.post('/clients/leads', verifyToken, clientCtrl.createLead);
router.patch('/clients/leads/:id/stage', verifyToken, clientCtrl.updateLeadStage);
router.post('/clients/leads/:id/convert', verifyToken, roleCheck(['PARTNER', 'ASSOCIATE', 'ADMIN']), clientCtrl.convertLeadToClientAndCase);
router.get('/clients/:id', verifyToken, clientCtrl.getClientById);
router.post('/clients', verifyToken, roleCheck(['PARTNER', 'ASSOCIATE', 'ADMIN']), clientCtrl.createClient);

// 3. Case, Hearing & Timeline Management
router.get('/cases', verifyToken, caseCtrl.getCases);
router.get('/cases/hearings', verifyToken, caseCtrl.getHearings);
router.get('/cases/calendar/export.ics', verifyToken, caseCtrl.exportICal);
router.get('/cases/:caseId/timeline', verifyToken, timelineCtrl.getCaseTimeline);
router.get('/cases/:id', verifyToken, caseCtrl.getCaseById);
router.post('/cases', verifyToken, roleCheck(['PARTNER', 'ASSOCIATE', 'ADMIN']), caseCtrl.createCase);
router.patch('/cases/:id', verifyToken, roleCheck(['PARTNER', 'ASSOCIATE', 'ADMIN']), caseCtrl.updateCase);
router.post('/cases/:id/hearings', verifyToken, roleCheck(['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN']), caseCtrl.addHearing);

// 4. Task & Workflow Management
router.get('/tasks', verifyToken, taskCtrl.getTasks);
router.post('/tasks', verifyToken, taskCtrl.createTask);
router.patch('/tasks/:id/status', verifyToken, taskCtrl.updateTaskStatus);
router.patch('/tasks/:id/approval', verifyToken, roleCheck(['PARTNER', 'ADMIN']), taskCtrl.updateTaskApproval);
router.delete('/tasks/:id', verifyToken, taskCtrl.deleteTask);

// 5. AI Legal Assistant
router.post('/ai/summarize-case', verifyToken, aiCtrl.summarizeCase);
router.post('/ai/extract-entities', verifyToken, aiCtrl.extractEntities);
router.post('/ai/draft-document', verifyToken, aiCtrl.draftDocument);
router.post('/ai/ask-matter', verifyToken, aiCtrl.askMatterChatbot);
router.post('/ai/classify-enquiry', verifyToken, aiCtrl.classifyEnquiry);

// 6. Omnichannel Communications
router.get('/communications', verifyToken, commCtrl.getCommunications);
router.post('/communications', verifyToken, commCtrl.logCommunication);
router.post('/communications/send-bulk', verifyToken, roleCheck(['PARTNER', 'ADMIN']), commCtrl.sendBulkCommunication);

// 7. Legal Research & Judgments
router.get('/legal-research/search', verifyToken, researchCtrl.searchJudgments);
router.post('/legal-research/judgments', verifyToken, researchCtrl.saveJudgment);
router.patch('/legal-research/judgments/:id/link', verifyToken, researchCtrl.linkJudgmentToCase);

// 8. Document Management & E-Signatures
router.get('/documents', verifyToken, docCtrl.getDocuments);
router.post('/documents', verifyToken, docCtrl.createDocument);
router.get('/documents/templates', verifyToken, docCtrl.getTemplates);
router.post('/documents/esign', verifyToken, esignCtrl.signDocument);
router.post('/documents/generate-pdf', verifyToken, esignCtrl.generatePdf);

// 9. Billing, Retainers & Accounts
router.get('/billing/timesheets', verifyToken, billCtrl.getTimesheets);
router.post('/billing/timesheets', verifyToken, billCtrl.createTimesheet);
router.get('/billing/invoices', verifyToken, billCtrl.getInvoices);
router.get('/billing/invoices/:id', verifyToken, billCtrl.getInvoiceById);
router.post('/billing/invoices', verifyToken, roleCheck(['PARTNER', 'ACCOUNTANT', 'ADMIN']), billCtrl.createInvoice);
router.patch('/billing/invoices/:id/status', verifyToken, billCtrl.updateInvoiceStatus);
router.post('/billing/pay-stub', verifyToken, billCtrl.processPayment);

// 10. Business Development & Analytics
router.get('/business-dev/referrals', verifyToken, roleCheck(['PARTNER', 'ADMIN']), bdCtrl.getReferrals);
router.post('/business-dev/referrals', verifyToken, roleCheck(['PARTNER', 'ADMIN']), bdCtrl.createReferral);
router.get('/business-dev/campaigns', verifyToken, roleCheck(['PARTNER', 'ADMIN']), bdCtrl.getMarketingCampaigns);
router.get('/business-dev/retention', verifyToken, roleCheck(['PARTNER', 'ADMIN']), bdCtrl.getRepeatClientStats);

// 11. Compliance Utilities
router.get('/compliance/limitation', verifyToken, compCtrl.getLimitationAlerts);
router.post('/compliance/limitation', verifyToken, compCtrl.createLimitationAlert);
router.get('/compliance/court-fee', verifyToken, compCtrl.calculateCourtFee);
router.get('/compliance/bar-council', verifyToken, compCtrl.getBarCouncilRegistry);
router.get('/compliance/dpdp', verifyToken, compCtrl.getDpdpSettings);

// 12. Reports & Management Analytics
router.get('/reports/caseload', verifyToken, roleCheck(['PARTNER', 'ADMIN']), repCtrl.getCaseloadReport);
router.get('/reports/revenue', verifyToken, roleCheck(['PARTNER', 'ACCOUNTANT', 'ADMIN']), repCtrl.getRevenueReport);
router.get('/reports/aging', verifyToken, roleCheck(['PARTNER', 'ACCOUNTANT', 'ADMIN']), repCtrl.getAgingReport);

module.exports = router;
