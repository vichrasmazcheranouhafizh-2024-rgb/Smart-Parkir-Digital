import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Shield, QrCode, ImagePlus, Bell, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { JukirProfile, PetugasNotification, buildJukirQRPayload } from '../../types';
import { getJukirProfile, putJukirProfile, getPetugasNotifications, markNotificationRead } from '../../db';

interface JukirProfileViewProps {
  accountId: string;
  onBack: () => void;
}

export default function JukirProfileView({ accountId, onBack }: JukirProfileViewProps) {
  const [profile, setProfile] = useState<JukirProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [notifications, setNotifications] = useState<PetugasNotification[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void (async () => {
      const p = await getJukirProfile(accountId);
      if (p) {
        setProfile(p);
        const qr = await QRCode.toDataURL(buildJukirQRPayload(p), { width: 200, margin: 2 });
        setQrDataUrl(qr);
      }
      const notifs = await getPetugasNotifications();
      setNotifications(notifs);
    })();
  }, [accountId]);

  const handleSave = async () => {
    if (!profile) return;
    await putJukirProfile(profile);
    const qr = await QRCode.toDataURL(buildJukirQRPayload(profile), { width: 200, margin: 2 });
    setQrDataUrl(qr);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile({ ...profile, photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm font-semibold">Memuat profil...</div>
    );
  }

  const statusColor = {
    verified: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    revoked: 'bg-rose-100 text-rose-700 border-rose-200',
  }[profile.verificationStatus];

  return (
    <div className="flex-grow flex flex-col max-w-md mx-auto w-full bg-slate-50 md:rounded-3xl overflow-hidden">
      <header className="bg-white border-b border-slate-100 px-4 py-4 flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-full hover:bg-slate-100"><ArrowLeft size={18} /></button>
        <h1 className="text-sm font-extrabold text-slate-800">Profil Jukir Digital</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-8">
        {/* Notifications */}
        {notifications.filter((n) => !n.read).length > 0 && (
          <div className="space-y-2">
            {notifications.filter((n) => !n.read).map((n) => (
              <div key={n.id} className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex gap-2">
                <Bell size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-black text-indigo-800">{n.title}</p>
                  <p className="text-[10px] text-indigo-600 mt-0.5">{n.message}</p>
                </div>
                <button onClick={() => { void markNotificationRead(n.id); setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x)); }} className="text-[9px] font-bold text-indigo-500">✓</button>
              </div>
            ))}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex gap-4 items-start">
            <div className="relative">
              <img src={profile.photoUrl} alt="" className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100" />
              {editing && (
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-lg">
                  <ImagePlus size={12} />
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
            </div>
            <div className="flex-1">
              <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${statusColor}`}>
                <Shield size={10} />
                {profile.verificationStatus === 'verified' ? 'KTA Terverifikasi' : profile.verificationStatus === 'pending' ? 'Menunggu Verifikasi' : 'KTA Dicabut'}
              </span>
              <h2 className="text-base font-extrabold text-slate-800 mt-2">{profile.fullName}</h2>
              <p className="text-xs font-mono text-indigo-600 font-bold">{profile.ktaNumber}</p>
              <p className="text-[10px] text-slate-500 mt-1">{profile.assignedLocation} • {profile.assignedZone}</p>
            </div>
          </div>
        </div>

        {/* QR Identity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <QrCode size={16} className="text-indigo-600" />
            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">QR Identitas Resmi</p>
          </div>
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR Jukir" className="mx-auto w-44 h-44 rounded-xl border border-slate-100" />
          )}
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Warga dapat memindai QR ini untuk verifikasi jukir resmi</p>
        </div>

        {/* Edit Form */}
        {editing ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            {[
              { key: 'fullName', label: 'Nama Lengkap' },
              { key: 'nik', label: 'NIK' },
              { key: 'phone', label: 'No. HP' },
              { key: 'assignedZone', label: 'Zone Penugasan' },
              { key: 'assignedLocation', label: 'Lokasi Penugasan' },
            ].map(({ key, label }) => (
              <label key={key} className="block text-[10px] font-black text-slate-500 uppercase">
                {label}
                <input
value={(profile as unknown as Record<string, string>)[key] ?? ''}
                  onChange={(e) => setProfile({ ...profile, [key]: e.target.value })}
                  className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
                />
              </label>
            ))}
            <label className="block text-[10px] font-black text-slate-500 uppercase">
              Shift
              <select
                value={profile.shift}
                onChange={(e) => setProfile({ ...profile, shift: e.target.value as JukirProfile['shift'] })}
                className="mt-1 w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold"
              >
                <option value="Pagi">Pagi (06:00–14:00)</option>
                <option value="Siang">Siang (14:00–22:00)</option>
                <option value="Malam">Malam (22:00–06:00)</option>
              </select>
            </label>
            <div className="flex gap-2 pt-2">
              <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white font-bold py-2.5 rounded-xl text-xs">
                <Save size={14} /> Simpan
              </button>
              <button onClick={() => setEditing(false)} className="px-4 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">Batal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl text-xs">
            Edit Profil Jukir
          </button>
        )}

        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold p-3 rounded-xl border border-emerald-100">
            <CheckCircle size={16} /> Profil berhasil disimpan ke database
          </div>
        )}

        {/* Info rows */}
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
          {[
            ['NIK', profile.nik],
            ['No. HP', profile.phone],
            ['Shift', profile.shift],
            ['Bergabung', profile.joinedAt],
            ['Verifikasi', profile.verifiedAt ?? '-'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-2.5">
              <span className="text-slate-400 font-semibold">{k}</span>
              <span className="font-bold text-slate-800">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
