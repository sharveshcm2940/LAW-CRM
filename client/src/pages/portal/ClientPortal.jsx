import React, { useState, useEffect } from 'react';
import { UserCheck, Scale, FileText, Calendar, Receipt, Shield, Upload, Send, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function ClientPortal() {
  const { user } = useAuth();
  const [cases, setCases] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Client upload & message state
  const [uploadTitle, setUploadTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'lawyer', text: 'Welcome to LexOS Client Portal. You can view hearing status, download petitions, and message your lead advocate here.' },
  ]);

  useEffect(() => {
    fetchPortalData();
  }, []);

  const fetchPortalData = async () => {
    try {
      const [casesRes, invRes, docsRes] = await Promise.all([
        api.get('/cases'),
        api.get('/billing/invoices'),
        api.get('/documents'),
      ]);
      setCases(casesRes.data || []);
      setInvoices(invRes.data || []);
      setDocuments(docsRes.data || []);
    } catch (e) {
      console.error('Failed to fetch client portal data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !cases.length) return;
    try {
      await api.post('/documents', {
        caseId: cases[0].id,
        title: uploadTitle,
        docType: 'OTHER',
        fileUrl: `/uploads/${uploadTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
        isClientVisible: true,
      });
      setUploadTitle('');
      fetchPortalData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    const msg = messageText;
    setMessageText('');
    setMessages(prev => [...prev, { sender: 'client', text: msg }]);

    try {
      await api.post('/communications', {
        caseId: cases[0]?.id,
        channel: 'EMAIL',
        direction: 'INBOUND',
        subject: 'Client Portal Message',
        body: msg,
        sender: user?.fullName,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 p-2">
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-2xl bg-[#111113] border border-white/[0.08] relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 mb-3 border border-emerald-500/20">
          <Shield className="w-3.5 h-3.5" />
          <span>Client Access Portal · Encrypted Workspace</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Welcome back, {user?.fullName}
        </h2>
        <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 max-w-xl">
          Real-time dashboard for your retained legal matters, court hearing listings, document uploads, and direct advocate messaging.
        </p>
      </div>

      {/* Grid of Retained Cases */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Your Retained Matters ({cases.length})</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cases.map((c) => (
            <div key={c.id} className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-200">
                  {c.caseType}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400">
                  {c.status}
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">{c.title}</h4>
                <div className="text-xs font-mono text-gray-400 mt-1">{c.caseNumber}</div>
              </div>

              <div className="p-3 bg-[#0A0A0A] rounded-xl border border-white/[0.06] text-xs space-y-1">
                <div className="text-[#9CA3AF]">Court Bench: <strong className="text-white">{c.courtName}</strong></div>
                <div className="text-[#9CA3AF]">Lead Advocate: <strong className="text-white">{c.leadLawyer?.fullName || 'Assigned Counsel'}</strong></div>
              </div>

              {c.hearings?.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <div className="text-xs font-bold text-white mb-2">Next Listed Hearing:</div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex justify-between">
                    <span>{c.hearings[0]?.purpose}</span>
                    <span className="font-bold">
                      {new Date(c.hearings[0]?.hearingDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Documents & Message Advocate Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Client Document Upload & List */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Client Documents Vault ({documents.length})
          </h3>

          <form onSubmit={handleUploadDoc} className="flex gap-2 text-xs">
            <input
              type="text"
              required
              value={uploadTitle}
              onChange={e => setUploadTitle(e.target.value)}
              placeholder="Upload document title (e.g. Identity Proof / Contract Agreement)..."
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
            <button type="submit" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl flex items-center gap-1">
              <Upload className="w-3.5 h-3.5" /> Upload
            </button>
          </form>

          <div className="space-y-2 text-xs max-h-56 overflow-y-auto">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-white">{doc.title}</span>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[11px]">
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Message Advocate Chat Drawer */}
        <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] flex flex-col h-80 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-400" /> Message Your Lead Advocate
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2.5 rounded-xl max-w-xs ${m.sender === 'client' ? 'bg-amber-500 text-black font-medium' : 'bg-[#1A1A1A] border border-white/10 text-neutral-300'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              placeholder="Type message to advocate..."
              className="flex-1 bg-[#1A1A1A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-xl">
              Send
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
