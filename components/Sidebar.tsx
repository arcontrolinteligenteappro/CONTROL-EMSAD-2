
import React from 'react';
import { AppView, AcademicCycle } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Info,
  History,
  GraduationCap,
  BrainCircuit,
  ShieldCheck,
  Zap,
  BookMarked,
  StickyNote,
  ClipboardCheck,
  Library,
  Globe,
  X
} from 'lucide-react';

interface SidebarProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  cycle: AcademicCycle;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, cycle, isOpen, onClose }) => {
  const menuItems = [
    { id: AppView.Dashboard, label: 'Resumen Académico', icon: LayoutDashboard },
    { id: AppView.EcosistemaIA, label: 'Aula Inteligente IA', icon: BrainCircuit },
    { id: AppView.Browser, label: 'Navegador Web', icon: Globe },
    { id: AppView.Library, label: 'Biblioteca Digital', icon: Library },
    { id: AppView.Classroom, label: 'Control de Aula', icon: ClipboardCheck },
    { id: AppView.Notas, label: 'Bóveda de Archivos', icon: StickyNote },
    { id: AppView.Personal, label: 'Gestión Personal', icon: Users },
    { id: AppView.Materias, label: 'Plan de Estudios', icon: BookMarked },
    { id: AppView.InternalControl, label: 'Control Interno', icon: ShieldCheck, hidden: !cycle.config.showInternalControl },
    { id: AppView.History, label: 'Archivo Histórico', icon: History },
    { id: AppView.Config, label: 'Configuración', icon: Settings },
    { id: AppView.About, label: 'Ayuda y Soporte', icon: Info },
  ].filter(item => !item.hidden);

  return (
    <>
      {/* Mobile/Tablet Backdrop Overlay with Blur */}
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[45] lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 w-[280px] bg-[#0f172a] dark:bg-[#020617] text-slate-400 flex flex-col border-r border-slate-800/50 dark:border-slate-800 shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        `}
      >
        {/* Header Section */}
        <div className="p-8 flex flex-col items-center gap-6 border-b border-slate-800/40 relative shrink-0">
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-2.5 text-slate-500 hover:text-white lg:hidden bg-white/5 rounded-2xl active:scale-90 transition-all"
          >
            <X size={20} />
          </button>

          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-indigo-600 rounded-[1.3rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0 mt-4 lg:mt-0 ring-4 ring-blue-500/10">
            <GraduationCap size={38} />
          </div>
          <div className="text-center space-y-1.5">
            <h1 className="font-black text-sm tracking-[0.25em] text-white uppercase italic leading-none">ARCONTROL</h1>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest opacity-80">Macho 16 • Nayarit</p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto scrollbar-hide overscroll-contain">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveView(item.id); onClose(); }}
                className={`
                  w-full flex items-center gap-4 px-6 py-4.5 rounded-[1.8rem] transition-all duration-300 group relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-900/50 scale-[1.03]' 
                    : 'hover:bg-slate-800/40 hover:text-white hover:pl-8'}
                `}
              >
                {isActive && (
                  <div className="absolute left-2.5 w-1.5 h-7 bg-white/40 rounded-full" />
                )}
                <item.icon 
                  size={22} 
                  className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-400'}`} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[11px] font-black uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Footer Section */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/30 shrink-0">
          <div className="bg-slate-800/40 dark:bg-slate-900/60 rounded-3xl p-5 flex items-center gap-4 border border-slate-700/30">
             <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 animate-pulse ring-4 ring-blue-500/5">
                <Zap size={22} />
             </div>
             <div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest opacity-60">IA Nucleus</div>
                <div className="text-[10px] font-black text-white uppercase tracking-widest leading-none mt-1">Live Stable 5.0</div>
             </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
