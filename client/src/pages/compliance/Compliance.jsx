import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Scale,
  Calculator,
  Award,
  Lock,
  AlertTriangle,
  CheckCircle2,
  Building,
  FileCheck,
} from 'lucide-react';
import api from '../../api/axios';

export default function Compliance() {
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState([]);
  const [barRegistry, setBarRegistry] = useState([]);
  const [dpdpSettings, setDpdpSettings] = useState(null);

  // Court Fee Calculator state
  const [stateName, setStateName] = useState('Delhi');
  const [claimAmount, setClaimAmount] = useState('1000000');
  const [suitType, setSuitType] = useState('MONEY_SUIT');
  const [feeResult, setFeeResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limRes, barRes, dpdpRes] = await Promise.all([
          api.get('/compliance/limitation'),
          api.get('/compliance/bar-council'),
          api.get('/compliance/dpdp'),
        ]);
        setAlerts(limRes.data?.alerts || []);
        setRules(limRes.data?.statutoryRules || []);
        setBarRegistry(barRes.data || []);
        setDpdpSettings(dpdpRes.data || null);
      } catch (e) {
        console.error('Failed to fetch compliance data:', e);
      }
    };
    fetchData();
  }, []);

  const handleCalculateFee = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(
        `/compliance/court-fee?state=${stateName}&claimAmount=${claimAmount}&suitType=${suitType}`
      );
      setFeeResult(res.data);
    } catch (err) {
      console.error('Court fee calculation failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="border-b border-white/[0.08] pb-5">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Statutory Compliance & Indian Legal Utilities
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Limitation Act warnings, State-wise Court Fee Calculator, Bar Council COP registry & DPDP Act data protection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 cols): Limitation Act Alerts & Rules */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Statutory Limitation Watch</h3>
              </div>
              <span className="text-xs text-amber-400 font-bold bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                Limitation Act 1963
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((a) => (
                <div
                  key={a.id}
                  className="p-4 rounded-xl bg-[#0A0A0A] border border-amber-500/20 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {a.actName} ({a.section})
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      {a.statutoryDays} Days Window
                    </span>
                  </div>

                  <div className="text-xs font-bold text-white">{a.case?.title}</div>
                  <div className="text-[11px] text-[#9CA3AF]">Trigger Event: {a.triggerEvent}</div>

                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-[#9CA3AF]">Statutory Deadline:</span>
                    <span className="text-white font-mono font-bold">
                      {new Date(a.deadlineDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statutory Reference Schedule */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <h3 className="text-base font-bold text-white">Statutory Limitation Reference Rules</h3>
            <div className="space-y-2 text-xs">
              {rules.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">
                      {r.act} · {r.section}
                    </div>
                    <div className="text-[11px] text-[#9CA3AF]">{r.description}</div>
                  </div>
                  <span className="font-mono font-bold text-amber-300 shrink-0 ml-2">
                    {r.statutoryDays} Days
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): State Court Fee Calculator & Bar Council COP */}
        <div className="lg:col-span-5 space-y-6">
          {/* State Court Fee Calculator Card */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">State Court Fee Calculator</h3>
            </div>

            <form onSubmit={handleCalculateFee} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">State Court Rules</label>
                <select
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none"
                >
                  <option value="Delhi">Delhi High Court / District Benches</option>
                  <option value="Maharashtra">Bombay High Court Rules</option>
                  <option value="Karnataka">Karnataka High Court Rules</option>
                  <option value="TamilNadu">Madras High Court Rules</option>
                  <option value="UttarPradesh">Allahabad High Court Rules</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Claim / Suit Value (₹)</label>
                <input
                  type="number"
                  required
                  value={claimAmount}
                  onChange={(e) => setClaimAmount(e.target.value)}
                  className="w-full p-2.5 bg-[#0A0A0A] border border-white/[0.15] rounded-xl text-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all"
              >
                Calculate Ad Valorem Court Fee
              </button>
            </form>

            {feeResult && (
              <div className="p-4 rounded-xl bg-[#0A0A0A] border border-purple-500/30 text-xs space-y-2 font-mono">
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Ad Valorem Base:</span>
                  <span className="text-white">{feeResult.adValoremPercent}</span>
                </div>
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Calculated Court Fee:</span>
                  <span className="text-white">₹{feeResult.calculatedCourtFee?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#9CA3AF]">
                  <span>Vakalatnama Stamp Fee:</span>
                  <span className="text-white">₹{feeResult.vakalatnamaStampFee}</span>
                </div>
                <div className="pt-2 border-t border-white/[0.08] flex justify-between font-bold text-amber-300 text-sm">
                  <span>Total Stamp Duty Required:</span>
                  <span>₹{feeResult.totalStampDuty?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Bar Council Registry Status */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Bar Council COP Verification</h3>
            </div>

            <div className="space-y-2 text-xs">
              {barRegistry.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="p-3 rounded-xl bg-[#0A0A0A] border border-white/[0.06] flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-white">{lawyer.fullName}</div>
                    <div className="text-[11px] text-[#9CA3AF]">
                      Bar No: {lawyer.barCouncilNo || 'Verified'} · {lawyer.stateBarCouncil}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px]">
                    COP ACTIVE
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DPDP Act 2023 Card */}
          {dpdpSettings && (
            <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                <Lock className="w-4 h-4" />
                <span>{dpdpSettings.act}</span>
              </div>
              <p className="text-[11px] text-[#9CA3AF]">
                Data Fiduciary: {dpdpSettings.dataFiduciary} · Retention: {dpdpSettings.retentionPolicyMonths} Months (7 Years statutory tax & litigation mandate). Encryption: {dpdpSettings.encryptionAtRest}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
