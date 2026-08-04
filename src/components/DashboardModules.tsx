import React, { useState } from 'react';
import {
  Search,
  ChevronRight,
  FileText,
  Users,
  DollarSign,
  PieChart,
  Briefcase,
  FolderArchive,
  Package,
  Layers,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';
import { Modulo, Submodulo, UserRole } from '../types';

interface DashboardModulesProps {
  modules: Modulo[];
  role?: UserRole;
  onOpenSubmodule: (sub: Submodulo) => void;
  onOpenConfig?: () => void;
}

// Icon helper
const getSubmoduleIcon = (iconName: string, color: string) => {
  const props = { className: 'w-5 h-5', style: { color } };
  switch (iconName?.toLowerCase()) {
    case 'file-text':
      return <FileText {...props} />;
    case 'users':
      return <Users {...props} />;
    case 'dollar-sign':
      return <DollarSign {...props} />;
    case 'pie-chart':
      return <PieChart {...props} />;
    case 'briefcase':
      return <Briefcase {...props} />;
    case 'folder-archive':
      return <FolderArchive {...props} />;
    default:
      return <Package {...props} />;
  }
};

export const DashboardModules: React.FC<DashboardModulesProps> = ({ modules, role, onOpenSubmodule, onOpenConfig }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredModules = modules
    .map((modulo) => {
      const filteredSubs = (modulo.submodulos || []).filter((sub) => {
        const query = searchTerm.toLowerCase();
        const nameMatch = sub.nombre.toLowerCase().includes(query);
        const descMatch = (sub.desc || '').toLowerCase().includes(query);
        const linksMatch = (sub.sublinks || []).some((link) =>
          link.nombre.toLowerCase().includes(query)
        );
        return nameMatch || descMatch || linksMatch;
      });

      return {
        ...modulo,
        submodulos: filteredSubs
      };
    })
    .filter((modulo) => modulo.submodulos.length > 0 || searchTerm === '');

  const totalSubmodules = modules.reduce((acc, m) => acc + (m.submodulos?.length || 0), 0);
  const totalSublinks = modules.reduce(
    (acc, m) => acc + (m.submodulos || []).reduce((sAcc, s) => sAcc + (s.sublinks?.length || 0), 0),
    0
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header Banner */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Servicios Institucionales
            </span>

            {role === 'ADMIN' && onOpenConfig && (
              <button
                type="button"
                onClick={onOpenConfig}
                className="px-3.5 py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>+ Gestionar Módulos</span>
              </button>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
            ¿Qué servicio o trámite buscas hoy?
          </h2>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-6">
            Explora las opciones de gestión, consulta tus trámites y accede a las herramientas oficiales.
          </p>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, descripción o trámite..."
              className="w-full bg-slate-50 dark:bg-[#0A0A0A] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-medium rounded-2xl py-3.5 pl-12 pr-4 shadow-inner text-sm outline-none border border-slate-200 dark:border-[#262626] focus:border-emerald-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 dark:bg-[#1F1F1F] px-2 py-1 rounded-lg"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modules List */}
      {filteredModules.length === 0 ? (
        <div className="bg-white dark:bg-[#121212] rounded-3xl p-10 text-center border border-slate-200 dark:border-[#1F1F1F] shadow-sm">
          <Search className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-gray-200">No se encontraron resultados</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            No encontramos ninguna coincidencia para "{searchTerm}". Intenta buscar con otras palabras.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredModules.map((modulo) => (
            <div key={modulo.id} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {modulo.nombre}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] px-2.5 py-1 rounded-full shadow-sm">
                  {modulo.submodulos.length} servicio{modulo.submodulos.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Submodules Cards List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modulo.submodulos.map((sub) => {
                  const cardColor = sub.color || '#10B981';
                  const linkCount = sub.sublinks?.length || 0;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => onOpenSubmodule(sub)}
                      className="group bg-white dark:bg-[#121212] hover:bg-slate-50 dark:hover:bg-[#181818] border border-slate-200/80 dark:border-[#1F1F1F] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 rounded-2xl p-4 transition-all duration-200 shadow-sm hover:shadow-md dark:shadow-md dark:hover:shadow-xl cursor-pointer flex items-center gap-4 relative overflow-hidden"
                    >
                      {/* Left color bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1.5 transition-all group-hover:w-2"
                        style={{ backgroundColor: cardColor }}
                      />

                      {/* Icon Wrap */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{ backgroundColor: `${cardColor}20` }}
                      >
                        {getSubmoduleIcon(sub.icono, cardColor)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pl-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-gray-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {sub.nombre}
                          </h4>
                          {linkCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                              {linkCount} opción{linkCount === 1 ? '' : 'es'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {sub.desc || 'Haz clic para acceder al servicio y opciones.'}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="text-slate-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
