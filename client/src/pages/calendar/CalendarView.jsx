import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Scale,
  User,
  AlertCircle,
  Plus,
  CheckCircle2,
  ListTodo,
  UserCheck,
  Tag,
  Repeat,
  Filter,
  CheckSquare,
} from 'lucide-react';
import api from '../../api/axios';

export default function CalendarView() {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'hearings'
  const [hearings, setHearings] = useState([]);
  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Draft Rebuttal Affidavit for High Court Hearing',
      caseTitle: 'M/S Apex Tech vs. Union of India',
      caseNumber: 'WP(C) 4892/2025',
      assignedTo: 'Adv. Rajesh Sharma',
      assigneeRole: 'PARTNER',
      dueDate: '2026-08-05',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      isRecurring: false,
    },
    {
      id: 'task-2',
      title: 'File GST Reconciliation Statement with NCLT Registrar',
      caseTitle: 'In Re: Global Logistics Insolvency',
      caseNumber: 'CP(IB) 112/2026',
      assignedTo: 'Adv. Priya Nair',
      assigneeRole: 'ASSOCIATE',
      dueDate: '2026-08-08',
      priority: 'HIGH',
      status: 'PENDING',
      isRecurring: true,
      recurPattern: 'MONTHLY',
    },
    {
      id: 'task-3',
      title: 'Serve Legal Demand Notice u/s 138 NI Act to Opposing Counsel',
      caseTitle: 'Sharma Exports vs. Skyline Infra',
      caseNumber: 'CC 8912/2026',
      assignedTo: 'Paralegal Amit Kumar',
      assigneeRole: 'PARALEGAL',
      dueDate: '2026-08-03',
      priority: 'URGENT',
      status: 'COMPLETED',
      isRecurring: false,
    },
    {
      id: 'task-4',
      title: 'Prepare Evidence Index & Cross-Examination Outline',
      caseTitle: 'State vs. Vikram Singh',
      caseNumber: 'CRL 402/2024',
      assignedTo: 'Adv. Rajesh Sharma',
      assigneeRole: 'PARTNER',
      dueDate: '2026-08-10',
      priority: 'MEDIUM',
      status: 'PENDING',
      isRecurring: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Task Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskFilter, setTaskFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'URGENT'
  const [newTask, setNewTask] = useState({
    title: '',
    caseTitle: 'M/S Apex Tech vs. Union of India',
    assignedTo: 'Adv. Rajesh Sharma',
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'HIGH',
    isRecurring: false,
    recurPattern: 'WEEKLY',
  });

  useEffect(() => {
    const fetchHearings = async () => {
      try {
        const res = await api.get('/cases/hearings');
        setHearings(res.data || []);
      } catch (e) {
        console.error('Failed to fetch calendar hearings:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchHearings();
  }, []);

  const handleCreateTask = (e) => {
    e.preventDefault();
    const created = {
      id: `task-${Date.now()}`,
      ...newTask,
      status: 'PENDING',
      assigneeRole: newTask.assignedTo.includes('Rajesh') ? 'PARTNER' : newTask.assignedTo.includes('Priya') ? 'ASSOCIATE' : 'PARALEGAL',
    };
    setTasks([created, ...tasks]);
    setShowTaskModal(false);
    setNewTask({
      title: '',
      caseTitle: 'M/S Apex Tech vs. Union of India',
      assignedTo: 'Adv. Rajesh Sharma',
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'HIGH',
      isRecurring: false,
      recurPattern: 'WEEKLY',
    });
  };

  const handleStatusToggle = (taskId) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'PENDING' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'COMPLETED' : 'PENDING';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'ALL') return true;
    if (taskFilter === 'URGENT') return t.priority === 'URGENT';
    return t.status === taskFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Task & Hearing Assignment Hub</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Team Live
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage advocate task assignments, deadlines, recurring compliance filings, and court cause lists
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              window.open('/api/cases/calendar/export.ics', '_blank');
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Export iCal (.ics)</span>
          </button>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'tasks' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>Task Assignments ({tasks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('hearings')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'hearings' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Court Listings ({hearings.length})</span>
            </button>
          </div>

          {activeTab === 'tasks' && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-xs rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-all flex items-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Task</span>
            </button>
          )}
        </div>
      </div>

      {/* TEAM WORKLOAD SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Active Tasks</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tasks.length}
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.status !== 'COMPLETED').length} <span className="text-xs text-slate-500 font-normal">Pending</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adv. Rajesh Sharma</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">Partner</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.assignedTo.includes('Rajesh')).length} <span className="text-xs text-slate-500 font-normal">Tasks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Adv. Priya Nair</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40">Associate</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.assignedTo.includes('Priya')).length} <span className="text-xs text-slate-500 font-normal">Tasks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Paralegal Team</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">Support</span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {tasks.filter((t) => t.assignedTo.includes('Paralegal')).length} <span className="text-xs text-slate-500 font-normal">Filing Tasks</span>
          </div>
        </div>
      </div>

      {/* TAB 1: TASK ASSIGNMENTS */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Task Filter Toolbar */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Filter:</span>
              <div className="flex flex-wrap gap-1">
                {['ALL', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'URGENT'].map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setTaskFilter(filterKey)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                      taskFilter === filterKey
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTasks.length}</span> tasks
            </div>
          </div>

          {/* Task Items List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400">{task.caseNumber || 'General Matter'}</div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{task.title}</h4>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{task.caseTitle}</div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      task.priority === 'URGENT'
                        ? 'badge-rose'
                        : task.priority === 'HIGH'
                        ? 'badge-amber'
                        : 'badge-indigo'
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Assigned Advocate</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{task.assignedTo}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400 text-[10px] block">Due Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">{task.dueDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {task.isRecurring && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/40">
                      <Repeat className="w-3 h-3" />
                      {task.recurPattern} COMPLIANCE
                    </span>
                  )}

                  <div className="ml-auto">
                    <button
                      onClick={() => handleStatusToggle(task.id)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        task.status === 'COMPLETED'
                          ? 'badge-emerald'
                          : task.status === 'IN_PROGRESS'
                          ? 'badge-amber'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{task.status.replace('_', ' ')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: COURT LISTINGS */}
      {activeTab === 'hearings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bench Listings</h3>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {hearings.length} Listed
                </span>
              </div>

              <div className="space-y-2.5">
                {hearings.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{h.case?.caseNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">{h.case?.courtName}</span>
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{h.case?.title}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Purpose: <strong className="text-slate-700 dark:text-slate-300">{h.purpose}</strong> | Advocate: <strong className="text-slate-700 dark:text-slate-300">{h.case?.leadLawyer?.fullName}</strong>
                      </div>
                    </div>

                    <div className="shrink-0 text-left sm:text-right font-mono">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(h.hearingDate).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Court Venues</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="font-bold text-slate-900 dark:text-white">Delhi High Court</div>
                  <div className="text-slate-500 dark:text-slate-400">Sher Shah Road, New Delhi</div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60">
                  <div className="font-bold text-slate-900 dark:text-white">NCLT Principal Bench</div>
                  <div className="text-slate-500 dark:text-slate-400">CGO Complex, Lodhi Road</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TASK MODAL */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#151d2a] border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Assign New Task</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Assign legal drafting or research task</p>
              </div>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Task Description</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Draft Written Statement for High Court"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Assignee Advocate</label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Adv. Rajesh Sharma">Adv. Rajesh Sharma (Partner)</option>
                    <option value="Adv. Priya Nair">Adv. Priya Nair (Associate)</option>
                    <option value="Paralegal Amit Kumar">Paralegal Amit Kumar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="URGENT">URGENT</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-lg hover:bg-slate-800"
                >
                  Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
