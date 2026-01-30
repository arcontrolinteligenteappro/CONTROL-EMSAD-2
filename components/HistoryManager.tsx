
import React from 'react';
import { HistoryEntry, AppView, ScheduleData } from '../types';
import { Clock, ExternalLink, Trash2, Calendar, Cpu, CheckCircle2 } from 'lucide-react';

interface HistoryManagerProps {
  history: HistoryEntry[];
  setSchedules: (schedules: ScheduleData[]) => void;
  setActiveView: (view: AppView) => void;
  deleteEntry: (id: string) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ history, setSchedules, setActiveView, deleteEntry }) => {
  const loadHistory = (entry: HistoryEntry) => {
    setSchedules(entry.dataSnapshot.schedules);
    // Fix: AppView.Horarios does not exist; using AppView.EcosistemaIA which hosts the schedule generator
    setActiveView(AppView.EcosistemaIA);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-l-4 border-blue-500 pl-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 italic tracking-tighter uppercase flex items-center gap-4">
            <Clock className="text-blue-500" size={40} />
            ARCHIVO DE NODOS
          </h2>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.3em] font-black mt-2">
            Registro histórico de optimización ARCONTROL v4.0.2
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {history.length > 0 ? (
          history.map((entry) => (
            <div key={entry.id} className="group bg-white p-10 rounded-[3.5rem] border border-slate-200 hover:border-blue-500/30 transition-all hover:-translate-y-2 relative overflow-hidden shadow-sm">
              <div className="absolute -top-10 -right-10 opacity-[0.02] group-hover:opacity-10 transition-all duration-700">
                <Cpu size={150} />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-center">
                  <CheckCircle2 className="text-emerald-500" size={24} />
                  <span className="text-[10px] font-mono text-slate-400 font-black">ID: {entry.id}</span>
                </div>

                <div>
                  <h4 className="text-slate-900 font-black text-xl italic uppercase tracking-tighter truncate">{entry.label}</h4>
                  <div className="flex items-center gap-2 text-blue-500/60 mt-2">
                    <Calendar size={12} />
                    <p className="text-[10px] font-mono font-black uppercase tracking-widest">{entry.timestamp}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    onClick={() => loadHistory(entry)}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                  >
                    <ExternalLink size={14} /> RESTAURAR
                  </button>
                  <button 
                    onClick={() => deleteEntry(entry.id)}
                    className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-200 rounded-[4rem]">
            <Clock className="mx-auto text-slate-200 mb-6" size={64} />
            <p className="text-slate-400 font-mono text-sm uppercase tracking-[0.4em] font-black italic">No se han registrado despliegues.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryManager;
