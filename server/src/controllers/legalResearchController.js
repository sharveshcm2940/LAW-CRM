const prisma = require('../config/db');

const PRECEDENT_DATABASE = [
  {
    id: 'sc-2021-08-41',
    title: 'State of UP vs. Sudhir Kumar',
    court: 'Supreme Court of India',
    citation: '(2021) 8 SCC 41',
    judgmentDate: '2021-09-14',
    summary: 'Held that judicial review of administrative action in government tenders & concessions is permissible if action is arbitrary or tainted by mala fides.',
    tags: 'Writ Petition, Government Contracts, Administrative Law',
    linkUrl: 'https://indiankanoon.org/doc/198273641/',
  },
  {
    id: 'sc-2020-10-274',
    title: 'Internet and Mobile Association of India vs. RBI',
    court: 'Supreme Court of India',
    citation: '(2020) 10 SCC 274',
    judgmentDate: '2020-03-04',
    summary: 'Doctrine of proportionality applied to invalidate RBI circular on virtual asset escrow restrictions.',
    tags: 'Banking, Regulatory Powers, RBI Act',
    linkUrl: 'https://indiankanoon.org/doc/12345678/',
  },
  {
    id: 'dhc-2023-comm-89',
    title: 'M/s Apex Constructions vs. Delhi Development Authority',
    court: 'Delhi High Court',
    citation: '2023 SCC OnLine Del 4110',
    judgmentDate: '2023-05-18',
    summary: 'Arbitration agreement stay under Section 8 of Arbitration Act granted where contract contains mandatory arbitration clause.',
    tags: 'Arbitration Act, FIDIC, Commercial Suit',
    linkUrl: 'https://dhcourtdoc.nic.in/judgments/2023/apex.pdf',
  },
  {
    id: 'sc-1999-7-510',
    title: 'K. Bhaskaran vs. Sankaran Vaidhyan Balan',
    court: 'Supreme Court of India',
    citation: '(1999) 7 SCC 510',
    judgmentDate: '1999-09-29',
    summary: 'Jurisdiction in cheque bounce cases under Section 138 NI Act lies where notice is served and payment is demanded.',
    tags: 'NI Act, Section 138, Cheque Bounce',
    linkUrl: 'https://indiankanoon.org/doc/887766/',
  },
];

const searchJudgments = async (req, res) => {
  try {
    const { query } = req.query;
    const q = (query || '').toLowerCase();

    // 1. Search local DB judgments
    const dbJudgments = await prisma.judgment.findMany({
      include: { case: { select: { caseNumber: true, title: true } } },
    });

    // 2. Filter mock precedent database
    const matches = PRECEDENT_DATABASE.filter(j =>
      j.title.toLowerCase().includes(q) ||
      j.summary.toLowerCase().includes(q) ||
      j.tags.toLowerCase().includes(q) ||
      j.citation.toLowerCase().includes(q)
    );

    res.json({
      query: q,
      totalResults: matches.length + dbJudgments.length,
      savedJudgments: dbJudgments,
      searchResults: matches,
    });
  } catch (err) {
    console.error('searchJudgments error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
};

const saveJudgment = async (req, res) => {
  try {
    const { caseId, title, court, citation, judgmentDate, summary, linkUrl, tags } = req.body;

    const judgment = await prisma.judgment.create({
      data: {
        caseId: caseId || null,
        title,
        court: court || 'Supreme Court of India',
        citation,
        judgmentDate: judgmentDate ? new Date(judgmentDate) : new Date(),
        summary,
        linkUrl,
        tags,
      },
    });

    res.status(201).json(judgment);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save judgment precedent' });
  }
};

const linkJudgmentToCase = async (req, res) => {
  try {
    const { id } = req.params;
    const { caseId } = req.body;

    const updated = await prisma.judgment.update({
      where: { id },
      data: { caseId },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to link judgment to matter' });
  }
};

module.exports = {
  searchJudgments,
  saveJudgment,
  linkJudgmentToCase,
};
