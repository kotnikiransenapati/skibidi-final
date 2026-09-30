import React from 'react';
import { useAuth, UserRole, ROLE_ACCOUNTS } from '../contexts/AuthContext';
import { ActiveScreen } from '../types';
import { ShieldAlert, ArrowLeft, ArrowRight, Lock } from 'lucide-react';

interface AccessDeniedScreenProps {
  attemptedScreen: ActiveScreen;
  requiredRole: UserRole;
  requiredRoleName: string;
  setActiveScreen: (screen: ActiveScreen) => void;
}

export const AccessDeniedScreen: React.FC<AccessDeniedScreenProps> = ({
  attemptedScreen,
  requiredRole,
  requiredRoleName,
  setActiveScreen,
}) => {
  const { currentRole, activeAccount, switchRole } = useAuth();
  const requiredAccount = ROLE_ACCOUNTS[requiredRole];

  const handleSwitchAndProceed = () => {
    switchRole(requiredRole);
    setActiveScreen(attemptedScreen);
  };

  const handleReturnToSafe = () => {
    if (currentRole === 'farmer') {
      setActiveScreen('farmer-panel');
    } else if (currentRole === 'admin') {
      setActiveScreen('admin-panel');
    } else if (currentRole === 'support') {
      setActiveScreen('support-panel');
    } else {
      setActiveScreen('landing');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50/70">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-bold uppercase tracking-wider font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Role-Based Access Control</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Access Restricted to {requiredRoleName}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            You are currently signed in under the <strong className="text-slate-800">{activeAccount.badge}</strong> as{' '}
            <strong className="text-slate-800">{activeAccount.name}</strong> ({activeAccount.title}).
          </p>
        </div>

        {/* Current vs Required Account Comparison */}
        <div className="grid grid-cols-2 gap-3 text-left p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
          <div className="space-y-1 pr-2 border-r border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Your Current Role
            </span>
            <div className="flex items-center gap-2">
              <img
                src={activeAccount.avatar}
                alt={activeAccount.name}
                className="w-7 h-7 rounded-full object-cover border border-slate-300"
              />
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{activeAccount.name}</p>
                <p className="text-[10px] text-slate-500 font-mono">[{activeAccount.badge}]</p>
              </div>
            </div>
            <p className="text-[10px] text-red-600 font-semibold pt-1">
              ✕ No permission for this panel
            </p>
          </div>

          <div className="space-y-1 pl-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Required Account
            </span>
            <div className="flex items-center gap-2">
              <img
                src={requiredAccount.avatar}
                alt={requiredAccount.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-400"
              />
              <div className="truncate">
                <p className="font-bold text-slate-900 truncate">{requiredAccount.name}</p>
                <p className="text-[10px] text-emerald-700 font-mono">[{requiredAccount.badge}]</p>
              </div>
            </div>
            <p className="text-[10px] text-emerald-700 font-semibold pt-1">
              ✓ Authorized Access
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleReturnToSafe}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Allowed Area</span>
          </button>

          <button
            onClick={handleSwitchAndProceed}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
          >
            <span>Switch to {requiredAccount.name.split(' ')[0]} Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Tip: You can switch roles at any time using the <strong>Role Panels</strong> switcher at the bottom-left.
        </p>
      </div>
    </div>
  );
};
