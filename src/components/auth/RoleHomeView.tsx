import React from 'react';
import { User, QrCode, Shield, ChevronRight } from 'lucide-react';
import { Role } from '../../types';

interface RoleHomeViewProps {
  onSelectRole: (role: Role) => void;
}

const ROLES: { role: Role; title: string; subtitle: string; icon: React.ReactNode; color: string }[] = [
  {
    role: 'user',
    title: 'Warga / Pengguna',
    subtitle: 'Cari parkir, bayar QRIS/tunai, lapor pungli',
    icon: <User size={28} />,
    color: 'from-indigo-600 to-indigo-700',
  },
  {
    role: 'petugas',
    title: 'Petugas Parkir Resmi',
    subtitle: 'Profil Jukir, QR identitas, rekap shift',
    icon: <QrCode size={28} />,
    color: 'from-slate-700 to-slate-800',
  },
  {
    role: 'admin',
    title: 'Admin Dishub',
    subtitle: 'PAD real-time, verifikasi KTA, laporan pungli',
    icon: <Shield size={28} />,
    color: 'from-slate-900 to-slate-950',
  },
];

export default function RoleHomeView({ onSelectRole }: RoleHomeViewProps) {
  return (
    <div className="flex-grow flex flex-col justify-center px-6 py-8 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-500/30">
          <span className="text-3xl font-extrabold">P</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Parkir Digital Surabaya</h1>
        <p className="text-sm font-semibold text-slate-500 mt-2">Pilih peran Anda untuk melanjutkan</p>
      </div>

      <div className="space-y-3">
        {ROLES.map(({ role, title, subtitle, icon, color }) => (
          <button
            key={role}
            type="button"
            onClick={() => onSelectRole(role)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r ${color} text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-left`}
          >
            <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold">{title}</p>
              <p className="text-[11px] font-medium text-white/80 mt-0.5">{subtitle}</p>
            </div>
            <ChevronRight size={20} className="text-white/70 shrink-0" />
          </button>
        ))}
      </div>

      <p className="text-center text-[10px] text-slate-400 font-semibold mt-8 uppercase tracking-wider">
        Pemerintah Kota Surabaya • Dishub
      </p>
    </div>
  );
}
