import React, { useState, useEffect } from 'react';
import {
  FolderLock,
  FileText,
  Upload,
  Search,
  Eye,
  Shield,
  Copy,
  Check,
  FileCheck,
  Plus,
  ArrowDownToLine,
} from 'lucide-react';
import api from '../../api/axios';

export default function Documents() {
  const [activeTab, setActiveTab] = useState('vault'); // 'vault' | 'templates'
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [cases, setCases] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [uploadData, setUploadData] = useState({
    caseId: '',
    title: '',
    docType: 'PETITION',
    fileUrl: '',
    isClientVisible: true,
  });

  const fetchData = async () => {
    try {
      const [docsRes, tplRes, casesRes] = await Promise.all([
        api.get('/documents'),
        api.get('/documents/templates'),
        api.get('/cases'),
      ]);
      setDocuments(docsRes.data || []);
      setTemplates(tplRes.data || []);
      setCases(casesRes.data || []);
    } catch (e) {
      console.error('Failed to fetch documents/templates:', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/documents', uploadData);
      setShowUploadModal(false);
      setUploadData({
        caseId: '',
        title: '',
        docType: 'PETITION',
        fileUrl: '',
        isClientVisible: true,
      });
      fetchData();
    } catch (err) {
      alert('Failed to save document metadata.');
    }
  };

  const copyTemplateContent = (id, content) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Document Vault & Legal Templates
          </h2>
          <p className="text-xs text-[#9CA3AF]">
            Per-case encrypted file repository, access control, and standard Indian legal pleading templates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#111113] p-1 rounded-full border border-white/[0.08]">
            <button
              onClick={() => setActiveTab('vault')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'vault'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Document Vault
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeTab === 'templates'
                  ? 'bg-white text-black shadow'
                  : 'text-[#9CA3AF] hover:text-white'
              }`}
            >
              Template Library
            </button>
          </div>

          {activeTab === 'vault' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-white text-[#0A0A0A] font-bold text-xs rounded-full hover:bg-gray-100 transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DOCUMENT VAULT */}
      {activeTab === 'vault' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[#9CA3AF] border-b border-white/[0.08]">
                  <th className="pb-3 font-semibold">Document Title</th>
                  <th className="pb-3 font-semibold">Case Matter</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Uploaded By</th>
                  <th className="pb-3 font-semibold">Access Isolation</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2 font-bold text-white text-sm">
                        <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] pl-6">Version: v{doc.version}.0</div>
                    </td>
                    <td className="py-3.5 text-gray-300">
                      <div className="font-semibold text-white">{doc.case?.caseNumber}</div>
                      <div className="text-[10px] text-[#9CA3AF] max-w-[180px] truncate">
                        {doc.case?.title}
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-gray-200">
                        {doc.docType}
                      </span>
                    </td>
                    <td className="py-3.5 text-gray-300">
                      {doc.uploadedBy?.fullName || 'Advocate'}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.isClientVisible
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-amber-500/10 text-amber-400'
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {doc.isClientVisible ? 'Client Visible' : 'Internal Only'}
                      </span>
                    </td>
                    <td className="py-3.5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={async () => {
                          const signerName = prompt('Enter Advocate / Client Signer Name:', 'Adv. Rajesh Sharma');
                          if (!signerName) return;
                          try {
                            const res = await api.post('/documents/esign', { documentId: doc.id, signerName, signatureType: 'Aadhaar eSign' });
                            alert(res.data.message + '\nHash: ' + res.data.signatureHash);
                            fetchData();
                          } catch (err) {
                            alert('E-Signature failed');
                          }
                        }}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition-all"
                      >
                        <Shield className="w-3 h-3" /> E-Sign
                      </button>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-[11px] inline-flex items-center gap-1 transition-all"
                      >
                        <ArrowDownToLine className="w-3 h-3" /> Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATE LIBRARY */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300">
                    {tpl.category}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">{tpl.title}</h3>
                <p className="text-xs text-[#9CA3AF]">{tpl.description}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-white/[0.06] text-xs font-mono text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                {tpl.content}
              </div>

              <button
                onClick={() => copyTemplateContent(tpl.id, tpl.content)}
                className="w-full py-2.5 bg-white text-black font-bold text-xs rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
              >
                {copiedId === tpl.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Template Format</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/[0.15] rounded-2xl max-w-md w-full p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-lg font-bold text-white">Upload Case Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Select Case Matter</label>
                <select
                  required
                  value={uploadData.caseId}
                  onChange={(e) => setUploadData({ ...uploadData, caseId: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                >
                  <option value="">Select Case...</option>
                  {cases.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} - {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="Writ Petition Final Draft"
                  value={uploadData.title}
                  onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Document Type</label>
                <select
                  value={uploadData.docType}
                  onChange={(e) => setUploadData({ ...uploadData, docType: e.target.value })}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                >
                  <option value="NOTICE">NOTICE</option>
                  <option value="AFFIDAVIT">AFFIDAVIT</option>
                  <option value="PETITION">PETITION</option>
                  <option value="EVIDENCE">EVIDENCE</option>
                  <option value="AGREEMENT">AGREEMENT</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="clientVisible"
                  checked={uploadData.isClientVisible}
                  onChange={(e) => setUploadData({ ...uploadData, isClientVisible: e.target.checked })}
                  className="w-4 h-4 accent-white rounded"
                />
                <label htmlFor="clientVisible" className="text-gray-300 font-medium">
                  Visible on Client Portal
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="w-1/2 py-2.5 bg-white/10 text-white font-bold rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
