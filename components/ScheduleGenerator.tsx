
import React, { useState, useEffect, useRef } from 'react';
import { Teacher, Subject, Group, ScheduleData, OptimizationWeights } from '../types';
import { generateScheduleFromPrompt, generateOptimizedSchedule } from '../geminiService';
import { TIME_BLOCKS, DAYS, INSTITUTION_INFO } from '../constants';
import { Loader2, Printer, CalendarRange, Sparkles, CheckCircle2, Share2, Palette, List, Mic, MicOff, ChevronDown, SlidersHorizontal, Info, Wand2, Terminal, User } from 'lucide-react';

interface ScheduleGeneratorProps {
  teachers: Teacher[];
  subjects: Subject[];
  groups: Group[];
  schedules: ScheduleData[];
  setSchedules: (schedules: ScheduleData[]) => void;
  weights: OptimizationWeights;
}

const ScheduleGenerator: React.FC<ScheduleGeneratorProps> = ({ teachers, subjects, groups, schedules, setSchedules, weights }) => {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'group' | 'teacher'>('group');
  const [selectedId, setSelectedId] = useState<string>('');
  const [instruction, setInstruction] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [generationType, setGenerationType] = useState<'FREE' | 'AUTO'>('AUTO');
  
  const recognitionRef = useRef<any>(null);
  const onlyTeachers = teachers.filter(t => t.role === 'DOCENTE');

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-MX';
      recognitionRef.current.onresult = (event: any) => {
        setInstruction(event.results[0][0].transcript);
        setIsListening(false);
      };
    }
    if (viewMode === 'group' && groups.length > 0) {
      if (!selectedId || !groups.find(g => g.id === selectedId)) setSelectedId(groups[0].id);
    } else if (viewMode === 'teacher' && onlyTeachers.length > 0) {
      if (!selectedId || !onlyTeachers.find(t => t.id === selectedId)) setSelectedId(onlyTeachers[0].id);
    }
  }, [viewMode, groups, onlyTeachers]);

  const toggleMic = () => {
    if (isListening) recognitionRef.current.stop();
    else { setIsListening(true); recognitionRef.current.start(); }
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (generationType === 'FREE') {
         if (!instruction.trim()) { alert("Escriba o dicte las instrucciones."); setLoading(false); return; }
         const data = { teachers: onlyTeachers, subjects, groups };
         const result = await generateScheduleFromPrompt(instruction, data);
         setSchedules(result);
      } else {
         if (onlyTeachers.length === 0 || subjects.length === 0 || groups.length === 0) {
            alert("Faltan datos críticos en la base de datos.");
            setLoading(false);
            return;
         }
         const result = await generateOptimizedSchedule(onlyTeachers, subjects, groups, weights);
         setSchedules(result);
      }
    } catch (err) { 
      console.error(err);
      alert("Error en el núcleo de optimización IA."); 
    }
    finally { setLoading(false); }
  };

  // Helper to get title for print
  const getPrintTitle = () => {
    if (viewMode === 'group') {
      const g = groups.find(x => x.id === selectedId);
      return `HORARIO DE CLASES - GRUPO ${g?.name} (${g?.semester}º SEMESTRE)`;
    } else {
      const t = onlyTeachers.find(x => x.id === selectedId);
      return `HORARIO DOCENTE - ${t?.name.toUpperCase()}`;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* PANEL DE CONTROL */}
      <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm no-print space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
                {generationType === 'FREE' ? <Terminal size={24} /> : <Wand2 size={24} />}
             </div>
             <div>
                <h3 className="text-lg font-black text-slate-900 uppercase italic leading-none">Generador de Horarios</h3>
                <div className="flex gap-2 mt-2">
                   <button onClick={() => setGenerationType('AUTO')} className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all ${generationType === 'AUTO' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-100'}`}>Automático (Datos)</button>
                   <button onClick={() => setGenerationType('FREE')} className={`text-[8px] font-black uppercase px-2 py-1 rounded-lg transition-all ${generationType === 'FREE' ? 'bg-blue-100 text-blue-700' : 'text-slate-400 hover:bg-slate-100'}`}>Redacción Libre</button>
                </div>
             </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full lg:w-auto items-center">
             {generationType === 'FREE' && (
               <div className="relative flex-1 md:w-96 group">
                  <input 
                    type="text" 
                    value={instruction} 
                    onChange={e => setInstruction(e.target.value)} 
                    placeholder="Ej: 'El Maestro Juan da Matemáticas 1 al Grupo A los Lunes a primera hora...'"
                    className="w-full pl-6 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 shadow-inner"
                  />
                  <button onClick={toggleMic} className={`absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-600'}`}>
                     {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
               </div>
             )}

             <button 
                onClick={handleGenerate}
                disabled={loading}
                className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-lg"
             >
                {loading ? <Loader2 className="animate-spin" size={14}/> : <Sparkles size={14}/>}
                {generationType === 'FREE' ? 'Procesar Texto' : 'Generar Optimizado'}
             </button>
          </div>
        </div>
      </div>

      {schedules.length > 0 && (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-6 print:border-none print:shadow-none print:rounded-none">
          
          {/* HEADER SOLO VISIBLE EN IMPRESIÓN */}
          <div className="hidden print:block p-8 border-b-2 border-black mb-4">
             <div className="flex justify-between items-center mb-6">
                {/* Placeholder para Logos - En prod usaríamos <img> */}
                <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO SEP</div>
                <div className="text-center">
                   <h1 className="text-xl font-black uppercase tracking-tight">Colegio de Estudios Científicos y Tecnológicos</h1>
                   <h2 className="text-sm font-bold uppercase tracking-widest mt-1">del Estado de Nayarit</h2>
                   <p className="text-[10px] font-medium uppercase mt-1">Plantel EMSaD 16 El Macho</p>
                </div>
                <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO CECyTEN</div>
             </div>
             <div className="text-center border-t border-black pt-2">
                <h3 className="text-lg font-black uppercase">{getPrintTitle()}</h3>
             </div>
          </div>

          <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-4">
              <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                <button onClick={() => setViewMode('group')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'group' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Grupos</button>
                <button onClick={() => setViewMode('teacher')} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${viewMode === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>Docentes</button>
              </div>
              
              <select 
                value={selectedId} 
                onChange={(e) => setSelectedId(e.target.value)}
                className="bg-white border border-slate-200 px-5 py-2 rounded-xl text-[9px] font-black uppercase outline-none focus:ring-2 focus:ring-blue-500/10 shadow-sm min-w-[180px]"
              >
                {(viewMode === 'group' ? groups : onlyTeachers).map(i => (
                  <option key={i.id} value={i.id}>{viewMode === 'group' ? `GRUPO ${i.name}` : (i as Teacher).name}</option>
                ))}
              </select>
            </div>
            
            <button onClick={() => window.print()} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-black text-[9px] uppercase flex items-center gap-2 shadow-lg hover:bg-black transition-all">
              <Printer size={14}/> Imprimir Horario
            </button>
          </div>

          <div className="p-8 overflow-x-auto print:p-0 print:overflow-visible">
             <table className="w-full text-left border-collapse min-w-[900px] print:min-w-0 print:w-full print:border-2 print:border-black">
                <thead>
                  <tr className="bg-slate-50 print:bg-white">
                    <th className="p-4 print:p-2 text-[9px] font-black text-slate-400 print:text-black uppercase border border-slate-100 print:border-black w-24 text-center">Hora</th>
                    {DAYS.map(day => <th key={day} className="p-4 print:p-2 text-[9px] font-black text-slate-400 print:text-black uppercase border border-slate-100 print:border-black text-center tracking-widest">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {TIME_BLOCKS.map((block, idx) => (
                    <tr key={idx} className={block.isBreak ? 'bg-slate-50/30 print:bg-slate-100' : ''}>
                      <td className="p-4 print:p-2 border border-slate-100 print:border-black text-center">
                         <div className="text-[10px] font-black text-slate-900 print:text-black">{block.start} - {block.end}</div>
                         {block.isBreak && <span className="text-[6px] font-black text-blue-500 print:text-black uppercase block mt-1 tracking-tighter">{block.label}</span>}
                      </td>
                      {DAYS.map(day => {
                         if (block.isBreak) return <td key={day} className="border border-slate-100 print:border-black bg-slate-50/50 print:bg-slate-100"></td>;
                         
                         let slot: any = null;
                         if (viewMode === 'group') {
                           slot = schedules.find(s => s.groupId === selectedId)?.slots.find(s => s.day === day && s.startTime === block.start);
                         } else {
                           schedules.forEach(gs => {
                             const found = gs.slots.find(s => s.day === day && s.startTime === block.start && s.teacherId === selectedId);
                             if (found) {
                               const g = groups.find(x => x.id === gs.groupId);
                               slot = { ...found, groupName: g?.name, groupColor: g?.color };
                             }
                           });
                         }

                         const sub = subjects.find(s => s.id === slot?.subjectId);
                         const teacher = onlyTeachers.find(t => t.id === slot?.teacherId);

                         return (
                           <td key={day} className="p-2 border border-slate-100 print:border-black h-32 print:h-20 w-48 align-top">
                              {slot ? (
                                <div className="h-full p-4 print:p-1 rounded-[1.5rem] print:rounded-none border print:border-none bg-white flex flex-col justify-between shadow-sm print:shadow-none transition-all relative overflow-hidden" style={{ borderColor: `${sub?.color}30`, borderLeft: `6px solid ${sub?.color}` }}>
                                   <div className="text-[9px] font-black text-slate-900 print:text-black uppercase italic leading-tight mb-2 line-clamp-2">{sub?.name}</div>
                                   <div className="pt-2 border-t border-slate-50 print:border-black flex items-center justify-between">
                                      {viewMode === 'group' ? (
                                        <span className="text-[9px] font-black text-blue-600 print:text-black uppercase italic truncate">{teacher?.alias || teacher?.name.split(' ')[0]}</span>
                                      ) : (
                                        <span className="text-[9px] font-black text-indigo-600 print:text-black italic">G: {slot.groupName}</span>
                                      )}
                                   </div>
                                </div>
                              ) : null}
                           </td>
                         );
                      })}
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>

          {/* FOOTER FIRMAS SOLO IMPRESIÓN */}
          <div className="hidden print:flex justify-around items-end mt-20 pb-10">
             <div className="text-center">
                <div className="w-48 border-t border-black mb-2"></div>
                <p className="text-[10px] font-bold uppercase">Elaboró</p>
                <p className="text-[8px] uppercase">Control Escolar</p>
             </div>
             <div className="text-center">
                <div className="w-48 border-t border-black mb-2"></div>
                <p className="text-[10px] font-bold uppercase">Revisó</p>
                <p className="text-[8px] uppercase">Coordinación Académica</p>
             </div>
             <div className="text-center">
                <div className="w-48 border-t border-black mb-2"></div>
                <p className="text-[10px] font-bold uppercase">Autorizó</p>
                <p className="text-[8px] uppercase">Dirección del Plantel</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleGenerator;
