import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Plus, CheckSquare, Clock, AlertTriangle, UserCheck, Calendar, Filter, Loader2 } from 'lucide-react';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await axios.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/tasks', {
        title,
        description,
        dueDate,
        priority,
      });
      setShowCreateModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { id: 'PENDING', label: 'Pending / Action Required', color: 'border-amber-500/40 text-amber-400' },
    { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-500/40 text-blue-400' },
    { id: 'COMPLETED', label: 'Completed', color: 'border-emerald-500/40 text-emerald-400' },
    { id: 'OVERDUE', label: 'Overdue / Escalated', color: 'border-red-500/40 text-red-400' },
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Task & Workflow Management</h1>
          <p className="text-xs text-neutral-400">Kanban workflow, lawyer allocations, priority deadlines, and task approval chains.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs rounded-xl flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition"
        >
          <Plus className="w-4 h-4" /> Create New Task
        </button>
      </div>

      {/* Kanban Board Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-amber-400" /> Loading task workflow board...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {columns.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div key={col.id} className="bg-[#141414] border border-white/10 rounded-2xl p-4 flex flex-col min-h-[600px]">
                
                {/* Column Header */}
                <div className={`flex items-center justify-between pb-3 mb-4 border-b ${col.color}`}>
                  <h3 className="text-sm font-semibold">{col.label}</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks Column */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colTasks.length === 0 && (
                    <div className="py-10 text-center text-xs text-neutral-600 border border-dashed border-white/5 rounded-xl">
                      No tasks in this stage
                    </div>
                  )}

                  {colTasks.map(t => (
                    <div
                      key={t.id}
                      className="bg-[#1C1C1C] border border-white/10 rounded-xl p-4 space-y-3 shadow-md hover:border-white/20 transition"
                    >
                      <div className="flex items-start justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                          t.priority === 'URGENT' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          t.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}>
                          {t.priority}
                        </span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-500" />
                          {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                      {t.description && <p className="text-[11px] text-neutral-400 line-clamp-2">{t.description}</p>}

                      {t.case && (
                        <p className="text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          {t.case.caseNumber} - {t.case.title}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                        <span className="text-neutral-400 flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-neutral-500" /> {t.assignedTo?.fullName || 'Unassigned'}
                        </span>
                        <select
                          value={t.status}
                          onChange={e => handleUpdateStatus(t.id, e.target.value)}
                          className="bg-[#121212] border border-white/10 rounded text-[10px] text-neutral-300 px-1.5 py-0.5 focus:outline-none"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="COMPLETED">Completed</option>
                          <option value="OVERDUE">Overdue</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-lg font-semibold">Create New Task</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Draft Rejoinder to Union Affidavit"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Actionable instructions for assigned advocate..."
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
