import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Link,
  Save,
  Layers,
  Package,
  FileText,
  Users,
  DollarSign,
  PieChart,
  Briefcase,
  FolderArchive,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Modulo, Submodulo, Subsubmodulo } from '../types';

interface StructureConfigModalProps {
  modules: Modulo[];
  onClose: () => void;
  onSaveModules: (newModules: Modulo[]) => Promise<void>;
}

const COLOR_OPTIONS = [
  { label: 'Azul', value: '#3b82f6' },
  { label: 'Verde', value: '#10b981' },
  { label: 'Cian', value: '#0284c7' },
  { label: 'Morado', value: '#8b5cf6' },
  { label: 'Rosa', value: '#ec4899' },
  { label: 'Ámbar', value: '#f59e0b' },
  { label: 'Turquesa', value: '#06b6d4' },
  { label: 'Rojo', value: '#e11d48' }
];

const ICON_OPTIONS = [
  { id: 'package', label: 'Paquete', Icon: Package },
  { id: 'file-text', label: 'Documento', Icon: FileText },
  { id: 'users', label: 'Usuarios', Icon: Users },
  { id: 'dollar-sign', label: 'Finanzas', Icon: DollarSign },
  { id: 'pie-chart', label: 'Estadísticas', Icon: PieChart },
  { id: 'briefcase', label: 'Trabajo', Icon: Briefcase },
  { id: 'folder-archive', label: 'Archivo', Icon: FolderArchive },
  { id: 'shield-check', label: 'Seguridad', Icon: ShieldCheck }
];

export const StructureConfigModal: React.FC<StructureConfigModalProps> = ({
  modules,
  onClose,
  onSaveModules,
}) => {
  const [draftModules, setDraftModules] = useState<Modulo[]>(JSON.parse(JSON.stringify(modules)));
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [isSaving, setIsSaving] = useState(false);

  // Module Modal State
  const [moduleModal, setModuleModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    moduleId?: string;
    nombre: string;
  } | null>(null);

  // Submodule Modal State
  const [submoduleModal, setSubmoduleModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    moduloId: string;
    submoduloId?: string;
    nombre: string;
    desc: string;
    url: string;
    color: string;
    icono: string;
  } | null>(null);

  // Sublink Modal State
  const [sublinkModal, setSublinkModal] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    moduloId: string;
    submoduloId: string;
    sublinkId?: string;
    nombre: string;
    desc: string;
    url: string;
  } | null>(null);

  // Delete Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'module' | 'submodule' | 'sublink';
    moduloId: string;
    submoduloId?: string;
    sublinkId?: string;
    title: string;
  } | null>(null);

  const generateRandomID = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  // --- MODULE HANDLERS ---
  const handleOpenAddModule = () => {
    setModuleModal({
      isOpen: true,
      mode: 'add',
      nombre: ''
    });
  };

  const handleOpenEditModule = (mod: Modulo) => {
    setModuleModal({
      isOpen: true,
      mode: 'edit',
      moduleId: mod.id,
      nombre: mod.nombre
    });
  };

  const handleSaveModuleModal = () => {
    if (!moduleModal || !moduleModal.nombre.trim()) return;

    if (moduleModal.mode === 'add') {
      const newMod: Modulo = {
        id: generateRandomID(),
        nombre: moduleModal.nombre.trim(),
        orden: draftModules.length + 1,
        submodulos: []
      };
      setDraftModules([...draftModules, newMod]);
      setExpandedIndex(draftModules.length);
    } else if (moduleModal.mode === 'edit' && moduleModal.moduleId) {
      setDraftModules(
        draftModules.map((m) =>
          m.id === moduleModal.moduleId ? { ...m, nombre: moduleModal.nombre.trim() } : m
        )
      );
    }
    setModuleModal(null);
  };

  // --- SUBMODULE HANDLERS ---
  const handleOpenAddSubmodule = (moduloId: string) => {
    setSubmoduleModal({
      isOpen: true,
      mode: 'add',
      moduloId,
      nombre: '',
      desc: '',
      url: '',
      color: '#3b82f6',
      icono: 'package'
    });
  };

  const handleOpenEditSubmodule = (moduloId: string, sub: Submodulo) => {
    setSubmoduleModal({
      isOpen: true,
      mode: 'edit',
      moduloId,
      submoduloId: sub.id,
      nombre: sub.nombre,
      desc: sub.desc || '',
      url: sub.url || '',
      color: sub.color || '#3b82f6',
      icono: sub.icono || 'package'
    });
  };

  const handleSaveSubmoduleModal = () => {
    if (!submoduleModal || !submoduleModal.nombre.trim()) return;

    if (submoduleModal.mode === 'add') {
      const newSub: Submodulo = {
        id: generateRandomID(),
        moduloId: submoduleModal.moduloId,
        nombre: submoduleModal.nombre.trim(),
        desc: submoduleModal.desc.trim(),
        url: submoduleModal.url.trim(),
        color: submoduleModal.color,
        icono: submoduleModal.icono,
        sublinks: []
      };

      setDraftModules(
        draftModules.map((mod) => {
          if (mod.id === submoduleModal.moduloId) {
            return {
              ...mod,
              submodulos: [...(mod.submodulos || []), newSub]
            };
          }
          return mod;
        })
      );
    } else if (submoduleModal.mode === 'edit' && submoduleModal.submoduloId) {
      setDraftModules(
        draftModules.map((mod) => {
          if (mod.id === submoduleModal.moduloId) {
            return {
              ...mod,
              submodulos: (mod.submodulos || []).map((sub) => {
                if (sub.id === submoduleModal.submoduloId) {
                  return {
                    ...sub,
                    nombre: submoduleModal.nombre.trim(),
                    desc: submoduleModal.desc.trim(),
                    url: submoduleModal.url.trim(),
                    color: submoduleModal.color,
                    icono: submoduleModal.icono
                  };
                }
                return sub;
              })
            };
          }
          return mod;
        })
      );
    }
    setSubmoduleModal(null);
  };

  // --- SUBLINK (TRÁMITE) HANDLERS ---
  const handleOpenAddSublink = (moduloId: string, submoduloId: string) => {
    setSublinkModal({
      isOpen: true,
      mode: 'add',
      moduloId,
      submoduloId,
      nombre: '',
      desc: '',
      url: ''
    });
  };

  const handleOpenEditSublink = (moduloId: string, submoduloId: string, link: Subsubmodulo) => {
    setSublinkModal({
      isOpen: true,
      mode: 'edit',
      moduloId,
      submoduloId,
      sublinkId: link.id,
      nombre: link.nombre,
      desc: link.desc || '',
      url: link.url
    });
  };

  const handleSaveSublinkModal = () => {
    if (!sublinkModal || !sublinkModal.nombre.trim() || !sublinkModal.url.trim()) return;

    if (sublinkModal.mode === 'add') {
      const newLink: Subsubmodulo = {
        id: generateRandomID(),
        nombre: sublinkModal.nombre.trim(),
        desc: sublinkModal.desc.trim(),
        url: sublinkModal.url.trim()
      };

      setDraftModules(
        draftModules.map((mod) => {
          if (mod.id === sublinkModal.moduloId) {
            return {
              ...mod,
              submodulos: (mod.submodulos || []).map((sub) => {
                if (sub.id === sublinkModal.submoduloId) {
                  return {
                    ...sub,
                    sublinks: [...(sub.sublinks || []), newLink]
                  };
                }
                return sub;
              })
            };
          }
          return mod;
        })
      );
    } else if (sublinkModal.mode === 'edit' && sublinkModal.sublinkId) {
      setDraftModules(
        draftModules.map((mod) => {
          if (mod.id === sublinkModal.moduloId) {
            return {
              ...mod,
              submodulos: (mod.submodulos || []).map((sub) => {
                if (sub.id === sublinkModal.submoduloId) {
                  return {
                    ...sub,
                    sublinks: (sub.sublinks || []).map((l) => {
                      if (l.id === sublinkModal.sublinkId) {
                        return {
                          ...l,
                          nombre: sublinkModal.nombre.trim(),
                          desc: sublinkModal.desc.trim(),
                          url: sublinkModal.url.trim()
                        };
                      }
                      return l;
                    })
                  };
                }
                return sub;
              })
            };
          }
          return mod;
        })
      );
    }
    setSublinkModal(null);
  };

  // --- DELETE EXECUTION ---
  const handleConfirmDeleteAction = () => {
    if (!deleteConfirm) return;

    const { type, moduloId, submoduloId, sublinkId } = deleteConfirm;

    if (type === 'module') {
      setDraftModules(draftModules.filter((m) => m.id !== moduloId));
    } else if (type === 'submodule' && submoduloId) {
      setDraftModules(
        draftModules.map((m) => {
          if (m.id === moduloId) {
            return {
              ...m,
              submodulos: (m.submodulos || []).filter((s) => s.id !== submoduloId)
            };
          }
          return m;
        })
      );
    } else if (type === 'sublink' && submoduloId && sublinkId) {
      setDraftModules(
        draftModules.map((m) => {
          if (m.id === moduloId) {
            return {
              ...m,
              submodulos: (m.submodulos || []).map((s) => {
                if (s.id === submoduloId) {
                  return {
                    ...s,
                    sublinks: (s.sublinks || []).filter((l) => l.id !== sublinkId)
                  };
                }
                return s;
              })
            };
          }
          return m;
        })
      );
    }

    setDeleteConfirm(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveModules(draftModules);
      onClose();
    } catch (e) {
      alert('Error guardando la estructura');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-[#0A0A0A]/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] text-slate-800 dark:text-gray-200 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-[#1F1F1F] flex items-center justify-between bg-white dark:bg-[#121212]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Gestión de Módulos, Servicios y Trámites
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Crea, edita o elimina la estructura de navegación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#1F1F1F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {draftModules.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 dark:bg-[#0A0A0A] rounded-2xl border border-dashed border-slate-300 dark:border-[#262626] p-6 space-y-2">
              <Layers className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-gray-300">No hay módulos creados</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">Haz clic abajo en "+ Nuevo Módulo" para comenzar.</p>
            </div>
          ) : (
            draftModules.map((modulo, idx) => {
              const isExpanded = expandedIndex === idx;

              return (
                <div
                  key={modulo.id}
                  className="border border-slate-200 dark:border-[#1F1F1F] rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#0A0A0A] shadow-sm transition-all"
                >
                  {/* Module Header Bar */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="p-4 bg-slate-100 dark:bg-[#181818] flex items-center justify-between cursor-pointer hover:bg-slate-200/70 dark:hover:bg-[#202020] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-black flex items-center justify-center border border-emerald-500/20 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                          {modulo.nombre}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-gray-400">
                          {modulo.submodulos?.length || 0} servicio(s) / submódulo(s)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleOpenAddSubmodule(modulo.id)}
                        title="Agregar Submódulo"
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1 border border-emerald-500/20 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">+ Submódulo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModule(modulo)}
                        title="Editar nombre del Módulo"
                        className="p-1.5 rounded-lg text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteConfirm({
                            type: 'module',
                            moduloId: modulo.id,
                            title: `¿Eliminar el módulo "${modulo.nombre}" y todos sus submódulos?`
                          })
                        }
                        title="Eliminar Módulo"
                        className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 dark:text-gray-400 ml-1" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 dark:text-gray-400 ml-1" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Submodules list */}
                  {isExpanded && (
                    <div className="p-4 border-t border-slate-200 dark:border-[#1F1F1F] space-y-3 bg-white dark:bg-[#0A0A0A]">
                      {(!modulo.submodulos || modulo.submodulos.length === 0) ? (
                        <div className="text-center py-6 border border-dashed border-slate-200 dark:border-[#1F1F1F] rounded-xl p-4">
                          <p className="text-xs text-slate-400 dark:text-gray-500 font-medium">
                            Sin submódulos en esta categoría.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleOpenAddSubmodule(modulo.id)}
                            className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold"
                          >
                            + Crear primer submódulo
                          </button>
                        </div>
                      ) : (
                        modulo.submodulos.map((sub) => (
                          <div
                            key={sub.id}
                            className="bg-slate-50 dark:bg-[#121212] p-3.5 rounded-xl border border-slate-200 dark:border-[#262626] space-y-2 relative overflow-hidden"
                          >
                            <div
                              className="absolute left-0 top-0 bottom-0 w-1"
                              style={{ backgroundColor: sub.color || '#3b82f6' }}
                            />

                            <div className="flex items-center justify-between pl-1">
                              <div className="min-w-0 pr-2">
                                <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                  {sub.nombre}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate">
                                  {sub.desc || 'Sin descripción'}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddSublink(modulo.id, sub.id)}
                                  className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                                  title="Agregar trámite directo"
                                >
                                  <Link className="w-3 h-3" />
                                  <span>+ Trámite</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSubmodule(modulo.id, sub)}
                                  className="p-1.5 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-colors"
                                  title="Editar submódulo"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteConfirm({
                                      type: 'submodule',
                                      moduloId: modulo.id,
                                      submoduloId: sub.id,
                                      title: `¿Eliminar el submódulo "${sub.nombre}"?`
                                    })
                                  }
                                  className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                  title="Eliminar submódulo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Sublinks / child options list */}
                            {sub.sublinks && sub.sublinks.length > 0 && (
                              <div className="pl-3 border-l-2 border-emerald-500/40 space-y-1.5 pt-1">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-gray-500">
                                  Trámites y Opciones Directas:
                                </p>
                                {sub.sublinks.map((link) => (
                                  <div
                                    key={link.id}
                                    className="flex items-center justify-between text-[11px] bg-white dark:bg-[#0A0A0A] p-2 rounded-xl border border-slate-200 dark:border-[#1F1F1F] gap-2"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <span className="font-bold text-slate-800 dark:text-gray-200 truncate block">
                                        {link.nombre}
                                      </span>
                                      <span className="text-[10px] text-slate-500 dark:text-gray-400 truncate block">
                                        {link.desc || 'Servicio o trámite directo'}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditSublink(modulo.id, sub.id, link)}
                                        className="p-1 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-md"
                                        title="Editar trámite"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDeleteConfirm({
                                            type: 'sublink',
                                            moduloId: modulo.id,
                                            submoduloId: sub.id,
                                            sublinkId: link.id,
                                            title: `¿Eliminar el trámite "${link.nombre}"?`
                                          })
                                        }
                                        className="p-1 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md"
                                        title="Eliminar trámite"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-[#1F1F1F] bg-white dark:bg-[#121212] flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenAddModule}
            className="flex-1 py-3 bg-slate-100 dark:bg-[#1F1F1F] hover:bg-slate-200 dark:hover:bg-[#262626] text-slate-800 dark:text-gray-200 font-extrabold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-[#262626]"
          >
            <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>+ Nuevo Módulo</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Guardar Estructura</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- MODULE MODAL DIALOG --- */}
      {moduleModal && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] text-slate-900 dark:text-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {moduleModal.mode === 'add' ? 'Nuevo Módulo Principal' : 'Editar Nombre del Módulo'}
            </h4>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                Nombre del Módulo
              </label>
              <input
                type="text"
                placeholder="Ej: Servicios Ciudadanos"
                value={moduleModal.nombre}
                onChange={(e) => setModuleModal({ ...moduleModal, nombre: e.target.value })}
                className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModuleModal(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveModuleModal}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20"
              >
                {moduleModal.mode === 'add' ? 'Crear Módulo' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBMODULE MODAL DIALOG --- */}
      {submoduleModal && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] text-slate-900 dark:text-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {submoduleModal.mode === 'add' ? 'Nuevo Submódulo / Servicio' : 'Editar Submódulo'}
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Nombre del Submódulo *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Peticiones y Quejas"
                  value={submoduleModal.nombre}
                  onChange={(e) => setSubmoduleModal({ ...submoduleModal, nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Descripción Breve
                </label>
                <input
                  type="text"
                  placeholder="Ej: Radica tus PQRS de forma rápida"
                  value={submoduleModal.desc}
                  onChange={(e) => setSubmoduleModal({ ...submoduleModal, desc: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  URL Principal (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/servicio"
                  value={submoduleModal.url}
                  onChange={(e) => setSubmoduleModal({ ...submoduleModal, url: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>

              {/* Color Preset Picker */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Color de Identificación
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setSubmoduleModal({ ...submoduleModal, color: c.value })}
                      className={`w-7 h-7 rounded-full transition-transform border-2 ${
                        submoduleModal.color === c.value
                          ? 'border-white scale-110 shadow-md ring-2 ring-emerald-500'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Icono Representativo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {ICON_OPTIONS.map((opt) => {
                    const OptIcon = opt.Icon;
                    const isSelected = submoduleModal.icono === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSubmoduleModal({ ...submoduleModal, icono: opt.id })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                            : 'bg-slate-50 dark:bg-[#0A0A0A] border-slate-200 dark:border-[#262626] text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-[#1A1A1A]'
                        }`}
                      >
                        <OptIcon className="w-4 h-4" />
                        <span className="text-[10px]">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmoduleModal(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSubmoduleModal}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20"
              >
                {submoduleModal.mode === 'add' ? 'Agregar Submódulo' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBLINK (TRÁMITE) MODAL DIALOG --- */}
      {sublinkModal && (
        <div className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] text-slate-900 dark:text-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              {sublinkModal.mode === 'add' ? 'Nuevo Trámite Directo' : 'Editar Trámite Directo'}
            </h4>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Nombre del Trámite *
                </label>
                <input
                  type="text"
                  placeholder="Ej: Radicar nueva PQRS"
                  value={sublinkModal.nombre}
                  onChange={(e) => setSublinkModal({ ...sublinkModal, nombre: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-bold outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  Descripción Breve (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej: Permite la radicación formal de peticiones"
                  value={sublinkModal.desc}
                  onChange={(e) => setSublinkModal({ ...sublinkModal, desc: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase">
                  URL del Trámite *
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/radicar"
                  value={sublinkModal.url}
                  onChange={(e) => setSublinkModal({ ...sublinkModal, url: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] text-slate-900 dark:text-white p-3 rounded-2xl text-xs font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSublinkModal(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSublinkModal}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20"
              >
                {sublinkModal.mode === 'add' ? 'Agregar Trámite' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white">Confirmar Eliminación</h4>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">{deleteConfirm.title}</p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAction}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
