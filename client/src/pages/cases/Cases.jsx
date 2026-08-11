import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ChevronRight,
  User,
  Building2,
  X,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import api from '../../api/axios';
import ChronologicalTimeline from '../../components/cases/ChronologicalTimeline';


export default function Cases() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailTab, setDetailTab] = useState('timeline');

  // New Case Form
  const [caseFormData, setCaseFormData] = useState({
    caseNumber: '',
    cnrNumber: '',
    title: '',
    caseType: 'CIVIL',
    status: 'UNDER_TRIAL',
    courtName: 'Delhi High Court',
    judgeName: '',
    opposingParty: '',
    opposingCounsel: '',
    description: '',
    clientId: '',
  });

  // Add Hearing Form
  const [hearingFormData, setHearingFormData] = useState({
    hearingDate: '',
    purpose: '',
    judgeNotes: '',
    status: 'SCHEDULED',
  });

  const fetchCasesAndClients = async () => {
    try {
      const [casesRes, clientsRes] = await Promise.all([
        api.get(`/cases?caseType=${filterType}&status=${filterStatus}&search=${searchQuery}`),
        api.get('/clients'),
      ]);
      setCases(casesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch cases:', err);
    }
  };

  useEffect(() => {
    fetchCasesAndClients();
  }, [filterType, filterStatus, searchQuery]);

  const handleCreateCase = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cases', caseFormData);
      setShowCaseModal(false);
      fetchCasesAndClients();
    } catch (err) {
      alert('Failed to create case record.');
    }
  };

  const handleAddHearing = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await api.post(`/cases/${selectedCase.id}/hearings`, hearingFormData);
      setShowHearingModal(false);
      // Refresh selected case details
      const updated = await api.get(`/cases/${selectedCase.id}`);
      setSelectedCase(updated.data);
      fetchCasesAndClients();
    } catch (err) {
      alert('Failed to schedule hearing date.');
    }
  };

  const viewCaseDetail = async (caseId) => {
    try {
      const res = await api.get(`/cases/${caseId}`);
      setSelectedCase(res.data);
    } catch (e) {
      console.error('Failed to load case detail:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Case & Matter Directory
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Real-time e-Courts CNR tracking, court benches, hearing history, and counsel assignment
          </p>
        </div>

        <button
          onClick={() => setShowCaseModal(true)}
          className="px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black font-bold text-xs rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Case Filing</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title, case number, CNR number, court..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#111113] border border-white/[0.12] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#111113] border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="">All Case Types</option>
            <option value="CIVIL">Civil Suits & Writs</option>
            <option value="CRIMINAL">Criminal Defense & NI Act</option>
            <option value="CORPORATE">Corporate & IBC</option>
            <option value="IPR">IPR & Trademark Injunctions</option>
            <option value="FAMILY">Family & Matrimonial</option>
            <option value="TAX">Tax & Customs Appeals</option>
            <option value="ARBITRATION">Commercial Arbitration</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2.5 bg-[#111113] border border-white/[0.12] rounded-xl text-xs text-white focus:outline-none"
          >
            <option value="">All Stages</option>
            <option value="FILED">Filed</option>
            <option value="UNDER_TRIAL">Under Trial</option>
            <option value="ADJOURNED">Adjourned</option>
            <option value="DISPOSED">Disposed</option>
            <option value="APPEAL">Appeal Stage</option>
          </select>
        </div>
      </div>

      {/* Case Directory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cases.map((c) => (
          <div
            key={c.id}
            onClick={() => viewCaseDetail(c.id)}
            className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer space-y-4 group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-200 border border-white/10">
                  {c.caseType}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    c.status === 'UNDER_TRIAL'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      : c.status === 'ADJOURNED'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {c.title}
                </h3>
                <div className="text-xs font-mono text-gray-400 mt-0.5">{c.caseNumber}</div>
              </div>

              {c.cnrNumber && (
                <div className="inline-block text-[10px] font-mono bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.08] text-gray-300">
                  CNR: {c.cnrNumber}
                </div>
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-white/[0.06] text-xs text-[#9CA3AF]">
              <div className="flex items-center justify-between">
                <span>Court Bench:</span>
                <span className="text-white font-medium truncate max-w-[160px]">
                  {c.courtName}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Client:</span>
                <span className="text-white font-medium truncate max-w-[160px]">
                  {c.client?.companyName || c.client?.name}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1 text-purple-400 font-semibold">
                  <Calendar className="w-3 h-3" />
                  {c.hearings?.length || 0} Hearings
                </span>
                <span className="text-white font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Details <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CASE DETAIL SLIDE-OVER MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#111113] border-l border-white/[0.15] w-full max-w-2xl h-full overflow-y-auto p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-white/10 text-gray-200">
                  {selectedCase.caseType} · {selectedCase.status}
                </span>
                <h3 className="text-xl font-extrabold text-white mt-2">{selectedCase.title}</h3>
                <div className="text-xs font-mono text-gray-400">
                  {selectedCase.caseNumber} | CNR: {selectedCase.cnrNumber || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Benches & Parties Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-[#0A0A0A] p-4 rounded-xl border border-white/[0.08]">
              <div>
                <span className="text-[#9CA3AF] block font-medium">Court Bench</span>
                <span className="text-white font-bold block mt-0.5">{selectedCase.courtName}</span>
                {selectedCase.judgeName && (
                  <span className="text-gray-400 block text-[11px]">Judge: {selectedCase.judgeName}</span>
                )}
              </div>
              <div>
                <span className="text-[#9CA3AF] block font-medium">Lead Advocate</span>
                <span className="text-white font-bold block mt-0.5">
                  {selectedCase.leadLawyer?.fullName}
                </span>
                <span className="text-gray-400 block text-[11px]">
                  Bar No: {selectedCase.leadLawyer?.barCouncilNo || 'N/A'}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-white/[0.06]">
                <span className="text-[#9CA3AF] block font-medium">Opposing Counsel & Party</span>
                <span className="text-amber-300 font-semibold block mt-0.5">
                  {selectedCase.opposingParty || 'N/A'}
                </span>
                {selectedCase.opposingCounsel && (
                  <span className="text-gray-400 block text-[11px]">
                    Counsel: {selectedCase.opposingCounsel}
                  </span>
                )}
              </div>
            </div>

            {/* Detail Modal Tab Switcher */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
              <button
                onClick={() => setDetailTab('timeline')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  detailTab === 'timeline'
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-black font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Chronological Timeline
              </button>
              <button
                onClick={() => setDetailTab('hearings')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  detailTab === 'hearings'
                    ? 'bg-[#0F172A] dark:bg-white text-white dark:text-black font-bold'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Hearings & Documents
              </button>
            </div>

            {/* Render Selected Tab */}
            {detailTab === 'timeline' ? (
              <ChronologicalTimeline caseId={selectedCase.id} />
            ) : (
              <>
                {/* Hearing Timeline History */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">Court Hearing History</h4>
                    <button
                      onClick={() => setShowHearingModal(true)}
                      className="px-3 py-1 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-100"
                    >
                      + Schedule Next Hearing
                    </button>
                  </div>

              <div className="space-y-2">
                {selectedCase.hearings?.map((h) => (
                  <div
                    key={h.id}
                    className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/[0.06] space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-amber-300">
                        {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded text-gray-300">
                        {h.status}
                      </span>
                    </div>
                    <div className="text-white font-medium">Purpose: {h.purpose}</div>
                    {h.judgeNotes && (
                      <div className="text-[#9CA3AF] text-[11px] italic">
                        Judge Notes: {h.judgeNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Document Vault Snapshot */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white">Case Documents ({selectedCase.documents?.length || 0})</h4>
              <div className="space-y-2">
                {selectedCase.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white">{doc.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      {doc.isClientVisible ? 'Client Visible' : 'Internal Only'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            </>
            )}
          </div>
        </div>
      )}

      {/* NEW CASE FILING MODAL */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-xl w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">New Case Filing</h3>
              <button
                onClick={() => setShowCaseModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Case Number</label>
                  <input
                    type="text"
                    required
                    placeholder="W.P.(C) 1234/2026"
                    value={caseFormData.caseNumber}
                    onChange={(e) => setCaseFormData({ ...caseFormData, caseNumber: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">16-Char CNR Number</label>
                  <input
                    type="text"
                    placeholder="DHC0012345672026"
                    value={caseFormData.cnrNumber}
                    onChange={(e) => setCaseFormData({ ...caseFormData, cnrNumber: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Case Title</label>
                <input
                  type="text"
                  required
                  placeholder="Apex Infra vs. Union of India"
                  value={caseFormData.title}
                  onChange={(e) => setCaseFormData({ ...caseFormData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Client</label>
                  <select
                    required
                    value={caseFormData.clientId}
                    onChange={(e) => setCaseFormData({ ...caseFormData, clientId: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  >
                    <option value="">Select Client Entity</option>
                    {clients.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.companyName || cli.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Practice Area</label>
                  <select
                    value={caseFormData.caseType}
                    onChange={(e) => setCaseFormData({ ...caseFormData, caseType: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  >
                    <option value="CIVIL">CIVIL</option>
                    <option value="CRIMINAL">CRIMINAL</option>
                    <option value="CORPORATE">CORPORATE</option>
                    <option value="IPR">IPR</option>
                    <option value="FAMILY">FAMILY</option>
                    <option value="TAX">TAX</option>
                    <option value="ARBITRATION">ARBITRATION</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Court Bench</label>
                  <input
                    type="text"
                    required
                    placeholder="Delhi High Court"
                    value={caseFormData.courtName}
                    onChange={(e) => setCaseFormData({ ...caseFormData, courtName: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Opposing Party</label>
                  <input
                    type="text"
                    placeholder="Union of India"
                    value={caseFormData.opposingParty}
                    onChange={(e) => setCaseFormData({ ...caseFormData, opposingParty: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowCaseModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Create Case Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD HEARING DATE MODAL */}
      {showHearingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Schedule Court Hearing Date</h3>
              <button
                onClick={() => setShowHearingModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHearing} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Hearing Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={hearingFormData.hearingDate}
                  onChange={(e) => setHearingFormData({ ...hearingFormData, hearingDate: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Purpose of Hearing</label>
                <input
                  type="text"
                  required
                  placeholder="Final Arguments on Stay Application"
                  value={hearingFormData.purpose}
                  onChange={(e) => setHearingFormData({ ...hearingFormData, purpose: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Judge Directions / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Court directed filing of rejoinder by Aug 8."
                  value={hearingFormData.judgeNotes}
                  onChange={(e) => setHearingFormData({ ...hearingFormData, judgeNotes: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowHearingModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Schedule Hearing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
