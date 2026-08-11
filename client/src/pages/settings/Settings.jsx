import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Shield, Lock, FileText, Building, Key, Users, CheckCircle2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState([]);
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled || false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await api.get('/auth/audit-logs');
        setAuditLogs(res.data || []);
      } catch (e) {
        console.error('Failed to fetch audit logs:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const handleToggleMfa = async () => {
    try {
      const res = await api.post('/auth/toggle-mfa');
      setMfaEnabled(res.data.mfaEnabled);
    } catch (e) {
      alert('Failed to toggle MFA setting');
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="border-b border-white/[0.08] pb-5">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">
          Firm Administration & Security Audit
        </h2>
        <p className="text-xs text-[#9CA3AF]">
          Firm letterhead branding, role-based access control, security audit logs, and MFA settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Firm Profile & Security Settings */}
        <div className="lg:col-span-5 space-y-6">
          {/* Firm Branding Card */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-bold text-white">Firm Identity & Letterhead</h3>
            </div>

            <div className="space-y-3 text-xs bg-[#0A0A0A] p-4 rounded-xl border border-white/[0.06]">
              <div>
                <span className="text-[#9CA3AF] block font-medium">Firm Name</span>
                <span className="text-white font-bold text-sm block mt-0.5">
                  LexOS Chambers & Partners
                </span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block font-medium">Bar Registration</span>
                <span className="text-white font-bold block mt-0.5">ND/BAR/2010/889</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block font-medium">GSTIN & PAN</span>
                <span className="text-gray-300 font-mono block mt-0.5">
                  GST: 07AAACL1234A1Z1 | PAN: AAACL1234A
                </span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block font-medium">Registered Address</span>
                <span className="text-gray-300 block mt-0.5">
                  Suite 401-404, Legal Towers, Barakhamba Road, Connaught Place, New Delhi 110001
                </span>
              </div>
            </div>
          </div>

          {/* MFA & Security Settings */}
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Multi-Factor Auth (MFA)</h3>
              </div>
              <button
                onClick={handleToggleMfa}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  mfaEnabled
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {mfaEnabled ? 'ENABLED ✓' : 'ENABLE MFA'}
              </button>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              Require TOTP authenticator app verification upon every partner/associate login attempt.
            </p>
          </div>
        </div>

        {/* Right Column (7 cols): System Security Audit Logs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-[#111113] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white">Security Audit Log Timeline</h3>
              </div>
              <span className="text-xs text-[#9CA3AF]">Last 50 Actions</span>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#0A0A0A] border border-white/[0.06] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-white">
                      {log.user?.fullName || 'System User'} ({log.user?.role || 'SYSTEM'})
                    </span>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </div>

                  <div className="text-[#9CA3AF] text-[11px]">{log.details}</div>

                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1">
                    <span>IP: {log.ipAddress}</span>
                    <span>
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
