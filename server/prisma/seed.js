const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding NR Elango Law Associates database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.limitationAlert.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.timesheet.deleteMany();
  await prisma.task.deleteMany();
  await prisma.document.deleteMany();
  await prisma.hearing.deleteMany();
  await prisma.communication.deleteMany();
  await prisma.judgment.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.retainer.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.referralSource.deleteMany();
  await prisma.case.deleteMany();
  await prisma.client.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.firm.deleteMany();
  await prisma.lead.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Seed Firm
  const firm = await prisma.firm.create({
    data: {
      name: 'NR Elango Law Associates',
      regNumber: 'TN/MAD/BAR/1992/510',
      address: 'Chambers of N.R. Elango (Senior Advocate), 1st Floor, Law Chambers, High Court Buildings, Chennai 600104',
      gstNo: '33AAACN9988A1ZM',
      panNo: 'AAACN9988A',
      email: 'chambers@nrelango.in',
      phone: '+91 44 2534 8899',
    },
  });

  console.log('✅ Firm initialized:', firm.name);

  // 2. Seed Advocates & Chambers Staff
  const partnerUser = await prisma.user.create({
    data: {
      email: 'partner@nrelango.in',
      password: hashedPassword,
      fullName: 'Adv. N.R. Elango (Senior Advocate)',
      role: 'PARTNER',
      phone: '+91 98400 12345',
      barCouncilNo: 'TN/1088/1992',
      hourlyRate: 15000.0,
      firmId: firm.id,
    },
  });

  const associateUser = await prisma.user.create({
    data: {
      email: 'associate@nrelango.in',
      password: hashedPassword,
      fullName: 'Adv. S. Manoharan',
      role: 'ASSOCIATE',
      phone: '+91 98410 98765',
      barCouncilNo: 'TN/2450/2012',
      hourlyRate: 6500.0,
      firmId: firm.id,
    },
  });

  const paralegalUser = await prisma.user.create({
    data: {
      email: 'paralegal@nrelango.in',
      password: hashedPassword,
      fullName: 'K. Arumugam (Chambers Clerk)',
      role: 'PARALEGAL',
      phone: '+91 99400 11223',
      hourlyRate: 2500.0,
      firmId: firm.id,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nrelango.in',
      password: hashedPassword,
      fullName: 'R. Subramanian (Chambers Manager)',
      role: 'ADMIN',
      phone: '+91 98401 55667',
      firmId: firm.id,
    },
  });

  const accountantUser = await prisma.user.create({
    data: {
      email: 'accountant@nrelango.in',
      password: hashedPassword,
      fullName: 'V. Selvam (Finance Controller)',
      role: 'ACCOUNTANT',
      phone: '+91 97900 22334',
      firmId: firm.id,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@nrelango.in',
      password: hashedPassword,
      fullName: 'K. Ramakrishnan (Chennai Super Infra)',
      role: 'CLIENT',
      phone: '+91 98402 77889',
      firmId: firm.id,
    },
  });

  // 3. Seed Corporate & Individual Clients
  const client1 = await prisma.client.create({
    data: {
      clientType: 'CORPORATE',
      name: 'Chennai Super Infra Developers Pvt Ltd',
      companyName: 'Chennai Super Infra Developers Pvt Ltd',
      email: 'ramakrishnan@chennaisuperinfra.com',
      phone: '+91 98402 77889',
      pan: 'AAACC8888D',
      gstNo: '33AAACC8888D1Z2',
      cin: 'U45201TN2010PTC078901',
      address: 'No. 45, Mount Road, Guindy, Chennai 600032',
      kycStatus: 'VERIFIED',
      userId: clientUser.id,
      contacts: {
        create: [
          { name: 'K. Ramakrishnan', role: 'Managing Director', email: 'ramakrishnan@chennaisuperinfra.com', phone: '+91 98402 77889', isPrimary: true },
          { name: 'V. Murugan', role: 'General Counsel', email: 'murugan.v@chennaisuperinfra.com', phone: '+91 98402 11223', isPrimary: false },
        ],
      },
    },
  });

  const client2 = await prisma.client.create({
    data: {
      clientType: 'CORPORATE',
      name: 'TNEB Solar Contractors Association',
      companyName: 'TNEB Solar Contractors Association',
      email: 'secretariat@tnebsolar.org',
      phone: '+91 98405 44332',
      pan: 'AAATT4444F',
      gstNo: '33AAATT4444F1Z8',
      address: 'Anna Salai, Triplicane, Chennai 600002',
      kycStatus: 'VERIFIED',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      clientType: 'INDIVIDUAL',
      name: 'Dr. V. Sundararamachandran',
      email: 'dr.sundaram@chennaimed.in',
      phone: '+91 98408 99887',
      pan: 'ABDPS1234H',
      address: '14th Main Road, Anna Nagar West, Chennai 600040',
      kycStatus: 'VERIFIED',
    },
  });

  // 4. Seed High Court & Supreme Court Cases
  const case1 = await prisma.case.create({
    data: {
      caseNumber: 'W.P. No. 12890 of 2025',
      cnrNumber: 'TNMD010045892025',
      title: 'Chennai Super Infra vs. State of Tamil Nadu & TANGEDCO',
      caseType: 'CIVIL',
      status: 'UNDER_TRIAL',
      courtName: 'Madras High Court (First Bench)',
      judgeName: 'Hon\'ble The Chief Justice & Justice K. Kumaresh Babu',
      opposingParty: 'State of Tamil Nadu (Energy Department)',
      opposingCounsel: 'Advocate General of Tamil Nadu',
      description: 'Writ Petition under Article 226 challenging arbitrary tender disqualification and invocation of bank guarantee for Chennai Sub-station project.',
      filingDate: new Date('2025-03-12'),
      clientId: client1.id,
      leadLawyerId: partnerUser.id,
      firmId: firm.id,
    },
  });

  const case2 = await prisma.case.create({
    data: {
      caseNumber: 'S.L.P. (Crl) No. 4410 of 2026',
      cnrNumber: 'SCIN000987652026',
      title: 'TNEB Solar Association vs. Union of India (Supreme Court)',
      caseType: 'CORPORATE',
      status: 'FILED',
      courtName: 'Supreme Court of India (Courtroom 3)',
      judgeName: 'Hon\'ble Mr. Justice B.R. Gavai & Justice Prashant Kumar Mishra',
      opposingParty: 'Union of India & Ministry of New and Renewable Energy',
      opposingCounsel: 'Additional Solicitor General of India',
      description: 'Special Leave Petition challenging High Court order on solar tariff caps.',
      filingDate: new Date('2026-01-20'),
      clientId: client2.id,
      leadLawyerId: partnerUser.id,
      firmId: firm.id,
    },
  });

  const case3 = await prisma.case.create({
    data: {
      caseNumber: 'Crl. O.P. No. 8901 of 2025',
      cnrNumber: 'TNMD020089012025',
      title: 'Dr. V. Sundararamachandran vs. State (DVAC Tamil Nadu)',
      caseType: 'CRIMINAL',
      status: 'UNDER_TRIAL',
      courtName: 'Madras High Court (Madurai Bench)',
      judgeName: 'Hon\'ble Mr. Justice G. Jayachandran',
      opposingParty: 'Directorate of Vigilance and Anti-Corruption (DVAC)',
      opposingCounsel: 'State Public Prosecutor',
      description: 'Quash petition under Section 482 CrPC regarding tender evaluation committee report.',
      filingDate: new Date('2025-06-15'),
      clientId: client3.id,
      leadLawyerId: partnerUser.id,
      firmId: firm.id,
    },
  });

  // 5. Seed Hearings
  await prisma.hearing.createMany({
    data: [
      { caseId: case1.id, hearingDate: new Date('2026-08-12T10:30:00Z'), purpose: 'Arguments on Interim Stay of Tender Cancellation', judgeNotes: 'Senior Advocate N.R. Elango concluded 1st round of oral submissions.', status: 'SCHEDULED' },
      { caseId: case2.id, hearingDate: new Date('2026-08-19T11:00:00Z'), purpose: 'Admission & Stay Consideration before Supreme Court', judgeNotes: 'Notice issued to Ministry. Counter due in 2 weeks.', status: 'SCHEDULED' },
    ],
  });

  // 6. Seed Tasks
  await prisma.task.createMany({
    data: [
      { caseId: case1.id, title: 'Draft Synopsis & Note of Arguments for First Bench', description: 'Compile TANGEDCO circulars and 2024 SCC High Court precedents', assignedToId: associateUser.id, dueDate: new Date('2026-08-10'), priority: 'URGENT', status: 'IN_PROGRESS', approvalStatus: 'APPROVED' },
      { caseId: case2.id, title: 'File Index & Vakalatnama with Supreme Court Advocate-on-Record', description: 'Ensure AoR endorsement and paperbook preparation', assignedToId: paralegalUser.id, dueDate: new Date('2026-08-14'), priority: 'HIGH', status: 'PENDING', approvalStatus: 'APPROVED' },
    ],
  });

  // 7. Seed Omnichannel Communications
  await prisma.communication.createMany({
    data: [
      { caseId: case1.id, clientId: client1.id, channel: 'WHATSAPP', direction: 'OUTBOUND', subject: 'Madras High Court Listing Update', body: 'Dear Ramakrishnan ji, W.P. 12890/2025 is listed tomorrow as Item 14 before First Bench.', sender: partnerUser.fullName, recipient: client1.phone, loggedBy: partnerUser.fullName },
      { caseId: case2.id, clientId: client2.id, channel: 'EMAIL', direction: 'INBOUND', subject: 'Supreme Court SLP Draft Approved', body: 'Association board has reviewed and approved SLP grounds draft.', sender: client2.email, recipient: partnerUser.email, loggedBy: associateUser.fullName },
    ],
  });

  // 8. Seed Supreme Court & High Court Precedents
  await prisma.judgment.createMany({
    data: [
      { caseId: case1.id, title: 'Tata Cellular vs. Union of India (1994) 6 SCC 651', court: 'Supreme Court of India', citation: '(1994) 6 SCC 651', judgmentDate: new Date('1994-07-26'), summary: 'Landmark decision setting bounds of judicial review in government contracts & tenders.', tags: 'Tenders, Government Contracts, Wednesbury Unreasonableness' },
      { caseId: case2.id, title: 'PTC India Financial Services vs. Venkateswarlu (2022) 9 SCC 1', court: 'Supreme Court of India', citation: '2022 SCC OnLine SC 608', judgmentDate: new Date('2022-05-12'), summary: 'Supreme Court ruling on pledge invocation & regulatory bounds.', tags: 'Banking, Regulatory Powers' },
    ],
  });

  // 9. Seed Retainers & Expenses
  await prisma.expense.createMany({
    data: [
      { caseId: case1.id, category: 'COURT_FEE', description: 'Madras High Court Writ Petition Ad Valorem Stamp Duty', amount: 25000.0, date: new Date('2025-03-12') },
    ],
  });

  await prisma.retainer.createMany({
    data: [
      { caseId: case1.id, clientId: client1.id, initialAmount: 1000000.0, balance: 750000.0, notes: 'Annual Senior Advocate Retainer for Infrastructure & Constitutional Matters.' },
    ],
  });

  // 10. Seed Referral Sources
  await prisma.referralSource.createMany({
    data: [
      { name: 'Senior Advocate Chamber Network (Delhi & Mumbai)', type: 'PARTNER_FIRM', email: 'referrals@nrelango.in', phone: '+91 44 2534 8899', totalLeads: 18, revenueGenerated: 5500000.0 },
      { name: 'Tamil Nadu Bar Association Registry', type: 'CAMPAIGN', totalLeads: 32, revenueGenerated: 3800000.0 },
    ],
  });

  // 11. Seed Invoices & Documents
  await prisma.document.createMany({
    data: [
      { caseId: case1.id, title: 'Writ Petition under Art 226 - Final Draft', docType: 'PETITION', fileUrl: '/uploads/writ_petition_nrelango.pdf', version: 1, isClientVisible: true, uploadedById: partnerUser.id },
      { caseId: case1.id, title: 'Senior Advocate Note of Oral Arguments', docType: 'AFFIDAVIT', fileUrl: '/uploads/senior_note_arguments.pdf', version: 1, isClientVisible: true, uploadedById: partnerUser.id },
    ],
  });

  await prisma.lead.createMany({
    data: [
      { name: 'M. Karunakaran', companyName: 'Coimbatore Textile Mills LLP', phone: '+91 98422 11223', email: 'karunakaran@coimbatoretextiles.in', practiceArea: 'Corporate', source: 'REFERRAL', stage: 'NEW', estimatedValue: 750000.0, notes: 'Seeking Senior Advocate representation before NCLT Chennai Bench.' },
      { name: 'Dr. S. Meenakshi', phone: '+91 98400 99887', email: 'dr.meenakshi@gmail.com', practiceArea: 'Litigation', source: 'WEBSITE', stage: 'CONTACTED', estimatedValue: 500000.0, notes: 'High Court Property Partition Appeal.' },
    ],
  });

  console.log('🎉 Seeding completed successfully for NR Elango Law Associates!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
