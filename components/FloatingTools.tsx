import React, { useState } from 'react';
import { 
  X, Calculator, StickyNote, Ruler, ArrowLeftRight, 
  Languages, Search, Camera, FileUp, Zap, Wand2, Maximize
} from 'lucide-react';

const FloatingTools: React.FC<{onQuickSearch: (q: string) => void}> = ({ onQuickSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { id: 'calc', icon: Calculator, label: 'Calculadora' },
    { id: 'conv', icon: Ruler, label: 'Conversor' },
    { id: 'ocr', icon: Camera, label: 'Escáner PDF' },
    { id: 'dict', icon: Languages, label: 'Diccionario' },
    { id: 'notes', icon: StickyNote, label: 'Notas IA' }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[300] no-print">
      {/* Tool Window */}
      {activeTool && (
        <div className="absolute bottom-20 right-0 w-80 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-blue-900/50 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b dark:border-blue-900/20 flex justify-between items-center">
            <span className="text-[10px] font-black uppercase dark:text-blue-400 tracking-widest">{activeTool} Tool</span>
            <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-rose-100 rounded-lg text-rose-500"><X size={16}/></button>
          </div>
          <div className="p-6">
            {activeTool === 'ocr' && (
              <div className="space-y-4 text-center">
                <div className="w-full aspect-video bg-slate-100 dark:bg-black rounded-2xl flex flex-col items-center justify-center border-2 border-dashed dark:border-blue-500/30">
                  <Camera className="text-slate-400 dark:text-blue-500/50 mb-2" size={32}/>
                  <p className="text-[8px] font-black dark:text-blue-400 uppercase">Visor de Escaneo Activo</p>
                </div>
                <button className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase">Capturar y Procesar OCR</button>
              </div>
            )}
            {activeTool === 'calc' && (
              <div className="grid grid-cols-4 gap-2">
                {[7,8,9,'/',4,5,6,'*',1,2,3,'-','C',0,'=','+'].map(b => (
                  <button key={b.toString()} className="py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs hover:bg-blue-500 hover:text-white transition-all">{b}</button>
                ))}
              </div>
            )}
            {!['ocr', 'calc'].includes(activeTool) && (
              <div className="py-10 text-center opacity-40">
                <Wand2 className="mx-auto mb-2 animate-spin" size={24}/>
                <p className="text-[10px] font-black uppercase">Módulo en Desarrollo</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toolbox Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 flex flex-col gap-3 animate-in slide-in-from-bottom-4">
          {tools.map(tool => (
            <button 
              key={tool.id} 
              onClick={() => { setActiveTool(tool.id); setIsOpen(false); }}
              className="flex items-center gap-4 bg-white dark:bg-slate-900 p-3 pr-6 rounded-2xl shadow-xl border border-slate-200 dark:border-blue-500/20 hover:scale-110 transition-transform group"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <tool.icon size={20} />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">{tool.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* AR WATERMARK BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-red-900 dark:bg-blue-600 text-white rounded-[1.8rem] shadow-2xl flex flex-col items-center justify-center border-4 border-white/20 hover:rotate-12 transition-all relative group"
      >
        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-[1.8rem]"></div>
        <span className="text-2xl font-black italic tracking-tighter z-10">AR</span>
        <span className="text-[6px] font-black uppercase tracking-tighter opacity-70 z-10">Control</span>
      </button>
    </div>
  );
};

export default FloatingTools;