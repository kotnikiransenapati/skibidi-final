import React, { useState } from 'react';
import { ActiveScreen } from '../types';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface FloatingRolePortalWidgetProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
}

export const FloatingRolePortalWidget: React.FC<FloatingRolePortalWidgetProps> = ({
  activeScreen,
  setActiveScreen,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { switchRole, currentRole, activeAccount } = useAuth();

  const portals = [
    {
      id: 'landing',
      role: 'customer' as UserRole,
      label: 'Storefront',
      desc: 'Consumer Marketplace',
      icon: 'storefront',
      account: 'Priya Sharma (Customer)',
    },
    {
      id: 'profile',
      role: 'customer' as UserRole,
      label: 'Customer Profile',
      desc: 'Preferences & Escrow',
      icon: 'account_circle',
      account: 'Priya Sharma (Customer)',
    },
    {
      id: 'farmer-panel',
      role: 'farmer' as UserRole,
      label: 'Farmer Workflow',
      desc: 'Harvest & Reefer Dispatch',
      icon: 'agriculture',
      account: 'Ramesh Patel (Lead Smallholder)',
    },
    {
      id: 'admin-panel',
      role: 'admin' as UserRole,
      label: 'Admin Command',
      desc: 'Cold-Chain Fleet Radar',
      icon: 'admin_panel_settings',
      account: 'Dr. Rajesh Kulkarni (Platform Admin)',
    },
    {
      id: 'support-panel',
      role: 'support' as UserRole,
      label: 'Support Desk',
      desc: 'Dispute Arbitration',
      icon: 'support_agent',
      account: 'Ananya Deshmukh (Dispute Arbiter)',
    },
  ];

  return (
    <div className="fixed bottom-5 left-5 z-40 print:hidden">
      {isOpen ? (
        <div className="bg-white/98 backdrop-blur-md text-slate-800 rounded-3xl p-4 shadow-2xl border border-slate-200/90 w-80 text-xs space-y-3 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="material-symbols-outlined text-[18px] text-emerald-700">tune</span>
              <span>Stakeholder Roles &amp; Panels</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              title="Collapse"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {/* Active Account Pill */}
          <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={activeAccount.avatar}
                alt={activeAccount.name}
                className="w-6 h-6 rounded-full object-cover border border-emerald-500"
              />
              <div>
                <p className="font-bold text-slate-900 text-[11px] truncate">{activeAccount.name}</p>
                <p className="text-[10px] text-emerald-700 font-mono">[{activeAccount.badge}]</p>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Active ID</span>
          </div>

          <div className="space-y-1">
            {portals.map((p) => {
              const isScreenActive = activeScreen === p.id;
              const isRoleMatched = currentRole === p.role;

              return (
                <button
                  key={p.id}
                  onClick={() => {
                    // Switch to the matching role and navigate
                    switchRole(p.role);
                    setActiveScreen(p.id as ActiveScreen);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                    isScreenActive
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[18px] ${
                        isScreenActive ? 'text-emerald-700' : 'text-slate-500'
                      }`}
                    >
                      {p.icon}
                    </span>
                    <div>
                      <div className="text-xs font-semibold">{p.label}</div>
                      <div className="text-[10px] text-slate-500">{p.account}</div>
                    </div>
                  </div>
                  {isRoleMatched && (
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                      Current
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Click any role to switch account</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-emerald-700 font-semibold hover:underline cursor-pointer"
            >
              Minimize
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-lg border border-slate-200/90 backdrop-blur-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
          title="Switch Stakeholder View"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="material-symbols-outlined text-[18px] text-emerald-700">switch_account</span>
          <span className="hidden sm:inline font-bold">Role Panels</span>
          <span className="text-slate-600 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-full font-mono font-bold border border-slate-200">
            {activeAccount.role}
          </span>
        </button>
      )}
    </div>
  );
};
