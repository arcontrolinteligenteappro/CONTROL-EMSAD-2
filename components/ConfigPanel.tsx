
import React, { useMemo, useState } from 'react';
import { AcademicCycle, Group, AppConfig, OptimizationWeights, HistoryEntry } from '../types';
import { loginToGoogle, syncDataToDrive } from '../cloudService';
import { 
  Settings, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Database, 
  CalendarRange, 
  Layers,
  Edit3,
  Zap,
  Layout,
  BrainCircuit,
  SlidersHorizontal,
  Plus,
  Cloud,
  LogOut,
  Archive,
  RefreshCcw,
  CheckCircle2,
  ChevronRightSquare,
  ShieldCheck,
  Users2
} from 'lucide-react';

interface ConfigPanelProps {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  cycle: AcademicCycle;
  setCycle: (cycle: AcademicCycle) => void;
  weights: OptimizationWeights;
  setWeights: (weights: OptimizationWeights) => void;
  onArchiveCycle: () => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ groups, setGroups, cycle, setCycle, weights, setWeights, onArchiveCycle }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const addGroup = () => {
    const newGroup: Group = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      name: 'A', 
      semester: 1, 
      maleCount: 0, 
      femaleCount: 0, 
      color: '#3b82f6',
      students: [],
      assignments: []
    };
    setGroups([...groups, newGroup]);
  };

  const toggleConfig = (key: keyof AppConfig) => {
    setCycle({
      ...cycle,
      config: { ...cycle.config, [key]: !cycle.config[key] }
    });
  };

  const handleWeightChange = (key: keyof OptimizationWeights, val: number) => {
    setWeights({ ...weights, [key]: val });
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await loginToGoogle();
      setCycle({
        ...cycle,
        config: { ...cycle.config, cloud: { ...cycle.config.cloud, isAuthenticated: true, userEmail: user.email } }
      });
    } catch (error) {
      alert("Error al conectar con Google.");
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const timestamp = await syncDataToDrive({ cycle, groups, weights });
      setCycle({
        ...cycle,
        config: { ...cycle.config, cloud: { ...cycle.config.cloud, lastSync: timestamp } }
      });
      alert("Sincronización completada exitosamente.");
    } catch (error) {
      alert(error);
    } finally {
      setIsSyncing(false);
    }
  };

  const groupedGroups = useMemo(() => {
    const map: Record<number, Group[]> = {};
    groups.forEach(g => {
      if (!map[g.semester]) map[g.semester] = [];
      map[g.semester].push(g);
    });
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b));
  }, [groups]);

  const updateGroup = (id: string, updates: Partial<Group>) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updates } : g));
  };

  const ConfigToggle = ({ label, configKey, description, icon: Icon, color }: any) => (
    <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100 flex flex-col justify-between group hover:border-blue-500/20 transition-all hover:bg-white">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon size={24} />
          </div>
          <h4 className="text-[12px] font-black uppercase text-slate-800 tracking-tight">{label}</h4>
        </div>
        <button onClick={() => toggleConfig(configKey as keyof AppConfig)} className="transition-transform active:scale-90">
          {cycle.config[configKey as keyof AppConfig] ? <ToggleRight className="text-blue-600" size={48} /> : <ToggleLeft className="text-slate-300" size={48} />}
        </button>
      </div>
      <p className="text-[9px] text-slate-400 font-bold uppercase leading-relaxed italic">
        {description}
      </p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-24">
      <div className="bg-white p-8 md:p-14 rounded-[4rem] border border-slate-200 shadow-sm space-y-16">
         {/* Cabecera */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-50 pb-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-[2.2rem] flex items-center justify-center text-white shadow-2xl">
                <Settings size={34} className="animate-[spin_6s_linear_infinite]" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 uppercase italic leading-none">Matriz de Configuración</h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">Nayarit • EMSaD 16 El Macho • Gestión Enterprise</p>
              </div>
            </div>
            <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
               <Zap className="text-blue-600" size={16} />
               <span className="text-[11px] font-black text-blue-700 uppercase tracking-widest">ARCONTROL v4.5 Live IA</span>
            </div>
         </div>

         {/* NUBE Y CICLO ESCOLAR */}
         <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <Cloud className="text-sky-500" size={24} />
               <h4 className="text-[14px] font-black uppercase text-slate-900 italic tracking-widest">Sincronización y Respaldo</h4>
            </div>
            
            <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
               <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                     {cycle.config.cloud?.isAuthenticated ? <CheckCircle2 className="text-emerald-400"/> : <LogOut className="text-slate-400"/>}
                     <h3 className="text-xl font-black uppercase italic">
                        {cycle.config.cloud?.isAuthenticated ? `Conectado: ${cycle.config.cloud.userEmail}` : 'Modo Local (Offline)'}
                     </h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest max-w-md leading-relaxed">
                     La sincronización con Google Drive permite resguardo automático y acceso multidispositivo.
                     {cycle.config.cloud?.lastSync && <span className="block text-sky-400 mt-2">Última sincronización: {cycle.config.cloud.lastSync}</span>}
                  </p>
               </div>

               <div className="relative z-10 flex flex-col gap-3 w-full md:w-auto">
                  {!cycle.config.cloud?.isAuthenticated ? (
                     <button onClick={handleGoogleLogin} className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-sky-50 transition-all flex items-center justify-center gap-2">
                        <Cloud size={16} /> Conectar Google Drive
                     </button>
                  ) : (
                     <div className="flex gap-3">
                        <button onClick={handleManualSync} disabled={isSyncing} className="px-8 py-4 bg-sky-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-sky-500 transition-all flex items-center justify-center gap-2 shadow-lg">
                           {isSyncing ? <RefreshCcw size={16} className="animate-spin"/> : <Cloud size={16}/>} Sincronizar Ahora
                        </button>
                        <button onClick={onArchiveCycle} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-rose-500 transition-all flex items-center justify-center gap-2 shadow-lg">
                           <Archive size={16} /> Cerrar Ciclo Escolar
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Motores IA */}
         <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
               <BrainCircuit className="text-blue-600" size={24} />
               <h4 className="text-[14px] font-black uppercase text-slate-900 italic tracking-widest">Ecosistema de Inteligencia Artificial</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <ConfigToggle 
                  label="Asistente de Voz IA" 
                  configKey="useGeneralAI" 
                  color="bg-slate-900"
                  icon={Zap}
                  description="Activa la interacción multimodal (voz/texto) en todos los módulos operativos."
               />
               <ConfigToggle 
                  label="Optimización de Horarios" 
                  configKey="useAIScheduler" 
                  color="bg-blue-600"
                  icon={CalendarRange}
                  description="Compactación inteligente de horas muertas y balanceo de carga docente."
               />
               <ConfigToggle 
                  label="Validación Curricular" 
                  configKey="useOfficialCurriculumIA" 
                  color="bg-emerald-600"
                  icon={Database}
                  description="Audita las materias automáticamente contra el marco oficial MCCEMS de Nayarit."
               />
            </div>
         </div>

         {/* Márgenes de Optimización IA (Weights) */}
         <div className="space-y-8 pt-10 border-t border-slate-50">
            <div className="flex items-center gap-4 mb-4">
               <SlidersHorizontal className="text-blue-600" size={24} />
               <h4 className="text-[14px] font-black uppercase text-slate-900 italic tracking-widest">Margen de Decisión IA (Parámetros de Horario)</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
               {[
                 { key: 'alpha1', label: 'Horas Muertas', desc: 'Prioridad de compactar huecos.' },
                 { key: 'alpha2', label: 'Fragmentación', desc: 'Evitar saltos entre turnos.' },
                 { key: 'alpha3', label: 'Conflictos', desc: 'Rigurosidad de solapamientos.' },
                 { key: 'alpha4', label: 'Equidad Carga', desc: 'Balance entre docentes.' },
                 { key: 'alpha5', label: 'Compactación', desc: 'Agrupación de bloques.' }
               ].map(w => (
                 <div key={w.key} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-4">
                    <div className="flex justify-between items-center">
                       <label className="text-[10px] font-black text-slate-500 uppercase">{w.label}</label>
                       <span className="text-[12px] font-black text-blue-600">{Math.round((weights as any)[w.key] * 100)}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="1" 
                      step="0.05" 
                      value={(weights as any)[w.key]} 
                      onChange={e => handleWeightChange(w.key as any, parseFloat(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <p className="text-[8px] font-bold text-slate-400 uppercase italic leading-none">{w.desc}</p>
                 </div>
               ))}
            </div>
         </div>

         {/* Visibilidad de Módulos */}
         <div className="space-y-8 pt-10 border-t border-slate-50">
            <div className="flex items-center gap-4 mb-4">
               <Layout className="text-purple-600" size={24} />
               <h4 className="text-[14px] font-black uppercase text-slate-900 italic tracking-widest">Habilitación de Módulos Operativos</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <ConfigToggle label="Control Interno" configKey="showInternalControl" color="bg-rose-600" icon={ShieldCheck} description="Bitácora de problemáticas y temas sindicales SITACECYTEN." />
               <ConfigToggle label="Control Escolar" configKey="showControlEscolar" color="bg-indigo-500" icon={Users2} description="Gestión de matrícula, géneros y jefes de grupo." />
               <ConfigToggle label="Planeación IA" configKey="showPlaneacion" color="bg-emerald-500" icon={Edit3} description="Diseño de secuencias pedagógicas MCCEMS." />
               <ConfigToggle label="Bitácora IA" configKey="showBitacora" color="bg-blue-400" icon={Layout} description="Generador de reactivos basados en bitácora." />
            </div>
         </div>

         {/* Gestión de Grupos */}
         <div className="pt-16 border-t border-slate-100 space-y-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h4 className="text-2xl font-black text-slate-900 uppercase italic flex items-center gap-4">
                    <Layers size={32} className="text-blue-600" /> Matrícula Grupal
                  </h4>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Registro manual de unidades académicas</p>
               </div>
               <button onClick={addGroup} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] hover:bg-blue-600 transition-all text-[11px] font-black uppercase shadow-2xl flex items-center gap-4">
                  <Plus size={20} /> Nuevo Grupo
               </button>
            </div>

            {groupedGroups.map(([semester, semesterGroups]) => (
               <div key={semester} className="space-y-10">
                  <div className="semester-divider">
                     <span className="semester-label text-[14px] font-black text-slate-800 uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                        <ChevronRightSquare size={20} className="text-blue-500" />
                        {semester}º Semestre
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                     {semesterGroups.map(g => (
                        <div key={g.id} className="group-card-focus bg-white p-10 rounded-[4rem] border border-slate-200 space-y-8 group relative shadow-sm hover:border-blue-500/30 transition-all overflow-hidden">
                           <div className="flex justify-between items-start">
                              <div className="space-y-6 flex-1">
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Grupo</label>
                                    <input 
                                      type="text" 
                                      value={g.name} 
                                      onChange={e => updateGroup(g.id, { name: e.target.value.toUpperCase() })} 
                                      className="input-focus-mode academic-focus w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-[14px] font-black uppercase text-slate-800 shadow-inner outline-none" 
                                    />
                                 </div>
                                 <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase ml-3">Semestre</label>
                                    <select value={g.semester} onChange={e => updateGroup(g.id, { semester: parseInt(e.target.value) })} className="input-focus-mode w-full bg-slate-50 border border-slate-100 px-6 py-4 rounded-2xl text-[12px] font-black uppercase shadow-inner outline-none">
                                       {[1, 2, 3, 4, 5, 6].map(s => <option key={s} value={s}>{s}º Semestre</option>)}
                                    </select>
                                 </div>
                              </div>
                              <button onClick={() => setGroups(groups.filter(gx => gx.id !== g.id))} className="text-rose-300 hover:text-rose-600 transition-all p-4 bg-rose-50 rounded-2xl ml-6">
                                 <Trash2 size={24}/>
                              </button>
                           </div>
                           <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase text-center w-full block">Varones</label>
                                 <input 
                                  type="number" 
                                  value={g.maleCount} 
                                  onChange={e => updateGroup(g.id, { maleCount: parseInt(e.target.value) || 0 })} 
                                  className="input-focus-mode w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-base font-black text-blue-600 shadow-inner text-center outline-none" 
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-[10px] font-black text-slate-400 uppercase text-center w-full block">Mujeres</label>
                                 <input 
                                  type="number" 
                                  value={g.femaleCount} 
                                  onChange={e => updateGroup(g.id, { femaleCount: parseInt(e.target.value) || 0 })} 
                                  className="input-focus-mode w-full bg-slate-50 border border-slate-100 p-5 rounded-2xl text-base font-black text-rose-600 shadow-inner text-center outline-none" 
                                 />
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </div>

         {/* Autoridades */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-100">
            <div className="space-y-5">
               <label className="text-[12px] font-black text-slate-400 uppercase ml-4">Titular de Dirección</label>
               <input type="text" value={cycle.directorName} onChange={e => setCycle({...cycle, directorName: e.target.value.toUpperCase()})} className="input-focus-mode academic-focus w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-[15px] font-black text-slate-800 shadow-inner outline-none" placeholder="NOMBRE DEL DIRECTOR" />
            </div>
            <div className="space-y-5">
               <label className="text-[12px] font-black text-slate-400 uppercase ml-4">Representante Sindical</label>
               <input type="text" value={cycle.delegadoSindicalName} onChange={e => setCycle({...cycle, delegadoSindicalName: e.target.value.toUpperCase()})} className="input-focus-mode academic-focus w-full px-10 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-[15px] font-black text-slate-800 shadow-inner outline-none" placeholder="NOMBRE DEL DELEGADO" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
