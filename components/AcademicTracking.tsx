
import React, { useState, useRef, useEffect } from 'react';
import { Teacher, Subject, AcademicCycle } from '../types';
import { generateDetailedExam } from '../geminiService';
import { BookOpen, FileText, CheckCircle2, Sparkles, Loader2, Printer, Eye, LayoutList, Mic, MicOff, GraduationCap } from 'lucide-react';
import { INSTITUTION_INFO } from '../constants';

interface AcademicTrackingProps {
  teachers: Teacher[];
  subjects: Subject[];
  cycle: AcademicCycle;
}

const AcademicTracking: React.FC<AcademicTrackingProps> = ({ teachers, subjects, cycle }) => {
  const [selectedSub, setSelectedSub] = useState('');
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<{ applied: string, solved: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [activeTab, setActiveTab] = useState<'applied' | 'solved'>('applied');
  
  const recognitionRef = useRef<any>(null);

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
  }, []);

  const toggleMic = () => {
    if (isListening) recognitionRef.current.stop();
    else { setIsListening(true); recognitionRef.current.start(); }
  };

  const handleGenerate = async () => {
    setLoading(true);
    const topics = cycle.academicLogs.filter(l => l.subjectId === selectedSub && l.isDelivered).map(l => l.topic);
    const res = await generateDetailedExam(instruction, subjects.find(s => s.id === selectedSub)?.name || '', topics);
    setExamData(res);
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm space-y-8 no-print">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl">
                 <LayoutList size={32} />
              </div>
              <div>
                 <h2 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Generador de Exámenes IA</h2>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">EMSaD 16 • Evaluación Predictiva</p>
              </div>
           </div>
           <button onClick={toggleMic} className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-indigo-600 hover:text-white'}`}>
             {isListening ? <MicOff size={24} /> : <Mic size={24} />}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><BookOpen size={10} /> Materia</label>
              <select value={selectedSub} onChange={e => setSelectedSub(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500 appearance-none">
                 <option value="">Seleccionar...</option>
                 {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
           </div>
           <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Sparkles size={10} /> Instrucción Específica (Voz/Texto)</label>
              <input 
                type="text" 
                value={instruction} 
                onChange={e => setInstruction(e.target.value)} 
                placeholder="Ej: 'Examen de 10 preguntas, nivel difícil, incluir problemas prácticos'..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-indigo-500"
              />
           </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || !selectedSub} className={`w-full py-6 rounded-[2rem] font-black uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${loading ? 'bg-slate-100 text-slate-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
           {loading ? <Loader2 className="animate-spin" size={24} /> : <Sparkles size={24} />}
           Generar Examen Alumno + Clave Docente
        </button>
      </div>

      {examData && (
        <div className="space-y-6">
           <div className="flex bg-white/80 backdrop-blur-md p-1.5 rounded-[2rem] border border-slate-200 no-print max-w-fit mx-auto">
              <button onClick={() => setActiveTab('applied')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase flex items-center gap-2 transition-all ${activeTab === 'applied' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <FileText size={16}/> Examen Alumno
              </button>
              <button onClick={() => setActiveTab('solved')} className={`px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase flex items-center gap-2 transition-all ${activeTab === 'solved' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                 <GraduationCap size={16}/> Clave Resuelta
              </button>
           </div>

           <div className="bg-white p-16 rounded-[4rem] border border-slate-200 shadow-2xl relative overflow-hidden print:shadow-none print:p-0 print:border-none">
              <div className="flex justify-between items-center mb-10 no-print">
                 <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${activeTab === 'applied' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
                       {activeTab === 'applied' ? <FileText size={24}/> : <GraduationCap size={24}/>}
                    </div>
                    <div>
                       <h3 className="text-sm font-black uppercase italic">{activeTab === 'applied' ? 'Instrumento de Evaluación' : 'Guía de Respuestas'}</h3>
                       <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Nayarit • Ciclo {cycle.year}</p>
                    </div>
                 </div>
                 <button onClick={() => window.print()} className="bg-slate-100 text-slate-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all"><Printer size={16}/> Imprimir PDF</button>
              </div>

              <div className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700 print:text-black">
                 {activeTab === 'applied' ? examData.applied : examData.solved}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AcademicTracking;
