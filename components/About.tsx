
import React from 'react';
import { INSTITUTION_INFO } from '../constants';
import { 
  ShieldCheck, Terminal, FileText, Info, Zap, ChevronRight, 
  BrainCircuit, ClipboardList, Users, BookOpen, Clock, 
  Share2, ShieldAlert 
} from 'lucide-react';

const About: React.FC = () => {
  const features = [
    {
      title: "Planeación Didáctica IA",
      desc: "Generación de secuencias basadas en el modelo MCCEMS Nayarit. Incluye exportación oficial y modo proyector interactivo.",
      icon: FileText,
      color: "text-emerald-500"
    },
    {
      title: "Horarios Inteligentes",
      desc: "Algoritmo de optimización que minimiza horas muertas y balancea la carga docente automáticamente.",
      icon: Clock,
      color: "text-blue-500"
    },
    {
      title: "Control de Aula Smart",
      desc: "Asistencia mediante fotografía (OCR) y semáforo de acreditación académica en tiempo real.",
      icon: ClipboardList,
      color: "text-indigo-500"
    },
    {
      title: "Control Interno",
      desc: "Módulo especializado para seguimiento de temas sindicales (SITACECYTEN) e infraestructura.",
      icon: ShieldAlert,
      color: "text-rose-500"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-12 px-4">
      {/* Header ARCONTROL */}
      <div className="text-center space-y-6">
        <div className="w-24 h-24 bg-blue-600 rounded-[2.2rem] mx-auto flex items-center justify-center text-white shadow-[0_0_50px_rgba(37,99,235,0.3)] rotate-3 border-4 border-white/10 animate-bounce">
          <ShieldCheck size={48} />
        </div>
        <div>
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase drop-shadow-sm">{INSTITUTION_INFO.systemName}</h2>
          <p className="text-blue-600 dark:text-blue-400 font-mono tracking-[0.4em] text-[10px] uppercase mt-2 font-bold italic">Inteligencia Artificial Docente V5.0</p>
        </div>
      </div>

      {/* Grid de Funciones Detalladas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[3rem] shadow-sm hover:shadow-xl transition-all group">
             <div className="flex items-start gap-6">
                <div className={`w-14 h-14 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
                   <f.icon size={28} />
                </div>
                <div className="space-y-2">
                   <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase italic">{f.title}</h4>
                   <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase leading-relaxed tracking-tight">
                      {f.desc}
                   </p>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Manual de Operatividad Logica */}
      <div className="bg-slate-900 p-12 rounded-[4rem] border border-blue-900/30 shadow-2xl space-y-10">
        <div className="flex items-center gap-4 border-b border-blue-900/20 pb-6">
          <BrainCircuit className="text-blue-500" size={32} />
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Lógica del Sistema IA</h3>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-4">
             <div className="text-blue-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={14}/> Formulación
             </div>
             <p className="text-[11px] text-slate-400 font-medium uppercase leading-relaxed">
                Cada respuesta está anclada al contexto del plantel 16 El Macho. La IA no solo responde, sino que propone soluciones basadas en la normatividad CECyTEN.
             </p>
          </div>
          <div className="space-y-4">
             <div className="text-emerald-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={14}/> Operatividad
             </div>
             <p className="text-[11px] text-slate-400 font-medium uppercase leading-relaxed">
                El sistema funciona en modo local con sincronización asíncrona. Esto garantiza que el docente pueda usar la app en zonas con conectividad limitada en Tecuala.
             </p>
          </div>
          <div className="space-y-4">
             <div className="text-amber-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <ChevronRight size={14}/> Resultados
             </div>
             <p className="text-[11px] text-slate-400 font-medium uppercase leading-relaxed">
                Automatización de documentos oficiales, reducción de carga administrativa y monitoreo proactivo de deserción escolar mediante alertas de asistencia.
             </p>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-blue-900/20 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500">
                 <Terminal size={24} />
              </div>
              <div className="text-left">
                 <p className="text-[10px] font-mono text-blue-500 font-bold uppercase">Desarrollado por:</p>
                 <p className="text-lg font-black text-white tracking-tighter italic uppercase leading-none">{INSTITUTION_INFO.author}</p>
              </div>
           </div>
           <a 
              href={`https://${INSTITUTION_INFO.website}`} 
              target="_blank" 
              className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/20"
           >
              Visitar Portal Oficial
           </a>
        </div>
      </div>

      <div className="text-center opacity-30 pb-10">
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.8em]">
          ARCONTROL - Nayarit • 2025 • Todos los derechos reservados
        </p>
      </div>
    </div>
  );
};

export default About;
