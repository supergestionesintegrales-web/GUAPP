import React from 'react';
import { RefreshCw, Bell, Settings, LogOut, Sun, Moon } from 'lucide-react';
import { UserRole } from '../types';
import { GuappLogo } from './GuappLogo';

interface HeaderNavProps {
  role: UserRole;
  unreadNewsCount: number;
  isSyncing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSync: () => void;
  onOpenNews: () => void;
  onOpenConfig: () => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  role,
  unreadNewsCount,
  isSyncing,
  theme,
  onToggleTheme,
  onSync,
  onOpenNews,
  onOpenConfig,
  onLogout,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-slate-200 dark:border-[#1F1F1F] px-3 sm:px-5 py-2.5 shadow-sm dark:shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-500 to-cyan-400 p-1 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <GuappLogo gradientId="guappLogoHeader" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white leading-none">
                GUAPP
              </h1>
              {role === 'ADMIN' ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 dark:border-rose-500/30">
                  Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30">
                  Público
                </span>
              )}
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-gray-400 leading-tight">
              Tu Guajira App
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#1F1F1F] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-in spin-in-90 duration-300" />
            )}
            <span className="hidden lg:inline text-xs font-bold">
              {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
            </span>
          </button>

          {/* Sync Button */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            title="Sincronizar datos"
            className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#1F1F1F] transition-colors flex items-center gap-1.5 text-xs font-semibold relative disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 dark:text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sincronizar</span>
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={onOpenNews}
            title="Noticias e información"
            className="p-2 rounded-xl text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#1F1F1F] transition-colors relative"
          >
            <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {unreadNewsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-white dark:text-black text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {unreadNewsCount}
              </span>
            )}
          </button>

          {/* Structure / Module Config Button (Admin Only) */}
          {role === 'ADMIN' && (
            <button
              type="button"
              onClick={onOpenConfig}
              title="Gestión de Estructura y Módulos"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 text-xs font-bold"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Estructura</span>
            </button>
          )}

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            title="Cerrar sesión"
            className="p-2 rounded-xl text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

