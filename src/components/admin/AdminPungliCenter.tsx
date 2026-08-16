import React, { useEffect, useState } from 'react';
import { ArrowLeft, AlertTriangle, CheckCircle, PhoneCall, Send, MapPin, Clock, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { PungliReport, PungliReportStatus } from '../../types';
import { getPungliReports, updatePungliStatus } from '../../db';

interface AdminPungliCenterProps {
  onBack: () => void;
}

export default function AdminPungliCenter({ onBack }: AdminPungliCenterProps) {
  const [reports, setReports] = useState<PungliReport[]>([]);
  const [activeStatus, setActiveStatus] = useState<PungliReportStatus | 'all'>('all');
  const [selectedReport, setSelectedReport] = useState<PungliReport | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [toast, setToast] = useState('');

  const load = async () => {
    const list = await getPungliReports();
    setReports(list);
  };

  useEffect(() => { void load(); }, []);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleUpdateStatus = async (id: string, status: PungliReportStatus) => {
    await updatePungliStatus(id, status, officerNote || undefined);
    triggerToast(`Laporan pungli diperbarui ke status ${status.toUpperCase()}.`);
    setOfficerNote('');
    await load();
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({ ...selectedReport, status });
    }
  };

  const filteredReports = reports.filter((r) => {
    if (activeStatus === 'all') return true;
    return r.status === activeStatus;
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
            <h1 className="text-2xl font-black text-slate-900">Pusat Penindakan Lapor Pungli</h1>
            <p className="text-xs text-slate-500 font-medium">Monitoring pengaduan parkir liar dan koordinasi Tim Saber Pungli 112 Surabaya</p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
          {(['all', 'submitted', 'reviewing', 'dispatched', 'resolved'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer ${
                activeStatus === s ? 'bg-indigo-600 text-white shadow' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'submitted' ? 'Baru' : s === 'reviewing' ? 'Investigasi' : s === 'dispatched' ? 'Petugas Meluncur' : 'Selesai'}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.map((r) => (
          <div key={r.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3 hover:shadow-md transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                  r.status === 'resolved' ? 'bg-emerald-100 text-emerald-800'
                    : r.status === 'dispatched' ? 'bg-blue-100 text-blue-800'
                    : r.status === 'reviewing' ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {r.status === 'submitted' ? 'LAPORAN BARU' : r.status === 'reviewing' ? 'SEDANG DITINJAU' : r.status === 'dispatched' ? 'TIM SABER OTW' : 'SELESAI DITINDAK'}
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">{r.location}</h3>
                <p className="text-[10px] text-slate-400 font-semibold">{r.region}, Surabaya • {r.submittedAt}</p>
              </div>

              <a
                href="tel:112"
                className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-[10px] font-black px-2.5 py-1.5 rounded-xl flex items-center gap-1 border border-rose-200"
              >
                <PhoneCall size={11} /> 112 Saber
              </a>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl font-medium border border-slate-100 leading-relaxed">
              "{r.description}"
            </p>

            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
              <span>Pelapor: <strong>{r.reporterName}</strong> ({r.reporterPhone})</span>
            </div>

            {/* Status Change Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => handleUpdateStatus(r.id, 'reviewing')}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  r.status === 'reviewing' ? 'bg-amber-500 text-white border-amber-500 shadow' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                🔍 Investigasi
              </button>
              <button
                onClick={() => handleUpdateStatus(r.id, 'dispatched')}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  r.status === 'dispatched' ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                🚨 Kirim Petugas
              </button>
              <button
                onClick={() => handleUpdateStatus(r.id, 'resolved')}
                className={`py-2 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                  r.status === 'resolved' ? 'bg-emerald-600 text-white border-emerald-600 shadow' : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                }`}
              >
                ✓ Selesai
              </button>
            </div>
          </div>
        ))}

        {filteredReports.length === 0 && (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400">
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-700">Tidak ada pengaduan pungli aktif</h3>
            <p className="text-xs mt-1">Wilayah Surabaya berstatus kondusif dan tertib parkir digital.</p>
          </div>
        )}
      </div>
    </div>
  );
}
