import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ExternalLink,
  AlertTriangle,
  Globe,
  X,
  Maximize2,
  Minimize2,
  Plus,
  Search,
  Link as LinkIcon,
  FolderTree
} from 'lucide-react';
import { OpenTab, Submodulo, UserRole } from '../types';

interface ProgramTabViewerProps {
  activeTab: OpenTab | null;
  selectedSubmodule: Submodulo | null;
  role?: UserRole;
  onClose: () => void;
  onOpenSublink: (nombre: string, url: string) => void;
  onAddSublinkToSubmodule?: (submoduloId: string, nombre: string, url: string, desc?: string) => Promise<void>;
}

export const ProgramTabViewer: React.FC<ProgramTabViewerProps> = ({
  activeTab,
  selectedSubmodule,
  role,
  onClose,
  onOpenSublink,
  onAddSublinkToSubmodule,
}) => {
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Floating Window Controls
  const [isMaximized, setIsMaximized] = useState(false);

  // Subsubmodule inline search & addition state
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddSublinkOpen, setIsAddSublinkOpen] = useState(false);
  const [newSublinkName, setNewSublinkName] = useState('');
  const [newSublinkDesc, setNewSublinkDesc] = useState('');
  const [newSublinkUrl, setNewSublinkUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Reset loading state when activeTab changes
  useEffect(() => {
    setIframeError(false);
    setIframeLoading(true);
  }, [activeTab?.id, activeTab?.url]);

  const handleAddSublinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmodule || !newSublinkName.trim() || !newSublinkUrl.trim()) return;

    setIsAdding(true);
    try {
      if (onAddSublinkToSubmodule) {
        await onAddSublinkToSubmodule(selectedSubmodule.id, newSublinkName.trim(), newSublinkUrl.trim(), newSublinkDesc.trim());
      }
      setNewSublinkName('');
      setNewSublinkDesc('');
      setNewSublinkUrl('');
      setIsAddSublinkOpen(false);
    } catch (err) {
      alert('Error agregando el sub-submódulo');
    } finally {
      setIsAdding(false);
    }
  };

  if (!activeTab && !selectedSubmodule) return null;

  // Render Subsubmodules List View when clicking a submodule
  if (!activeTab && selectedSubmodule) {
    const sublinks = selectedSubmodule.sublinks || [];
    const filteredSublinks = sublinks.filter(
      (s) =>
        s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.desc && s.desc.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.url.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-[#0A0A0A]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-[#1F1F1F] p-4 flex items-center justify-between shadow-sm select-none">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
                title="Volver"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FolderTree className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                    {selectedSubmodule.nombre}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                  {selectedSubmodule.desc || 'Submódulo de servicios'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F1F]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {/* Direct URL button if present */}
            {selectedSubmodule.url && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Enlace Principal del Submódulo
                  </span>
                  <p className="text-xs font-bold text-slate-800 dark:text-gray-200 truncate mt-0.5">
                    {selectedSubmodule.url}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenSublink(selectedSubmodule.nombre, selectedSubmodule.url!)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 shrink-0"
                >
                  Abrir Principal
                </button>
              </div>
            )}

            {/* Sub-submodules Header & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-gray-300">
                  Trámites y Sub-submódulos
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px] border border-emerald-500/20">
                  {sublinks.length}
                </span>
              </div>

              {/* ONLY ADMIN CAN CREATE / ADD SUB-SUBMODULES */}
              {role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => setIsAddSublinkOpen(!isAddSublinkOpen)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar Trámite</span>
                </button>
              )}
            </div>

            {/* Form to add subsubmodule dynamically (Admin Only) */}
            {role === 'ADMIN' && isAddSublinkOpen && (
              <form
                onSubmit={handleAddSublinkSubmit}
                className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#262626] p-4 rounded-2xl space-y-3 animate-in fade-in duration-200"
              >
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Nuevo Sub-submódulo / Trámite Directo
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">
                      Nombre
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Estado de Cuenta"
                      value={newSublinkName}
                      onChange={(e) => setNewSublinkName(e.target.value)}
                      className="w-full bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] p-2.5 rounded-xl text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">
                      Descripción
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Trámite y gestión en línea"
                      value={newSublinkDesc}
                      onChange={(e) => setNewSublinkDesc(e.target.value)}
                      className="w-full bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] p-2.5 rounded-xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-gray-400">
                      URL del Servicio
                    </label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/tramite"
                      value={newSublinkUrl}
                      onChange={(e) => setNewSublinkUrl(e.target.value)}
                      className="w-full bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] p-2.5 rounded-xl text-xs text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddSublinkOpen(false)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isAdding}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20"
                  >
                    {isAdding ? 'Guardando...' : 'Guardar Trámite'}
                  </button>
                </div>
              </form>
            )}

            {/* Filter Input if multiple sublinks */}
            {sublinks.length > 3 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar trámite o sub-submódulo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white text-xs pl-9 pr-3 py-2.5 rounded-xl font-medium outline-none focus:border-emerald-500"
                />
              </div>
            )}

            {/* Subsubmodules List */}
            {filteredSublinks.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-[#181818] rounded-2xl border border-dashed border-slate-200 dark:border-[#262626] p-4">
                <LinkIcon className="w-8 h-8 text-slate-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-gray-300">
                  {sublinks.length === 0
                    ? 'No hay trámites agregados aún a este submódulo.'
                    : 'No se encontraron trámites con esa búsqueda.'}
                </p>
                {role === 'ADMIN' && (
                  <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-1">
                    Como Administrador, puedes usar el botón "+ Agregar Trámite" para registrar uno.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredSublinks.map((link) => (
                  <div
                    key={link.id}
                    onClick={() => onOpenSublink(link.nombre, link.url)}
                    className="bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#262626] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 rounded-2xl p-3.5 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between group space-y-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform border border-emerald-500/20">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {link.nombre}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400 line-clamp-2 leading-snug mt-0.5">
                          {link.desc || 'Acceso directo al servicio y gestión institucional.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60 dark:border-[#222]">
                      <span className="px-3 py-1 rounded-xl text-[11px] font-bold bg-emerald-600 text-white shrink-0 shadow-sm group-hover:bg-emerald-500 transition-colors flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" />
                        <span>Abrir Trámite</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Active Tab View Modal
  return (
    <div
      className={`fixed z-50 transition-all duration-150 ${
        isMaximized
          ? 'inset-0 p-0'
          : 'top-12 sm:top-16 left-1/2 -translate-x-1/2 w-[95vw] max-w-5xl h-[84vh] p-0'
      }`}
    >
      <div
        className={`bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] text-slate-900 dark:text-gray-200 flex flex-col w-full h-full shadow-2xl overflow-hidden ${
          isMaximized ? 'rounded-none' : 'rounded-3xl'
        }`}
      >
        {/* Header Bar */}
        <div className="bg-white dark:bg-[#121212] border-b border-slate-200 dark:border-[#1F1F1F] px-4 py-3 flex items-center justify-between shrink-0 shadow-md select-none">
          {/* Title & Controls */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors shrink-0"
              title="Cerrar vista"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  {activeTab?.nombre}
                </h3>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate">{activeTab?.url}</p>
            </div>
          </div>

          {/* Window Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* External Navigation Button */}
            {activeTab?.url && (
              <a
                href={activeTab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 dark:bg-[#1F1F1F] text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors border border-slate-200 dark:border-[#262626]"
                title="Abrir en pestaña nueva del navegador"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Navegador</span>
              </a>
            )}

            {/* Maximize Toggle */}
            <button
              type="button"
              onClick={() => setIsMaximized(!isMaximized)}
              className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1F1F1F] transition-colors"
              title={isMaximized ? 'Restaurar tamaño' : 'Maximizar ventana'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Frame / Browser Content */}
        <div className="flex-1 relative bg-slate-100 dark:bg-[#0A0A0A] overflow-hidden flex items-center justify-center">
          {iframeLoading && (
            <div className="absolute inset-0 z-10 bg-slate-100/90 dark:bg-[#0A0A0A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="w-10 h-10 border-4 border-slate-300 dark:border-[#262626] border-t-emerald-500 rounded-full animate-spin mb-3" />
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                Cargando servicio...
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs">
                Conectando con {activeTab?.nombre}
              </p>
            </div>
          )}

          {iframeError ? (
            <div className="p-8 max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  El sitio requiere apertura en navegador
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                  Por políticas de seguridad (X-Frame-Options) del sitio ({activeTab?.nombre}), no es
                  posible incrustarlo dentro del marco de la aplicación.
                </p>
              </div>
              {activeTab?.url && (
                <a
                  href={activeTab.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xl shadow-emerald-600/20 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Abrir en Navegador Externo</span>
                </a>
              )}
            </div>
          ) : (
            <iframe
              src={activeTab?.url}
              title={activeTab?.nombre}
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setIframeLoading(false);
                setIframeError(true);
              }}
              className="w-full h-full border-none"
              allow="fullscreen; camera; microphone; geolocation"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
};
