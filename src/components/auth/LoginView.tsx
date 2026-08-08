import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Sparkles, User, QrCode, Shield, Phone, ArrowLeft, CheckCircle, Check, Loader2 } from 'lucide-react';
import { Role } from '../../types';

interface LoginViewProps {
  onLogin: (role: Role) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  // Modes: 'login' or 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Registered dynamic account registry matching simulated database
  const [accounts, setAccounts] = useState(() => {
    const saved = localStorage.getItem('parkwise_accounts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // use fallback
      }
    }
    const defaultAccs = [
      { email: 'vichras.mazcheranou.hafizh-2024@ft.um-surabaya.ac.id', password: 'password123', role: 'user' as Role },
      { email: 'admin@parkwise.id', password: 'admin', role: 'admin' as Role },
      { email: 'petugas@parkwise.id', password: 'petugas', role: 'petugas' as Role }
    ];
    localStorage.setItem('parkwise_accounts', JSON.stringify(defaultAccs));
    return defaultAccs;
  });

  // Login standard state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot password flow states
  // 'none' | 'input_email' | 'enter_code' | 'reset_password'
  const [forgotStep, setForgotStep] = useState<'none' | 'input_email' | 'enter_code' | 'reset_password'>('none');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [showForgotConfirmPass, setShowForgotConfirmPass] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Custom interactive simulations
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStatus, setGoogleStatus] = useState<'connecting' | 'list' | 'success'>('connecting');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('vichras.mazcheranou.hafizh-2024@ft.um-surabaya.ac.id');

  // Validate Email Regex Format
  const validateEmailFormat = (emailStr: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr);
  };

  // Submit Handler for standard login page
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailTrimmed = email.trim();
    if (!emailTrimmed) {
      setErrorMsg('Harap masukkan alamat email.');
      return;
    }

    if (!password) {
      setErrorMsg('Harap masukkan kata sandi Anda.');
      return;
    }

    // Strict account checking to prevent fictitious login
    const emailLower = emailTrimmed.toLowerCase();
    const foundAcc = accounts.find((acc: any) => acc.email.toLowerCase() === emailLower);

    if (!foundAcc) {
      setErrorMsg('Gagal masuk! Email tidak terdaftar di database ParkWise. Silakan mendaftar terlebih dahulu.');
      return;
    }

    if (foundAcc.password !== password) {
      setErrorMsg('Gagal masuk! Kata sandi salah. Harap periksa kembali atau gunakan "Lupa sandi?".');
      return;
    }

    // Credentials match, proceed with role setting!
    onLogin(foundAcc.role);
  };

  // Forgot Password Helpers
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetEmail = forgotEmail.trim();
    if (!targetEmail || !validateEmailFormat(targetEmail)) {
      setErrorMsg('Harap masukkan format email yang valid.');
      return;
    }

    const matchedAccount = accounts.find((acc: any) => acc.email.toLowerCase() === targetEmail.toLowerCase());
    if (!matchedAccount) {
      setErrorMsg('Gagal mengirim kode! Email tidak terdaftar di sistem ParkWise. Harap daftar akun baru.');
      return;
    }

    // Generate a random 4-digit code
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(mockCode);
    setForgotStep('enter_code');
    setSuccessMsg(`Kode verifikasi 4-digit telah dikirim ke: ${targetEmail}`);
  };

  const handleForgotCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (forgotCode !== generatedCode) {
      setErrorMsg('Kode verifikasi tidak sesuai! Harap periksa kembali token simulasi di bawah.');
      return;
    }

    setForgotStep('reset_password');
    setSuccessMsg('Kode berhasil diverifikasi! Silakan ubah kata sandi baru Anda.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Kata sandi baru harus berukuran minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    // Update the password in accounts list
    const updated = accounts.map((acc: any) => {
      if (acc.email.toLowerCase() === forgotEmail.trim().toLowerCase()) {
        return { ...acc, password: newPassword };
      }
      return acc;
    });

    setAccounts(updated);
    localStorage.setItem('parkwise_accounts', JSON.stringify(updated));

    // Reset flow and transition back to login page
    setEmail(forgotEmail);
    setPassword(newPassword);
    setForgotStep('none');
    setForgotEmail('');
    setForgotCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setSuccessMsg('Sandi berhasil diperbarui! Silakan klik "Masuk" menggunakan sandi baru Anda.');
  };

  const handleResendCode = () => {
    setErrorMsg('');
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(newCode);
    setForgotCode('');
    setSuccessMsg('Kode verifikasi baru telah dikirim ulang ke: ' + forgotEmail);
  };

  // Validator and submit for registration form
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailTrimmed = registerEmail.trim();

    if (!emailTrimmed) {
      setErrorMsg('Alamat email wajib diisi.');
      return;
    }

    // Strict email validation
    if (!validateEmailFormat(emailTrimmed)) {
      setErrorMsg('Format email tidak sesuai! Silakan periksa kembali (contoh: nama@email.com).');
      return;
    }

    if (!registerPhone) {
      setErrorMsg('Nomor telepon wajib diisi.');
      return;
    }

    if (!registerPassword) {
      setErrorMsg('Kata sandi wajib diisi.');
      return;
    }

    if (registerPassword.length < 6) {
      setErrorMsg('Kata sandi harus berukuran minimal 6 karakter demi keamanan akun.');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setErrorMsg('Kata sandi baru dan konfirmasi kata sandi tidak cocok!');
      return;
    }

    // If valid, show the high-fidelity confirmation modal to verify details!
    setShowConfirmModal(true);
  };

  const handleConfirmRegistration = () => {
    setShowConfirmModal(false);
    
    // Add to accounts list
    const newAccount = {
      email: registerEmail.trim(),
      password: registerPassword,
      role: 'user' as Role
    };

    const updatedAccounts = [...accounts, newAccount];
    setAccounts(updatedAccounts);
    localStorage.setItem('parkwise_accounts', JSON.stringify(updatedAccounts));

    // Simulate successful registration
    setEmail(registerEmail); // Pre-fill login email input
    setPassword(registerPassword); // Pre-fill login password input
    
    // Clear registration fields
    setRegisterEmail('');
    setRegisterPassword('');
    setRegisterConfirmPassword('');
    setRegisterPhone('');
    
    // Smooth transition back to login state
    setMode('login');
    setSuccessMsg('Pendaftaran Berhasil! Silakan klik tombol "Masuk" untuk melanjutkan.');
  };

  const handleQuickLogin = (role: Role) => {
    onLogin(role);
  };

  // Google Connection Simulation
  const handleGoogleLoginClick = () => {
    setShowGoogleModal(true);
    setGoogleStatus('connecting');
    setErrorMsg('');
    setSuccessMsg('');
    
    // Simulate establishing connection to google core auth API
    setTimeout(() => {
      setGoogleStatus('list');
    }, 1200);
  };

  const selectGoogleProfile = (gmail: string) => {
    setSelectedGoogleAccount(gmail);
    setGoogleStatus('success');
    
    // Trigger login
    setTimeout(() => {
      setShowGoogleModal(false);
      onLogin('user');
    }, 1500);
  };

  return (
    <div id="login-container" className="flex-grow flex flex-col justify-center px-6 py-6 max-w-md mx-auto w-full relative select-none">
      
      {/* Brand Header Section */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white mb-3.5 shadow-md shadow-indigo-500/20">
          <span className="text-2xl font-extrabold font-sans">P</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-800 mb-1 tracking-tight">
          Parkir Digital Surabaya
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          {mode === 'login' ? 'Selamat datang kembali. Silakan masuk untuk melanjutkan.' : 'Buat akun Smart Member ParkWise Kota Surabaya.'}
        </p>
      </div>

      {/* SUCCESS MESSAGE */}
      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-3 px-4 rounded-xl border border-emerald-100 font-bold flex items-center gap-2 mb-4 animate-fade-in shadow-sm">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div className="bg-rose-50 text-rose-600 text-xs py-3 px-4 rounded-xl border border-rose-100 font-bold flex items-start gap-2 mb-4 animate-shake shadow-sm">
          <span className="shrink-0 mt-0.5 font-bold">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CASE C: FORGOT PASSWORD FLOW */}
      {forgotStep === 'input_email' ? (
        <form onSubmit={handleForgotEmailSubmit} className="space-y-4 bg-white p-5 rounded-[24px] shadow-lg border border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <button 
              type="button"
              onClick={() => { setForgotStep('none'); setErrorMsg(''); setSuccessMsg(''); }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Lupa Kata Sandi</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Masukkan email Anda. Kami akan mengirimkan kode verifikasi 4-digit untuk menyetel ulang kata sandi Anda.</p>
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="forgot-email">
              Alamat Email Terdaftar
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input 
                id="forgot-email"
                type="email"
                placeholder="nama@email.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-semibold"
                required
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-sans text-xs font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Kirim Kode Verifikasi
          </button>
        </form>
      ) : forgotStep === 'enter_code' ? (
        <form onSubmit={handleForgotCodeSubmit} className="space-y-4 bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 animate-fade-in">
          <div className="flex items-center gap-1.5 mb-1">
            <button 
              type="button"
              onClick={() => { setForgotStep('input_email'); setErrorMsg(''); }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Masukkan Kode</span>
          </div>
          
          <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl text-indigo-800 text-[11px] font-medium leading-normal">
            <p className="font-bold">Simulasi OTP Terkirim!</p>
            <p className="mt-1">Masukkan kode verifikasi berikut: <span className="font-mono font-black text-xs text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded ml-1 animate-pulse">{generatedCode}</span></p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider text-center" htmlFor="verification-code">
              Isi Kode Verifikasi 4-Digit
            </label>
            <input 
              id="verification-code"
              type="text"
              maxLength={4}
              placeholder="0 0 0 0"
              value={forgotCode}
              onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))}
              className="block w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-800 text-base tracking-widest font-black focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-mono"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-sans text-xs font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer-auto animate-pulse"
          >
            Verifikasi Kode
          </button>

          <div className="text-center pt-1.5">
            <p className="text-[10px] text-slate-400 font-semibold">
              Belum menerima kode?{' '}
              <button 
                type="button"
                onClick={handleResendCode}
                className="text-indigo-600 hover:text-indigo-700 font-black hover:underline cursor-pointer"
              >
                Kirim Ulang Kode
              </button>
            </p>
          </div>
        </form>
      ) : forgotStep === 'reset_password' ? (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4 bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 animate-fade-in">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Ubah Sandi Baru</span>
          </div>
          <p className="text-xs text-slate-400 font-semibold leading-normal">Silakan buat kata sandi baru yang aman untuk akun <b>{forgotEmail}</b> Anda.</p>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="new-pass">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                id="new-pass"
                type={showForgotPass ? 'text' : 'password'}
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold"
                required
              />
              <button 
                type="button"
                onClick={() => setShowForgotPass(!showForgotPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
              >
                {showForgotPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="confirm-new-pass">
              Ulangi Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                id="confirm-new-pass"
                type={showForgotConfirmPass ? 'text' : 'password'}
                placeholder="Ketik ulang sandi baru"
                value={confirmNewPassword}
                onChange={(e) => { setConfirmNewPassword(e.target.value); setErrorMsg(''); }}
                className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold"
                required
              />
              <button 
                type="button"
                onClick={() => setShowForgotConfirmPass(!showForgotConfirmPass)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-450"
              >
                {showForgotConfirmPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-sans text-xs font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Simpan Kata Sandi & Masuk
          </button>
        </form>
      ) : mode === 'login' ? (
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4 bg-white p-5 rounded-[24px] shadow-lg border border-slate-100"
        >
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" htmlFor="email-input">
              Email / ID Smart Member
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input 
                id="email-input"
                name="email"
                placeholder="nama@email.com"
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                className="block w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-semibold placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-wider" htmlFor="password-input">
                Kata Sandi
              </label>
               <button 
                type="button"
                onClick={() => { setForgotStep('input_email'); setErrorMsg(''); setSuccessMsg(''); setForgotEmail(email); }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors focus:outline-none"
              >
                Lupa sandi?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                id="password-input"
                name="password"
                placeholder="••••••••"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-semibold placeholder:text-slate-400"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Tampilkan kata sandi"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-sans text-sm font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            Masuk
          </button>
        </form>
      ) : (
        /* CASE B: REGISTER VIEW MODE */
        <form 
          onSubmit={handleRegisterSubmit} 
          className="space-y-3.5 bg-white p-5 rounded-[24px] shadow-lg border border-slate-100 animate-fade-in"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <button 
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(''); }}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <ArrowLeft size={16} />
            </button>
            <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Daftar Akun Baru</span>
          </div>

          {/* Email Field with validation check indicator */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="reg-email">
              Alamat Email (Format harus sesuai)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input 
                id="reg-email"
                placeholder="pengguna@domain.com"
                type="text"
                value={registerEmail}
                onChange={(e) => {
                  setRegisterEmail(e.target.value);
                  setErrorMsg('');
                }}
                className={`block w-full pl-9 pr-3 py-2.5 bg-slate-50 border ${
                  registerEmail ? (validateEmailFormat(registerEmail) ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-rose-400 ring-1 ring-rose-400') : 'border-slate-200'
                } rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold`}
                required
              />
              {registerEmail && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {validateEmailFormat(registerEmail) ? (
                    <CheckCircle size={14} className="text-emerald-500" />
                  ) : (
                    <span className="text-[10px] font-bold text-rose-500">tidak valid</span>
                  )}
                </div>
              )}
            </div>
            <p className="text-[9px] text-slate-400 leading-none">Wajib menggunakan format email valid (dengan @ dan domain).</p>
          </div>

          {/* No Hp Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="reg-phone">
              Nomor Telepon
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone size={16} />
              </div>
              <input 
                id="reg-phone"
                placeholder="08123456XXXX"
                type="tel"
                value={registerPhone}
                onChange={(e) => {
                  // Only allow digits/plus/hyphen
                  setRegisterPhone(e.target.value.replace(/[^0-9+\- ]/g, ''));
                  setErrorMsg('');
                }}
                className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="reg-pass">
              Kata Sandi (Min 6 Karakter)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                id="reg-pass"
                placeholder="Buat sandi rumit"
                type={showRegPassword ? 'text' : 'password'}
                value={registerPassword}
                onChange={(e) => {
                  setRegisterPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold"
                required
              />
              <button 
                type="button"
                onClick={() => setShowRegPassword(!showRegPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showRegPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="reg-confirm">
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                id="reg-confirm"
                placeholder="Ketik ualng sandi"
                type={showRegConfirmPassword ? 'text' : 'password'}
                value={registerConfirmPassword}
                onChange={(e) => {
                  setRegisterConfirmPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="block w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all font-semibold"
                required
              />
              <button 
                type="button"
                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showRegConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {registerConfirmPassword && (
              <div className="text-right">
                {registerPassword === registerConfirmPassword ? (
                  <span className="text-[9px] font-bold text-emerald-600">✓ Sandi cocok</span>
                ) : (
                  <span className="text-[9px] font-bold text-rose-500">✗ Tidak cocok</span>
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-indigo-600 text-white font-sans text-xs font-bold py-3 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </form>
      )}

      {/* Divider */}
      <div className="my-5 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-slate-100 px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
          Atau masuk dengan
        </span>
      </div>

      {/* Social Login Buttons - modified to simulate Google popup authentication process */}
      <div className="space-y-2">
        <button 
          type="button"
          onClick={handleGoogleLoginClick}
          className="w-full flex items-center justify-center bg-white text-slate-700 border border-slate-200 py-3 rounded-xl font-sans text-xs font-bold hover:bg-slate-50 transition-all active:scale-[0.98] cursor-pointer"
        >
          <img 
            alt="Google Logo" 
            className="w-4 h-4 mr-2" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCT4y62JOMUNapM9uny3__7o28WVeXyUtF5X09JUv3PrSLFo75z6EQlT-A06l7_2uBaxeO2S8Xw-rOYf40lgY2G7FcdJOoUuNNqEeNCxaewhR3Y0aIsVxh7AXHpzb6PGZF4FQ8shfYnLg4-_ktuz-p2fw8CshEwQjS0VibDbHaS0jGiQa8AlQxG2GNEkCLLydWP28-6iGAS1b_9IWP3aNL7QOKAVkA6Xf5aX9FZUXEar0klpq3lCHl9dcJtAvmoUOP0hTh61Horjc5i"
          />
          Hubungkan Google Account
        </button>
      </div>

      {/* Registration Link / Footer */}
      <div className="mt-5 text-center pb-4">
        {mode === 'login' ? (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Belum punya akun?{' '}
            <button 
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-indigo-600 hover:text-indigo-700 font-black ml-1 outline-none focus:underline"
            >
              Daftar sekarang
            </button>
          </p>
        ) : (
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Sudah memiliki akun?{' '}
            <button 
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className="text-indigo-600 hover:text-indigo-700 font-black ml-1 outline-none focus:underline"
            >
              Login kembali
            </button>
          </p>
        )}
      </div>

      {/* Premium Sandbox Demo Shortcuts Console Card */}
      <div className="mt-2 bg-gradient-to-r from-indigo-50/80 to-slate-50/80 p-4 rounded-2xl border border-indigo-100 shadow-sm">
        <div className="flex items-center gap-1.5 mb-2 text-indigo-800">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Demo Quick Access Control</span>
        </div>
        <p className="text-[10px] text-slate-500 font-semibold mb-2.5">
          Gunakan tombol pintasan cepat di bawah ini untuk menguji fungsionalitas penuh aplikasi:
        </p>
        <div className="grid grid-cols-3 gap-1.5 font-sans">
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all font-bold cursor-pointer"
          >
            <User size={14} className="text-indigo-600" />
            <span className="text-[9px] text-slate-700">User</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('petugas')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all font-bold cursor-pointer"
          >
            <QrCode size={14} className="text-indigo-600" />
            <span className="text-[9px] text-slate-700">Petugas</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="flex flex-col items-center gap-1 p-2 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all font-bold cursor-pointer"
          >
            <Shield size={14} className="text-indigo-600" />
            <span className="text-[9px] text-slate-700">Admin</span>
          </button>
        </div>
      </div>

      {/* ----------------- MODAL OVERLAY 1: CONFIRM REGISTER DETAILS ----------------- */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 animate-scale-up">
            <div className="flex items-center gap-2 text-indigo-700 mb-1">
              <Shield size={20} className="animate-pulse" />
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide">Konfirmasi & Verifikasi Data</h3>
            </div>
            
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Silakan pastikan bahwa alamat email dan kata sandi yang Anda masukkan sudah benar sebelum didaftarkan ke sistem ParkWise Pemkot Surabaya:
            </p>

            <div className="bg-slate-50 rounded-xl p-3.5 space-y-2 border border-slate-100 text-xs font-semibold text-slate-700 font-sans">
              <div className="flex justify-between">
                <span className="text-slate-400">Email:</span>
                <span className="font-extrabold text-slate-800">{registerEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">No. Telepon:</span>
                <span className="font-extrabold text-slate-800">{registerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kata Sandi:</span>
                <span className="font-mono text-indigo-600">{'*'.repeat(registerPassword.length)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition-all outline-none"
              >
                Kembali & Edit
              </button>
              <button
                type="button"
                onClick={handleConfirmRegistration}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-500/10 outline-none flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                Ya, Sudah Benar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- MODAL OVERLAY 2: GOOGLE ACCOUNTS CONNECTION DIALOG ----------------- */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-[24px] max-w-sm w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col animate-scale-up">
            
            {/* Google Brand Top Bar */}
            <div className="bg-slate-50 p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {/* Google Multi color G symbol */}
                <span className="font-sans font-black text-slate-700 tracking-tight text-sm">G</span>
                <span className="text-xs font-black text-slate-500 lowercase tracking-tight">oogle Account Connection</span>
              </div>
              <button 
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Connecting State Animation */}
            {googleStatus === 'connecting' && (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="animate-spin text-indigo-600" size={36} />
                <div>
                  <h4 className="font-extrabold text-slate-800 text-sm mb-1">Membuka Akun Google Anda...</h4>
                  <p className="text-[11px] text-slate-400 font-medium">Menghubungkan layanan otentikasi aman ParkWise ke API Google.</p>
                </div>
              </div>
            )}

            {/* Account Selection Box */}
            {googleStatus === 'list' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!customGoogleEmail || !validateEmailFormat(customGoogleEmail)) {
                    alert('Harap masukkan alamat email Google yang valid.');
                    return;
                  }
                  selectGoogleProfile(customGoogleEmail);
                }}
                className="p-5 flex flex-col gap-3.5"
              >
                <div className="text-center mb-1">
                  <h4 className="font-extrabold text-slate-800 text-sm">Hubungkan Akun Google Anda</h4>
                  <p className="text-[11px] text-slate-400 font-semibold">Silakan masukkan akun Google Anda sendiri untuk masuk ke ParkWise</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="google-email">
                      Alamat Email Google
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-bold">
                        @
                      </div>
                      <input 
                        id="google-email"
                        type="email"
                        placeholder="contoh@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        className="block w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider" htmlFor="google-pass">
                      Kata Sandi Google (Simulasi)
                    </label>
                    <input 
                      id="google-pass"
                      type="password"
                      placeholder="••••••••"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Hubungkan Akun & Masuk
                </button>

                <p className="text-[9px] text-slate-400 text-center leading-normal">
                  Sistem otentikasi ParkWise mematuhi Kebijakan Privasi Google API. Data Anda dijamin aman.
                </p>
              </form>
            )}

            {/* Connection Success State */}
            {googleStatus === 'success' && (
              <div className="p-8 flex flex-col items-center justify-center text-center gap-4 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-500/10">
                  <Check size={24} className="animate-bounce" />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-sm mb-1">Koneksi Berhasil!</h4>
                  <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                    Akun Google dideteksi sebagai anggota aktif. Masuk ke dashboard...
                  </p>
                  <p className="text-xs font-mono font-bold text-indigo-600 mt-2 truncate bg-slate-50 px-2.5 py-1 rounded-lg max-w-[280px]">
                    {selectedGoogleAccount}
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
