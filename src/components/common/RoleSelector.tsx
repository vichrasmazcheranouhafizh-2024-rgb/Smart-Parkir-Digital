import React from 'react';
import { Shield, QrCode, User, HelpCircle } from 'lucide-react';
import { Role } from '../../types';

interface RoleSelectorProps {
  currentRole: Role;
  onChangeRole: (newRole: Role) => void;
  onResetOnboarding: () => void;
}

export default function RoleSelector({ currentRole, onChangeRole, onResetOnboarding }: RoleSelectorProps) {
  return (
    <div id="role-selector-floating" className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-3 border border-slate-200 flex flex-col gap-2 max-w-xs transition-all duration-300 hover:shadow-indigo-500/10">
      <div className="flex items-center justify-between border-b pb-2 mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulasi Peran</span>
        <button 
          onClick={onResetOnboarding}
          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
          title="Ulangi Onboarding"
        >
          <HelpCircle size={10} /> Onboard
        </button>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChangeRole('user')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentRole === 'user'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <User size={14} /> User
        </button>
        <button
          onClick={() => onChangeRole('petugas')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentRole === 'petugas'
              ? 'bg-slate-700 text-white shadow-md shadow-slate-500/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <QrCode size={14} /> Petugas
        </button>
        <button
          onClick={() => onChangeRole('admin')}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            currentRole === 'admin'
              ? 'bg-slate-900 text-white shadow-md shadow-slate-950/30'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <Shield size={14} /> Admin
        </button>
      </div>
    </div>
  );
}
