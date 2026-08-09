import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, ShieldOff, ShieldCheck, User } from 'lucide-react';
import { JukirProfile } from '../../types';
import { getAllJukirProfiles, updateJukirVerification, putPetugasNotification } from '../../db';

interface AdminPetugasManageProps {
  onBack: () => void;
}

export default function AdminPetugasManage({ onBack }: AdminPetugasManageProps) {
  const [profiles, setProfiles] = useState<JukirProfile[]>([]);

  const load = async () => {
    setProfiles(await getAllJukirProfiles());
  };

  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: JukirProfile['verificationStatus'], profile: JukirProfile) => {
    await updateJukirVerification(id, status);
    if (status === 'verified' || status === 'revoked') {
      await putPetugasNotification({
        id: `notif-${Date.now()}`,
        title: status === 'verified' ? 'KTA Digital Terverifikasi' : 'KTA Digital Dicabut',
        message: status === 'verified'
          ? `Selamat! KTA Digital Anda (${profile.ktaNumber}) telah diverifikasi oleh Admin Dishub Surabaya.`
          : `KTA Digital Anda (${profile.ktaNumber}) telah dicabut oleh Admin Dishub. Hubungi kantor Dishub.`,
        type: status === 'verified' ? 'verification' : 'warning',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    await load();
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 lg:ml-[280px] p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Kelola Petugas & KTA Digital</h1>
          <p className="text-xs text-slate-500">Verifikasi atau cabut KTA digital juru parkir resmi</p>
        </div>
      </div>

      <div className="grid gap-4">
        {profiles.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
            <img src={p.photoUrl} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-100" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <User size={14} className="text-slate-400" />
                <h3 className="text-sm font-extrabold text-slate-800">{p.fullName}</h3>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                  p.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700'
                    : p.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-700'
                    : 'bg-rose-100 text-rose-700'
                }`}>
                  {p.verificationStatus.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-mono text-indigo-600 mt-1">{p.ktaNumber}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{p.assignedLocation} • Shift {p.shift}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {p.verificationStatus !== 'verified' && (
                <button
                  onClick={() => setStatus(p.id, 'verified', p)}
                  className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                >
                  <ShieldCheck size={14} /> Verifikasi KTA
                </button>
              )}
              {p.verificationStatus !== 'revoked' && (
                <button
                  onClick={() => setStatus(p.id, 'revoked', p)}
                  className="flex items-center gap-1 px-3 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
                >
                  <ShieldOff size={14} /> Cabut KTA
                </button>
              )}
              {p.verificationStatus === 'revoked' && (
                <button
                  onClick={() => setStatus(p.id, 'pending', p)}
                  className="flex items-center gap-1 px-3 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl"
                >
                  <Shield size={14} /> Reset Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
