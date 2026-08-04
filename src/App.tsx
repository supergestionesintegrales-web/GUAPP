import React, { useState, useEffect } from 'react';
import { Home, Newspaper, LogOut, Sparkles } from 'lucide-react';
import { UserRole, Modulo, Noticia, OpenTab, Submodulo } from './types';
import { PortalLogin } from './components/PortalLogin';
import { HeaderNav } from './components/HeaderNav';
import { DashboardModules } from './components/DashboardModules';
import { NewsSection } from './components/NewsSection';
import { FloatingTabsPanel } from './components/FloatingTabsPanel';
import { ProgramTabViewer } from './components/ProgramTabViewer';
import { StructureConfigModal } from './components/StructureConfigModal';

export default function App() {
  const [role, setRole] = useState<UserRole>(null);
  const [adminPin, setAdminPin] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('guapp_theme') as 'dark' | 'light') || 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('guapp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [activeNavTab, setActiveNavTab] = useState<'inicio' | 'tramites'>('inicio');

  // App Data
  const [modules, setModules] = useState<Modulo[]>([]);
  const [news, setNews] = useState<Noticia[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Tab Manager for Submodules / Links
  const [openTabs, setOpenTabs] = useState<Record<string, OpenTab>>({});
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedSubmoduleForViewer, setSelectedSubmoduleForViewer] = useState<Submodulo | null>(null);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Toast Notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3000);
  };

  // Initial Data Fetch
  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const [modRes, newsRes] = await Promise.all([
        fetch('/api/gas/getDashboardModules'),
        fetch('/api/gas/getNews')
      ]);

      if (modRes.ok) {
        const modData = await modRes.json();
        setModules(modData);
      }
      if (newsRes.ok) {
        const nData = await newsRes.json();
        setNews(nData);
      }
    } catch (e) {
      console.warn('Error fetching server data:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Login handler
  const handleLogin = async (selectedRole: UserRole, pin?: string) => {
    setLoginError(null);

    if (selectedRole === 'ADMIN') {
      setIsLoginLoading(true);
      try {
        const res = await fetch('/api/gas/validateAdminPIN', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin })
        });
        const data = await res.json();

        if (data.isValid && data.role === 'ADMIN') {
          setRole('ADMIN');
          setAdminPin(pin?.trim() || null);
          showToast('🔑 Modo Administrador activado');
        } else if (data.isValid && data.role === 'PUBLISHER') {
          setRole('PUBLISHER');
          setAdminPin(pin?.trim() || null);
          showToast('📢 Acceso de publicación activado');
        } else {
          setLoginError('PIN incorrecto o no autorizado.');
        }
      } catch (e) {
        setLoginError('Error validando el PIN.');
      } finally {
        setIsLoginLoading(false);
      }
    } else {
      setRole('PUBLIC');
      showToast('👋 ¡Bienvenido a GUAPP!');
    }
  };

  const handleLogout = () => {
    setRole(null);
    setAdminPin(null);
    setOpenTabs({});
    setActiveTabId(null);
    setSelectedSubmoduleForViewer(null);
    showToast('Sesión cerrada');
  };

  // Open Submodule or link
  const handleOpenSubmodule = (sub: Submodulo) => {
    if (sub.sublinks && sub.sublinks.length > 0) {
      setSelectedSubmoduleForViewer(sub);
      setActiveTabId(null);
    } else if (sub.url) {
      handleOpenSublink(sub.nombre, sub.url);
    } else {
      showToast('⚠️ Este módulo no tiene una URL configurada');
    }
  };

  const handleOpenSublink = (nombre: string, url: string) => {
    const tabId = `tab_${Date.now()}`;
    const newTab: OpenTab = { id: tabId, nombre, url };

    setOpenTabs((prev) => ({ ...prev, [tabId]: newTab }));
    setActiveTabId(tabId);
    setSelectedSubmoduleForViewer(null);
  };

  const handleSwitchTab = (tabId: string) => {
    setActiveTabId(tabId);
  };

  const handleCloseTab = (tabId: string) => {
    setOpenTabs((prev) => {
      const next = { ...prev };
      delete next[tabId];
      return next;
    });

    if (activeTabId === tabId) {
      const remaining = Object.keys(openTabs).filter((id) => id !== tabId);
      if (remaining.length > 0) {
        setActiveTabId(remaining[remaining.length - 1]);
      } else {
        setActiveTabId(null);
      }
    }
  };

  const handleCloseAllTabs = () => {
    setOpenTabs({});
    setActiveTabId(null);
    setSelectedSubmoduleForViewer(null);
    showToast('Todas las pestañas cerradas');
  };

  // Save Modules
  const handleSaveModules = async (newModules: Modulo[]) => {
    if (role !== 'ADMIN' || !adminPin) {
      showToast('⚠️ Solo administradores pueden modificar la estructura');
      return;
    }
    try {
      const res = await fetch('/api/gas/saveDashboardModules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modules: newModules, pin: adminPin })
      });
      if (res.ok) {
        setModules(newModules);
        showToast('✅ Estructura de módulos guardada correctamente');
      }
    } catch (e) {
      showToast('Error guardando módulos');
    }
  };

  // Add Subsubmodule / Sublink directly to a Submodule
  const handleAddSublinkToSubmodule = async (submoduloId: string, nombre: string, url: string, desc?: string) => {
    const updatedModules = modules.map((m) => ({
      ...m,
      submodulos: (m.submodulos || []).map((sub) => {
        if (sub.id === submoduloId) {
          const newSublink = {
            id: `sublink_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            nombre,
            desc,
            url
          };
          const updatedSub = {
            ...sub,
            sublinks: [...(sub.sublinks || []), newSublink]
          };
          // Also update active viewer submodule reference
          if (selectedSubmoduleForViewer?.id === submoduloId) {
            setSelectedSubmoduleForViewer(updatedSub);
          }
          return updatedSub;
        }
        return sub;
      })
    }));

    await handleSaveModules(updatedModules);
    showToast('✨ Trámite / Sub-submódulo agregado correctamente');
  };

  // Save News
  const canPublishNews = role === 'ADMIN' || role === 'PUBLISHER';

  const handleSaveNews = async (newsData: Partial<Noticia>, fileBase64?: string) => {
    if (!canPublishNews || !adminPin) {
      showToast('⚠️ No tienes permiso para publicar noticias o comunicados');
      return;
    }
    try {
      let finalImageUrl = newsData.imagenURL ?? '';

      if (fileBase64) {
        const uploadRes = await fetch('/api/gas/uploadNewsImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64: fileBase64,
            newsId: newsData.id || `news_${Date.now()}`,
            pin: adminPin
          })
        });
        if (uploadRes.ok) {
          const upData = await uploadRes.json();
          finalImageUrl = upData.fileUrl;
        }
      }

      const updatedNewsList = [...news];
      const existingIdx = updatedNewsList.findIndex((n) => n.id === newsData.id);

      if (existingIdx >= 0) {
        updatedNewsList[existingIdx] = {
          ...updatedNewsList[existingIdx],
          ...newsData,
          imagenURL: finalImageUrl
        } as Noticia;
      } else {
        const newNoticia: Noticia = {
          id: newsData.id || `news_${Date.now()}`,
          tipo: newsData.tipo || 'noticia',
          titulo: newsData.titulo || '',
          descripcion: newsData.descripcion || '',
          fecha: newsData.fecha || new Date().toISOString().split('T')[0],
          imagenURL: finalImageUrl,
          creadoPor: role === 'ADMIN' ? 'Administración' : 'Publicaciones',
          fechaCreacion: new Date().toISOString()
        };
        updatedNewsList.unshift(newNoticia);
      }

      const saveRes = await fetch('/api/gas/saveNews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticias: updatedNewsList, usuarioActual: role, pin: adminPin })
      });

      if (saveRes.ok) {
        setNews(updatedNewsList);
        showToast('✅ Noticia publicada con éxito');
      }
    } catch (e) {
      showToast('Error publicando noticia');
    }
  };

  // Delete News
  const handleDeleteNews = async (id: string) => {
    if (!canPublishNews || !adminPin) {
      showToast('⚠️ No tienes permiso para eliminar publicaciones');
      return;
    }
    const nextNews = news.filter((n) => n.id !== id);
    try {
      const res = await fetch('/api/gas/saveNews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noticias: nextNews, usuarioActual: role, pin: adminPin })
      });
      if (res.ok) {
        setNews(nextNews);
        showToast('🗑️ Noticia eliminada');
      }
    } catch (e) {
      showToast('Error eliminando noticia');
    }
  };

  // Active Tab for Program Viewer
  const activeOpenTab = activeTabId ? openTabs[activeTabId] || null : null;

  if (!role) {
    return (
      <PortalLogin
        onLogin={handleLogin}
        isLoading={isLoginLoading}
        errorMsg={loginError}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-[#0A0A0A] text-slate-800 dark:text-gray-200 flex flex-col font-sans transition-colors duration-200 pb-16 safe-bottom">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-[#121212] text-slate-900 dark:text-gray-100 font-bold text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-200 dark:border-[#1F1F1F] animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <HeaderNav
        role={role}
        unreadNewsCount={news.length}
        isSyncing={isSyncing}
        theme={theme}
        onToggleTheme={toggleTheme}
        onSync={fetchData}
        onOpenNews={() => setActiveNavTab('tramites')}
        onOpenConfig={() => setIsConfigOpen(true)}
        onLogout={handleLogout}
      />

      {/* App Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pt-[4.25rem] sm:pt-20 px-[max(0.75rem,env(safe-area-inset-left))] sm:px-6">
        {activeNavTab === 'inicio' ? (
          <DashboardModules
            modules={modules}
            role={role}
            onOpenSubmodule={handleOpenSubmodule}
            onOpenConfig={() => setIsConfigOpen(true)}
          />
        ) : (
          <NewsSection
            news={news}
            role={role}
            onSaveNews={handleSaveNews}
            onDeleteNews={handleDeleteNews}
          />
        )}
      </main>

      {/* Floating Active Tabs Button & Panel */}
      <FloatingTabsPanel
        openTabs={openTabs}
        activeTabId={activeTabId}
        onSwitchTab={handleSwitchTab}
        onCloseTab={handleCloseTab}
        onCloseAllTabs={handleCloseAllTabs}
      />

      {/* Multi-Tab Program / Sublink Viewer */}
      <ProgramTabViewer
        activeTab={activeOpenTab}
        selectedSubmodule={selectedSubmoduleForViewer}
        role={role}
        onClose={() => {
          setActiveTabId(null);
          setSelectedSubmoduleForViewer(null);
        }}
        onOpenSublink={handleOpenSublink}
        onAddSublinkToSubmodule={handleAddSublinkToSubmodule}
      />

      {/* Admin Structure Modal */}
      {isConfigOpen && (
        <StructureConfigModal
          modules={modules}
          onClose={() => setIsConfigOpen(false)}
          onSaveModules={handleSaveModules}
        />
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1F1F1F] px-2 sm:px-4 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-xl dark:shadow-2xl transition-all safe-bottom">
        <button
          type="button"
          onClick={() => {
            setActiveNavTab('inicio');
            setActiveTabId(null);
            setSelectedSubmoduleForViewer(null);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeNavTab === 'inicio'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveNavTab('tramites');
            setActiveTabId(null);
            setSelectedSubmoduleForViewer(null);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
            activeNavTab === 'tramites'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 font-medium'
          }`}
        >
          <Newspaper className="w-5 h-5" />
          <span className="text-[10px]">Noticias</span>
          {news.length > 0 && (
            <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>

        <button
          type="button"
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 py-1 px-4 rounded-xl text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px]">Salir</span>
        </button>
      </nav>
    </div>
  );
}
