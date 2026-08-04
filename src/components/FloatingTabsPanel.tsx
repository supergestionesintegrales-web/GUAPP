import React, { useState, useEffect, useRef } from 'react';
import { Layers, X, Minimize2, Trash2, GripHorizontal } from 'lucide-react';
import { OpenTab } from '../types';

interface FloatingTabsPanelProps {
  openTabs: Record<string, OpenTab>;
  activeTabId: string | null;
  onSwitchTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onCloseAllTabs: () => void;
}

export const FloatingTabsPanel: React.FC<FloatingTabsPanelProps> = ({
  openTabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onCloseAllTabs,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tabList: OpenTab[] = Object.values(openTabs);
  const count = tabList.length;

  // Position & Draggable state for the multiventana launcher badge
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    moved: false,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.moved = true;
      }
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !e.touches[0]) return;
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragStartRef.current.moved = true;
      }
      setPosition({
        x: dragStartRef.current.initialX + dx,
        y: dragStartRef.current.initialY + dy,
      });
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging]);

  const handleStartDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStartRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: position.x,
      initialY: position.y,
      moved: false,
    };
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    if (dragStartRef.current.moved) {
      e.stopPropagation();
      return;
    }
    setIsOpen(!isOpen);
  };

  if (count === 0) return null;

  return (
    <div
      className="fixed top-20 right-4 z-50 select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* Draggable Multiventana Floating Button */}
      <div
        onMouseDown={(e) => handleStartDrag(e.clientX, e.clientY)}
        onTouchStart={(e) => e.touches[0] && handleStartDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onClick={handleButtonClick}
        className={`group relative bg-emerald-600 hover:bg-emerald-500 text-white font-bold p-3 rounded-2xl shadow-2xl shadow-emerald-600/40 transition-shadow flex items-center gap-2 cursor-grab active:cursor-grabbing ${
          isDragging ? 'ring-2 ring-emerald-300 scale-105' : 'hover:scale-105'
        }`}
        title="Arrastra para mover el icono o haz clic para ver pestañas abiertas"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-emerald-200 opacity-60 group-hover:opacity-100" />
        <Layers className="w-5 h-5" />
        <span className="text-xs font-black">{count}</span>
        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-extrabold w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#0A0A0A] shadow-md">
          {count}
        </span>
      </div>

      {/* Floating Panel Drawer */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-80 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl border border-slate-200 dark:border-[#1F1F1F] rounded-3xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-200 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#1F1F1F]">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Pestañas Abiertas ({count})
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of open tabs */}
          <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
            {tabList.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => {
                    onSwitchTab(tab.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all border ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500/50 font-extrabold text-emerald-800 dark:text-emerald-300'
                      : 'bg-slate-50 dark:bg-[#1A1A1A] border-slate-200 dark:border-[#262626] text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#222222] font-medium'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{tab.nombre}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.id);
                    }}
                    className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-400 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Batch Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-[#1F1F1F]">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 bg-slate-100 dark:bg-[#1A1A1A] hover:bg-slate-200 dark:hover:bg-[#262626] text-slate-700 dark:text-gray-300 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-[#262626]"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              Minimizar
            </button>
            <button
              type="button"
              onClick={() => {
                onCloseAllTabs();
                setIsOpen(false);
              }}
              className="flex-1 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-rose-900/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Cerrar Todo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
