import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { MessageSquare, Mail, Phone, Send, Plus, Users, Filter, CheckCircle2 } from 'lucide-react';

export default function Communications() {
  const [comms, setComms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState('ALL');

  // New communication log state
  const [showModal, setShowModal] = useState(false);
  const [channel, setChannel] = useState('WHATSAPP');
  const [direction, setDirection] = useState('OUTBOUND');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipient, setRecipient] = useState('');

  // Bulk communication state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkChannel, setBulkChannel] = useState('EMAIL');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');

  useEffect(() => {
    fetchComms();
  }, []);

  const fetchComms = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/communications');
      setComms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogComm = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/communications', {
        channel,
        direction,
        subject,
        body,
        recipient,
      });
      setShowModal(false);
      setSubject('');
      setBody('');
      setRecipient('');
      fetchComms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendBulk = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/communications/send-bulk', {
        channel: bulkChannel,
        subject: bulkSubject,
        body: bulkBody,
      });
      setShowBulkModal(false);
      setBulkSubject('');
      setBulkBody('');
      fetchComms();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComms = selectedChannel === 'ALL'
    ? comms
    : comms.filter(c => c.channel === selectedChannel);

  const getChannelBadge = (ch) => {
    switch (ch) {
      case 'WHATSAPP': return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><MessageSquare className="w-3 h-3" /> WhatsApp</span>;
      case 'EMAIL': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>;
      case 'PHONE_CALL': return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Phone className="w-3 h-3" /> Call Log</span>;
      default: return <span className="bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1"><Send className="w-3 h-3" /> SMS</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Omnichannel Client Communications</h1>
          <p className="text-xs text-neutral-400">WhatsApp, Email, SMS and Call Logs linked across client profiles & court matters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <Users className="w-4 h-4" /> Bulk Client Broadcast
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs rounded-xl flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4" /> Log Communication
          </button>
        </div>
      </div>

      {/* Filter Channel Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'ALL', label: 'All Channels' },
          { id: 'WHATSAPP', label: 'WhatsApp' },
          { id: 'EMAIL', label: 'Email' },
          { id: 'PHONE_CALL', label: 'Phone Call Logs' },
          { id: 'SMS', label: 'SMS' },
        ].map(ch => (
          <button
            key={ch.id}
            onClick={() => setSelectedChannel(ch.id)}
            className={`px-3 py-1.5 rounded-lg border transition ${
              selectedChannel === ch.id
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium'
                : 'bg-[#141414] border-white/10 text-neutral-400 hover:text-white'
            }`}
          >
            {ch.label}
          </button>
        ))}
      </div>

      {/* Communications Table */}
      <div className="bg-[#141414] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="bg-[#1C1C1C] text-neutral-400 font-semibold border-b border-white/10">
              <tr>
                <th className="py-3 px-4">Channel & Direction</th>
                <th className="py-3 px-4">Client / Matter</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Message Snippet</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComms.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {getChannelBadge(c.channel)}
                      <span className="text-[10px] text-neutral-500 uppercase">{c.direction}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-white">
                    {c.client?.name || 'General Client'}
                    {c.case && <span className="block text-[10px] text-amber-400">{c.case.caseNumber}</span>}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-neutral-200">{c.subject || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-neutral-400 max-w-xs truncate">{c.body}</td>
                  <td className="py-3.5 px-4 text-neutral-400">{c.loggedBy || 'System'}</td>
                  <td className="py-3.5 px-4 text-neutral-500">{new Date(c.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Comm Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-lg font-semibold">Log Communication Activity</h3>
            <form onSubmit={handleLogComm} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Channel</label>
                  <select
                    value={channel}
                    onChange={e => setChannel(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="EMAIL">Email</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Direction</label>
                  <select
                    value={direction}
                    onChange={e => setDirection(e.target.value)}
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                  >
                    <option value="OUTBOUND">Outbound</option>
                    <option value="INBOUND">Inbound</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Recipient Phone / Email</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  placeholder="+91 98101 55443 or client@company.com"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Subject / Summary</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Discussed Writ Petition Strategy"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Details & Message Body</label>
                <textarea
                  required
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={3}
                  placeholder="Enter call notes or message transcript..."
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400">
                  Save Activity Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Broadcast Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-lg font-semibold text-purple-400">Bulk Client Announcement</h3>
            <form onSubmit={handleSendBulk} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Broadcast Channel</label>
                <select
                  value={bulkChannel}
                  onChange={e => setBulkChannel(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="EMAIL">Email Broadcast</option>
                  <option value="WHATSAPP">WhatsApp Broadcast</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Announcement Subject</label>
                <input
                  type="text"
                  required
                  value={bulkSubject}
                  onChange={e => setBulkSubject(e.target.value)}
                  placeholder="e.g. High Court Summer Vacation Registry Circular"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Broadcast Content</label>
                <textarea
                  required
                  value={bulkBody}
                  onChange={e => setBulkBody(e.target.value)}
                  rows={4}
                  placeholder="Notice message to all registered active clients..."
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700">
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
