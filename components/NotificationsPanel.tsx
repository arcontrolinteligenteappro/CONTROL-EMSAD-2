
import React, { useState, useMemo } from 'react';
import { AcademicCycle } from '../types';
import { Bell, AlertCircle, Clock, CheckCircle2, X, ChevronRight, Calendar, Info } from 'lucide-react';

interface NotificationsPanelProps {
  cycle: AcademicCycle;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ cycle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const alerts = useMemo(() => {
    const list: any[] = [];
    
    // Alertas de Bitácora
    const pendingLogs = cycle.academicLogs.filter(l => !l.isDelivered).length;
    if (pendingLogs > 0) {
      list.push({
        id: 'logs',
        type: 'danger',
        title: 'Bitácoras Pendientes',
        message: `Hay ${pendingLogs} secuencias didácticas generadas sin registro de entrega.`,
        icon: AlertCircle
      });
    }

    // Alertas de Calendario
    if (cycle.calendarData?.eventos) {
      cycle.calendarData.eventos.slice(0, 2).forEach((e, i) => {
        list.push({
          id: `event-${i}`,
          type: 'info',
          title: 'Evento Próximo',
          message: `${e.nombre} - ${e.fecha}`,
          icon: Calendar
        });
      });
    }

    // Alerta de Ciclo
    list.push({
      id: 'cycle',
      type: 'success',
      title: 'Sistema Activo',
      message: `Ciclo Escolar ${cycle.year} - ${cycle.period} sincronizado.`,
      icon: CheckCircle2
    });

    return list;
  }, [cycle]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative ${isOpen ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
      >
        <Bell size={20} className={alerts.length > 0 ? 'animate-bounce' : ''} />
        {alerts.length > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-rose-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-4 w-96 bg-white border border-slate-200 rounded-[3rem] shadow-2xl z-[110] overflow-hidden animate-in slide-in-from-top-4">
             <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h4 className="text-sm font-black uppercase italic tracking-tighter">Centro de Notificaciones</h4>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl transition-all"><X size={18}/></button>
             </div>
             
             <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide space-y-4">
                {alerts.map(alert => (
                  <div key={alert.id} className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] flex items-start gap-5 ${
                    alert.type === 'danger' ? 'bg-rose-50 border-rose-100' : 
                    alert.type === 'success' ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      alert.type === 'danger' ? 'bg-rose-500 text-white' : 
                      alert.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                       <alert.icon size={20} />
                    </div>
                    <div>
                       <h5 className="text-[11px] font-black uppercase italic text-slate-800 leading-none mb-1.5">{alert.title}</h5>
                       <p className="text-[10px] font-medium text-slate-500 leading-relaxed uppercase opacity-80">{alert.message}</p>
                    </div>
                  </div>
                ))}

                {alerts.length === 0 && (
                  <div className="py-12 text-center opacity-30">
                    <Bell size={40} className="mx-auto mb-3" />
                    <p className="text-[9px] font-black uppercase">Sin alertas nuevas</p>
                  </div>
                )}
             </div>

             <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
                <button className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                   Configurar Recordatorios <ChevronRight size={14}/>
                </button>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsPanel;
