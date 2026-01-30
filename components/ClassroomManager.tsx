import React, { useState, useMemo, useRef } from 'react';
import { Group, Student, Assignment, AttendanceRecord, AppConfig, Teacher } from '../types';
import { 
  ClipboardList, Camera, Wand2, X, Download, Share2, 
  Trash2, UserPlus, CheckCircle2, AlertTriangle, Clock, Printer,
  ShieldCheck, MessageCircle, Phone, AtSign, User, Edit3, ShieldAlert
} from 'lucide-react';
import { parseGradebookFromImage } from '../geminiService';

const ClassroomManager: React.FC<{ groups: Group[], setGroups: (g: Group[]) => void, config: AppConfig, teachers: Teacher[] }> = ({ groups, setGroups, config, teachers }) => {
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [view, setView] = useState<'attendance' | 'grades' | 'students'>('attendance');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeGroup = useMemo(() => groups.find(g => g.id === selectedGroupId), [groups, selectedGroupId]);

  const updateGroups = (updated: Group) => {
    setGroups(groups.map(g => g.id === updated.id ? updated : g));
  };

  const calculateAbsences = (attendance: AttendanceRecord[]) => {
    const lates = attendance.filter(a => a.status === 'R').length;
    const absences = attendance.filter(a => a.status === 'F').length;
    return absences + Math.floor(lates / 3);
  };

  const toggleAttendance = (studentId: string, status: AttendanceRecord['status']) => {
    if (!activeGroup) return;
    const updatedStudents = activeGroup.students.map(s => {
      if (s.id === studentId) {
        const otherRecords = s.attendance.filter(a => a.date !== currentDate);
        return { ...s, attendance: [...otherRecords, { date: currentDate, status }] };
      }
      return s;
    });
    updateGroups({ ...activeGroup, students: updatedStudents });
  };

  const startScanning = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { alert("Error de acceso a cámara"); setCameraActive(false); }
  };

  const captureAndProcess = async () => {
    if (videoRef.current) {
      setIsProcessing(true);
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      setCameraActive(false);

      try {
        const data = await parseGradebookFromImage(canvas.toDataURL('image/jpeg'), 'ATTENDANCE');
        // Logic to merge would go here
        alert(`Se detectaron ${data.length} alumnos en la captura.`);
      } catch (e) { alert("Error en procesamiento IA"); }
      finally { setIsProcessing(false); }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      {/* Header Panel */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-blue-900/20 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-red-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100 dark:shadow-blue-950">
            <ClipboardList size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white uppercase italic tracking-tighter leading-none">Control Docente</h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-blue-400 uppercase tracking-widest mt-1">Plantel EMSaD 16 Nayarit • Gestión Integral</p>
          </div>
        </div>

        <div className="flex gap-4">
          <select 
            value={selectedGroupId} 
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="px-6 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-blue-900/30 rounded-2xl text-[10px] font-black uppercase dark:text-white outline-none"
          >
            {groups.map(g => <option key={g.id} value={g.id}>Grupo {g.name} - {g.semester}º</option>)}
          </select>
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl">
             <button onClick={() => setView('attendance')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${view === 'attendance' ? 'bg-red-900 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>Asistencia</button>
             <button onClick={() => setView('grades')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${view === 'grades' ? 'bg-red-900 dark:bg-blue-600 text-white shadow-sm' : 'text-slate-400'}`}>Calificaciones</button>
          </div>
        </div>
      </div>

      {activeGroup && (
        <div className="space-y-6">
           {/* Visual Alerta Desertores */}
           <div className="grid grid-cols-1 md:grid-cols-4 gap-6 no-print">
              <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 p-6 rounded-[2.5rem] flex items-center gap-4">
                 <ShieldAlert className="text-red-600" size={32}/>
                 <div>
                    <p className="text-2xl font-black text-red-600 leading-none">{activeGroup.students.filter(s => calculateAbsences(s.attendance) >= 5).length}</p>
                    <p className="text-[9px] font-bold text-red-400 uppercase">Sin derecho a examen (+5 faltas)</p>
                 </div>
              </div>
              <button 
                onClick={startScanning}
                className="bg-slate-900 dark:bg-blue-600 text-white p-6 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group hover:scale-105 transition-all shadow-xl"
              >
                 <Camera size={24} className="group-hover:animate-bounce"/>
                 <span className="text-[10px] font-black uppercase tracking-widest">Escanear Lista Física</span>
              </button>
           </div>

           {/* Scanning Interface Overlay */}
           {cameraActive && (
              <div className="fixed inset-0 z-[400] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
                 <div className="relative w-full max-w-2xl aspect-video rounded-[3rem] overflow-hidden border-4 border-blue-500/50 shadow-[0_0_100px_rgba(37,99,235,0.3)]">
                    <video ref={videoRef} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-400/50 animate-scan z-10"></div>
                    <button onClick={captureAndProcess} className="absolute bottom-10 left-1/2 -translate-x-1/2 px-12 py-5 bg-white text-blue-950 rounded-[2rem] font-black uppercase text-xs shadow-2xl hover:scale-110 transition-transform">Capturar para OCR</button>
                    <button onClick={() => setCameraActive(false)} className="absolute top-6 right-6 p-3 bg-red-600 text-white rounded-2xl"><X/></button>
                 </div>
                 <p className="text-blue-400 font-mono text-[10px] mt-6 uppercase tracking-[0.5em] animate-pulse">Analizador de documentos AR-EMSAD v5.0</p>
              </div>
           )}

           {/* Table View */}
           <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border-2 border-slate-100 dark:border-blue-900/20 overflow-hidden shadow-sm">
              <div className="p-8 border-b dark:border-blue-900/10 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                 <div className="flex items-center gap-4">
                    <Clock className="text-red-900 dark:text-blue-500" size={24}/>
                    <input type="date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} className="bg-transparent border-none font-black uppercase text-sm dark:text-white outline-none"/>
                 </div>
                 <button onClick={() => window.print()} className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:text-blue-500 transition-all"><Printer size={20}/></button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/30">
                      <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-blue-900/10">Alumno</th>
                      <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-blue-900/10 text-center">Registro Rápido</th>
                      <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-blue-900/10 text-center">Faltas</th>
                      <th className="py-5 px-8 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b dark:border-blue-900/10 text-center">Acreditación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-blue-900/10">
                    {activeGroup.students.map((student) => {
                      const totalAbs = calculateAbsences(student.attendance);
                      const isAtRisk = totalAbs >= 5;
                      const today = student.attendance.find(a => a.date === currentDate);

                      return (
                        <tr key={student.id} className={`${isAtRisk ? 'bg-red-50/50 dark:bg-red-950/10' : ''} hover:bg-slate-50 dark:hover:bg-blue-900/5 transition-colors`}>
                          <td className="py-5 px-8">
                             <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase italic">{student.name}</p>
                             <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.curp || 'SIN CURP'}</p>
                          </td>
                          <td className="py-5 px-8 text-center no-print">
                            <div className="inline-flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl shadow-inner border dark:border-blue-900/20">
                               {['A', 'R', 'F'].map(st => (
                                 <button 
                                  key={st} 
                                  onClick={() => toggleAttendance(student.id, st as any)}
                                  className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all ${today?.status === st ? 'bg-white dark:bg-blue-600 dark:text-white shadow-lg text-red-900' : 'text-slate-400'}`}
                                 >
                                    {st}
                                 </button>
                               ))}
                            </div>
                          </td>
                          <td className="py-5 px-8 text-center">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${isAtRisk ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-blue-400'}`}>{totalAbs}</span>
                          </td>
                          <td className="py-5 px-8 text-center">
                             {isAtRisk ? <ShieldAlert className="mx-auto text-red-600" size={24}/> : <ShieldCheck className="mx-auto text-emerald-500" size={24}/>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManager;