import React, { useEffect, useState } from 'react';
import { ArrowLeft, Shield, ShieldOff, ShieldCheck, User, MapPin, Clock, FileText, CheckCircle, XCircle, AlertCircle, Eye, Sparkles } from 'lucide-react';
import { JukirProfile, AuthAccount } from '../../types';
import { getAllJukirProfiles, updateJukirVerification, putPetugasNotification, getAccounts, updateAccountApproval } from '../../db';

interface AdminPetugasManageProps {
  onBack: () => void;
}

export default function AdminPetugasManage({ onBack }: AdminPetugasManageProps) {
  const [profiles, setProfiles] = useState<JukirProfile[]>([]);
  const [accounts, setAccounts] = useState<AuthAccount[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<JukirProfile | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'verified' | 'revoked'>('all');
  const [toast, setToast] = useState('');

  const load = async () => {
    const [pList, aList] = await Promise.all([
      getAllJukirProfiles(),
      getAccounts(),
    ]);
    setProfiles(pList);
    setAccounts(aList);
  };

  useEffect(() => { void load(); }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const setStatus = async (id: string, status: JukirProfile['verificationStatus'], profile: JukirProfile) => {
    await updateJukirVerification(id, status);

    // Also update AuthAccount approvalStatus
    const matchingAcc = accounts.find(a => a.id === profile.accountId || a.email.toLowerCase().includes(profile.fullName.toLowerCase().replace(/\s+/g, '')));
    if (matchingAcc) {
      await updateAccountApproval(matchingAcc.id, status === 'verified' ? 'approved' : status === 'revoked' ? 'rejected' : 'pending');
    }

    await putPetugasNotification({
      id: `notif-${Date.now()}`,
      title: status === 'verified' ? 'KTA Digital Resmi Terverifikasi' : 'KTA Digital Dicabut / Ditinjau',
      message: status === 'verified'
        ? `Selamat! KTA Digital Anda (${profile.ktaNumber}) telah disetujui & diverifikasi oleh Admin Dishub Surabaya. Anda sekarang dapat bertugas di ${profile.assignedLocation}.`
        : `Status KTA (${profile.ktaNumber}) telah diubah menjadi ${status}. Hubungi kantor Dishub Surabaya.`,
      type: status === 'verified' ? 'verification' : 'warning',
      read: false,
      createdAt: new Date().toISOString(),
    });

    triggerToast(`Status KTA ${profile.fullName} diperbarui menjadi ${status.toUpperCase()}.`);
    await load();
    if (selectedProfile && selectedProfile.id === id) {
      setSelectedProfile({ ...selectedProfile, verificationStatus: status });
    }
  };

  const filteredProfiles = profiles.filter(p => {
    if (activeFilter === 'all') return true;
    return p.verificationStatus === activeFilter;
  });

  return (
    <div className="flex-1 min-h-screen bg-slate-50 lg:ml-[280px] p-4 lg:p-8 select-none">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2">
          <Sparkles size={16} className="text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Verifikasi KTA & Petugas Parkir</h1>
            <p className="text-xs text-slate-500 font-medium">Validasi identitas resmi jukir, penugasan lokasi, dan legalitas operasional Dishub</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          {(['all', 'pending', 'verified', 'revoked'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                activeFilter === f ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'pending' ? 'Menunggu ACC' : f === 'verified' ? 'Terverifikasi' : 'Dicabut'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Petugas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {filteredProfiles.map((p) => (
          <div key={p.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-start gap-3.5">
              <img src={p.photoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full ${
                    p.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : p.verificationStatus === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}>
                    {p.verificationStatus === 'verified' ? 'TERVERIFIKASI DISHUB' : p.verificationStatus === 'pending' ? 'MENUNGGU ACC' : 'DICABUT'}
                  </span>
                  <button
                    onClick={() => setSelectedProfile(p)}
                    className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={12} /> Detail KTA
                  </button>
                </div>
                <h3 className="text-sm font-black text-slate-900 mt-1">{p.fullName}</h3>
                <p className="text-xs font-mono text-indigo-600 font-bold">{p.ktaNumber}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                  <MapPin size={11} className="text-slate-400" /> {p.assignedLocation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block">NIK KTP</span>
                <span className="font-mono font-bold text-slate-700">{p.nik}</span>
              </div>
              <div className="bg-slate-50 p-2 rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold block">Shift Patroli</span>
                <span className="font-bold text-slate-700">{p.shift}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-1">
              {p.verificationStatus !== 'verified' && (
                <button
                  onClick={() => setStatus(p.id, 'verified', p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow cursor-pointer active:scale-95 transition-all"
                >
                  <ShieldCheck size={14} /> ACC & Verifikasi KTA
                </button>
              )}
              {p.verificationStatus === 'verified' && (
                <button
                  onClick={() => setStatus(p.id, 'revoked', p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow cursor-pointer active:scale-95 transition-all"
                >
                  <ShieldOff size={14} /> Cabut Izin KTA
                </button>
              )}
              {p.verificationStatus === 'revoked' && (
                <button
                  onClick={() => setStatus(p.id, 'pending', p)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow cursor-pointer active:scale-95 transition-all"
                >
                  <Shield size={14} /> Reset ke Pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-fade-in text-slate-800">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-wider">Kartu Tanda Anggota (KTA) Digital</span>
              <button onClick={() => setSelectedProfile(null)} className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded">DISHUB SURABAYA</span>
                <span className="text-[10px] font-bold text-indigo-200">KTA RESMI</span>
              </div>
              <div className="flex items-center gap-4">
                <img src={selectedProfile.photoUrl} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white/40" />
                <div>
                  <h3 className="text-base font-black leading-tight">{selectedProfile.fullName}</h3>
                  <p className="text-xs font-mono text-indigo-200 mt-0.5">{selectedProfile.ktaNumber}</p>
                  <p className="text-[10px] text-slate-300 mt-1">📍 {selectedProfile.assignedLocation}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Nomor NIK:</span>
                <span className="font-mono font-black">{selectedProfile.nik}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">No. Telepon:</span>
                <span className="font-bold">{selectedProfile.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Shift Kerja:</span>
                <span className="font-bold">{selectedProfile.shift}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400 font-bold">Tanggal Terdaftar:</span>
                <span className="font-bold">{selectedProfile.joinedAt}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setStatus(selectedProfile.id, 'verified', selectedProfile)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                Setujui / ACC KTA
              </button>
              <button
                onClick={() => setStatus(selectedProfile.id, 'revoked', selectedProfile)}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow"
              >
                Tolak / Cabut KTA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
