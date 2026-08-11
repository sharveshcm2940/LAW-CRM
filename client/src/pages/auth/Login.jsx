import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle';
import LawCrmLogo from '../../components/common/LawCrmLogo';

export default function Login() {
  const [username, setUsername] = useState('partner@nrelango.in');
  const [password, setPassword] = useState('Password123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(username, password);
      if (user.role === 'CLIENT') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials. Please verify your advocate username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = (demoUser) => {
    if (demoUser === 'partner') {
      setUsername('partner@nrelango.in');
      setPassword('Password123!');
    } else if (demoUser === 'associate') {
      setUsername('associate@nrelango.in');
      setPassword('Password123!');
    } else if (demoUser === 'client') {
      setUsername('client@nrelango.in');
      setPassword('Password123!');
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white relative font-sans antialiased transition-colors">
      
      {/* Top Right Theme Toggle Switcher */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Left Panel: Hairline Grid Background with Structured Legal Chambers Features */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 lg:p-16 bg-grid-pattern border-r border-slate-200 dark:border-[#1E1E22] relative select-none">
        
        {/* Unique Bespoke Law CRM Logo Header */}
        <LawCrmLogo className="w-9 h-9" showText={true} />

        {/* Center Content Section */}
        <div className="my-auto space-y-8 max-w-xl">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-slate-200 dark:bg-[#18181B] border border-slate-300 dark:border-[#27272A] text-slate-700 dark:text-[#A1A1AA] w-fit">
            NR Elango Law Associates · Chambers OS
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
            One system for litigation,<br />cause lists & advocate execution.
          </h1>

          {/* Structured Key-Value Legal List */}
          <div className="space-y-3 pt-2 text-xs font-sans">
            {[
              { key: 'Chambers', desc: 'Senior Advocate Chambers of N.R. Elango (High Court & SC)' },
              { key: 'Litigation', desc: 'Madras High Court First Bench & Madurai Bench Cause Lists' },
              { key: 'Statutory', desc: 'Limitation Act 1963 warnings for Writs, Sec 482 & Sec 138' },
              { key: 'Pleadings', desc: 'Document Vault, Aadhaar eSign & Automated Notice Drafter' },
              { key: 'Precedents', desc: 'Supreme Court & High Court Judgment binder & citation index' },
              { key: 'Finances', desc: 'GST SAC 998211 invoices, 18% GST calculation & Sec 194J TDS' },
              { key: 'Privilege', desc: 'Advocate-Client legal privilege & DPDP Act 2023 compliance' },
            ].map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 items-baseline">
                <div className="col-span-3 font-bold text-slate-900 dark:text-white tracking-wide">
                  {item.key}
                </div>
                <div className="col-span-9 text-slate-600 dark:text-[#8E8E93] leading-relaxed font-normal">
                  {item.desc}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom Left Footer Note */}
        <div className="text-xs text-slate-500 dark:text-[#52525B] font-normal">
          Bar Council of Tamil Nadu & Puducherry Reg: TN/1088/1992.
        </div>
      </div>

      {/* Right Panel: Clean Sign In Box */}
      <div className="w-full lg:w-[48%] flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-[#0A0A0B]">
        <div className="w-full max-w-sm space-y-6">
          
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <LawCrmLogo className="w-8 h-8" showText={true} />
          </div>

          {/* Sign In Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Sign in</h2>
            <p className="text-xs text-slate-500 dark:text-[#8E8E93] mt-1.5 font-normal">
              Use your NR Elango credentials to continue.
            </p>
          </div>

          {/* Quick Demo Role Prefill Selector */}
          <div className="p-2.5 bg-slate-100 dark:bg-[#121214] rounded-xl border border-slate-200 dark:border-[#222225]">
            <div className="text-[10px] font-semibold text-slate-600 dark:text-[#8E8E93] mb-2">Select Demo Role Profile:</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoRole('partner')}
                className={`py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                  username === 'partner@nrelango.in'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold'
                    : 'bg-white dark:bg-[#18181B] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#27272A]'
                }`}
              >
                Senior Partner
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoRole('associate')}
                className={`py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                  username === 'associate@nrelango.in'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold'
                    : 'bg-white dark:bg-[#18181B] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#27272A]'
                }`}
              >
                Associate
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoRole('client')}
                className={`py-1 px-2 rounded-md text-[11px] font-medium transition-all ${
                  username === 'client@nrelango.in'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold'
                    : 'bg-white dark:bg-[#18181B] text-slate-700 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[#27272A]'
                }`}
              >
                Client
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-[#8E8E93] font-medium mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="partner@nrelango.in"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-500 dark:focus:border-[#52525B] transition-all"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-[#8E8E93] font-medium mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0A0A0B] border border-slate-300 dark:border-[#28282B] rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-500 dark:focus:border-[#52525B] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 text-xs"
            >
              {loading ? 'Signing in...' : 'Continue'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="pt-4 text-xs text-slate-500 dark:text-[#52525B] font-normal leading-relaxed">
            Access is provisioned by Chambers Operations. Contact your team lead if you can't sign in.
          </div>

        </div>
      </div>
    </div>
  );
}
