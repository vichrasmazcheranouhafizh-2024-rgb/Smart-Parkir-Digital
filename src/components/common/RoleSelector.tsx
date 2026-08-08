import React, { useState } from 'react';
import { Shield, QrCode, User, HelpCircle, ChevronUp, ChevronDown, X } from 'lucide-react';
import { Role } from '../../types';

interface RoleSelectorProps {
  currentRole: Role;
  onChangeRole: (newRole: Role) => void;
  onResetOnboarding: () => void;
}

export default function RoleSelector({ currentRole, onChangeRole, onResetOnboarding }: RoleSelectorProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // Completely hidden — show only a tiny floating restore button
  if (isHidden) {
    return (
      <button
        id="role-selector-restore"
        onClick={() => { setIsHidden(false); setIsCollapsed(false); }}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
        title="Tampilkan Simulasi Peran"
      >
        <User size={18} />
      </button>
    );
  }

  // Collapsed — show a compact pill
  if (isCollapsed) {
    return (
      <div
        id="role-selector-collapsed"
        className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md shadow-xl rounded-full px-3 py-2 border border-slate-200 flex items-center gap-2 transition-all duration-300"
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peran</span>
        <button
          onClick={() => setIsCollapsed(false)}
          className="text-slate-500 hover:text-indigo-600 transition-colors"
          title="Perluas"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => setIsHidden(true)}
          className="text-slate-400 hover:text-red-500 transition-colors"
          title="Sembunyikan"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  // Expanded — full panel
  return (
    <div id="role-selector-floating" className="fixed bottom-4 right-4 z-50 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl p-3 border border-slate-200 flex flex-col gap-2 max-w-xs transition-all duration-300 hover:shadow-indigo-500/10">
      <div className="flex items-center justify-between border-b pb-2 mb-1">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Simulasi Peran</span>
        <div className="flex items-center gap-1">
          <button 
            onClick={onResetOnboarding}
            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded flex items-center gap-1 transition-colors"
            title="Ulangi Onboarding"
          >
            <HelpCircle size={10} /> Onboard
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5"
            title="Perkecil"
          >
            <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setIsHidden(true)}
            className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
            title="Sembunyikan"
          >
            <X size={14} />
          </button>
        </div>
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

