import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  DollarSign,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Search,
  FileText,
  ListTodo,
  ChevronRight,
  Globe,
  BookOpen,
} from 'lucide-react';
import api from '../../api/axios';

export default function Dashboard() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [limitationAlerts, setLimitationAlerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [casesRes, hearingsRes, alertsRes, invRes] = await Promise.all([
          api.get('/cases'),
          api.get('/cases/hearings'),
          api.get('/compliance/limitation'),
          api.get('/billing/invoices'),
        ]);

        setCases(casesRes.data || []);
        setHearings(hearingsRes.data || []);
        setLimitationAlerts(alertsRes.data?.alerts || []);
        setInvoices(invRes.data || []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeCasesCount = cases.filter((c) => c.status !== 'DISPOSED').length;
  const pendingRevenue = invoices
    .filter((i) => i.status !== 'PAID')
    .reduce((acc, i) => acc + i.netPayable, 0);

  return (
    <div className="space-y-6">
      {/* Executive Welcome Hero Card matching Aperture OS */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-700 dark:text-[#A1A1AA]">
            <Globe className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
            <span>NR Elango Law Associates · Internal Operating System</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Firm Operations & Case Intelligence
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#8E8E93] max-w-2xl leading-relaxed">
            One system for active litigation, Madras High Court listings, advocate task workflows, GST invoicing, and statutory limitation tracking.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => navigate('/cases')}
            className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Case</span>
          </button>
          <button
            onClick={() => navigate('/calendar')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-[#18181B] border border-slate-200 dark:border-[#27272A] text-slate-800 dark:text-white font-medium text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#222225] transition-all flex items-center gap-2 shadow-xs"
          >
            <ListTodo className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
            <span>Task Hub</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider">Active Matters</span>
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#18181B] text-slate-900 dark:text-white border border-slate-200 dark:border-[#27272A]">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeCasesCount}</div>
          <div className="text-[11px] text-slate-500 dark:text-[#8E8E93]">High Court, Supreme Court & NCLT</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider">Pending Dues</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            ₹{pendingRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#8E8E93]">GST invoices awaiting payment</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider">Upcoming Hearings</span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{hearings.length}</div>
          <div className="text-[11px] text-slate-500 dark:text-[#8E8E93]">Scheduled bench appearances</div>
        </div>

        <div className="p-5 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93] uppercase tracking-wider">Limitation Alerts</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{limitationAlerts.length}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">Limitation Act 1963 warnings</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Court Listings & Active Matters */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Court Cause List */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E1E22]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Court Cause List & Listings</h3>
                <p className="text-xs text-slate-500 dark:text-[#8E8E93]">Bench listings and judge notes</p>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <span>Full Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {hearings.slice(0, 5).map((h) => (
                <div
                  key={h.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225] flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-[#333338] transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">{h.case?.caseNumber}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-[#18181B] text-slate-700 dark:text-[#A1A1AA] border border-slate-300 dark:border-[#27272A]">
                        {h.case?.courtName?.split('(')[0] || 'Court'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-900 dark:text-white font-medium">{h.case?.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-[#8E8E93]">Purpose: {h.purpose}</div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white font-mono">
                      {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8E8E93] font-mono">
                      10:30 AM
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Matters Directory */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E1E22]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Matters Directory</h3>
                <p className="text-xs text-slate-500 dark:text-[#8E8E93]">Ongoing suits, writs & proceedings</p>
              </div>
              <button
                onClick={() => navigate('/cases')}
                className="text-xs font-semibold text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
              >
                <span>View All ({cases.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-[#8E8E93] border-b border-slate-100 dark:border-[#1E1E22]">
                    <th className="pb-2.5 font-semibold">Case No. & CNR</th>
                    <th className="pb-2.5 font-semibold">Title</th>
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E22]">
                  {cases.slice(0, 5).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#18181B] transition">
                      <td className="py-2.5 pr-2">
                        <div className="font-bold text-slate-900 dark:text-white">{c.caseNumber}</div>
                        <div className="text-[10px] text-slate-500 dark:text-[#8E8E93] font-mono">{c.cnrNumber || 'No CNR'}</div>
                      </td>
                      <td className="py-2.5 max-w-[180px] truncate text-slate-700 dark:text-slate-200 font-medium">
                        {c.title}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-[#8E8E93]">
                        {c.client?.companyName || c.client?.name}
                      </td>
                      <td className="py-2.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#18181B] text-slate-800 dark:text-white border border-slate-200 dark:border-[#27272A]">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Quick Actions & Statutory Alerts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/clients')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#333338] text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Conflict-of-Interest Search
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8E8E93]">Verify opposing party history</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#52525B]" />
              </button>

              <button
                onClick={() => navigate('/research')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#333338] text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Precedent Research
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8E8E93]">Search SCC & High Court precedents</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#52525B]" />
              </button>

              <button
                onClick={() => navigate('/billing')}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225] hover:border-slate-300 dark:hover:border-[#333338] text-left flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Create GST Invoice (SAC 998211)
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-[#8E8E93]">Auto-calculate CGST/SGST/TDS</div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#52525B]" />
              </button>
            </div>
          </div>

          {/* Statutory Limitation Alerts */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Statutory Limitation Alerts</h3>
              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/30">
                Limitation Act 1963
              </span>
            </div>

            <div className="space-y-2.5">
              {limitationAlerts.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300">{a.actName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-[#8E8E93]">{a.section}</span>
                  </div>
                  <div className="text-xs text-slate-900 dark:text-white font-medium">{a.case?.title}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
