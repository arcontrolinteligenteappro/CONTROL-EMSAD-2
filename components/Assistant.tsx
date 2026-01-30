
import React, { useState, useRef } from 'react';
import { Subject, Teacher, StaffRole, ContactInfo } from '../types';
import { Sparkles, Loader2, Send, Mic, MicOff, Trash2, CheckCircle2 } from 'lucide-react';
import { analyzeTeacherInput } from '../geminiService';

interface AssistantProps {
  subjects: Subject[];
  onAddTeachers: (teachers: Teacher[]) => void;
}

const Assistant: React.FC<AssistantProps> = ({ subjects, onAddTeachers }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [extracted, setExtracted] = useState<any[]>([]);
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Navegador no compatible con voz.");
      return;
    }
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'es-MX';
    recognitionRef.current.onstart = () => setIsListening(true);
    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.start();
  };

  const handleProcess = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const results = await analyzeTeacherInput(text, subjects);
      setExtracted(results);
    } catch (err) {
      alert("Error de procesamiento inteligente.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const finalTeachers: Teacher[] = extracted.map(e => ({
      id: Math.random().toString(36).substr(2, 9),
      name: (e.name || 'Personal ARCONTROL').toUpperCase(),
      role: (e.role as StaffRole) || 'DOCENTE',
      alias: (e.alias || '').toUpperCase(),
      phones: e.phone ? [{ value: e.phone, label: 'PERSONAL' }] as ContactInfo[] : [{ value: '', label: 'PERSONAL' }],
      emails: [
        ...(e.email ? [{ value: e.email, label: 'PERSONAL' }] as ContactInfo[] : []),
        ...(e.institutionalEmail ? [{ value: e.institutionalEmail, label: 'INSTITUCIONAL' }] as ContactInfo[] : [])
      ].length > 0 ? [
        ...(e.email ? [{ value: e.email, label: 'PERSONAL' }] as ContactInfo[] : []),
        ...(e.institutionalEmail ? [{ value: e.institutionalEmail, label: 'INSTITUCIONAL' }] as ContactInfo[] : [])
      ] : [{ value: '', label: 'PERSONAL' }],
      socials: [],
      address: '',
      degree: '',
      photo: '',
      assignedSubjects: e.assignedSubjects || [],
      availability: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
      maxHoursPerWeek: 20,
      color: '#3b82f6',
      belongsToUnion: false,
      isUnionLead: false,
      isActive: true,
      employmentType: 'PERMANENTE',
      laborStatus: 'ACTIVO',
      totalPermitDays: 9,
      usedPermitDays: 0,
      absenceHistory: []
    }));
    onAddTeachers(finalTeachers);
    setExtracted([]);
    setText('');
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-8 opacity-10"><Sparkles size={100} /></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Mic size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-blue-400">Asistente IA de Personal</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Dicta el perfil para extracción automática</p>
            </div>
          </div>
          
          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ejemplo: 'Registrar a Humberto Reyes como docente con el alias Profe Humberto, asignarle Matemáticas 1 y Química 2'..."
              className="w-full h-32 bg-black/40 border border-white/10 rounded-3xl p-6 text-xs font-mono outline-none focus:border-blue-500/50 transition-all resize-none scrollbar-hide"
            />
            <div className="absolute bottom-4 right-4 flex gap-2">
              <button 
                onClick={isListening ? () => recognitionRef.current.stop() : startListening}
                className={`p-4 rounded-2xl transition-all shadow-xl ${isListening ? 'bg-red-500 animate-pulse text-white' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              </button>
              <button
                onClick={handleProcess}
                disabled={loading || !text}
                className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all ${loading ? 'bg-slate-800 text-slate-600' : 'bg-white text-slate-950 hover:bg-blue-50'}`}
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                {loading ? 'Analizando...' : 'Procesar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {extracted.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 size={16} /> Vista Previa de IA
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {extracted.map((t, i) => (
              <div key={i} className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="text-xs font-black text-slate-800 uppercase italic">{t.name}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {t.assignedSubjects?.map((id: string) => (
                    <span key={id} className="text-[8px] font-bold bg-white px-2 py-0.5 rounded border border-slate-200 uppercase">{subjects.find(s => s.id === id)?.name || id}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleConfirm} className="w-full py-4 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-colors">
            Confirmar e Integrar a Matriz
          </button>
        </div>
      )}
    </div>
  );
};

export default Assistant;
