import React, { useState } from 'react';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  User,
  Sparkles,
  Upload,
  X,
  Tag,
  CheckCircle2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { Noticia, UserRole } from '../types';

interface NewsSectionProps {
  news: Noticia[];
  role: UserRole;
  onSaveNews: (newsData: Partial<Noticia>, fileBase64?: string) => Promise<void>;
  onDeleteNews: (id: string) => Promise<void>;
}

const motivationalQuotes = [
  { quote: '¡Mantente informado!', sub: 'Las noticias e hitos institucionales en tiempo real' },
  { quote: 'Conecta con la gestión', sub: 'Descubre novedades, convocatorias y proyectos' },
  { quote: 'Sé parte de la transformación', sub: 'Tu fuente oficial de información y comunicados' },
  { quote: 'Transparencia y Eficiencia', sub: 'Notificaciones sobre convocatorias y eventos' }
];

export const NewsSection: React.FC<NewsSectionProps> = ({ news, role, onSaveNews, onDeleteNews }) => {
  const isAdmin = role === 'ADMIN';
  const canPublish = role === 'ADMIN' || role === 'PUBLISHER';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<Noticia | null>(null);
  const [selectedNewsDetail, setSelectedNewsDetail] = useState<Noticia | null>(null);
  const [filterType, setFilterType] = useState<'todos' | 'noticia' | 'novedad' | 'evento'>('todos');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [type, setType] = useState<'noticia' | 'novedad' | 'evento'>('noticia');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  const handleOpenForm = (item?: Noticia) => {
    if (!canPublish) return;
    if (item) {
      setEditingNews(item);
      setType((item.tipo as any) || 'noticia');
      setTitle(item.titulo || '');
      setDescription(item.descripcion || '');
      setDate(item.fecha || '');
      setImagePreview(item.imagenURL || null);
      setImageBase64(null);
    } else {
      setEditingNews(null);
      setType('noticia');
      setTitle('');
      setDescription('');
      setDate('');
      setImagePreview(null);
      setImageBase64(null);
    }
    setIsFormOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageBase64(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPublish) return;
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa el título y la descripción');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveNews(
        {
          id: editingNews ? editingNews.id : `news_${Date.now()}`,
          tipo: type,
          titulo: title.trim(),
          descripcion: description.trim(),
          fecha: date || new Date().toISOString().split('T')[0],
          imagenURL: imagePreview ?? ''
        },
        imageBase64 || undefined
      );

      setIsFormOpen(false);
      setEditingNews(null);
      setSelectedNewsDetail(null);
    } catch (err) {
      alert('Error guardando la publicación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = (id: string) => {
    if (!canPublish) return;
    setConfirmDeleteId(id);
  };

  const executeDelete = async (id: string) => {
    await onDeleteNews(id);
    setConfirmDeleteId(null);
    if (selectedNewsDetail?.id === id) {
      setSelectedNewsDetail(null);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Banner */}
      <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-slate-900 dark:text-white shadow-xl dark:shadow-2xl relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-sky-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Tablón Informativo
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight mb-1 text-slate-900 dark:text-white">
            {randomQuote.quote}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 mb-4">{randomQuote.sub}</p>

          {canPublish ? (
            <button
              type="button"
              onClick={() => handleOpenForm()}
              className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Publicar Nueva Noticia / Comunicado</span>
            </button>
          ) : (
            <p className="text-xs text-slate-500 dark:text-gray-400 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#1F1F1F] rounded-xl px-3 py-2 inline-flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Ingresa con PIN autorizado para publicar comunicados.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl mx-auto flex items-center justify-center">
              <Trash2 className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">¿Eliminar esta publicación?</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                Esta acción borrará la publicación de forma permanente de la plataforma.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-[#262626]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => executeDelete(confirmDeleteId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin News Form Modal / Accordion */}
      {isFormOpen && canPublish && (
        <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl dark:shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1F1F1F] mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {editingNews ? 'Editar Noticia' : 'Nueva Publicación'}
            </h3>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F1F1F] text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type Select */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Tipo
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                >
                  <option value="noticia">📢 Noticia Informativa</option>
                  <option value="novedad">✨ Novedad / Actualización</option>
                  <option value="evento">📅 Próximo Evento</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Fecha (opcional)
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Inicio de Inscripciones para Becas"
                className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detalla la noticia o evento para la comunidad..."
                className="w-full bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl p-3 text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Imagen Destacada
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-[#262626] max-h-48 group">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-transform active:scale-90"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-200 dark:border-[#262626] hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 dark:bg-[#0A0A0A] hover:bg-slate-100 dark:hover:bg-[#121212] transition-all">
                  <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mb-2" />
                  <span className="text-xs font-bold text-slate-700 dark:text-gray-300">
                    Haz clic para cargar imagen
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-gray-500 mt-0.5">PNG, JPG, WEBP (Max 5MB)</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-300 font-bold text-xs rounded-xl hover:bg-slate-200 dark:hover:bg-[#262626] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingNews ? 'Guardar Cambios' : 'Publicar'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detailed News Modal */}
      {selectedNewsDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-3 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121212] border border-slate-200 dark:border-[#1F1F1F] rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[95dvh] sm:max-h-[90dvh] modal-landscape-fit overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-3 sm:p-5 border-b border-slate-200 dark:border-[#1F1F1F] flex flex-wrap items-center justify-between gap-2 bg-slate-50/50 dark:bg-[#161616]/50 shrink-0">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-sky-400 border border-blue-500/20">
                  {selectedNewsDetail.tipo || 'Noticia'}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-gray-400 truncate">
                  Detalle de Publicación
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
                {canPublish && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenForm(selectedNewsDetail);
                        setSelectedNewsDetail(null);
                      }}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-extrabold flex items-center gap-1 hover:bg-emerald-500/20 transition-all"
                      title="Editar esta publicación"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePrompt(selectedNewsDetail.id)}
                      className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-extrabold flex items-center gap-1 hover:bg-rose-500/20 transition-all"
                      title="Eliminar esta publicación"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedNewsDetail(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#222] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Scrollable */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1">
              {/* Cover Image with Zoom Trigger */}
              {selectedNewsDetail.imagenURL && (
                <div
                  className="relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#080808] border border-slate-200 dark:border-[#1F1F1F] flex items-center justify-center p-2 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  onClick={() => {
                    setZoomedImage(selectedNewsDetail.imagenURL || null);
                    setZoomScale(1);
                  }}
                  title="Haz clic para abrir el visor con Zoom"
                >
                  <img
                    src={selectedNewsDetail.imagenURL}
                    alt={selectedNewsDetail.titulo}
                    className="w-full h-auto max-h-[420px] object-contain rounded-xl group-hover:scale-[1.01] transition-transform duration-200"
                  />
                  <div className="absolute bottom-4 right-4 bg-slate-900/85 backdrop-blur-md text-white text-xs font-extrabold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg border border-slate-700/60 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all">
                    <ZoomIn className="w-4 h-4 text-sky-400" />
                    <span>Ampliar con Zoom</span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-2">
                  {selectedNewsDetail.titulo}
                </h2>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-gray-400 pt-1 pb-3 border-b border-slate-100 dark:border-[#1F1F1F]">
                  {selectedNewsDetail.fecha && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                      {selectedNewsDetail.fecha}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400 dark:text-gray-500" />
                    Publicado por: {selectedNewsDetail.creadoPor || 'Sistema'}
                  </span>
                </div>
              </div>

              {/* Full Description with Formatting */}
              <div className="text-sm text-slate-700 dark:text-gray-200 leading-relaxed whitespace-pre-line space-y-3 font-normal">
                {selectedNewsDetail.descripcion}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-[#1F1F1F] bg-slate-50/50 dark:bg-[#161616]/50 flex items-center justify-between shrink-0">
              <p className="text-[11px] text-slate-400 dark:text-gray-500 font-medium hidden sm:block">
                GUAPP • Portal Informativo Institucional
              </p>
              <button
                type="button"
                onClick={() => setSelectedNewsDetail(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl hover:opacity-90 transition-opacity ml-auto"
              >
                Cerrar Lectura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Pills */}
      {news.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterType('todos')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              filterType === 'todos'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-[#1F1F1F] hover:bg-slate-50 dark:hover:bg-[#1A1A1A]'
            }`}
          >
            Todos ({news.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('noticia')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              filterType === 'noticia'
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-[#1F1F1F] hover:bg-slate-50 dark:hover:bg-[#1A1A1A]'
            }`}
          >
            📢 Noticias ({news.filter((n) => n.tipo === 'noticia' || !n.tipo).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('novedad')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              filterType === 'novedad'
                ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-[#1F1F1F] hover:bg-slate-50 dark:hover:bg-[#1A1A1A]'
            }`}
          >
            ✨ Novedades ({news.filter((n) => n.tipo === 'novedad').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('evento')}
            className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all border ${
              filterType === 'evento'
                ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                : 'bg-white dark:bg-[#121212] text-slate-700 dark:text-gray-300 border-slate-200 dark:border-[#1F1F1F] hover:bg-slate-50 dark:hover:bg-[#1A1A1A]'
            }`}
          >
            📅 Eventos ({news.filter((n) => n.tipo === 'evento').length})
          </button>
        </div>
      )}

      {/* News Grid */}
      {(() => {
        const filteredNews = news.filter((item) => {
          if (filterType === 'todos') return true;
          if (filterType === 'noticia') return item.tipo === 'noticia' || !item.tipo;
          return item.tipo === filterType;
        });

        if (news.length === 0) {
          return (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-10 text-center border border-slate-200 dark:border-[#1F1F1F] shadow-sm">
              <Newspaper className="w-12 h-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-gray-200">No hay publicaciones aún</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 max-w-xs mx-auto">
                {role === 'ADMIN'
                  ? 'Publica la primera noticia para informar a la comunidad.'
                  : role === 'PUBLISHER'
                    ? 'Puedes publicar la primera noticia para informar a la comunidad.'
                    : 'Pronto habrá novedades e informativos disponibles.'}
              </p>
            </div>
          );
        }

        if (filteredNews.length === 0) {
          return (
            <div className="bg-white dark:bg-[#121212] rounded-3xl p-8 text-center border border-slate-200 dark:border-[#1F1F1F] shadow-sm space-y-2">
              <Tag className="w-10 h-10 text-slate-300 dark:text-gray-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-gray-200">No hay publicaciones en esta categoría</h3>
              <p className="text-xs text-slate-500 dark:text-gray-400">Selecciona otra categoría o selecciona 'Todos'.</p>
              <button
                type="button"
                onClick={() => setFilterType('todos')}
                className="mt-2 px-3 py-1.5 bg-slate-100 dark:bg-[#1F1F1F] text-slate-700 dark:text-gray-200 text-xs font-bold rounded-xl"
              >
                Ver todos los comunicados
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {filteredNews.map((item) => {
              const badgeMap = {
                noticia: { label: 'Noticia', color: 'bg-blue-500/10 text-blue-700 dark:text-sky-400 border-blue-500/20' },
                novedad: { label: 'Novedad', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
                evento: { label: 'Evento', color: 'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20' }
              };
              const badge = badgeMap[item.tipo as keyof typeof badgeMap] || badgeMap.noticia;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedNewsDetail(item)}
                className="bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-[#1F1F1F] rounded-2xl overflow-hidden shadow-sm dark:shadow-md hover:shadow-md dark:hover:shadow-xl hover:border-blue-500/40 dark:hover:border-sky-500/40 transition-all duration-200 flex flex-col group cursor-pointer"
              >
                {/* Image if exists */}
                {item.imagenURL && (
                  <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-[#080808] flex items-center justify-center p-2">
                    <img
                      src={item.imagenURL}
                      alt={item.titulo}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedImage(item.imagenURL || null);
                          setZoomScale(1);
                        }}
                        className="p-1.5 bg-slate-900/80 hover:bg-black backdrop-blur-md text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md border border-slate-700/60"
                        title="Zoom directo a esta imagen"
                      >
                        <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
                        <span className="hidden sm:inline">Zoom</span>
                      </button>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 pointer-events-none">
                      <span className="text-[11px] font-bold text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg">
                        Haz clic para ver noticia completa →
                      </span>
                    </div>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${badge.color}`}
                      >
                        {badge.label}
                      </span>
                      {item.fecha && (
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                          {item.fecha}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors leading-snug mb-1.5">
                      {item.titulo}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                      {item.descripcion}
                    </p>

                    <div className="mt-2 text-[11px] font-bold text-blue-600 dark:text-sky-400 group-hover:underline flex items-center gap-1">
                      <span>Ver publicación completa</span>
                      <span>→</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-[#1F1F1F] flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
                      {item.creadoPor || 'Sistema'}
                    </span>

                    {/* Publication Edit & Delete Actions (Admin only) */}
                    {canPublish && (
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleOpenForm(item)}
                          title="Editar publicación"
                          className="p-1.5 rounded-lg text-blue-600 dark:text-sky-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex items-center gap-1 font-extrabold text-[11px]"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePrompt(item.id)}
                          title="Eliminar publicación"
                          className="p-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors flex items-center gap-1 font-extrabold text-[11px]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        );
      })()}

      {/* Lightbox / Interactive Image Zoom Modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col animate-in fade-in duration-200 select-none">
          {/* Lightbox Top Control Bar */}
          <div className="p-3 sm:p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-sky-400 text-xs font-extrabold flex items-center gap-1.5 border border-blue-500/30">
                <ZoomIn className="w-4 h-4" /> Visualizador con Zoom
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline font-bold">
                Escala: {Math.round(zoomScale * 100)}%
              </span>
            </div>

            {/* Interactive Zoom Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-800/90 p-1 sm:p-1.5 rounded-2xl border border-slate-700/60 shadow-lg">
              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.max(0.5, prev - 0.25))}
                title="Reducir (-)"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-xl transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-xl transition-colors ${
                  zoomScale === 1
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                100%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1.5)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-xl transition-colors ${
                  zoomScale === 1.5
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                150%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(2)}
                className={`px-2.5 py-1 text-xs font-extrabold rounded-xl transition-colors ${
                  zoomScale === 2
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/80'
                }`}
              >
                200%
              </button>

              <button
                type="button"
                onClick={() => setZoomScale((prev) => Math.min(4, prev + 0.25))}
                title="Aumentar (+)"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/80 rounded-xl transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setZoomScale(1)}
                title="Reiniciar Zoom"
                className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Actions: Open in New Tab & Close */}
            <div className="flex items-center gap-2">
              <a
                href={zoomedImage}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                title="Abrir imagen original en nueva pestaña"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Pestaña Nueva</span>
              </a>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Cerrar visor"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Lightbox Canvas Area */}
          <div
            className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onClick={(e) => {
              if (e.target === e.currentTarget) setZoomedImage(null);
            }}
          >
            <div
              className="transition-transform duration-200 ease-out origin-center flex items-center justify-center min-w-full min-h-full"
              style={{ transform: `scale(${zoomScale})` }}
            >
              <img
                src={zoomedImage}
                alt="Imagen cargada ampliada"
                className="max-w-none max-h-[82vh] sm:max-h-[88vh] object-contain rounded-xl shadow-2xl pointer-events-auto border border-slate-800"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
