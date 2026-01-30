
import React, { useState, useRef, useMemo } from 'react';
import { Subject, AcademicCycle, Group } from '../types';
import { verifyOfficialCurriculum } from '../geminiService';
import { 
  BookPlus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  BookOpen, 
  AlertTriangle, 
  Camera, 
  Image as ImageIcon, 
  Power, 
  Settings2, 
  Upload, 
  LayoutGrid,
  CheckCircle2,
  X,
  Edit3,
  Hash,
  Clock,
  Layers,
  Plus,
  Palette,
  ChevronRight,
  Filter
} from 'lucide-react';

interface SubjectManagerProps {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  cycle: AcademicCycle;
  groups: Group[];
}

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1509228468518-180dd48a5d5f?w=400&q=80",
  "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80",
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80",
  "https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80",
];

const SubjectManager: React.FC<SubjectManagerProps> = ({ subjects, setSubjects, cycle, groups }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState<number | 'all'>('all');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [newSub, setNewSub] = useState<Partial<Subject>>({
    name: '', hoursPerWeek: 4, color: '#3b82f6', category: 'basica', semester: 1, image: GALLERY_IMAGES[0], isActive: true
  });

  const filteredSubjects = useMemo(() => {
    return semesterFilter === 'all' 
      ? subjects 
      : subjects.filter(s => s.semester === semesterFilter);
  }, [subjects, semesterFilter]);

  const handleToggleActive = (id: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleAddOrUpdate = () => {
    if (newSub.name) {
      if (editingId) {
        setSubjects(subjects.map(s => s.id === editingId ? { ...s, ...newSub } as Subject : s));
      } else {
        const subject: Subject = {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          name: (newSub.name as string).toUpperCase(),
          hoursPerWeek: newSub.hoursPerWeek || 4,
          color: newSub.color || '#3b82f6',
          category: newSub.category as any,
          semester: newSub.semester || 1,
          image: newSub.image,
          isActive: true
        };
        setSubjects([...subjects, subject]);
      }
      setIsAdding(false);
      setEditingId(null);
      setNewSub({ name: '', hoursPerWeek: 4, color: '#3b82f6', category: 'basica', semester: 1, image: GALLERY_IMAGES[0], isActive: true });
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("No se pudo acceder a la cámara."); setShowCamera(false); }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setNewSub({ ...newSub, image: canvas.toDataURL('image/jpeg') });
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewSub({ ...newSub, image: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleAuditCurriculum = async () => {
    setVerifying(true);
    try {
      const result = await verifyOfficialCurriculum(subjects);
      setAuditResult(result);
    } catch (err) {
      setAuditResult("Error crítico al consultar el motor de auditoría IA.");
    } finally {
      setVerifying(false);
    }
  };

  const isManualMode = cycle.config.useOfficialCurriculumIA === false;

  return (
    <div className="space-y-10 animate-in fade-in duration-600 pb-20">
      {/* Panel Superior y Filtros */}
      <div className="bg-white border border-slate-200 rounded-[3.5rem] p-10 shadow-sm space-y-10">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className={`w-16 h-16 ${isManualMode ? 'bg-slate-800' : 'bg-emerald-600'} rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl`}>
              {isManualMode ? <Settings2 size={32} /> : <BookOpen size={32} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Mapa Curricular</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nayarit • Plantel EMSaD 16 El Macho</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="flex bg-slate-50 border border-slate-100 p-1 rounded-2xl">
               <button 
                  onClick={() => setSemesterFilter('all')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${semesterFilter === 'all' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
               >Todos</button>
               {[1, 2, 3, 4, 5, 6].map(s => (
                 <button 
                    key={s}
                    onClick={() => setSemesterFilter(s)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${semesterFilter === s ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                 >{s}º</button>
               ))}
            </div>
            {!isManualMode && (
              <button 
                onClick={handleAuditCurriculum} 
                disabled={verifying}
                className="flex items-center gap-3 px-8 py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-black text-[10px] uppercase hover:bg-emerald-100 transition-all shadow-sm"
              >
                {verifying ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} 
                {verifying ? 'Auditoría...' : 'Auditoría IA'}
              </button>
            )}
            <button onClick={() => { setIsAdding(true); setEditingId(null); }} className="flex items-center gap-3 px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase hover:bg-black transition-all shadow-xl">
              <Plus size={18} /> Nueva Asignatura
            </button>
          </div>
        </div>
      </div>

      {auditResult && (
        <div className="bg-slate-950 text-emerald-400 p-10 rounded-[3.5rem] border border-emerald-900/30 shadow-2xl animate-in slide-in-from-top-6 font-mono relative">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
               <Sparkles size={20} className="text-emerald-500 animate-pulse" />
               <h4 className="text-[12px] font-black uppercase tracking-widest text-emerald-500">Dictamen Académico IA</h4>
             </div>
             <button onClick={() => setAuditResult(null)} className="p-2 hover:bg-white/10 rounded-full"><X size={20}/></button>
          </div>
          <div className="text-[13px] italic whitespace-pre-wrap leading-relaxed opacity-90 border-l-2 border-emerald-500/30 pl-6">
            {auditResult}
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-white border-2 border-emerald-500/20 p-12 rounded-[4rem] shadow-2xl animate-in zoom-in-95 grid grid-cols-1 md:grid-cols-4 gap-12 relative overflow-hidden">
          {/* Panel Multimodal de Imagen */}
          <div className="md:col-span-1 space-y-6">
             <div className="aspect-square bg-slate-50 rounded-[3rem] overflow-hidden relative group border-2 border-dashed border-slate-200 flex items-center justify-center shadow-inner">
                {newSub.image ? (
                  <img src={newSub.image} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={60} strokeWidth={1} className="text-slate-200" />
                )}
                <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-4 transition-all backdrop-blur-sm p-6">
                   <button onClick={startCamera} className="w-full bg-white text-slate-900 py-3 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase shadow-lg"><Camera size={18} /> Cámara</button>
                   <label className="w-full bg-emerald-600 text-white py-3 rounded-2xl cursor-pointer flex items-center justify-center gap-3 text-[10px] font-black uppercase shadow-lg">
                     <Upload size={18} /> Subir <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                   </label>
                   <button onClick={() => setShowGallery(!showGallery)} className="w-full bg-slate-800 text-white py-3 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black uppercase shadow-lg"><LayoutGrid size={18} /> Galería</button>
                </div>
             </div>
             {showGallery && (
               <div className="grid grid-cols-5 gap-2 animate-in slide-in-from-top-2 p-2 bg-slate-50 rounded-2xl">
                  {GALLERY_IMAGES.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => { setNewSub({...newSub, image: img}); setShowGallery(false); }} 
                      className={`aspect-square rounded-xl border-4 transition-all overflow-hidden ${newSub.image === img ? 'border-emerald-500' : 'border-transparent opacity-60'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
               </div>
             )}
          </div>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Nombre de la Asignatura</label>
              <input 
                type="text" 
                value={newSub.name} 
                onChange={e => setNewSub({...newSub, name: e.target.value.toUpperCase()})} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-[11px] font-black uppercase shadow-inner outline-none focus:border-emerald-500" 
                placeholder="EJ: MATEMÁTICAS I"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Semestre de Impartición</label>
              <select 
                value={newSub.semester} 
                onChange={e => setNewSub({...newSub, semester: parseInt(e.target.value)})} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-[11px] font-black uppercase shadow-inner appearance-none cursor-pointer outline-none focus:border-emerald-500"
              >
                {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}º Semestre</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Horas Semanales</label>
              <input 
                type="number" 
                value={newSub.hoursPerWeek} 
                onChange={e => setNewSub({...newSub, hoursPerWeek: parseInt(e.target.value)})} 
                className="w-full px-8 py-5 bg-slate-50 rounded-[2rem] border border-slate-100 text-[11px] font-black shadow-inner outline-none focus:border-emerald-500" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Color de Asignación</label>
              <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[2rem] border border-slate-100">
                 <input 
                  type="color" 
                  value={newSub.color} 
                  onChange={e => setNewSub({...newSub, color: e.target.value})} 
                  className="w-16 h-12 rounded-[1.5rem] border-none p-0 cursor-pointer overflow-hidden shadow-sm" 
                 />
                 <span className="text-[9px] font-black text-slate-400 uppercase">Identificador Visual</span>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-5 mt-10 border-t border-slate-50 pt-10">
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase hover:text-rose-500 transition-all">Cancelar</button>
              <button onClick={handleAddOrUpdate} className="px-14 py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-emerald-700 transition-all flex items-center gap-3">
                {editingId ? <CheckCircle2 size={18}/> : <Plus size={18}/>}
                {editingId ? 'Actualizar Registro' : 'Integrar al Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl bg-white p-6 rounded-[4rem] shadow-2xl overflow-hidden relative">
            <video ref={videoRef} autoPlay className="w-full aspect-video rounded-[3rem] object-cover" />
            <div className="mt-10 flex gap-6">
              <button onClick={stopCamera} className="flex-1 py-6 bg-slate-100 text-slate-900 rounded-[2rem] font-black uppercase text-xs">Cerrar</button>
              <button onClick={capturePhoto} className="flex-2 px-16 py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase text-xs shadow-2xl">Capturar</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Materias Registradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredSubjects.map(sub => (
          <div key={sub.id} className={`bg-white p-0 rounded-[3.5rem] border-2 transition-all flex flex-col relative overflow-hidden group/item ${!sub.isActive ? 'opacity-40 grayscale border-slate-100 shadow-none' : 'border-slate-100 shadow-sm hover:border-emerald-500/30 hover:shadow-xl hover:-translate-y-2'}`}>
            <div className="h-44 w-full overflow-hidden bg-slate-100 relative shadow-inner">
               {sub.image ? (
                 <img src={sub.image} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ImageIcon size={48} strokeWidth={1}/>
                 </div>
               )}
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                  <button onClick={() => handleToggleActive(sub.id)} className={`p-2.5 rounded-2xl transition-all shadow-lg ${sub.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'}`}>
                    <Power size={14} />
                  </button>
                  <button onClick={() => { setIsAdding(true); setEditingId(sub.id); setNewSub(sub); }} className="p-2.5 bg-white/90 backdrop-blur-md rounded-2xl text-slate-800 shadow-lg hover:bg-blue-600 hover:text-white transition-all">
                    <Settings2 size={14} />
                  </button>
               </div>
            </div>
            <div className="p-8">
              <div className="flex items-center gap-4">
                <div className="w-2 h-10 rounded-full shadow-sm" style={{ backgroundColor: sub.color }}></div>
                <div className="min-w-0">
                  <h4 className="text-[12px] font-black text-slate-900 uppercase italic leading-tight truncate tracking-tight">{sub.name}</h4>
                  <p className="text-[9px] font-black text-slate-400 uppercase mt-1.5 tracking-widest">{sub.semester}º SEMESTRE • {sub.hoursPerWeek} HRS</p>
                </div>
              </div>
              <div className="flex justify-between items-center pt-5 mt-5 border-t border-slate-50">
                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-xl border flex items-center gap-1 ${
                  sub.category === 'basica' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                  sub.category === 'propedueutica' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {sub.category}
                </span>
                <button onClick={() => { if(confirm(`¿Eliminar ${sub.name}?`)) setSubjects(subjects.filter(s => s.id !== sub.id)); }} className="text-slate-200 hover:text-rose-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 py-48 rounded-[5rem] text-center flex flex-col items-center gap-6">
           <BookOpen size={72} strokeWidth={0.5} className="text-slate-200" />
           <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest italic">No hay materias registradas para este filtro</p>
        </div>
      )}
    </div>
  );
};

export default SubjectManager;
