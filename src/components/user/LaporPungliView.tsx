import React, { useState, useRef } from 'react';
import { ArrowLeft, AlertTriangle, Camera, Send, Phone, Instagram, MapPin, CheckCircle } from 'lucide-react';
import { PungliReport } from '../../types';
import { addPungliReport } from '../../db';

interface LaporPungliViewProps {
  reporterName: string;
  reporterPhone: string;
  onBack: () => void;
  onSubmitted?: () => void;
}

export default function LaporPungliView({ reporterName, reporterPhone, onBack, onSubmitted }: LaporPungliViewProps) {
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('Genteng');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !description.trim()) return;

    setSubmitting(true);
    const report: PungliReport = {
      id: `PUNGLI-${Date.now()}`,
      reporterName,
      reporterPhone,
      location: location.trim(),
      region,
      description: description.trim(),
      photoUrl,
      status: 'dispatched',
      submittedAt: new Date().toISOString(),
      forwardedTo112: true,
      forwardedToInstagram: true,
    };

    await addPungliReport(report);
    setSubmitting(false);
    setSubmitted(true);
    onSubmitted?.();
  };

  if (submitted) {
    return (
      <div className="flex-grow flex flex-col max-w-md mx-auto w-full h-[850px] bg-slate-50 md:rounded-3xl overflow-hidden">
        <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100"><ArrowLeft size={18} /></button>
          <h1 className="text-sm font-extrabold text-slate-800">Lapor Pungli</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-lg font-extrabold text-slate-800 mb-2">Laporan Terkirim!</h2>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Laporan pungli Anda telah diteruskan ke:
          </p>
          <div className="w-full space-y-3 mb-6">
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-3 text-left">
              <Phone size={20} className="text-red-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-red-800">Command Center 112 Surabaya</p>
                <p className="text-[10px] text-red-600">Laporan diteruskan otomatis untuk tindak lanjut penertiban</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-pink-50 border border-pink-100 rounded-xl p-3 text-left">
              <Instagram size={20} className="text-pink-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-pink-800">@parkirsurabaya</p>
                <p className="text-[10px] text-pink-600">Bukti foto & lokasi diteruskan ke akun resmi Dishub</p>
              </div>
            </div>
          </div>
          <button onClick={onBack} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col max-w-md mx-auto w-full h-[850px] bg-slate-50 md:rounded-3xl overflow-hidden pb-6">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3 shrink-0">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-sm font-extrabold text-slate-800">Lapor Pungli</h1>
          <p className="text-[10px] text-slate-400 font-semibold">Terintegrasi 112 & @parkirsurabaya</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
            Laporkan praktik pungli parkir ilegal. Sertakan bukti foto dan lokasi agar tim penertiban Dishub dapat segera menindaklanjuti.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Lokasi Kejadian</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Contoh: Jl. Tunjungan No. 12, depan toko..."
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Wilayah</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold"
          >
            {['Genteng', 'Gubeng', 'Wonokromo', 'Sukolilo', 'Tegalsari', 'Sawahan', 'Rungkut'].map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Kronologi / Keterangan</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan kejadian pungli: siapa, kapan, berapa tarif diminta..."
            rows={4}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold resize-none"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Bukti Foto</label>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhoto} />
          {photoUrl ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200">
              <img src={photoUrl} alt="Bukti" className="w-full h-40 object-cover" />
              <button type="button" onClick={() => setPhotoUrl(undefined)} className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">Ganti</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center gap-2 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
              <Camera size={24} />
              <span className="text-xs font-bold">Ambil / Upload Foto Bukti</span>
            </button>
          )}
        </div>

        <div className="flex gap-2 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded-lg"><Phone size={12} /> 112</span>
          <span className="flex items-center gap-1 bg-pink-50 text-pink-700 px-2 py-1 rounded-lg"><Instagram size={12} /> @parkirsurabaya</span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl disabled:opacity-60"
        >
          <Send size={16} />
          {submitting ? 'Mengirim...' : 'Kirim Laporan Pungli'}
        </button>
      </form>
    </div>
  );
}
