import React, { useState } from 'react';
import axios from '../../api/axios';
import { Sparkles, FileText, Search, MessageSquare, Tag, X, Check, Loader2, Award, Landmark } from 'lucide-react';

export default function AiAssistantModal({ isOpen, onClose, selectedCaseId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(false);

  // States
  const [summaryData, setSummaryData] = useState(null);
  const [extractInput, setExtractInput] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [draftType, setDraftType] = useState('LEGAL_DEMAND_NOTICE');
  const [draftClientName, setDraftClientName] = useState('');
  const [draftResult, setDraftResult] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [enquiryText, setEnquiryText] = useState('');
  const [classification, setClassification] = useState(null);

  if (!isOpen) return null;

  const handleGenerateSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/ai/summarize-case', { caseId: selectedCaseId });
      setSummaryData(res.data.summary);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/ai/extract-entities', { text: extractInput });
      setExtractedData(res.data.extracted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDraft = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/ai/draft-document', {
        templateType: draftType,
        clientName: draftClientName || 'Chennai Super Infra Developers Pvt Ltd',
      });
      setDraftResult(res.data.draft);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatQuestion.trim()) return;
    const userQ = chatQuestion;
    setChatQuestion('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);
    try {
      const res = await axios.post('/ai/ask-matter', { caseId: selectedCaseId, question: userQ });
      setChatHistory(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassify = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/ai/classify-enquiry', { enquiryText });
      setClassification(res.data.classification);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-[#0B132B] border border-[#D4AF37]/30 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-white">
        
        {/* Chambers Gold Header */}
        <div className="p-6 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#101935] rounded-t-2xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A059] text-[#0B132B] shadow-lg">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#D4AF37]">NR Elango Chambers AI Copilot</h2>
              <p className="text-xs text-slate-400">High Court & Supreme Court Pleading Drafter, Case Analysis & Precedent Copilot</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#D4AF37]/20 bg-[#131C35] px-6 gap-2 overflow-x-auto">
          {[
            { id: 'summary', label: 'Case Summarizer', icon: FileText },
            { id: 'extractor', label: 'Entity Extractor', icon: Search },
            { id: 'drafter', label: 'Legal Drafter', icon: Sparkles },
            { id: 'chatbot', label: 'Matter Copilot Q&A', icon: MessageSquare },
            { id: 'classifier', label: 'Enquiry Classifier', icon: Tag },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                  active
                    ? 'border-[#D4AF37] text-[#D4AF37] bg-white/5 font-serif'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">

          {/* 1. Case Summarizer */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">Generate structured AI summary of active matter facts, Senior Counsel strategy, and High Court listings.</p>
                <button
                  onClick={handleGenerateSummary}
                  disabled={loading}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:from-[#C5A059] hover:to-[#B38F48] text-[#0B132B] font-bold text-xs rounded-xl flex items-center gap-2 transition"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Summarize Active Matter
                </button>
              </div>

              {summaryData && (
                <div className="bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-5 space-y-4">
                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#D4AF37]">{summaryData.caseTitle}</h3>
                    <p className="text-xs text-slate-400">{summaryData.court} | Case No: {summaryData.caseNumber}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D4AF37] font-cinzel uppercase tracking-wider mb-1">Executive Summary</h4>
                    <p className="text-xs text-slate-200 bg-[#0B132B] p-3 rounded-lg border border-white/5">{summaryData.executiveSummary}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D4AF37] font-cinzel uppercase tracking-wider mb-1">Senior Counsel Strategy</h4>
                    <p className="text-xs text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{summaryData.legalStrategy}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D4AF37] font-cinzel uppercase tracking-wider mb-1">Next Upcoming Listing</h4>
                    <p className="text-xs text-amber-300">{summaryData.nextDeadlines}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Entity Extractor */}
          {activeTab === 'extractor' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">Paste legal text, High Court notices, or judgment snippets to extract key court dates, CNR numbers, and statutory sections.</p>
              <textarea
                value={extractInput}
                onChange={e => setExtractInput(e.target.value)}
                placeholder="Paste Madras High Court petition or notice snippet..."
                rows={4}
                className="w-full bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={handleExtract}
                disabled={loading}
                className="px-4 py-2 bg-[#D4AF37] text-[#0B132B] font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Extract Dates & Entities
              </button>

              {extractedData && (
                <div className="grid grid-cols-2 gap-4 bg-[#131C35] p-4 rounded-xl border border-[#D4AF37]/20">
                  <div>
                    <h4 className="text-xs font-bold text-[#D4AF37] mb-2 font-cinzel">Key Court Dates</h4>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {extractedData.dates.map((d, i) => <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> {d}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#D4AF37] mb-2 font-cinzel">Extracted Case Numbers</h4>
                    <ul className="text-xs space-y-1 text-slate-300">
                      {extractedData.caseNumbers.map((c, i) => <li key={i} className="flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-400" /> {c}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Legal Drafter */}
          {activeTab === 'drafter' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Select Document Template</label>
                  <select
                    value={draftType}
                    onChange={e => setDraftType(e.target.value)}
                    className="w-full bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="LEGAL_DEMAND_NOTICE">Legal Demand Notice (Sec 138 / Contract)</option>
                    <option value="RETAINER_AGREEMENT">Retainer Advisory Agreement</option>
                    <option value="CLIENT_UPDATE_LETTER">Client Case Progress Update</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Client Entity Name</label>
                  <input
                    type="text"
                    value={draftClientName}
                    onChange={e => setDraftClientName(e.target.value)}
                    placeholder="e.g. Chennai Super Infra Developers Pvt Ltd"
                    className="w-full bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <button
                onClick={handleDraft}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Draft Legal Document
              </button>

              {draftResult && (
                <div className="bg-[#0B132B] p-4 rounded-xl border border-white/10 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {draftResult}
                </div>
              )}
            </div>
          )}

          {/* 4. Matter Chatbot */}
          {activeTab === 'chatbot' && (
            <div className="flex flex-col h-80 bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-4">
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {chatHistory.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-10">Ask any question regarding High Court listings, Senior Advocate notes, or Madras HC precedents for this case.</p>
                )}
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-xl max-w-md text-xs ${msg.sender === 'user' ? 'bg-[#D4AF37] text-[#0B132B] font-bold' : 'bg-[#0B132B] border border-white/10 text-slate-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                <input
                  type="text"
                  value={chatQuestion}
                  onChange={e => setChatQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder="e.g. When is the next High Court listing date and strategy?"
                  className="flex-1 bg-[#0B132B] border border-[#D4AF37]/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button onClick={handleSendChat} disabled={loading} className="px-4 py-2 bg-[#D4AF37] text-[#0B132B] text-xs font-bold rounded-xl">
                  Ask
                </button>
              </div>
            </div>
          )}

          {/* 5. Enquiry Classifier */}
          {activeTab === 'classifier' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">Classify raw inbound lead inquiries into legal practice areas and urgency levels.</p>
              <textarea
                value={enquiryText}
                onChange={e => setEnquiryText(e.target.value)}
                placeholder="e.g. Received a cheque dishonour notice under Section 138 from Chennai vendor, need Senior Advocate representation."
                rows={3}
                className="w-full bg-[#131C35] border border-[#D4AF37]/20 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
              />
              <button onClick={handleClassify} disabled={loading} className="px-4 py-2 bg-[#D4AF37] text-[#0B132B] text-xs font-bold rounded-xl flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tag className="w-4 h-4" />}
                Classify Enquiry
              </button>

              {classification && (
                <div className="bg-[#131C35] p-4 rounded-xl border border-[#D4AF37]/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Practice Area:</span>
                    <span className="font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-full">{classification.practiceArea}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Urgency Level:</span>
                    <span className={`font-bold px-2.5 py-1 rounded-full ${classification.urgency === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{classification.urgency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Recommended Advocate:</span>
                    <span className="text-white font-bold">{classification.recommendedLawyer}</span>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
