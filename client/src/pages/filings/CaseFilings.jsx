import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Plus,
  RefreshCw,
  Scale,
  Landmark,
  UserCheck,
  Building2,
  X,
  FileText,
} from 'lucide-react';
import api from '../../api/axios';

const LITIGATION_STAGES = [
  { id: 'FILED', label: '1. Petition Filed', color: 'bg-[#18181B] text-slate-300 border-slate-700' },
  { id: 'SCRUTINY', label: '2. Registry Scrutiny', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  { id: 'ADMISSION', label: '3. Admission & Notice', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  { id: 'UNDER_TRIAL', label: '4. Under Trial / Counter', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  { id: 'INTERIM_ORDER', label: '5. Interim Injunction', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  { id: 'ARGUMENTS', label: '6. Final Arguments', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  { id: 'DISPOSED', label: '7. Disposed & Decree', color: 'bg-slate-500/10 text-slate-400 border-slate-500/30' },
  { id: 'APPEAL', label: '8. Appellate Appeal', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
];

export default function CaseFilings() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedStage, setSelectedStage] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilingModal, setShowFilingModal] = useState(false);
  const [statusUpdateCase, setStatusUpdateCase] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // New Case Filing Form State
  const [filingData, setFilingData] = useState({
    caseNumber: '',
    cnrNumber: '',
    title: '',
    caseType: 'CIVIL',
    status: 'FILED',
    courtName: 'Madras High Court (First Bench)',
    judgeName: '',
    opposingParty: '',
    opposingCounsel: '',
    description: '',
    clientId: '',
  });

  const fetchCasesAndClients = async () => {
    try {
      const [casesRes, clientsRes] = await Promise.all([
        api.get('/cases'),
        api.get('/clients'),
      ]);
      setCases(casesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (e) {
      console.error('Failed to fetch filings:', e);
    }
  };

  useEffect(() => {
    fetchCasesAndClients();
  }, []);

  const handleCreateFiling = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cases', filingData);
      alert('✅ New Case Filing created successfully!');
      setShowFilingModal(false);
      setFilingData({
        caseNumber: '',
        cnrNumber: '',
        title: '',
        caseType: 'CIVIL',
        status: 'FILED',
        courtName: 'Madras High Court (First Bench)',
        judgeName: '',
        opposingParty: '',
        opposingCounsel: '',
        description: '',
        clientId: '',
      });
      fetchCasesAndClients();
    } catch (err) {
      alert('Failed to submit new case filing.');
    }
  };

  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!statusUpdateCase || !newStatus) return;
    setLoading(true);
    try {
      await api.patch(`/cases/${statusUpdateCase.id}`, {
        status: newStatus,
        description: statusNotes
          ? `${statusUpdateCase.description || ''}\n[Status Updated to ${newStatus}]: ${statusNotes}`
          : statusUpdateCase.description,
      });
      alert(`✅ Case status updated to: ${newStatus}`);
      setStatusUpdateCase(null);
      setStatusNotes('');
      fetchCasesAndClients();
    } catch (err) {
      alert('Failed to update case status.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesStage = selectedStage === 'ALL' || c.status === selectedStage;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.cnrNumber && c.cnrNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.courtName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  const getStageBadge = (status) => {
    const stage = LITIGATION_STAGES.find((s) => s.id === status);
    return stage ? (
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${stage.color}`}>
        {stage.label}
      </span>
    ) : (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-white font-sans">
      
      {/* Top Header & New Case Filing Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#1E1E22] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Case Filing & Stage Tracker</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#18181B] border border-[#27272A] text-[#A1A1AA]">
              Chambers Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#8E8E93] mt-1">
            Dedicated registry management for petition filings, scrutiny defect clearance, stage tracking, and status updates.
          </p>
        </div>

        <button
          onClick={() => setShowFilingModal(true)}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2 w-fit shadow-xs"
        >
          <FilePlus className="w-4 h-4" />
          <span>New Petition Filing</span>
        </button>
      </div>

      {/* KPI Stage Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-1">
          <span className="text-[#8E8E93] uppercase font-semibold text-[10px]">Total Filings</span>
          <div className="text-2xl font-bold">{cases.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-1">
          <span className="text-[#8E8E93] uppercase font-semibold text-[10px]">Pending Scrutiny</span>
          <div className="text-2xl font-bold text-amber-500">
            {cases.filter((c) => c.status === 'FILED' || c.status === 'SCRUTINY').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-1">
          <span className="text-[#8E8E93] uppercase font-semibold text-[10px]">Under Trial / Arguments</span>
          <div className="text-2xl font-bold text-indigo-400">
            {cases.filter((c) => c.status === 'UNDER_TRIAL' || c.status === 'ARGUMENTS').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] space-y-1">
          <span className="text-[#8E8E93] uppercase font-semibold text-[10px]">Disposed / Decided</span>
          <div className="text-2xl font-bold text-emerald-400">
            {cases.filter((c) => c.status === 'DISPOSED').length}
          </div>
        </div>
      </div>

      {/* Stage Pipeline Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedStage('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap ${
            selectedStage === 'ALL'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold'
              : 'bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#27272A]'
          }`}
        >
          All Filings ({cases.length})
        </button>

        {LITIGATION_STAGES.map((s) => {
          const count = cases.filter((c) => c.status === s.id).length;
          return (
            <button
              key={s.id}
              onClick={() => setSelectedStage(s.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStage === s.id
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-bold'
                  : 'bg-slate-100 dark:bg-[#18181B] text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#27272A]'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Case Number, Title, Court Bench, or Client..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-xl text-xs focus:outline-none focus:border-slate-400 dark:focus:border-[#333338]"
        />
      </div>

      {/* Case Filings Directory Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-500 dark:text-[#8E8E93] border-b border-slate-200 dark:border-[#1E1E22]">
              <th className="pb-3 font-semibold">Case Number & Title</th>
              <th className="pb-3 font-semibold">Court Bench</th>
              <th className="pb-3 font-semibold">Client Entity</th>
              <th className="pb-3 font-semibold">Current Stage</th>
              <th className="pb-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#1E1E22]">
            {filteredCases.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#18181B] transition">
                <td className="py-3.5 pr-4">
                  <div className="font-bold text-slate-900 dark:text-white">{c.caseNumber}</div>
                  <div className="text-slate-700 dark:text-slate-200 font-medium">{c.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">CNR: {c.cnrNumber || 'Pending Allocation'}</div>
                </td>
                <td className="py-3.5 text-slate-700 dark:text-slate-300">
                  <div className="font-semibold">{c.courtName}</div>
                  {c.judgeName && <div className="text-[10px] text-slate-400">Judge: {c.judgeName}</div>}
                </td>
                <td className="py-3.5 text-slate-700 dark:text-slate-300">
                  <div className="font-semibold">{c.client?.companyName || c.client?.name}</div>
                  <div className="text-[10px] text-slate-400">{c.client?.email}</div>
                </td>
                <td className="py-3.5">
                  {getStageBadge(c.status)}
                </td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => {
                      setStatusUpdateCase(c);
                      setNewStatus(c.status);
                    }}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-lg text-[11px] hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Update Status</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: NEW PETITION FILING MODAL */}
      {showFilingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E1E22] pb-3">
              <h3 className="text-base font-bold">Lodge New Case Petition Filing</h3>
              <button onClick={() => setShowFilingModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFiling} className="space-y-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Select Client Entity</label>
                <select
                  required
                  value={filingData.clientId}
                  onChange={(e) => setFilingData({ ...filingData, clientId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Select Client...</option>
                  {clients.map((cli) => (
                    <option key={cli.id} value={cli.id}>
                      {cli.companyName || cli.name} ({cli.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Case / Petition Number</label>
                  <input
                    type="text"
                    required
                    placeholder="W.P. No. 12890 of 2025"
                    value={filingData.caseNumber}
                    onChange={(e) => setFilingData({ ...filingData, caseNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">CNR Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="TNMD010045892025"
                    value={filingData.cnrNumber}
                    onChange={(e) => setFilingData({ ...filingData, cnrNumber: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Case Matter Title</label>
                <input
                  type="text"
                  required
                  placeholder="Chennai Super Infra vs. State of TN"
                  value={filingData.title}
                  onChange={(e) => setFilingData({ ...filingData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Court Bench</label>
                  <input
                    type="text"
                    required
                    value={filingData.courtName}
                    onChange={(e) => setFilingData({ ...filingData, courtName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Initial Stage</label>
                  <select
                    value={filingData.status}
                    onChange={(e) => setFilingData({ ...filingData, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                  >
                    {LITIGATION_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-[#1E1E22]">
                <button
                  type="button"
                  onClick={() => setShowFilingModal(false)}
                  className="w-1/2 py-2.5 bg-slate-200 dark:bg-[#18181B] text-slate-800 dark:text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200"
                >
                  Lodge Filing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPDATE CASE STATUS & LITIGATION STAGE MODAL */}
      {statusUpdateCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 text-xs">
          <div className="bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#1E1E22] pb-3">
              <div>
                <h3 className="text-base font-bold">Update Litigation Stage & Status</h3>
                <p className="text-slate-500 dark:text-[#8E8E93] text-[11px]">{statusUpdateCase.caseNumber}</p>
              </div>
              <button onClick={() => setStatusUpdateCase(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Select New Litigation Stage</label>
                <select
                  required
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
                >
                  {LITIGATION_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">Status Update Comments / Registry Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Scrutiny defects cleared by advocate. Listed for admission tomorrow before First Bench."
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-200 dark:border-[#1E1E22]">
                <button
                  type="button"
                  onClick={() => setStatusUpdateCase(null)}
                  className="w-1/2 py-2.5 bg-slate-200 dark:bg-[#18181B] text-slate-800 dark:text-white font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-1/2 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all"
                >
                  {loading ? 'Updating...' : 'Update Stage'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
