import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { TrendingUp, Users, Award, Target, Plus, DollarSign, ArrowUpRight } from 'lucide-react';

export default function BusinessDev() {
  const [referralsData, setReferralsData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [retentionData, setRetentionData] = useState(null);
  const [loading, setLoading] = useState(true);

  // New referral modal
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('PARTNER_FIRM');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [refRes, campRes, retRes] = await Promise.all([
        axios.get('/business-dev/referrals'),
        axios.get('/business-dev/campaigns'),
        axios.get('/business-dev/retention'),
      ]);
      setReferralsData(refRes.data);
      setCampaigns(campRes.data);
      setRetentionData(retRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/business-dev/referrals', { name, type, email, phone });
      setShowModal(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Development & Marketing Analytics</h1>
          <p className="text-xs text-neutral-400">Referral source tracking, marketing ROI, partner management, and repeat-client retention.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold text-xs rounded-xl flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition"
        >
          <Plus className="w-4 h-4" /> Add Referral Partner
        </button>
      </div>

      {/* Top Key Performance Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Referral Generated Dues</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            ₹{referralsData?.summary?.totalRevenue?.toLocaleString('en-IN') || 0}
          </p>
          <p className="text-[11px] text-emerald-400 font-medium">From {referralsData?.summary?.totalLeads || 0} referred leads</p>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Repeat-Client Retention Ratio</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400">
            {retentionData?.repeatClientRatioPercent || '0%'}
          </p>
          <p className="text-[11px] text-neutral-400">{retentionData?.repeatClientsCount || 0} corporate clients with multi-matter mandates</p>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Active Referral Network</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">
            {referralsData?.summary?.totalSources || 0}
          </p>
          <p className="text-[11px] text-neutral-400">Partner firms, CAs, and campaigns</p>
        </div>

        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-xs">
            <span>Marketing Campaign ROI</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400">7.2x</p>
          <p className="text-[11px] text-blue-400">Google Ads & Legal Newsletter campaigns</p>
        </div>
      </div>

      {/* Grid: Referral Partners & Marketing Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Referral Partners Table */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Top Referral Partners & Sources
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-[#1C1C1C] text-neutral-400 font-semibold border-b border-white/10">
                <tr>
                  <th className="py-2.5 px-3">Partner Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Leads</th>
                  <th className="py-2.5 px-3">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {referralsData?.sources?.map(s => (
                  <tr key={s.id} className="hover:bg-white/5">
                    <td className="py-3 px-3 font-semibold text-white">{s.name}</td>
                    <td className="py-3 px-3">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[10px]">{s.type}</span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-amber-400">{s.totalLeads}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">₹{s.revenueGenerated.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Marketing Campaigns Table */}
        <div className="bg-[#141414] border border-white/10 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Target className="w-4 h-4 text-purple-400" /> Active Marketing Campaigns
          </h2>

          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-[#1C1C1C] border border-white/10 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">{c.name}</h4>
                  <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded">{c.channel}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-white/5">
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Leads Generated</span>
                    <span className="font-bold text-white text-sm">{c.leads}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Converted</span>
                    <span className="font-bold text-amber-400 text-sm">{c.converted}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] block">Revenue</span>
                    <span className="font-bold text-emerald-400 text-sm">₹{(c.revenue / 100000).toFixed(1)}L</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add Referral Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#141414] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl text-white">
            <h3 className="text-lg font-semibold">Add Referral Partner / Source</h3>
            <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-400 block mb-1">Partner Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Singhania & Partners LLP"
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Partner Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-white focus:outline-none"
                >
                  <option value="PARTNER_FIRM">Partner Law Firm</option>
                  <option value="INDIVIDUAL">Individual Professional (CA / Consultant)</option>
                  <option value="CAMPAIGN">Digital Campaign / Directory</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@firm.com"
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98100 11111"
                    className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400">
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
