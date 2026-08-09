import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, User, QrCode, Shield } from 'lucide-react';
import { Role, AuthAccount } from '../../types';
import { authenticateAccount, addAccount } from '../../db';

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
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const acc = await authenticateAccount(email.trim(), password, role);
    if (!acc) {
      setErrorMsg(`Gagal masuk! Email/kata sandi salah atau akun bukan peran ${meta.label}.`);
      return;
    }
    onLogin(acc);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (role !== 'user') {
      setErrorMsg('Pendaftaran hanya tersedia untuk warga/pengguna.');
      return;
    }
    if (!regName.trim() || !email.trim() || password.length < 6) {
      setErrorMsg('Lengkapi data dan gunakan kata sandi minimal 6 karakter.');
      return;
    }

    const existing = await authenticateAccount(email.trim(), password);
    if (existing) {
      setErrorMsg('Email sudah terdaftar.');
      return;
    }

    const newAcc: AuthAccount = {
      id: `acc-user-${Date.now()}`,
      email: email.trim().toLowerCase(),
      password,
      role: 'user',
      fullName: regName.trim(),
      phone: regPhone.trim(),
      createdAt: new Date().toISOString(),
    };
    await addAccount(newAcc);
    setSuccessMsg('Pendaftaran berhasil! Silakan masuk.');
    setMode('login');
  };

  return (
    <div className="flex-grow flex flex-col justify-center px-6 py-6 max-w-md mx-auto w-full">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 text-xs font-bold mb-6 self-start"
      >
        <ArrowLeft size={16} /> Kembali pilih peran
      </button>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-3">
          {meta.icon}
          {meta.label}
        </div>
        <h1 className="text-xl font-extrabold text-slate-800">Masuk ke Akun</h1>
        <p className="text-xs text-slate-500 mt-1">Data login tersimpan aman di database lokal</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-3 px-4 rounded-xl border border-emerald-100 font-bold flex items-center gap-2 mb-4">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 text-xs py-3 px-4 rounded-xl border border-rose-100 font-bold mb-4">
          ⚠️ {errorMsg}
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4 bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider">Kata Sandi</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all">
            Masuk
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-3 bg-white p-5 rounded-2xl shadow-lg border border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase">Nama Lengkap</label>
            <input value={regName} onChange={(e) => setRegName(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase">No. HP</label>
            <input value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" required />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase">Kata Sandi</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold" required />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl">Daftar</button>
          <button type="button" onClick={() => setMode('login')} className="w-full text-xs font-bold text-slate-500">Sudah punya akun? Masuk</button>
        </form>
      )}

      {role === 'user' && mode === 'login' && (
        <p className="text-center text-xs text-slate-400 mt-4">
          Belum punya akun?{' '}
          <button onClick={() => setMode('register')} className="text-indigo-600 font-bold hover:underline">Daftar sekarang</button>
        </p>
      )}

      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 text-[10px] text-slate-500 font-semibold">
        <p className="font-black text-slate-600 mb-1 uppercase tracking-wider">Demo Akun</p>
        <p>{meta.hint}</p>
        <button
          type="button"
          onClick={() => { setEmail(meta.demoEmail); setPassword(meta.demoPass); }}
          className="mt-2 text-indigo-600 font-bold hover:underline"
        >
          Isi otomatis
        </button>
      </div>
    </div>
  );
}
