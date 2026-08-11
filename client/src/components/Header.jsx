import React, { useState } from 'react';
import { Search, Bell, Shield, ChevronRight, Sparkles } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import AiAssistantModal from './ai/AiAssistantModal';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Executive Dashboard';
    if (path.includes('/clients')) return 'Client Directory & Pipeline';
    if (path.includes('/cases')) return 'Case & Matter Directory';
    if (path.includes('/filings')) return 'Case Filings & Stage Tracker';
    if (path.includes('/documents')) return 'Document Vault & Templates';
    if (path.includes('/calendar')) return 'Task & Hearing Assignment Hub';
    if (path.includes('/tasks')) return 'Task & Workflow Kanban';
    if (path.includes('/communications')) return 'Omnichannel Communications';
    if (path.includes('/research')) return 'Legal Research & Judgments';
    if (path.includes('/business-dev')) return 'Business Development & Marketing';
    if (path.includes('/billing')) return 'GST Invoicing & Timesheets';
    if (path.includes('/compliance')) return 'Statutory Compliance & Court Fees';
    if (path.includes('/reports')) return 'Analytics & Practice Metrics';
    if (path.includes('/portal')) return 'Client Portal Workspace';
    if (path.includes('/settings')) return 'Firm Administration & Audit Logs';
    return 'Operating System';
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-[#0A0A0B] border-b border-slate-200 dark:border-[#1E1E22] px-6 flex items-center justify-between sticky top-0 z-30 select-none transition-colors">
        {/* Left: Page Title & Breadcrumb */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-500 dark:text-[#8E8E93]">NR Elango OS</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-[#52525B]" />
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{getPageTitle()}</h1>
        </div>

        {/* Right: AI Assistant, Search, Notifications, Theme Toggle */}
        <div className="flex items-center gap-3">
          
          {/* AI Legal Assistant Trigger Button */}
          <button
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-neutral-200 font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          {/* Global Quick Search */}
          <div className="relative hidden md:block w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A]" />
            <input
              type="text"
              placeholder="Search cases, CNR, clients..."
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#52525B] focus:outline-none focus:border-slate-400 dark:focus:border-[#3F3F46] transition-all"
            />
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg border border-slate-200 dark:border-[#222225] bg-slate-50 dark:bg-[#121214] hover:bg-slate-100 dark:hover:bg-[#18181B] text-slate-600 dark:text-[#A1A1AA] transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-xl shadow-xl p-4 space-y-3 z-50 text-slate-900 dark:text-white">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#222225] pb-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Court Hearing Alerts</span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">3 Upcoming</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225]">
                    <div className="font-semibold text-slate-900 dark:text-white">Chennai Super Infra vs. State of TN</div>
                    <div className="text-slate-500 dark:text-[#8E8E93] text-[11px]">Madras HC · Aug 12, 10:30 AM</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#222225]">
                    <div className="font-semibold text-slate-900 dark:text-white">TNEB Solar vs. Union of India</div>
                    <div className="text-slate-500 dark:text-[#8E8E93] text-[11px]">Supreme Court · Aug 19, 11:00 AM</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-[#121214] border border-slate-200 dark:border-[#222225] rounded-lg text-xs text-slate-900 dark:text-white">
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">{user?.fullName}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#18181B] uppercase font-bold text-slate-700 dark:text-[#A1A1AA]">
              {user?.role}
            </span>
          </div>
        </div>
      </header>

      {/* AI Assistant Modal */}
      <AiAssistantModal isOpen={showAiModal} onClose={() => setShowAiModal(false)} />
    </>
  );
}
