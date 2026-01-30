
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { FileSpreadsheet, Loader2, Sparkles, Printer, User, Book, Clock as ClockIcon, Target, CheckCircle2, ClipboardCheck, FileText, LayoutGrid, Save, History, Search, Upload, Image as ImageIcon, CheckSquare, Presentation, Projector, BookOpen, PenTool, Layers, Mic, ToggleLeft, ToggleRight, Cast, Monitor, Play, Pause, RotateCcw, MessageCircle, Users } from 'lucide-react';
import { Teacher, Subject, AcademicCycle, AcademicLog, Group, ClassMaterial } from '../types';
import { generateDidacticSequence, generateEvaluationInstrument, analyzeExternalSequence, generateClassMaterials } from '../geminiService';
import { INSTITUTION_INFO } from '../constants';

interface DidacticPlannerProps {
  teachers: Teacher[];
  subjects: Subject[];
  cycle: AcademicCycle;
  groups: Group[];
  onAddLog: (log: AcademicLog) => void;
}

const DidacticPlanner: React.FC<DidacticPlannerProps> = ({ teachers, subjects, cycle, groups, onAddLog }) => {
  const [plannerMode, setPlannerMode] = useState<'sequence' | 'evaluation' | 'class_gen' | 'logs'>('sequence');
  const [formData, setFormData] = useState({
    teacherId: '', subjectId: '', groupId: '', hours: 4, topic: '', objective: '', evalType: 'RUBRICA' as any
  });
  const [sequenceMode, setSequenceMode] = useState<'MCCEMS' | 'FREE'>('MCCEMS');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [classMaterial, setClassMaterial] = useState<ClassMaterial | null>(null);
  const [extractedActivities, setExtractedActivities] = useState<{ label: string, time: number, completed: boolean }[]>([]);
  const [showLogDialog, setShowLogDialog] = useState(false);
  
  // Presentation State
  const [slideIndex, setSlideIndex] = useState(0);
  const [isProjecting, setIsProjecting] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const projectorWindowRef = useRef<Window | null>(null);

  // Auto-fill logic for visual display
  const currentContext = useMemo(() => {
     const t = teachers.find(x => x.id === formData.teacherId);
     const s = subjects.find(x => x.id === formData.subjectId);
     const g = groups.find(x => x.id === formData.groupId);
     const date = new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
     return { teacherName: t?.name || 'Docente', subjectName: s?.name || 'Materia', groupName: g?.name || '', semester: g?.semester || 1, date };
  }, [formData, teachers, subjects, groups]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Sync Projector Window
  useEffect(() => {
    if (isProjecting && projectorWindowRef.current && classMaterial) {
      const slide = classMaterial.slides[slideIndex];
      const win = projectorWindowRef.current;
      
      if (win.closed) {
        setIsProjecting(false);
        return;
      }

      // Prepare Activity HTML if present
      const activityHTML = slide.activity ? `
        <div class="activity-box">
           <div class="activity-header">
              <span class="activity-icon">⚡</span>
              <span>DINÁMICA: ${slide.activity.type}</span>
           </div>
           <div class="activity-body">
              <p class="instruction">${slide.activity.instruction}</p>
              <h3 class="question">${slide.activity.question}</h3>
           </div>
        </div>
      ` : '';

      // Inject content into the projector window
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Proyector ARCONTROL - ${currentContext.subjectName}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { background-color: #0f172a; color: white; display: flex; flex-direction: column; height: 100vh; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .slide-content { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 4rem; position: relative; }
            h1 { font-size: 4.5rem; font-weight: 900; text-transform: uppercase; line-height: 1.1; margin-bottom: 2rem; color: #60a5fa; }
            li { font-size: 2.2rem; margin-bottom: 1.2rem; display: flex; align-items: flex-start; gap: 1rem; color: #e2e8f0; line-height: 1.3; }
            li::before { content: ''; width: 15px; height: 15px; background: #3b82f6; border-radius: 50%; margin-top: 15px; flex-shrink: 0; }
            .footer { padding: 2rem; display: flex; justify-content: space-between; opacity: 0.5; font-size: 1.2rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; border-top: 1px solid #334155; }
            
            /* Activity Styling */
            .activity-box {
               margin-top: 2rem;
               background: linear-gradient(135deg, #4338ca 0%, #3b82f6 100%);
               border-radius: 2rem;
               padding: 2rem;
               box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
               animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .activity-header { display: flex; align-items: center; gap: 1rem; font-weight: 900; text-transform: uppercase; color: #bfdbfe; margin-bottom: 1rem; font-size: 1.2rem; letter-spacing: 0.1em; }
            .instruction { font-size: 1.5rem; color: white; margin-bottom: 0.5rem; opacity: 0.9; }
            .question { font-size: 2.5rem; font-weight: 800; color: white; line-height: 1.1; }
            
            @keyframes slideUp {
               from { transform: translateY(50px); opacity: 0; }
               to { transform: translateY(0); opacity: 1; }
            }
          </style>
        </head>
        <body>
          <div class="slide-content">
            <h1 class="animate-in fade-in slide-in-from-bottom-4 duration-700">${slide.title}</h1>
            <ul>
              ${slide.content.map(c => `<li>${c}</li>`).join('')}
            </ul>
            ${activityHTML}
          </div>
          <div class="footer">
            <span>${currentContext.subjectName}</span>
            <span>Diapositiva ${slideIndex + 1} / ${classMaterial.slides.length}</span>
          </div>
        </body>
        </html>
      `;
      
      win.document.open();
      win.document.write(content);
      win.document.close();
    }
  }, [slideIndex, isProjecting, classMaterial]);

  const toggleProjector = () => {
    if (isProjecting) {
      projectorWindowRef.current?.close();
      setIsProjecting(false);
    } else {
      const newWin = window.open('', 'ARCONTROL_PROJECTOR', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
      if (newWin) {
        projectorWindowRef.current = newWin;
        setIsProjecting(true);
        // Trigger initial render
        setTimeout(() => setSlideIndex(i => i), 100);
        
        // Handle window close manually by user
        newWin.addEventListener('beforeunload', () => setIsProjecting(false));
      } else {
        alert("Permita las ventanas emergentes para usar el modo proyector.");
      }
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setClassMaterial(null);
    setExtractedActivities([]);
    try {
      if (plannerMode === 'sequence') {
        const res = await generateDidacticSequence({
          mode: sequenceMode,
          teacher: currentContext.teacherName,
          subject: currentContext.subjectName,
          cycle: cycle.year,
          hoursPerWeek: formData.hours,
          topic: formData.topic,
          objective: formData.objective
        });
        setResult(res);
        setExtractedActivities([
           { label: "Apertura: Encuadre y diagnóstico", time: 20, completed: false },
           { label: "Desarrollo: Explicación del tema", time: 40, completed: false },
           { label: "Cierre: Evaluación y retroalimentación", time: 30, completed: false }
        ]);
        setShowLogDialog(true);
      } else if (plannerMode === 'evaluation') {
        const res = await generateEvaluationInstrument({
          type: formData.evalType,
          subject: currentContext.subjectName,
          topic: formData.topic,
          level: 'EMSaD Nayarit'
        });
        setResult(res);
      } else if (plannerMode === 'class_gen') {
         const res = await generateClassMaterials({
            subject: currentContext.subjectName,
            topic: formData.topic,
            group: `Grupo ${currentContext.groupName} (${currentContext.semester}º)`,
            semester: currentContext.semester,
            teacher: currentContext.teacherName,
            duration: 50 
         });
         setClassMaterial(res);
      }
    } catch (err) { alert("Error ARCONTROL IA: Verifique su conexión"); }
    finally { setLoading(false); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
           try {
              const base64 = reader.result as string;
              const analysis = await analyzeExternalSequence(base64);
              setExtractedActivities(analysis.activities.map(a => ({ ...a, completed: false })));
              setResult("Secuencia externa analizada y cargada. Verifique las actividades extraídas a continuación.");
              setShowLogDialog(true);
           } catch (error) {
              alert("No se pudo analizar el documento.");
           } finally {
              setLoading(false);
           }
        };
        reader.readAsDataURL(file);
     }
  };

  const confirmLog = (isDelivered: boolean) => {
    const newLog: AcademicLog = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      teacherId: formData.teacherId,
      subjectId: formData.subjectId,
      groupId: formData.groupId || 'GENERAL',
      topic: formData.topic || 'Secuencia Externa',
      date: new Date().toISOString().split('T')[0],
      sequenceContent: result || JSON.stringify(classMaterial) || '',
      isDelivered: isDelivered,
      activities: extractedActivities.map((a, i) => ({ id: `act-${i}`, label: a.label, completed: a.completed }))
    };
    onAddLog(newLog);
    setShowLogDialog(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <FileSpreadsheet size={30} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Planeación Pedagógica</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">EMSaD 16 • Secuencias, Recursos y Clases</p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto scrollbar-hide">
            <button onClick={() => setPlannerMode('sequence')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${plannerMode === 'sequence' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <FileText size={14} /> Secuencia
            </button>
            <button onClick={() => setPlannerMode('class_gen')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${plannerMode === 'class_gen' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <Presentation size={14} /> Clase IA
            </button>
            <button onClick={() => setPlannerMode('evaluation')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${plannerMode === 'evaluation' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <ClipboardCheck size={14} /> Instrumentos
            </button>
            <button onClick={() => setPlannerMode('logs')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all whitespace-nowrap ${plannerMode === 'logs' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
              <History size={14} /> Bitácora
            </button>
          </div>
        </div>

        {plannerMode !== 'logs' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><User size={10} /> Docente</label>
                  <select value={formData.teacherId} onChange={(e) => setFormData({...formData, teacherId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold appearance-none outline-none focus:border-emerald-500">
                    <option value="">Seleccionar Docente</option>
                    {teachers.filter(t => t.role === 'DOCENTE').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Layers size={10} /> Grupo</label>
                  <select value={formData.groupId} onChange={(e) => setFormData({...formData, groupId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold appearance-none outline-none focus:border-emerald-500">
                    <option value="">Seleccionar Grupo</option>
                    {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.name} ({g.semester}º)</option>)}
                  </select>
               </div>
               <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Book size={10} /> Materia</label>
                  <select value={formData.subjectId} onChange={(e) => setFormData({...formData, subjectId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold appearance-none outline-none focus:border-emerald-500">
                    <option value="">Seleccionar Materia</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
               </div>
               {plannerMode === 'evaluation' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><LayoutGrid size={10} /> Tipo Instrumento</label>
                    <select value={formData.evalType} onChange={(e) => setFormData({...formData, evalType: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold appearance-none outline-none focus:border-emerald-500">
                      <option value="RUBRICA">RÚBRICA DE EVALUACIÓN</option>
                      <option value="LISTA_COTEJO">LISTA DE COTEJO</option>
                      <option value="EXAMEN">EXAMEN PARCIAL</option>
                    </select>
                  </div>
                )}
                {plannerMode === 'sequence' && (
                   <div className="space-y-1 flex flex-col justify-end">
                      <button onClick={() => setSequenceMode(sequenceMode === 'MCCEMS' ? 'FREE' : 'MCCEMS')} className="flex items-center gap-3 px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold transition-all hover:bg-slate-100">
                         {sequenceMode === 'MCCEMS' ? <ToggleRight size={24} className="text-emerald-500"/> : <ToggleLeft size={24} className="text-slate-400"/>}
                         {sequenceMode === 'MCCEMS' ? 'Modelo Oficial MCCEMS' : 'Formato Libre'}
                      </button>
                   </div>
                )}
                <div className="lg:col-span-4 space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-1"><Target size={10} /> Tema / Contenido</label>
                  <input type="text" placeholder="Ej: Las leyes del movimiento..." value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-bold outline-none" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button onClick={handleGenerate} disabled={loading || !formData.subjectId || !formData.topic} className={`w-full py-5 rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${loading ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                 {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                 {loading ? 'Procesando con IA...' : `Generar ${plannerMode === 'sequence' ? 'Secuencia' : plannerMode === 'class_gen' ? 'Clase Interactiva' : 'Evaluación'}`}
               </button>
               {plannerMode === 'sequence' && (
                  <label className="w-full py-5 bg-slate-800 text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-3 transition-all shadow-xl cursor-pointer hover:bg-slate-900">
                     <Upload size={20} /> Analizar PDF/Imagen Externa
                     <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                  </label>
               )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in slide-in-from-right-4">
             {/* ... Log code same as before ... */}
             <div className="py-20 text-center opacity-30">
                <Search size={48} className="mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">Historial de Planeaciones</p>
             </div>
          </div>
        )}
      </div>

      {/* RESULTADO DE CLASE GENERADA (PRESENTACIÓN CON MODO DUAL) */}
      {classMaterial && (
        <div className="bg-white rounded-[3.5rem] border border-slate-200 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center no-print">
               <div className="flex items-center gap-4">
                  <Projector size={32} className="text-blue-400"/>
                  <div>
                    <h3 className="text-xl font-black uppercase italic">Centro de Proyección</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       {currentContext.date} • {currentContext.groupName}
                    </p>
                  </div>
               </div>
               
               <div className="flex gap-3">
                  {/* Controles de Temporizador */}
                  <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl mr-4 border border-white/5">
                     <ClockIcon size={16} className={timerActive ? 'text-emerald-400 animate-pulse' : 'text-slate-400'} />
                     <span className="font-mono font-bold text-lg tabular-nums w-14 text-center">{formatTime(timerSeconds)}</span>
                     <button onClick={() => setTimerActive(!timerActive)} className="p-1 hover:text-blue-400">{timerActive ? <Pause size={14}/> : <Play size={14}/>}</button>
                     <button onClick={() => { setTimerActive(false); setTimerSeconds(0); }} className="p-1 hover:text-rose-400"><RotateCcw size={14}/></button>
                  </div>

                  <button 
                    onClick={toggleProjector} 
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 shadow-lg ${isProjecting ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                  >
                     {isProjecting ? <Cast size={16}/> : <Monitor size={16}/>}
                     {isProjecting ? 'Detener Proyección' : 'Proyectar / Chromecast'}
                  </button>
                  
                  <button onClick={() => window.print()} className="bg-white/10 hover:bg-white/20 px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2">
                     <Printer size={16}/> PDF
                  </button>
               </div>
            </div>

            {/* HEADER OFICIAL PARA IMPRESIÓN */}
            <div className="hidden print:block p-8 border-b-2 border-black mb-4">
               <div className="flex justify-between items-center">
                  <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO SEP</div>
                  <div className="text-center">
                     <h1 className="text-xl font-black uppercase">CECyTEN EMSaD 16 El Macho</h1>
                     <p className="text-[10px] font-bold uppercase mt-1">Guía Didáctica de Clase</p>
                  </div>
                  <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO CECyTEN</div>
               </div>
               <div className="mt-4 grid grid-cols-2 gap-4 text-[10px] font-medium border-t border-black pt-2">
                  <p><span className="font-bold">DOCENTE:</span> {currentContext.teacherName}</p>
                  <p><span className="font-bold">MATERIA:</span> {currentContext.subjectName}</p>
                  <p><span className="font-bold">FECHA:</span> {currentContext.date}</p>
                  <p><span className="font-bold">GRUPO:</span> {currentContext.groupName}</p>
               </div>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 print:block">
               {/* Visor de Diapositivas (Vista del Docente) */}
               <div className="lg:col-span-2 space-y-6 print:hidden">
                  <div className="aspect-video bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border-4 border-slate-900 shadow-2xl p-12 flex flex-col justify-center relative overflow-hidden group">
                     {/* Marca de agua si se está proyectando */}
                     {isProjecting && (
                       <div className="absolute top-4 left-4 bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-2 animate-pulse shadow-lg z-20">
                          <Cast size={12} /> En Vivo
                       </div>
                     )}
                     
                     <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><BookOpen size={200} /></div>
                     <div className="relative z-10 space-y-6">
                        <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight">
                           {classMaterial.slides[slideIndex]?.title}
                        </h2>
                        <div className="space-y-3">
                           {classMaterial.slides[slideIndex]?.content.map((point, i) => (
                              <div key={i} className="flex items-start gap-3 text-lg font-medium text-slate-600">
                                 <div className="w-2 h-2 mt-2.5 bg-blue-600 rounded-full shrink-0"></div>
                                 <p>{point}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        {currentContext.teacherName} • {currentContext.subjectName}
                     </div>
                  </div>

                  <div className="flex justify-between items-center bg-slate-100 p-2 rounded-2xl no-print border border-slate-200">
                     <button onClick={() => setSlideIndex(Math.max(0, slideIndex - 1))} disabled={slideIndex === 0} className="px-6 py-3 bg-white rounded-xl shadow-sm text-xs font-black uppercase disabled:opacity-50 hover:bg-slate-50 transition-all">Ant.</button>
                     <div className="flex gap-1">{classMaterial.slides.map((_, i) => <button key={i} onClick={() => setSlideIndex(i)} className={`w-3 h-3 rounded-full transition-all ${i === slideIndex ? 'bg-blue-600 w-6' : 'bg-slate-300 hover:bg-blue-400'}`}/>)}</div>
                     <button onClick={() => setSlideIndex(Math.min(classMaterial.slides.length - 1, slideIndex + 1))} disabled={slideIndex === classMaterial.slides.length - 1} className="px-6 py-3 bg-white rounded-xl shadow-sm text-xs font-black uppercase disabled:opacity-50 hover:bg-slate-50 transition-all">Sig.</button>
                  </div>
                  
                  {/* --- PANEL DE CONTROL DOCENTE (GUION Y DINÁMICA) --- */}
                  <div className="space-y-6">
                     {/* 1. Guion del Docente (Qué decir) */}
                     <div className="bg-blue-50 border border-blue-200 p-6 rounded-3xl space-y-3 relative overflow-hidden">
                        <div className="flex items-center gap-3 text-blue-800 text-[10px] font-black uppercase tracking-widest">
                           <Mic size={16} /> Guion del Docente (Teleprompter)
                        </div>
                        <p className="text-sm font-medium text-blue-900 leading-relaxed">
                           "{classMaterial.slides[slideIndex]?.teacherScript || classMaterial.slides[slideIndex]?.notes}"
                        </p>
                     </div>

                     {/* 2. Dinámica Interactiva (Qué hacer) */}
                     {classMaterial.slides[slideIndex]?.activity && (
                        <div className="bg-indigo-600 text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-4 opacity-10"><Users size={80}/></div>
                           <div className="relative z-10">
                              <div className="flex items-center gap-3 mb-2 border-b border-white/20 pb-2">
                                 <MessageCircle size={18} className="text-yellow-400"/>
                                 <span className="text-[10px] font-black uppercase tracking-widest">Actividad en Clase: {classMaterial.slides[slideIndex]?.activity?.type}</span>
                              </div>
                              <h4 className="text-xl font-bold leading-tight text-indigo-100">{classMaterial.slides[slideIndex]?.activity?.question}</h4>
                              <p className="text-xs font-medium opacity-80 mt-2 bg-indigo-800/50 p-3 rounded-xl border border-white/10">
                                 <span className="font-bold uppercase text-[9px] block mb-1">Instrucción:</span>
                                 {classMaterial.slides[slideIndex]?.activity?.instruction}
                              </p>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Vista de Impresión del Contenido */}
               <div className="hidden print:block space-y-6">
                  {classMaterial.slides.map((slide, i) => (
                     <div key={i} className="mb-6 p-4 border border-slate-300 rounded-xl">
                        <h4 className="font-bold uppercase text-sm mb-2">{slide.title}</h4>
                        <ul className="list-disc pl-5 text-xs mb-2">{slide.content.map((c, j) => <li key={j}>{c}</li>)}</ul>
                        {slide.activity && (
                           <div className="mt-2 p-2 bg-slate-100 border border-slate-300 rounded">
                              <p className="font-bold text-[10px] uppercase">Actividad: {slide.activity.type}</p>
                              <p className="text-[10px] italic">{slide.activity.question}</p>
                           </div>
                        )}
                        <p className="text-[10px] italic text-slate-500 mt-2">Nota Docente: {slide.teacherScript}</p>
                     </div>
                  ))}
               </div>

               {/* Panel Lateral de Recursos y Tareas */}
               <div className="space-y-6 print:mt-6">
                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 print:border-black print:rounded-none">
                     <div className="flex items-center gap-3 text-blue-600 border-b border-slate-50 pb-3">
                        <Sparkles size={20}/>
                        <h4 className="text-xs font-black uppercase">Ejemplos Contextualizados</h4>
                     </div>
                     <ul className="space-y-3">
                        {classMaterial.examples.map((ex, i) => <li key={i} className="text-xs font-medium text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 print:bg-white print:border-none print:p-0 print:mb-2">{ex}</li>)}
                     </ul>
                  </div>

                  <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4 print:border-black print:rounded-none">
                     <div className="flex items-center gap-3 text-emerald-600 border-b border-slate-50 pb-3">
                        <BookOpen size={20}/>
                        <h4 className="text-xs font-black uppercase">Recursos Necesarios</h4>
                     </div>
                     <ul className="space-y-2">
                        {classMaterial.resources.map((r, i) => <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-500"><CheckCircle2 size={12} className="text-emerald-500 print:hidden"/> {r}</li>)}
                     </ul>
                  </div>

                  <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl text-white space-y-4 print:bg-white print:text-black print:shadow-none print:border print:border-black print:rounded-none">
                     <div className="flex items-center gap-3 text-blue-400 border-b border-white/10 pb-3 print:border-black print:text-black">
                        <PenTool size={20}/>
                        <h4 className="text-xs font-black uppercase">Tarea Asignada</h4>
                     </div>
                     <ul className="space-y-3">
                        {classMaterial.homework.map((hw, i) => <li key={i} className="text-xs font-medium text-slate-300 italic print:text-black">• {hw}</li>)}
                     </ul>
                  </div>
               </div>
            </div>
        </div>
      )}

      {/* DIALOGO DE CONFIRMACIÓN (Existente) */}
      {showLogDialog && (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl p-10 space-y-6 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"><Save size={40} /></div>
              <div className="space-y-2 text-center">
                 <h3 className="text-xl font-black text-slate-900 uppercase italic">Registro de Planeación</h3>
                 <p className="text-xs text-slate-500 font-medium">Se han detectado {extractedActivities.length} actividades. Confirma el estado inicial.</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                 <button onClick={() => confirmLog(false)} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Guardar Pendiente</button>
                 <button onClick={() => confirmLog(true)} className="py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all">Registrar Completo</button>
              </div>
           </div>
        </div>
      )}

      {/* RESULTADO DE SECUENCIA / EVALUACIÓN (Existente) */}
      {result && !classMaterial && (
        <div className="bg-white p-12 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-8 animate-in slide-in-from-bottom-6 print:p-0 print:shadow-none print:border-none print:rounded-none">
          <div className="flex justify-between items-center no-print border-b border-slate-50 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle2 size={24} /></div>
              <div>
                <h3 className="text-sm font-black uppercase italic text-slate-800 tracking-tight">Secuencia / Instrumento Validado</h3>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ARCONTROL v4.5 • MCCEMS</p>
              </div>
            </div>
            <div className="flex gap-2">
               <button onClick={() => setResult(null)} className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Cerrar</button>
               <button onClick={() => window.print()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg"><Printer size={16} /> PDF Oficial</button>
            </div>
          </div>
          
          <div className="print:block hidden border-b-2 border-slate-900 pb-8 mb-8">
             <div className="flex justify-between items-center">
                <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO SEP</div>
                <div className="text-center">
                   <h1 className="text-xl font-black uppercase italic tracking-tighter">{INSTITUTION_INFO.name}</h1>
                   <p className="text-[10px] font-black uppercase text-slate-500 mt-1">Instrumento de Planeación Didáctica</p>
                </div>
                <div className="w-24 h-12 bg-slate-200 flex items-center justify-center text-[8px] font-black border border-slate-400">LOGO CECyTEN</div>
             </div>
             <div className="grid grid-cols-3 gap-4 mt-6 text-[9px] font-medium border border-black p-2">
                <div><span className="font-bold">DOCENTE:</span> {currentContext.teacherName}</div>
                <div><span className="font-bold">ASIGNATURA:</span> {currentContext.subjectName}</div>
                <div><span className="font-bold">PERIODO:</span> {cycle.period} {cycle.year}</div>
                <div><span className="font-bold">SEMESTRE:</span> {currentContext.semester}º</div>
                <div><span className="font-bold">GRUPO:</span> {currentContext.groupName}</div>
                <div><span className="font-bold">FECHA:</span> {currentContext.date}</div>
             </div>
          </div>

          <div className="prose prose-slate max-w-none text-sm font-medium leading-loose border-l-4 border-emerald-500 pl-8 py-2 print:border-none print:pl-0 print:prose-sm">
            <div className="whitespace-pre-wrap text-slate-700 print:text-black">{result}</div>
          </div>

          <div className="hidden print:flex justify-between items-end mt-20 pt-10 border-t border-slate-100">
             <div className="text-center">
                <p className="text-[8px] font-black uppercase mb-1">{cycle.directorName || 'Director del Plantel'}</p>
                <div className="w-48 border-t border-slate-900"></div>
                <p className="text-[8px] font-black uppercase mt-2">Vo. Bo. Dirección</p>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black uppercase mb-1">{currentContext.teacherName}</p>
                <div className="w-48 border-t border-slate-900"></div>
                <p className="text-[8px] font-black uppercase mt-2">Firma del Docente</p>
             </div>
             <div className="text-center">
                <p className="text-[8px] font-black uppercase mb-1">{cycle.delegadoSindicalName || 'Delegación Sindical'}</p>
                <div className="w-48 border-t border-slate-900"></div>
                <p className="text-[8px] font-black uppercase mt-2">Revisión Sindical</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DidacticPlanner;
