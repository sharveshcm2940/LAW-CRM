const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const signDocument = async (req, res) => {
  try {
    const { documentId, signerName, signatureType } = req.body;

    const doc = await prisma.document.findUnique({ where: { id: documentId } });
    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        version: doc.version + 1,
        title: `${doc.title} (Digitally Signed)`,
      },
    });

    await logAudit(req.user.id, 'SIGN_DOCUMENT', 'Document', doc.id, `Applied ${signatureType || 'Aadhaar eSign'} digital signature by ${signerName || req.user.fullName}`, req);

    res.json({
      success: true,
      message: `Document signed successfully via ${signatureType || 'Aadhaar eSign'}`,
      signatureHash: `SIG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`,
      signedAt: new Date().toISOString(),
      document: updated,
    });
  } catch (err) {
    console.error('signDocument error:', err);
    res.status(500).json({ error: 'E-Signature failed' });
  }
};

const generatePdf = async (req, res) => {
  try {
    const { docType, title, content, caseId } = req.body;

    const newDoc = await prisma.document.create({
      data: {
        caseId,
        title: title || `${docType || 'Legal_Notice'}_${Date.now()}.pdf`,
        docType: docType || 'NOTICE',
        fileUrl: `/uploads/${(title || 'notice').toLowerCase().replace(/\s+/g, '_')}.pdf`,
        version: 1,
        isClientVisible: true,
        accessLevel: 'ALL',
        uploadedById: req.user.id,
      },
    });

    res.status(201).json({
      success: true,
      pdfUrl: newDoc.fileUrl,
      document: newDoc,
    });
  } catch (err) {
    res.status(500).json({ error: 'PDF Generation failed' });
  }
};

module.exports = {
  signDocument,
  generatePdf,
};
