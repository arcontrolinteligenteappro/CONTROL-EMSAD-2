
import React, { useState, useMemo } from 'react';
import { Teacher, Subject, ScheduleData, Group, AcademicCycle } from '../types';
import { 
  BookOpen, 
  CalendarRange, 
  ShieldCheck, 
  ArrowUpRight, 
  Activity, 
  Users, 
  GraduationCap, 
  Search, 
  X, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Clock, 
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface DashboardProps {
  teachers: Teacher[];
  subjects: Subject[];
  schedules: ScheduleData[];
  groups: Group[];
  cycle: AcademicCycle;
}

const Dashboard: React.FC<DashboardProps> = ({ teachers, subjects, schedules, groups, cycle }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    return {
      personal: teachers.filter(t => t.name.toLowerCase().includes(q) || t.alias?.toLowerCase().includes(q)),
      materias: subjects.filter(s => s.name.toLowerCase().includes(q)),
      grupos: groups.filter(g => g.name.toLowerCase().includes(q)),
      eventos: (cycle.config.useCalendarIA && cycle.calendarData?.eventos.filter(e => e.nombre.toLowerCase().includes(q))) || []
    };
  }, [searchQuery, teachers, subjects, groups, cycle]);

  const hasResults = searchResults && (
    searchResults.personal.length > 0 || 
    searchResults.materias.length > 0 || 
    searchResults.grupos.length > 0 || 
    searchResults.eventos.length > 0
  );

  const stats = [
    { label: 'Personal', val: teachers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Materias', val: subjects.length, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Grupos', val: groups.length, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Horarios', val: schedules.length, icon: CalendarRange, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* Barra de Búsqueda Adaptativa */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl p-4 rounded-3xl border border-slate-200 dark:border-slate-800 sticky top-0 z-[50] no-print shadow-sm transition-all">
         <div className="flex items-center gap-4 px-2">
            <div className="w-12 h-12 bg-slate-900 dark:bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
              <Activity size={22} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-black text-slate-900 dark:text-white uppercase italic leading-none tracking-tighter truncate">CECyTEN EMSaD 16</h1>
              <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Status Operativo • Ciclo {cycle.year}</p>
            </div>
         </div>
         
         <div className="relative w-full lg:max-w-xl">
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-3.5 flex items-center gap-3 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="BUSCAR EXPEDIENTES, GRUPOS O DOCENTES..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-xs font-black uppercase tracking-wider placeholder:text-slate-400 text-slate-800 dark:text-white"
              />
              {searchQuery && <button onClick={() => setSearchQuery('')} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={14} className="text-slate-400" /></button>}
            </div>

            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[60vh] overflow-y-auto animate-in zoom-in-95 scrollbar-hide z-[110]">
                {!hasResults ? (
                  <div className="text-center py-8">
                    <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest italic">Sin coincidencias en la matriz</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {searchResults.personal.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] border-b dark:border-slate-800 pb-2">Resultados de Personal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {searchResults.personal.map(t => (
                            <div key={t.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent hover:border-blue-500/30 cursor-pointer transition-all">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-sm" style={{backgroundColor: t.color}}>{t.alias?.substring(0,2) || 'SN'}</div>
                              <div className="min-w-0">
                                <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase truncate">{t.name}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">{t.role}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
         </div>
      </div>

      {/* Hero Welcome Tablet Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 md:p-10 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 dark:bg-blue-600/5 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110"></div>
          <div className="space-y-5 relative z-10 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tighter uppercase italic leading-none">ARCONTROL EMSaD 16</h2>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-500 dark:text-slate-400 rounded-full uppercase tracking-widest">Nayarit, México</span>
              <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-[10px] font-black text-blue-600 dark:text-blue-400 rounded-full uppercase tracking-widest">Motor IA V5.0</span>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-center gap-2 p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 relative z-10 shadow-inner">
             <Activity className="text-blue-600 dark:text-blue-400 animate-pulse" size={28} />
             <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-tighter">Sincronización Live</span>
          </div>
        </div>

        <div className="bg-slate-900 dark:bg-blue-600 p-8 md:p-10 rounded-[3rem] shadow-xl text-white flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
            <ShieldCheck size={180} />
          </div>
          <div className="relative z-10 flex justify-between items-start">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg backdrop-blur-md border border-white/5">
              <Briefcase size={28} />
            </div>
            <ArrowUpRight size={24} className="opacity-40" />
          </div>
          <div className="relative z-10 mt-8">
            <div className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mb-1">Módulo Central</div>
            <div className="text-2xl font-black italic tracking-tight uppercase leading-none">Bitácora Digital</div>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas - Fluid Column para Tablets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-5 hover:shadow-xl hover:-translate-y-1 transition-all border-b-4 border-slate-100 dark:border-slate-800" style={{borderBottomColor: 'currentColor'}}>
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}>
              <stat.icon size={28} />
            </div>
            <div className="text-center md:text-left">
              <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-2">{stat.label}</div>
              <div className="text-3xl font-black text-slate-800 dark:text-white leading-none tabular-nums">{stat.val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-blue-500/40 transition-all cursor-pointer">
           <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
             <CalendarRange size={32} />
           </div>
           <div>
              <p className="text-[13px] font-black text-slate-800 dark:text-white uppercase italic leading-none">Planes de Estudio</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Currícula Nayarit</p>
           </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-emerald-500/40 transition-all cursor-pointer">
           <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
             <MapPin size={32} />
           </div>
           <div>
              <p className="text-[13px] font-black text-slate-800 dark:text-white uppercase italic leading-none">Ubicación Plantel</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Tecuala • Macho</p>
           </div>
        </div>

        {cycle.config.showInternalControl && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm flex items-center gap-6 group hover:border-amber-500/40 transition-all cursor-pointer">
             <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
               <ShieldAlert size={32} />
             </div>
             <div>
                <p className="text-[13px] font-black text-slate-800 dark:text-white uppercase italic leading-none">Representación</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Delegación Sindical</p>
             </div>
          </div>
        )}
      </div>
      
      {/* Timeline con Soporte Dark Mode */}
      {cycle.config.useCalendarIA && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 dark:opacity-10 text-blue-500"><Calendar size={180} /></div>
           <div className="flex justify-between items-center mb-10 relative z-10">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-3">
                 <Clock size={20} className="text-blue-600 dark:text-blue-400" /> Agenda Escolar Integrada
              </h3>
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em]">IA Sincronizada</span>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {cycle.calendarData?.eventos.slice(0, 4).map(e => (
                 <div key={e.id} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/20 transition-all shadow-sm">
                    <div className="flex items-center gap-5">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[11px] font-black text-white shadow-lg ${e.tipo === 'ESTATAL_TEPIC' ? 'bg-rose-600' : 'bg-slate-700 dark:bg-blue-600'}`}>
                          {e.tipo === 'ESTATAL_TEPIC' ? 'TEP' : 'CTE'}
                       </div>
                       <div>
                          <p className="text-[11px] font-black text-slate-800 dark:text-white uppercase italic leading-none truncate max-w-[200px]">{e.nombre}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-2">{e.fecha}</p>
                       </div>
                    </div>
                    {e.asistio && <CheckCircle2 size={22} className="text-emerald-500" />}
                 </div>
              )) || (
                 <div className="col-span-2 py-20 text-center text-[12px] font-black text-slate-300 dark:text-slate-800 uppercase italic tracking-[0.4em]">Sin registros próximos</div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
