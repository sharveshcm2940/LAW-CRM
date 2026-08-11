import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import api from '../../api/axios';

export default function Reports() {
  const [caseload, setCaseload] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [aging, setAging] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [caseRes, revRes, ageRes] = await Promise.all([
          api.get('/reports/caseload'),
          api.get('/reports/revenue'),
          api.get('/reports/aging'),
        ]);
        setCaseload(caseRes.data || []);
        setRevenue(revRes.data || null);
        setAging(ageRes.data || null);
      } catch (e) {
        console.error('Failed to fetch analytics reports:', e);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-white/[0.08] pb-5">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Firm Analytics & Practice Metrics
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Caseload distribution per advocate, practice area revenue, and outstanding payment aging analysis
        </p>
      </div>

      {/* Revenue Summary Grid */}
      {revenue && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
            <span className="text-xs text-[#9CA3AF]">Total Net Billed</span>
            <div className="text-2xl font-extrabold text-white">
              ₹{revenue.summary?.totalBilled?.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
            <span className="text-xs text-[#9CA3AF]">Collected Dues</span>
            <div className="text-2xl font-extrabold text-emerald-400">
              ₹{revenue.summary?.totalCollected?.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
            <span className="text-xs text-[#9CA3AF]">Total GST Liability</span>
            <div className="text-2xl font-extrabold text-[#9CA3AF]">
              ₹{revenue.summary?.totalGst?.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-1">
            <span className="text-xs text-[#9CA3AF]">TDS 194J Retained</span>
            <div className="text-2xl font-extrabold text-amber-400">
              ₹{revenue.summary?.totalTds?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      )}

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (6 cols): Caseload Per Advocate */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <h3 className="text-base font-bold text-white">Caseload per Advocate</h3>
            <div className="space-y-3 text-xs">
              {caseload.map((lawyer) => (
                <div
                  key={lawyer.lawyerId}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-white/[0.06] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{lawyer.lawyerName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-gray-200">
                      {lawyer.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.06] text-center">
                    <div className="p-2 rounded bg-white/[0.03]">
                      <div className="text-gray-400 text-[10px]">Active Suits</div>
                      <div className="text-white font-bold">{lawyer.activeCases}</div>
                    </div>
                    <div className="p-2 rounded bg-white/[0.03]">
                      <div className="text-gray-400 text-[10px]">Civil / Writs</div>
                      <div className="text-blue-400 font-bold">{lawyer.civilCount}</div>
                    </div>
                    <div className="p-2 rounded bg-white/[0.03]">
                      <div className="text-gray-400 text-[10px]">Criminal / NI</div>
                      <div className="text-purple-400 font-bold">{lawyer.criminalCount}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Payment Aging Buckets */}
        <div className="lg:col-span-6 space-y-4">
          {aging && (
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
              <h3 className="text-base font-bold text-white">Pending Invoice Aging Analysis</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-emerald-500/20">
                  <div className="text-[#9CA3AF]">0 - 30 Days (Current)</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    ₹{aging.summary?.currentTotal?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-blue-500/20">
                  <div className="text-[#9CA3AF]">31 - 60 Days</div>
                  <div className="text-xl font-bold text-blue-400 mt-1">
                    ₹{aging.summary?.thirtyToSixtyTotal?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-amber-500/20">
                  <div className="text-[#9CA3AF]">61 - 90 Days</div>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    ₹{aging.summary?.sixtyToNinetyTotal?.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0A] border border-red-500/20">
                  <div className="text-[#9CA3AF]">&gt; 90 Days Overdue</div>
                  <div className="text-xl font-bold text-red-400 mt-1">
                    ₹{aging.summary?.overNinetyTotal?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
