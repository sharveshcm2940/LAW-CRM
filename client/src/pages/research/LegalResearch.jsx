import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { Search, BookOpen, Bookmark, Link as LinkIcon, ExternalLink, Tag, Check, Sparkles } from 'lucide-react';

export default function LegalResearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [savedJudgments, setSavedJudgments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [casesList, setCasesList] = useState([]);

  // Link modal state
  const [selectedJudgment, setSelectedJudgment] = useState(null);
  const [targetCaseId, setTargetCaseId] = useState('');

  useEffect(() => {
    handleSearch('');
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await axios.get('/cases');
      setCasesList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const res = await axios.get(`/legal-research/search?query=${encodeURIComponent(searchQuery)}`);
      setResults(res.data.searchResults);
      setSavedJudgments(res.data.savedJudgments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJudgment = async (j) => {
    try {
      await axios.post('/legal-research/judgments', {
        title: j.title,
        court: j.court,
        citation: j.citation,
        judgmentDate: j.judgmentDate,
        summary: j.summary,
        linkUrl: j.linkUrl,
        tags: j.tags,
      });
      handleSearch(query);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLinkJudgment = async () => {
    if (!selectedJudgment || !targetCaseId) return;
    try {
      await axios.patch(`/legal-research/judgments/${selectedJudgment.id}/link`, { caseId: targetCaseId });
      setSelectedJudgment(null);
      handleSearch(query);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Legal Research & Case-Law Precedents</h1>
          <p className="text-xs text-neutral-400">Search Indian High Courts & Supreme Court judgments, manage citations, and link precedents to active matters.</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-neutral-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            handleSearch(e.target.value);
          }}
          placeholder="Search by legal ratio, citation (e.g. (2021) 8 SCC 41), statute Section 138, or Supreme Court..."
          className="w-full bg-[#141414] border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500 shadow-xl"
        />
      </div>

      {/* Grid: Search Precedents & Saved Case Binder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search Results Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Supreme Court & High Court Database Precedents
          </h2>

          {loading ? (
            <div className="py-10 text-center text-xs text-neutral-500">Searching case law database...</div>
          ) : results.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-500 border border-dashed border-white/5 rounded-2xl">
              No matching precedent judgments found for "{query}".
            </div>
          ) : (
            results.map(j => (
              <div key={j.id} className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-3 shadow-lg hover:border-amber-500/30 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{j.title}</h3>
                    <p className="text-xs text-amber-400 font-medium">{j.court} | Citation: {j.citation}</p>
                  </div>
                  <button
                    onClick={() => handleSaveJudgment(j)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Save Precedent
                  </button>
                </div>

                <p className="text-xs text-neutral-300 bg-black/40 p-3 rounded-xl border border-white/5">{j.summary}</p>

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-neutral-500 flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {j.tags}
                  </span>
                  {j.linkUrl && (
                    <a href={j.linkUrl} target="_blank" rel="noreferrer" className="text-amber-400 flex items-center gap-1 hover:underline">
                      View Full Order <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Saved Case Binder & Matter Links Column */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-purple-400 flex items-center gap-2">
            <Bookmark className="w-4 h-4" /> Firm Judgment Binder ({savedJudgments.length})
          </h2>

          <div className="space-y-3">
            {savedJudgments.map(sj => (
              <div key={sj.id} className="bg-[#141414] border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-semibold text-white">{sj.title}</h4>
                <p className="text-[11px] text-amber-400">{sj.citation}</p>
                <p className="text-neutral-400 line-clamp-2">{sj.summary}</p>

                {sj.case ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-2 rounded-lg text-[11px] flex items-center justify-between">
                    <span>Linked to: {sj.case.caseNumber}</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedJudgment(sj)}
                    className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 rounded-lg text-[11px] flex items-center justify-center gap-1 transition"
                  >
                    <LinkIcon className="w-3 h-3 text-amber-400" /> Link to Matter File
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Link Judgment Modal */}
      {selectedJudgment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-lg font-semibold">Link Precedent to Matter</h3>
            <p className="text-xs text-neutral-400">{selectedJudgment.title} ({selectedJudgment.citation})</p>

            <div>
              <label className="text-xs text-neutral-400 block mb-1">Select Matter</label>
              <select
                value={targetCaseId}
                onChange={e => setTargetCaseId(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                <option value="">-- Choose active court case --</option>
                {casesList.map(c => (
                  <option key={c.id} value={c.id}>{c.caseNumber} - {c.title}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
              <button onClick={() => setSelectedJudgment(null)} className="px-4 py-2 bg-neutral-800 text-xs text-neutral-300 rounded-xl">
                Cancel
              </button>
              <button onClick={handleLinkJudgment} className="px-4 py-2 bg-amber-500 text-black text-xs font-semibold rounded-xl hover:bg-amber-400">
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
