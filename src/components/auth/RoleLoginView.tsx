import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, User, QrCode, Shield, MapPin, AlertCircle, Clock, FileText } from 'lucide-react';
import { Role, AuthAccount, ParkingLocation, JukirProfile } from '../../types';
import { authenticateAccount, addAccount, getAccounts, putJukirProfile, getAllJukirProfiles } from '../../db';
import { INITIAL_LOCATIONS } from '../../data';

interface RoleLoginViewProps {
  role: Role;
  onLogin: (account: AuthAccount) => void;
  onBack: () => void;
}

const ROLE_META: Record<string, { label: string; icon: React.ReactNode; hint: string; demoEmail: string; demoPass: string }> = {
  user: {
    label: 'Warga / Pengguna',
    icon: <User size={18} />,
    hint: 'user@parkwise.id / user123',
    demoEmail: 'user@parkwise.id',
    demoPass: 'user123',
  },
  petugas: {
    label: 'Petugas Parkir Resmi',
    icon: <QrCode size={18} />,
    hint: 'petugas@parkwise.id / petugas123',
    demoEmail: 'petugas@parkwise.id',
    demoPass: 'petugas123',
  },
  admin: {
    label: 'Admin Dishub',
    icon: <Shield size={18} />,
    hint: 'admin@parkwise.id / admin123',
    demoEmail: 'admin@parkwise.id',
    demoPass: 'admin123',
  },
};

export default function RoleLoginView({ role, onLogin, onBack }: RoleLoginViewProps) {
  const meta = ROLE_META[role] ?? ROLE_META.user;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regKta, setRegKta] = useState('');
  const [regShift, setRegShift] = useState<'Pagi' | 'Siang' | 'Malam'>('Pagi');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState('');
  const [assignedLocationMap, setAssignedLocationMap] = useState<Record<string, string>>({});

  // Load existing assigned locations from accounts & jukir profiles
  useEffect(() => {
    async function checkAssignedLocations() {
      const accounts = await getAccounts();
      const profiles = await getAllJukirProfiles();
      const map: Record<string, string> = {};

      // Seed defaults
      map['tunjungan_plaza'] = 'Budi Santoso (KTA-SBY-2024-0042)';
      map['jalan_tunjungan'] = 'Ahmad Fauzi (KTA-SBY-2024-0091)';

      accounts.forEach((acc) => {
        if (acc.role === 'petugas' && acc.assignedLocationId && acc.approvalStatus !== 'rejected') {
          map[acc.assignedLocationId] = acc.fullName;
        }
      });
      profiles.forEach((p) => {
        if (p.assignedLocationId && p.verificationStatus !== 'revoked' && p.verificationStatus !== 'rejected') {
          map[p.assignedLocationId] = p.fullName;
        }
      });
      setAssignedLocationMap(map);
    }
    checkAssignedLocations();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const res = await authenticateAccount(email.trim(), password, role);
    if (res.error === 'not_found' || res.error === 'invalid_password') {
      setErrorMsg('Email atau kata sandi yang Anda masukkan salah.');
      return;
    }
    if (res.error === 'wrong_role') {
      setErrorMsg(`Akun ini terdaftar bukan sebagai peran ${meta.label}. Silakan gunakan form login yang sesuai.`);
      return;
    }
    if (res.error === 'pending_approval') {
      setErrorMsg(`⚠️ Akun Anda (${role.toUpperCase()}) masih berstatus MENUNGGU VERIFIKASI / ACC dari Admin Dishub Surabaya. Harap menunggu hingga akun disetujui.`);
      return;
    }
    if (res.error === 'rejected') {
      setErrorMsg('❌ Pendaftaran akun ini telah ditolak oleh Admin Dishub. Silakan hubungi Dinas Perhubungan Surabaya.');
      return;
    }
    if (res.account) {
      onLogin(res.account);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regName.trim() || !email.trim() || password.length < 6) {
      setErrorMsg('Lengkapi formulir dan gunakan kata sandi minimal 6 karakter.');
      return;
    }

    const existing = await authenticateAccount(email.trim(), password);
    if (existing.account || existing.error === 'pending_approval') {
      setErrorMsg('Alamat email sudah terdaftar dalam sistem.');
      return;
    }

    // Role-specific validations
    if (role === 'petugas') {
      if (!selectedLocationId) {
        setErrorMsg('Silakan pilih salah satu lokasi parkir yang belum terjaga oleh petugas lain.');
        return;
      }
      if (assignedLocationMap[selectedLocationId]) {
        setErrorMsg(`Lokasi terpilih sudah dijaga oleh ${assignedLocationMap[selectedLocationId]}. Harap pilih lokasi lain yang masih kosong.`);
        return;
      }
    }

    const assignedLocObj = INITIAL_LOCATIONS.find((l) => l.id === selectedLocationId);
    const newAccId = `acc-${role}-${Date.now()}`;
    const isWarga = role === 'user';

    const newAcc: AuthAccount = {
      id: newAccId,
      email: email.trim().toLowerCase(),
      password,
      role,
      fullName: regName.trim(),
      phone: regPhone.trim() || '0812-0000-0000',
      createdAt: new Date().toISOString(),
      approvalStatus: isWarga ? 'approved' : 'pending',
      assignedLocationId: selectedLocationId || undefined,
      assignedLocationName: assignedLocObj ? assignedLocObj.name : undefined,
      nik: regNik || undefined,
      ktaNumber: regKta || `KTA-SBY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      shift: regShift,
    };

    await addAccount(newAcc);

    if (role === 'petugas') {
      const newJukir: JukirProfile = {
        id: `jukir-${Date.now()}`,
        accountId: newAccId,
        ktaNumber: newAcc.ktaNumber || `KTA-SBY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        fullName: newAcc.fullName,
        nik: regNik || '3578000000000000',
        phone: newAcc.phone || '0812-0000-0000',
        assignedZone: 'Zone A',
        assignedLocation: assignedLocObj ? assignedLocObj.name : 'Titik Parkir Surabaya',
        assignedLocationId: selectedLocationId,
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
        shift: regShift,
        verificationStatus: 'pending',
        joinedAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      await putJukirProfile(newJukir);
    }

    if (isWarga) {
      setSuccessMsg('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
    } else if (role === 'petugas') {
      setSuccessMsg('✅ Pendaftaran Petugas berhasil dikirim! Status akun Anda: MENUNGGU ACC ADMIN DISHUB. Anda akan dapat masuk setelah akun diverifikasi.');
    } else {
      setSuccessMsg('✅ Pendaftaran Admin berhasil dikirim! Akun Anda sedang MENUNGGU ACC dari Super Admin Dishub aktif.');
    }

    setMode('login');
  };

  return (
    <div className="flex-grow flex flex-col justify-center px-4 py-6 max-w-md mx-auto w-full select-none">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold mb-4 self-start cursor-pointer"
      >
        <ArrowLeft size={16} /> Kembali pilih peran
      </button>

      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black mb-2 shadow-sm border border-indigo-100">
          {meta.icon}
          {meta.label}
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Masuk ke Akun' : `Daftar Akun ${meta.label}`}
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          {mode === 'login' 
            ? 'Sistem Terintegrasi Smart Parking Kota Surabaya' 
            : role === 'petugas' 
              ? 'Pilih lokasi jaga yang tersedia & tunggu ACC admin' 
              : role === 'admin' 
                ? 'Daftar sebagai petugas administratif Dishub' 
                : 'Nikmati kemudahan reservasi parkir online'}
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-800 text-xs p-3.5 rounded-2xl border border-emerald-200 font-bold flex items-start gap-2 mb-4 leading-relaxed shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 text-rose-700 text-xs p-3.5 rounded-2xl border border-rose-200 font-bold mb-4 leading-relaxed shadow-sm flex items-start gap-2">
          <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-3xl shadow-xl border border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Email Akun</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@dishub.surabaya.go.id"
                className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Kata Sandi</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all text-xs uppercase tracking-wider">
            Masuk Sebagai {meta.label}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3 bg-white p-5 rounded-3xl shadow-xl border border-slate-100 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Nama Lengkap</label>
            <input value={regName} onChange={(e) => setRegName(e.target.value)} placeholder="Contoh: Achmad Supriyadi" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" required />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Alamat Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@domain.com" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" required />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Nomor WhatsApp / HP</label>
            <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="081234567890" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" required />
          </div>

          {role === 'petugas' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">NIK (KTP)</label>
                  <input value={regNik} onChange={(e) => setRegNik(e.target.value)} placeholder="3578xxxxxxxxxxxx" maxLength={16} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold font-mono" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase">Shift Kerja</label>
                  <select value={regShift} onChange={(e: any) => setRegShift(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold">
                    <option value="Pagi">Pagi (06:00 - 14:00)</option>
                    <option value="Siang">Siang (14:00 - 22:00)</option>
                    <option value="Malam">Malam (22:00 - 06:00)</option>
                  </select>
                </div>
              </div>

              {/* Exclusive Location Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-[10px] font-black text-slate-700 uppercase flex items-center justify-between">
                  <span>Pilih Lokasi Jaga Parkir</span>
                  <span className="text-[9px] text-indigo-600 font-bold">Wajib Lokasi Kosong</span>
                </label>
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 text-[10px] text-amber-800 font-semibold mb-2">
                  ℹ️ Lokasi yang sudah dijaga petugas lain tidak dapat dipilih. Anda harus memilih titik parkir yang belum terisi.
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {INITIAL_LOCATIONS.map((loc) => {
                    const isTaken = !!assignedLocationMap[loc.id];
                    const keeperName = assignedLocationMap[loc.id];
                    const isSelected = selectedLocationId === loc.id;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => {
                          if (!isTaken) setSelectedLocationId(loc.id);
                        }}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          isTaken
                            ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'
                            : isSelected
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-sm cursor-pointer'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className={isTaken ? 'text-slate-400' : isSelected ? 'text-indigo-600' : 'text-slate-500'} />
                          <div>
                            <p className="font-extrabold text-[11px] leading-tight">{loc.name}</p>
                            <p className="text-[9px] text-slate-400">{loc.region} • {loc.totalCapacity} slot</p>
                          </div>
                        </div>
                        {isTaken ? (
                          <span className="text-[9px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md">
                            Terjaga: {keeperName.split(' ')[0]}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                            {isSelected ? '✓ Terpilih' : 'Tersedia'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase">Kata Sandi</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold" required />
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase shadow-md mt-2">
            Ajukan Pendaftaran {meta.label}
          </button>
        </form>
      )}

      {/* Mode Switcher */}
      <div className="mt-4 text-center">
        {mode === 'login' ? (
          <p className="text-xs text-slate-500 font-medium">
            Belum memiliki akun {meta.label}?{' '}
            <button onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }} className="text-indigo-600 font-extrabold hover:underline cursor-pointer">
              Daftar Sekarang
            </button>
          </p>
        ) : (
          <p className="text-xs text-slate-500 font-medium">
            Sudah memiliki akun?{' '}
            <button onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }} className="text-indigo-600 font-extrabold hover:underline cursor-pointer">
              Masuk ke Akun
            </button>
          </p>
        )}
      </div>

      {/* Demo Credentials Quick Fill */}
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-3 text-[10px] text-slate-500 font-semibold">
        <div className="flex justify-between items-center mb-1">
          <span className="font-black text-slate-700 uppercase tracking-wider">Demo Akses Cepat</span>
          <button
            type="button"
            onClick={() => { setEmail(meta.demoEmail); setPassword(meta.demoPass); setMode('login'); }}
            className="text-indigo-600 font-black hover:underline cursor-pointer bg-white px-2 py-0.5 rounded border border-indigo-200"
          >
            Gunakan Akun Demo
          </button>
        </div>
        <p className="font-mono text-slate-600">{meta.hint}</p>
      </div>
    </div>
  );
}
