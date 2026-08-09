import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, MapPin, Instagram, Phone, CheckCircle } from 'lucide-react';
import { PungliReport } from '../../types';
import { getPungliReports, updatePungliStatus } from '../../db';

interface AdminPungliCenterProps {
  onBack: () => void;
}

export default function AdminPungliCenter({ onBack }: AdminPungliCenterProps) {
  const [reports, setReports] = useState<PungliReport[]>([]);

  useEffect(() => {
    void getPungliReports().then(setReports);
  }, []);

  const handleStatus = async (id: string, status: PungliReport['status']) => {
    await updatePungliStatus(id, status);
    setReports(await getPungliReports());
  };

  const statusLabel: Record<PungliReport['status'], string> = {
    submitted: 'Baru',
    reviewing: 'Ditinjau',
    dispatched: 'Diteruskan 112/IG',
    resolved: 'Selesai',
  };

  return (
    <div className="flex-1 min-h-screen bg-slate-50 lg:ml-[280px] p-4 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Pusat Laporan Pungli</h1>
          <p className="text-xs text-slate-500">Data laporan warga untuk tindak lanjut penertiban Dishub</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {(['submitted', 'reviewing', 'dispatched', 'resolved'] as const).map((s) => (
          <div key={s} className="bg-white rounded-xl border border-slate-200 p-3 text-center">
            <p className="text-2xl font-black text-slate-800">{reports.filter((r) => r.status === s).length}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{statusLabel[s]}</p>
          </div>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-sm font-bold text-slate-600">Belum ada laporan pungli</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="p-4 flex flex-col md:flex-row gap-4">
                {r.photoUrl && (
                  <img src={r.photoUrl} alt="Bukti" className="w-full md:w-32 h-32 object-cover rounded-xl border border-slate-100" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1">
                        <AlertTriangle size={12} /> Laporan Pungli
                      </p>
                      <h3 className="text-sm font-extrabold text-slate-800 mt-1">{r.location}</h3>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={10} /> {r.region}, Surabaya
                      </p>
                    </div>
                    <span className="text-[9px] font-black bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">{statusLabel[r.status]}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{r.description}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Pelapor: {r.reporterName} • {r.reporterPhone} • {new Date(r.submittedAt).toLocaleString('id-ID')}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {r.forwardedTo112 && (
                      <span className="flex items-center gap-1 text-[9px] font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-lg">
                        <Phone size={10} /> 112
                      </span>
                    )}
                    {r.forwardedToInstagram && (
                      <span className="flex items-center gap-1 text-[9px] font-bold bg-pink-50 text-pink-700 px-2 py-0.5 rounded-lg">
                        <Instagram size={10} /> @parkirsurabaya
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 px-4 py-3 flex gap-2 bg-slate-50/50">
                {r.status !== 'reviewing' && (
                  <button onClick={() => handleStatus(r.id, 'reviewing')} className="text-xs font-bold px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg">Tinjau</button>
                )}
                {r.status !== 'resolved' && (
                  <button onClick={() => handleStatus(r.id, 'resolved')} className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-lg">
                    <CheckCircle size={12} /> Tandai Selesai
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
