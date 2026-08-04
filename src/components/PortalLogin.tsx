import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';
import { GuappLogo } from './GuappLogo';

interface PortalLoginProps {
  onLogin: (role: UserRole, pin?: string) => void;
  isLoading: boolean;
  errorMsg: string | null;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const PortalLogin: React.FC<PortalLoginProps> = ({
  onLogin,
  isLoading,
  errorMsg,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sistemaInfo, setSistemaInfo] = useState({
    nombreApp: 'GUAPP',
    subtituloApp: 'Tu Guajira App',
    lemaApp: 'Simpre cerca de ti',
  });

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    onLogin('ADMIN', pin.trim());
  };

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    fetch('/api/gas/getSistemaInfo')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.nombreApp) {
          setSistemaInfo({
            nombreApp: data.nombreApp,
            subtituloApp: data.subtituloApp || 'Tu Guajira App',
            lemaApp: data.lemaApp || 'Simpre cerca de ti',
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-slate-50 dark:bg-[#0A0A0A] text-slate-800 dark:text-gray-200 flex flex-col overflow-hidden transition-colors duration-200">
      {/* Top right Theme Toggle Button */}
      {onToggleTheme && (
        <div className="absolute top-3 right-3 z-20 shrink-0">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] shadow-md text-slate-700 dark:text-gray-200 hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Modo Claro</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Modo Oscuro</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Subtle Background Glows */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 sm:w-80 sm:h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-64 h-64 sm:w-80 sm:h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-4 py-3 min-h-0 overflow-y-auto overscroll-none">
        {/* Brand Header */}
        <div className="text-center mb-4 shrink-0">
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-blue-700 via-sky-500 to-cyan-400 rounded-2xl p-1.5 shadow-xl shadow-sky-500/25 mb-3">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-400/20 to-transparent rounded-2xl" />
            <GuappLogo className="w-full h-full drop-shadow" gradientId="guappLogoPortal" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-0.5">{sistemaInfo.nombreApp}</h1>
          <p className="text-sm sm:text-base font-semibold text-blue-600 dark:text-sky-400">{sistemaInfo.subtituloApp}</p>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5 font-medium">{sistemaInfo.lemaApp}</p>
        </div>

        {/* Access Cards */}
        <div className="w-full space-y-3 shrink-0">
          {/* Public Access Card */}
          <button
            type="button"
            onClick={() => onLogin('PUBLIC')}
            className="w-full text-left bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#1A1A1A] border border-slate-200 dark:border-[#1F1F1F] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-300 shadow-lg dark:shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                <Eye className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Acceso Público</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400 dark:text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-all" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-1.5">Consulta servicios e información institucional</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1F1F1F] text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">Ver Servicios</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1F1F1F] text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">Noticias</span>
                </div>
              </div>
            </div>
          </button>

          {/* Admin Profile Card */}
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-2xl overflow-hidden transition-all duration-300 shadow-lg dark:shadow-xl">
            <button
              type="button"
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="w-full text-left p-4 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-600/20">
                <Lock className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Perfil de Gestión</h3>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/20 dark:border-rose-500/30">
                    {isAdminOpen ? 'Cerrar' : 'Ingresar'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mb-1.5">Acceso administrativo, publicación o configuración del portal</p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1F1F1F] text-rose-700 dark:text-rose-300 border border-rose-500/20">Gestionar Módulos</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1F1F1F] text-blue-700 dark:text-sky-300 border border-blue-500/20">Publicar Noticias</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#1F1F1F] text-rose-700 dark:text-rose-300 border border-rose-500/20">Protegido por PIN</span>
                </div>
              </div>
            </button>

            {/* Slide-down PIN Form */}
            {isAdminOpen && (
              <form onSubmit={handleAdminSubmit} className="p-4 pt-2 border-t border-slate-200 dark:border-[#1F1F1F] bg-slate-50 dark:bg-[#0F0F0F] backdrop-blur-md">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 mb-2">
                  Ingresa tu PIN de Seguridad
                </label>
                <div className="relative mb-3">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Ingresa tu PIN de acceso"
                    className="w-full bg-white dark:bg-[#050505] border border-slate-300 dark:border-[#262626] focus:border-emerald-500 text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg rounded-xl py-3 pl-4 pr-12 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-gray-600 placeholder:text-sm placeholder:font-sans placeholder:tracking-normal"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Ocultar PIN' : 'Mostrar PIN'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 transition-colors rounded-lg"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-300 text-xs font-semibold bg-rose-50 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-500/30 p-2.5 rounded-xl mb-3 animate-bounce">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !pin.trim()}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Ingresar al Sistema</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer fijo abajo */}
      <div className="relative z-10 shrink-0 text-center px-4 pt-3 pb-4 border-t border-slate-200 dark:border-[#1F1F1F] bg-slate-50/80 dark:bg-[#0A0A0A]/80 backdrop-blur-sm w-full">
        <p className="text-[11px] text-slate-500 dark:text-gray-400 font-medium">Sistema Integrado de Calidad y Gestión</p>
        <p className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">© 2026 GUAPP — Todos los derechos reservados</p>
        <div className="flex justify-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Sincronizado
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            Protegido
          </span>
        </div>
      </div>
    </div>
  );
};

