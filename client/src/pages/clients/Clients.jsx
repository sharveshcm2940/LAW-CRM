import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  Building2,
  User,
  AlertOctagon,
  FileCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../../api/axios';

export default function Clients() {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'conflict' | 'leads'
  const [clients, setClients] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Conflict search state
  const [searchQuery, setSearchQuery] = useState('');
  const [conflictResults, setConflictResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // New Client Modal state
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    clientType: 'CORPORATE',
    name: '',
    companyName: '',
    email: '',
    phone: '',
    pan: '',
    gstNo: '',
    cin: '',
    address: '',
  });

  const fetchClientsAndLeads = async () => {
    try {
      const [cRes, lRes] = await Promise.all([
        api.get('/clients'),
        api.get('/clients/leads'),
      ]);
      setClients(cRes.data || []);
      setLeads(lRes.data || []);
    } catch (e) {
      console.error('Failed to fetch clients/leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientsAndLeads();
  }, []);

  const handleConflictSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.get(`/clients/conflict/search?query=${encodeURIComponent(searchQuery)}`);
      setConflictResults(res.data);
    } catch (err) {
      console.error('Conflict search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleCreateClient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/clients', formData);
      setShowModal(false);
      setFormData({
        clientType: 'CORPORATE',
        name: '',
        companyName: '',
        email: '',
        phone: '',
        pan: '',
        gstNo: '',
        cin: '',
        address: '',
      });
      fetchClientsAndLeads();
    } catch (err) {
      alert('Failed to create client record.');
    }
  };

  const handleLeadStageChange = async (leadId, newStage) => {
    try {
      await api.patch(`/clients/leads/${leadId}/stage`, { stage: newStage });
      fetchClientsAndLeads();
    } catch (err) {
      console.error('Failed to update lead stage:', err);
    }
  };

  const handleConvertLead = async (leadId) => {
    try {
      const res = await api.post(`/clients/leads/${leadId}/convert`);
      alert(`Lead Converted! Created Client (${res.data.client.name}) and Matter (${res.data.case.caseNumber})`);
      fetchClientsAndLeads();
    } catch (err) {
      alert('Failed to convert lead.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Client & Lead Management
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            KYC compliance, conflict-of-interest checks, and onboarding pipeline
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#111113] p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'directory'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Client Directory
            </button>
            <button
              onClick={() => setActiveTab('conflict')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'conflict'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Conflict Search
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'leads'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Lead Pipeline
            </button>
          </div>

          {activeTab === 'directory' && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white text-[#0A0A0A] font-bold text-xs rounded-full hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CLIENT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs text-[#9CA3AF]">Total Retained Clients</div>
              <div className="text-2xl font-extrabold text-white mt-1">{clients.length}</div>
            </div>
            <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs text-[#9CA3AF]">Corporate Entities</div>
              <div className="text-2xl font-extrabold text-white mt-1">
                {clients.filter((c) => c.clientType === 'CORPORATE').length}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#111113] border border-white/[0.08]">
              <div className="text-xs text-[#9CA3AF]">KYC Verified Ratio</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">100%</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#9CA3AF] border-b border-white/[0.08]">
                  <th className="pb-3 font-semibold">Client Name / Entity</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">GSTIN / PAN</th>
                  <th className="pb-3 font-semibold">Contact Info</th>
                  <th className="pb-3 font-semibold">Active Matters</th>
                  <th className="pb-3 font-semibold">KYC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-white text-sm">
                        {c.companyName || c.name}
                      </div>
                      {c.companyName && (
                        <div className="text-[11px] text-[#9CA3AF]">Rep: {c.name}</div>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-200">
                        {c.clientType === 'CORPORATE' ? (
                          <Building2 className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {c.clientType}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-gray-300">
                      <div>GST: {c.gstNo || 'N/A'}</div>
                      <div className="text-[10px] text-[#9CA3AF]">PAN: {c.pan || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 text-gray-300">
                      <div>{c.email}</div>
                      <div className="text-[10px] text-[#9CA3AF]">{c.phone}</div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">
                        {c.cases?.length || 0} Matters
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        VERIFIED
                      </span>
                    </td>
                    <td className="py-3.5 text-right pr-2">
                      <button
                        onClick={() => setSelectedClient(c)}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold text-[11px] transition-all"
                      >
                        Timeline & Checklist →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: CONFLICT OF INTEREST SEARCH */}
      {activeTab === 'conflict' && (
        <div className="space-y-6">
          <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08] graph-grid-bg max-w-3xl mx-auto space-y-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Conflict-of-Interest Search Engine</h3>
              <p className="text-xs text-[#9CA3AF] mt-1 max-w-md mx-auto">
                Scan party names, directors, opposing counsels, and past litigation registries before onboarding a new client.
              </p>
            </div>

            <form onSubmit={handleConflictSearch} className="flex gap-2 max-w-lg mx-auto">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter party name, company, PAN, or advocate name..."
                className="flex-1 px-4 py-3 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white transition-all"
              />
              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-100 transition-all shadow-md"
              >
                {searching ? 'Scanning...' : 'Run Search'}
              </button>
            </form>
          </div>

          {/* Search Results Display */}
          {conflictResults && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  conflictResults.conflictFound
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  {conflictResults.conflictFound ? (
                    <AlertOctagon className="w-5 h-5 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <div className="font-bold text-sm">
                      {conflictResults.conflictFound
                        ? `Potential Conflict Identified (${conflictResults.matchesCount} Match Found)`
                        : 'No Conflict Detected — Safe to Onboard'}
                    </div>
                    <div className="text-xs opacity-80">Query: "{conflictResults.query}"</div>
                  </div>
                </div>
              </div>

              {conflictResults.matches?.map((match, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#111113] border border-white/[0.08] space-y-1"
                >
                  <div className="text-xs font-bold text-white">{match.name}</div>
                  <div className="text-xs text-[#9CA3AF]">{match.details}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: LEAD PIPELINE KANBAN */}
      {activeTab === 'leads' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: NEW INQUIRIES */}
          <div className="p-4 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                New Inquiries ({leads.filter((l) => l.stage === 'NEW').length})
              </span>
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            </div>

            <div className="space-y-3">
              {leads
                .filter((l) => l.stage === 'NEW')
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-[#0A0A0A] border border-white/[0.06] space-y-2 hover:border-white/20 transition-all"
                  >
                    <div className="font-bold text-white text-xs">{lead.name}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{lead.companyName}</div>
                    <div className="text-[11px] text-gray-300 font-mono">
                      Area: {lead.practiceArea}
                    </div>
                    {lead.estimatedValue && (
                      <div className="text-xs text-emerald-400 font-bold">
                        Est: ₹{lead.estimatedValue.toLocaleString('en-IN')}
                      </div>
                    )}
                    <div className="pt-2 flex gap-2 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleLeadStageChange(lead.id, 'CONTACTED')}
                        className="w-full py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        Move to Contacted →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 2: CONTACTED / IN CONSULTATION */}
          <div className="p-4 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                In Consultation ({leads.filter((l) => l.stage === 'CONTACTED').length})
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            </div>

            <div className="space-y-3">
              {leads
                .filter((l) => l.stage === 'CONTACTED')
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-[#0A0A0A] border border-white/[0.06] space-y-2 hover:border-white/20 transition-all"
                  >
                    <div className="font-bold text-white text-xs">{lead.name}</div>
                    <div className="text-[11px] text-[#9CA3AF]">{lead.notes}</div>
                    <div className="pt-2 flex flex-col gap-1 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleConvertLead(lead.id)}
                        className="w-full py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 text-black text-[10px] font-extrabold rounded-lg transition-all shadow"
                      >
                        ⚡ Convert to Client & Matter
                      </button>
                      <button
                        onClick={() => handleLeadStageChange(lead.id, 'CONVERTED')}
                        className="w-full py-1 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Mark Retained ✓
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Column 3: CONVERTED / RETAINED */}
          <div className="p-4 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Converted / Retained ({leads.filter((l) => l.stage === 'CONVERTED').length})
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="space-y-3">
              {leads
                .filter((l) => l.stage === 'CONVERTED')
                .map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 rounded-xl bg-[#0A0A0A] border border-emerald-500/20 space-y-2"
                  >
                    <div className="font-bold text-white text-xs">{lead.name}</div>
                    <div className="text-[11px] text-emerald-400 font-semibold">
                      Successfully Retained
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-lg w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Add New Client Profile</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Client Type</label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => setFormData({ ...formData, clientType: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  >
                    <option value="CORPORATE">Corporate Entity</option>
                    <option value="INDIVIDUAL">Individual Client</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Client / Rep Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Company Name (if corporate)
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">GSTIN</label>
                  <input
                    type="text"
                    value={formData.gstNo}
                    onChange={(e) => setFormData({ ...formData, gstNo: e.target.value })}
                    className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Registered Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Save & Verify KYC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Contact Timeline & Onboarding Checklist Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{selectedClient.companyName || selectedClient.name}</h3>
                <p className="text-xs text-[#9CA3AF]">Contact History & Onboarding Workflow</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* Onboarding Checklist */}
            <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/[0.08] space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Onboarding Compliance Checklist</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Conflict of Interest Search Executed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>PAN & GSTIN Identity Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Vakalatnama / Engagement Terms Signed</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">✓</span>
                  <span>Client Portal Credentials Active</span>
                </div>
              </div>
            </div>

            {/* Contact History Timeline (Calls, Emails, Meetings) */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Contact History Timeline</div>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white">Retainer Engagement & Strategy Meeting</div>
                    <div className="text-[11px] text-[#9CA3AF] mt-0.5">Meeting with Lead Partner Adv. Rajesh Sharma</div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">2 days ago</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white">Document Collection & Fee Quotation Email</div>
                    <div className="text-[11px] text-[#9CA3AF] mt-0.5">Sent GST invoice & fee breakup for litigation</div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">5 days ago</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white">Initial Phone Call Consultation</div>
                    <div className="text-[11px] text-[#9CA3AF] mt-0.5">Inquiry received regarding High Court Writ Petition</div>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded">1 week ago</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-6 py-2 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
