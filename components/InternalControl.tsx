
import React, { useState } from 'react';
import { TrackingEntry, Teacher, Group, AppView } from '../types';
import { ShieldCheck, Plus, Trash2, CheckCircle2, AlertTriangle, User, Users, Clock, Filter, Search, MessageSquare, ShieldAlert } from 'lucide-react';

interface InternalControlProps {
  entries: TrackingEntry[];
  setEntries: (entries: TrackingEntry[]) => void;
  teachers: Teacher[];
  groups: Group[];
}

const InternalControl: React.FC<InternalControlProps> = ({ entries, setEntries, teachers, groups }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TrackingEntry>>({
    titulo: '', descripcion: '', categoria: 'ACADEMICA', prioridad: 'MEDIA', fecha: new Date().toISOString().split('T')[0], estado: 'PENDIENTE'
  });

  const handleAdd = () => {
    if (newEntry.titulo) {
      const entry: TrackingEntry = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        titulo: newEntry.titulo as string,
        descripcion: newEntry.descripcion || '',
        categoria: newEntry.categoria as any,
        prioridad: newEntry.prioridad as any,
        fecha: newEntry.fecha || new Date().toISOString().split('T')[0],
        estado: 'PENDIENTE',
        vinculoId: newEntry.vinculoId
      };
      setEntries([entry, ...entries]);
      setIsAdding(false);
      setNewEntry({ titulo: '', descripcion: '', categoria: 'ACADEMICA', prioridad: 'MEDIA', fecha: new Date().toISOString().split('T')[0], estado: 'PENDIENTE' });
    }
  };

  const getVinculoName = (id?: string) => {
    if (!id) return 'General';
    const teacher = teachers.find(t => t.id === id);
    if (teacher) return `Personal: ${teacher.name}`;
    const group = groups.find(g => g.id === id);
    if (group) return `Grupo: ${group.name}`;
    return 'Desconocido';
  };

  const updateStatus = (id: string, nextStatus: TrackingEntry['estado']) => {
    setEntries(entries.map(e => e.id === id ? { ...e, estado: nextStatus } : e));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-100">
            <ShieldCheck size={30} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter leading-none">Seguimiento y Control Interno</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Bitácora de Problemáticas y Temas Sindicales</p>
          </div>
        </div>
        <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus size={16} /> Nueva Entrada
        </button>
      </div>

      {isAdding && (
        <div className="bg-white border-2 border-blue-500/20 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Título de la Incidencia</label>
              <input type="text" value={newEntry.titulo} onChange={e => setNewEntry({...newEntry, titulo: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500" placeholder="EJ: FALTA DOCENTE / ACUERDO SINDICAL" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Categoría</label>
              <select value={newEntry.categoria} onChange={e => setNewEntry({...newEntry, categoria: e.target.value as any})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none">
                <option value="ACADEMICA">ACADÉMICA</option>
                <option value="SINDICAL">SINDICAL (SITACECYTEN)</option>
                <option value="PERSONAL">DE PERSONAL</option>
                <option value="INFRAESTRUCTURA">INFRAESTRUCTURA</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Vinculado a (Opcional)</label>
              <select value={newEntry.vinculoId} onChange={e => setNewEntry({...newEntry, vinculoId: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none">
                <option value="">GENERAL / PLANTEL</option>
                <optgroup label="Personal">
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} {t.isUnionLead ? '(Delegado)' : ''}</option>)}
                </optgroup>
                <optgroup label="Grupos">
                  {groups.map(g => <option key={g.id} value={g.id}>GRUPO {g.name}</option>)}
                </optgroup>
              </select>
            </div>
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Descripción del Tema / Problemática</label>
              <textarea rows={4} value={newEntry.descripcion} onChange={e => setNewEntry({...newEntry, descripcion: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[2rem] text-xs font-bold outline-none focus:border-blue-500 resize-none" placeholder="Escriba los detalles del seguimiento..." />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Cancelar</button>
            <button onClick={handleAdd} className="px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl">Guardar Bitácora</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm group hover:border-blue-500/20 transition-all">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  entry.categoria === 'SINDICAL' ? 'bg-emerald-50 text-emerald-600' :
                  entry.categoria === 'ACADEMICA' ? 'bg-blue-50 text-blue-600' :
                  entry.categoria === 'PERSONAL' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                }`}>
                  {entry.categoria === 'SINDICAL' ? <ShieldAlert size={24}/> : <MessageSquare size={24}/>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-sm font-black text-slate-900 uppercase italic leading-none">{entry.titulo}</h4>
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${entry.estado === 'RESUELTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {entry.estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2">
                    <div className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/><span className="text-[9px] font-black text-slate-400 uppercase">{entry.fecha}</span></div>
                    <div className="flex items-center gap-1.5"><User size={12} className="text-slate-400"/><span className="text-[9px] font-black text-slate-500 uppercase">{getVinculoName(entry.vinculoId)}</span></div>
                    <div className="flex items-center gap-1.5"><Filter size={12} className="text-slate-400"/><span className="text-[9px] font-black text-slate-500 uppercase">{entry.categoria}</span></div>
                  </div>
                  <p className="mt-3 text-[11px] font-bold text-slate-500 leading-relaxed uppercase opacity-80">{entry.descripcion}</p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                {entry.estado !== 'RESUELTO' && (
                  <button onClick={() => updateStatus(entry.id, 'RESUELTO')} className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><CheckCircle2 size={18}/></button>
                )}
                <button onClick={() => setEntries(entries.filter(e => e.id !== entry.id))} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 p-32 rounded-[4rem] text-center opacity-30">
          <ShieldCheck size={64} className="mx-auto mb-4" />
          <p className="text-xs font-black uppercase tracking-[0.4em]">Bitácora Limpia</p>
        </div>
      )}
    </div>
  );
};

export default InternalControl;
