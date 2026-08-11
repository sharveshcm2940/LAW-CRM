import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderLock,
  Calendar,
  Receipt,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
  BookOpen,
  FilePlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LawCrmLogo from './common/LawCrmLogo';

export default function Sidebar() {
  const { user, logout, hasRole } = useAuth();

  const corePracticeItems = [
    { label: 'Executive Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN', 'ACCOUNTANT'] },
    { label: 'Clients & Directory', path: '/clients', icon: Users, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
    { label: 'Matters & Cause Lists', path: '/cases', icon: Briefcase, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
    { label: 'Case Filings & Stages', path: '/filings', icon: FilePlus, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
    { label: 'Calendar & Tasks', path: '/calendar', icon: Calendar, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
    { label: 'Document Vault & E-Sign', path: '/documents', icon: FolderLock, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
  ];

  const intelligenceItems = [
    { label: 'GST Invoicing & Retainers', path: '/billing', icon: Receipt, roles: ['PARTNER', 'ACCOUNTANT', 'ADMIN', 'ASSOCIATE'] },
    { label: 'Legal Research & Precedents', path: '/research', icon: BookOpen, roles: ['PARTNER', 'ASSOCIATE', 'PARALEGAL', 'ADMIN'] },
    { label: 'Statutory Limitation', path: '/compliance', icon: ShieldAlert, roles: ['PARTNER', 'ASSOCIATE', 'ADMIN'] },
    { label: 'Analytics & Performance', path: '/reports', icon: BarChart3, roles: ['PARTNER', 'ADMIN', 'ACCOUNTANT'] },
    { label: 'Firm Settings', path: '/settings', icon: Settings, roles: ['PARTNER', 'ADMIN'] },
  ];

  const clientPortalItem = { label: 'Client Portal Workspace', path: '/portal', icon: UserCheck, roles: ['CLIENT'] };

  return (
    <aside className="w-64 bg-white dark:bg-[#0A0A0B] border-r border-slate-200 dark:border-[#1E1E22] flex flex-col justify-between h-screen sticky top-0 z-40 select-none transition-colors">
      <div>
        {/* Brand Header with LawCrmLogo */}
        <div className="p-4 border-b border-slate-200 dark:border-[#1E1E22] bg-slate-50 dark:bg-[#0B0B0C]">
          <LawCrmLogo className="w-8 h-8" showText={true} />
        </div>

        {/* User Card */}
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-100 dark:bg-[#121214] border border-slate-200 dark:border-[#222225]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-[#18181B] border border-slate-300 dark:border-[#27272A] flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.fullName}</div>
              <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 dark:text-[#8E8E93] mt-0.5">
                {user?.role}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 pt-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          
          {/* CLIENT PORTAL ROLE ONLY */}
          {user?.role === 'CLIENT' && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#52525B] px-3 mb-1.5">
                PORTAL WORKSPACE
              </div>
              <NavLink
                to={clientPortalItem.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181B]'
                  }`
                }
              >
                <UserCheck className="w-4 h-4 shrink-0" />
                <span className="truncate">{clientPortalItem.label}</span>
              </NavLink>
            </div>
          )}

          {/* ADVOCATE & STAFF ROLES */}
          {user?.role !== 'CLIENT' && (
            <>
              {/* SECTION 1: PRACTICE MANAGEMENT */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#52525B] px-3 mb-1.5">
                  PRACTICE MANAGEMENT
                </div>
                <div className="space-y-1">
                  {corePracticeItems.map((item) => {
                    if (!hasRole(item.roles)) return null;
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                              : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181B]'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: FINANCES & COMPLIANCE */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#52525B] px-3 mb-1.5">
                  FINANCES & COMPLIANCE
                </div>
                <div className="space-y-1">
                  {intelligenceItems.map((item) => {
                    if (!hasRole(item.roles)) return null;
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                            isActive
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-xs'
                              : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#18181B]'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1E1E22] bg-slate-50 dark:bg-[#0B0B0C]">
        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-[#8E8E93] hover:bg-slate-200 dark:hover:bg-[#18181B] hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-150"
        >
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
