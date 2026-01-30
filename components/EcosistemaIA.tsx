
import React, { useState, useRef, useEffect } from 'react';
import { BrainCircuit, Mic, MicOff, Sparkles, Loader2, Volume2, Send, FileText, ClipboardList, CalendarRange, X, Search } from 'lucide-react';
import { getInteractiveResponse } from '../geminiService';
import DidacticPlanner from './DidacticPlanner';
import AcademicTracking from './AcademicTracking';
import TutorIA from './TutorIA';
import ScheduleGenerator from './ScheduleGenerator';
import { Teacher, Subject, AcademicCycle, Group, OptimizationWeights, ScheduleData } from '../types';

interface EcosistemaIAProps {
  teachers: Teacher[];
  subjects: Subject[];
  groups: Group[];
  cycle: AcademicCycle;
  schedules: ScheduleData[];
  setSchedules: (schedules: ScheduleData[]) => void;
  weights: OptimizationWeights;
  onAddLog: (log: any) => void;
}

const EcosistemaIA: React.FC<EcosistemaIAProps> = ({ teachers, subjects, groups, cycle, schedules, setSchedules, weights, onAddLog }) => {
  const [activeTool, setActiveTool] = useState<'chat' | 'horarios' | 'planner' | 'exam' | 'tutor'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ia'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-MX';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserInput(transcript);
        handleSend(transcript);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    const newHistory = [...chatHistory, { role: 'user' as const, text }];
    setChatHistory(newHistory);
    setUserInput('');
    setLoading(true);

    const context = `Plantel EMSaD 16 El Macho, Nayarit. Docentes: ${teachers.length}, Materias: ${subjects.length}. Estás en el hub unificado de ARCONTROL.`;
    const response = await getInteractiveResponse(text, context);
    
    setChatHistory([...newHistory, { role: 'ia' as const, text: response }]);
    setLoading(false);
    speakResponse(response);
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-MX';
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleMic = () => {
    if (isListening) recognitionRef.current.stop();
    else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 flex flex-col h-full">
      {/* Pestañas de Navegación Multimodal */}
      <div className="flex flex-wrap justify-center bg-white/80 backdrop-blur-md p-2 rounded-[2.5rem] border border-slate-200 sticky top-4 z-[60] shadow-xl max-w-fit mx-auto gap-1">
         {[
           { id: 'chat', label: 'IA Voz', icon: Mic, color: 'text-blue-500' },
           { id: 'horarios', label: 'Horarios IA', icon: CalendarRange, color: 'text-indigo-500' },
           { id: 'planner', label: 'Planeación', icon: FileText, color: 'text-emerald-500' },
           { id: 'exam', label: 'Exámenes', icon: ClipboardList, color: 'text-purple-500' },
           { id: 'tutor', label: 'Tutor Visual', icon: BrainCircuit, color: 'text-orange-500' }
         ].map(tool => (
           <button 
            key={tool.id} 
            onClick={() => setActiveTool(tool.id as any)}
            className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] text-[10px] font-black uppercase transition-all ${activeTool === tool.id ? 'bg-slate-900 text-white shadow-2xl scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
           >
              <tool.icon size={16} className={activeTool === tool.id ? 'text-white' : tool.color} />
              <span className="hidden lg:inline">{tool.label}</span>
           </button>
         ))}
      </div>

      <div className="flex-1 w-full">
        {activeTool === 'chat' && (
          <div className="max-w-4xl mx-auto bg-white rounded-[4rem] border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[70vh]">
             <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                      <Sparkles size={24} />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900 uppercase italic leading-none">Asistente Unificado</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Interacción Multimodal Activa</p>
                   </div>
                </div>
                {isSpeaking && (
                   <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full border border-blue-100 animate-pulse">
                      <Volume2 size={14} />
                      <span className="text-[9px] font-black uppercase">IA está hablando...</span>
                   </div>
                )}
             </div>

             <div className="flex-1 p-8 overflow-y-auto space-y-6 scrollbar-hide">
                {chatHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                     <BrainCircuit size={80} className="text-slate-300 animate-pulse" />
                     <div className="space-y-2">
                        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Control de Voz ARCONTROL</p>
                        <p className="text-[10px] font-bold text-slate-300 uppercase italic">"Genera una planeación de Química", "Optimiza el horario de hoy", etc.</p>
                     </div>
                  </div>
                )}
                {chatHistory.map((chat, i) => (
                  <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                     <div className={`max-w-[85%] px-8 py-5 rounded-[2.5rem] shadow-sm text-sm font-medium ${chat.role === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                        {chat.text}
                     </div>
                  </div>
                ))}
                {loading && (
                   <div className="flex justify-start">
                      <div className="bg-slate-50 px-8 py-5 rounded-[2.5rem] flex items-center gap-3">
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                         </div>
                         <span className="text-[10px] font-black text-slate-400 uppercase">Procesando Consulta...</span>
                      </div>
                   </div>
                )}
             </div>

             <div className="p-8 border-t border-slate-100 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="flex gap-4 items-center max-w-4xl mx-auto">
                   <button 
                    onClick={toggleMic}
                    className={`w-20 h-20 rounded-[2.5rem] flex items-center justify-center transition-all shadow-2xl active:scale-90 ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                   >
                      {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                   </button>
                   <div className="flex-1 relative">
                      <input 
                        type="text" 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(userInput)}
                        placeholder="Instrucción de voz o texto..."
                        className="w-full px-10 py-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 text-sm font-bold outline-none focus:border-blue-500 shadow-inner"
                      />
                      <button 
                        onClick={() => handleSend(userInput)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-4 bg-slate-900 text-white rounded-full hover:bg-blue-600 transition-all shadow-lg"
                      >
                         <Send size={18} />
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTool === 'horarios' && (
          <ScheduleGenerator 
            teachers={teachers} 
            subjects={subjects} 
            groups={groups} 
            schedules={schedules} 
            setSchedules={setSchedules} 
            weights={weights} 
          />
        )}
        {activeTool === 'planner' && <DidacticPlanner teachers={teachers} subjects={subjects} cycle={cycle} groups={groups} onAddLog={onAddLog} />}
        {activeTool === 'exam' && <AcademicTracking teachers={teachers} subjects={subjects} cycle={cycle} />}
        {activeTool === 'tutor' && <TutorIA />}
      </div>
    </div>
  );
};

export default EcosistemaIA;
