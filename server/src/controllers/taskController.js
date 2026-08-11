const prisma = require('../config/db');
const logAudit = require('../middleware/auditLogger');

const getTasks = async (req, res) => {
  try {
    let where = {};
    if (req.user.role === 'CLIENT') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, priority, caseId } = req.query;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (caseId) where.caseId = caseId;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignedTo: { select: { id: true, fullName: true, role: true, email: true } },
        case: { select: { id: true, caseNumber: true, title: true, courtName: true } },
      },
    });

    res.json(tasks);
  } catch (err) {
    console.error('getTasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

const createTask = async (req, res) => {
  try {
    const { caseId, title, description, assignedToId, dueDate, priority, isRecurring, recurPattern, approvalStatus } = req.body;

    const task = await prisma.task.create({
      data: {
        caseId: caseId || null,
        title,
        description,
        assignedToId: assignedToId || req.user.id,
        dueDate: new Date(dueDate),
        priority: priority || 'MEDIUM',
        status: 'PENDING',
        approvalStatus: approvalStatus || 'APPROVED',
        isRecurring: !!isRecurring,
        recurPattern: recurPattern || null,
      },
      include: {
        assignedTo: { select: { fullName: true } },
        case: { select: { caseNumber: true, title: true } },
      },
    });

    await logAudit(req.user.id, 'CREATE_TASK', 'Task', task.id, `Created task "${title}"`, req);

    res.status(201).json(task);
  } catch (err) {
    console.error('createTask error:', err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: { assignedTo: { select: { fullName: true } } },
    });

    await logAudit(req.user.id, 'UPDATE_TASK', 'Task', id, `Updated task status to ${status}`, req);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task status' });
  }
};

const updateTaskApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body;

    const updated = await prisma.task.update({
      where: { id },
      data: { approvalStatus },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task approval' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTaskApproval,
  deleteTask,
};
