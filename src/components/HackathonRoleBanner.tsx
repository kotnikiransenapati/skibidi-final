import React from 'react';
import { useAuth, ROLE_ACCOUNTS, UserRole } from '../contexts/AuthContext';
import { ActiveScreen } from '../types';

interface HackathonRoleBannerProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
}

export const HackathonRoleBanner: React.FC<HackathonRoleBannerProps> = ({
  activeScreen,
  setActiveScreen,
}) => {
  const { currentRole, activeAccount, roleToast, dismissToast, switchRole } = useAuth();

  const isRestrictedPanel =
    activeScreen === 'admin-panel' ||
    activeScreen === 'farmer-panel' ||
    activeScreen === 'support-panel';

  return (
    <>
      {/* Toast Alert on Account Transition - Clean White Theme */}
      {roleToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-white text-slate-900 px-5 py-3 rounded-2xl shadow-xl border border-emerald-400/80 flex items-center space-x-3 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <div className="flex items-center space-x-2">
              <span className="font-bold text-emerald-800">Role Switched:</span>
              <span className="text-slate-700 font-medium">{roleToast}</span>
            </div>
            <button
              onClick={dismissToast}
              className="text-slate-400 hover:text-slate-700 ml-2 p-1 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Persistent Elevated Status Bar for Authenticated Stakeholder Panels - Clean White Theme */}
      {isRestrictedPanel && (
        <div className="bg-white/95 text-slate-800 border-b border-slate-200/90 px-6 py-2.5 text-xs flex flex-wrap items-center justify-between gap-3 shadow-xs backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2.5">
              <img
                src={activeAccount.avatar}
                alt={activeAccount.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-600 shadow-xs"
              />
              <div>
                <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                  <span>{activeAccount.name}</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-mono font-bold">
                    {activeAccount.badge}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">{activeAccount.title}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline font-medium">
              Switch role view:
            </span>

            <button
              onClick={() => {
                switchRole('customer');
                setActiveScreen('landing');
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition shadow-xs text-xs"
            >
              Storefront View
            </button>

            {activeScreen !== 'admin-panel' && (
              <button
                onClick={() => {
                  switchRole('admin');
                  setActiveScreen('admin-panel');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition text-xs"
              >
                Admin Panel
              </button>
            )}

            {activeScreen !== 'farmer-panel' && (
              <button
                onClick={() => {
                  switchRole('farmer');
                  setActiveScreen('farmer-panel');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition text-xs"
              >
                Farmer Panel
              </button>
            )}

            {activeScreen !== 'support-panel' && (
              <button
                onClick={() => {
                  switchRole('support');
                  setActiveScreen('support-panel');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200 transition text-xs"
              >
                Support Panel
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
