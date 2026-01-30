
import React, { useState, useEffect } from 'react';
import { AppView, Teacher, Subject, Group, AcademicCycle, OptimizationWeights, Note, HistoryEntry, DigitalBook, TrackingEntry } from './types';
import { INITIAL_SUBJECTS, INITIAL_WEIGHTS } from './constants';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TeacherManager from './components/TeacherManager';
import SubjectManager from './components/SubjectManager';
import ConfigPanel from './components/ConfigPanel';
import EcosistemaIA from './components/EcosistemaIA';
import InternalControl from './components/InternalControl';
import NotesManager from './components/NotesManager';
import Assistant from './components/Assistant';
import About from './components/About';
import Branding from './components/Branding';
import HistoryManager from './components/HistoryManager';
import NotificationsPanel from './components/NotificationsPanel';
import FloatingTools from './components/FloatingTools';
import ClassroomManager from './components/ClassroomManager';
import DigitalLibrary from './components/DigitalLibrary';
import WebBrowser from './components/WebBrowser';
import { Globe, Wifi, WifiOff, Menu, Sun, Moon } from 'lucide-react';
import { checkConnectivity, syncDataToDrive } from './cloudService';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.Dashboard);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('arcontrol_theme') === 'dark';
  });
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [groups, setGroups] = useState<Group[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [tracking, setTracking] = useState<TrackingEntry[]>([]); 
  const [weights, setWeights] = useState<OptimizationWeights>(INITIAL_WEIGHTS);
  const [isOnline, setIsOnline] = useState(true);
  const [browserQuery, setBrowserQuery] = useState('');
  
  const [cycle, setCycle] = useState<AcademicCycle>({ 
    year: '2024-2025', 
    period: 'AGO-ENE', 
    academicLogs: [], 
    config: {
      useAIScheduler: true,
      useOfficialCurriculumIA: true,
      useCalendarIA: true,
      useGroupAI: true,
      useGeneralAI: true,
      showInternalControl: true,
      showControlEscolar: true,
      showPlaneacion: true,
      showBitacora: true,
      maxAbsences: 10,
      cloud: { isAuthenticated: false, autoSync: true }
    }
  });

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('arcontrol_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('arcontrol_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const hydrate = (key: string, setter: (val: any) => void) => {
      const saved = localStorage.getItem(key);
      if (saved) setter(JSON.parse(saved));
    };
    hydrate('cecyten_teachers', setTeachers);
    hydrate('cecyten_groups', setGroups);
    hydrate('cecyten_cycle', setCycle);
    hydrate('cecyten_weights', setWeights);
    hydrate('cecyten_notes', setNotes);
    hydrate('cecyten_history', setHistory);
    hydrate('cecyten_books', setBooks);
    hydrate('cecyten_tracking', setTracking);

    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => { window.removeEventListener('online', handleStatus); window.removeEventListener('offline', handleStatus); };
  }, []);

  useEffect(() => {
    if (cycle.config.cloud?.autoSync && cycle.config.cloud?.isAuthenticated && isOnline) {
      const interval = setInterval(() => {
        syncDataToDrive({ teachers, groups, cycle, notes, books, tracking }).then(ts => {
          console.log("Auto-sync completed at " + ts);
        }).catch(e => console.log("Auto-sync deferred (offline)"));
      }, 60000 * 5); 
      return () => clearInterval(interval);
    }
  }, [cycle.config.cloud, isOnline, teachers, groups, notes, books, tracking]);

  const updateNotes = (val: Note[]) => { setNotes(val); localStorage.setItem('cecyten_notes', JSON.stringify(val)); };
  const updateTeachers = (val: Teacher[]) => { setTeachers(val); localStorage.setItem('cecyten_teachers', JSON.stringify(val)); };
  const updateCycle = (val: AcademicCycle) => { setCycle(val); localStorage.setItem('cecyten_cycle', JSON.stringify(val)); };
  const updateGroups = (val: Group[]) => { setGroups(val); localStorage.setItem('cecyten_groups', JSON.stringify(val)); };
  const updateHistory = (val: HistoryEntry[]) => { setHistory(val); localStorage.setItem('cecyten_history', JSON.stringify(val)); };
  const updateBooks = (val: DigitalBook[]) => { setBooks(val); localStorage.setItem('cecyten_books', JSON.stringify(val)); };
  const updateTracking = (val: TrackingEntry[]) => { setTracking(val); localStorage.setItem('cecyten_tracking', JSON.stringify(val)); };

  const handleArchiveCycle = () => {
    if (confirm("¿Está seguro de cerrar el ciclo escolar? Esta acción archivará todas las asistencias, notas y registros académicos actuales.")) {
      const archiveEntry: HistoryEntry = {
        id: Math.random().toString(36).substr(2, 9),
        label: `Ciclo ${cycle.year} - ${cycle.period}`,
        timestamp: new Date().toLocaleString(),
        description: "Cierre automático de ciclo. Datos resguardados.",
        dataSnapshot: {
          teachers: JSON.parse(JSON.stringify(teachers)), 
          groups: JSON.parse(JSON.stringify(groups)),
          cycle: JSON.parse(JSON.stringify(cycle)),
          schedules: JSON.parse(JSON.stringify(schedules)),
          notes: JSON.parse(JSON.stringify(notes))
        }
      };

      const newHistory = [archiveEntry, ...history];
      updateHistory(newHistory);

      const cleanGroups = groups.map(g => ({ ...g, students: [], assignments: [] }));
      const cleanCycle = { ...cycle, academicLogs: [] };
      
      updateGroups(cleanGroups);
      updateCycle(cleanCycle);
      updateNotes([]); 
      updateTracking([]);
      setSchedules([]);

      alert("Ciclo archivado correctamente. Sistema listo para nuevo periodo.");
    }
  };

  const handleQuickSearch = (query: string) => {
    setBrowserQuery(query);
    setActiveView(AppView.Browser);
  };

  const handleViewChange = (view: AppView) => {
    setActiveView(view);
    setIsSidebarOpen(false); 
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'} font-sans overflow-x-hidden`}>
      <Sidebar 
        activeView={activeView} 
        setActiveView={handleViewChange} 
        cycle={cycle} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      <main className={`flex-1 transition-all duration-300 ease-in-out relative min-h-screen flex flex-col lg:ml-[280px] w-full`}>
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-40 no-print">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="p-2.5 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 lg:hidden active:scale-95 transition-transform"
            >
              <Menu size={24} />
            </button>
            <Branding />
          </div>
          
          <div className="flex items-center gap-2 md:gap-5">
            {/* Theme Toggle Button */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all shadow-sm"
              title="Cambiar Tema"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-colors ${isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
               {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
               <span className="hidden lg:inline">{isOnline ? 'CONECTADO' : 'OFFLINE'}</span>
            </div>

            <NotificationsPanel cycle={cycle} />
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800">
              <Globe size={12} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[9px] font-black text-blue-700 dark:text-blue-300 uppercase tracking-widest">EMSaD 16</span>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-8 lg:p-10 max-w-[1920px] mx-auto w-full flex-1">
          <div key={activeView} className="animate-in fade-in slide-in-from-bottom-2 duration-500 h-full">
            {activeView === AppView.Dashboard && (
              <Dashboard teachers={teachers} subjects={subjects} schedules={schedules} groups={groups} cycle={cycle} />
            )}

            {activeView === AppView.EcosistemaIA && (
              <EcosistemaIA 
                teachers={teachers} 
                subjects={subjects} 
                groups={groups} 
                cycle={cycle} 
                schedules={schedules}
                setSchedules={setSchedules}
                weights={weights}
                onAddLog={(log) => setCycle({...cycle, academicLogs: [...cycle.academicLogs, log]})} 
              />
            )}

            {activeView === AppView.Classroom && (
              <ClassroomManager 
                groups={groups} 
                setGroups={updateGroups} 
                config={cycle.config}
                teachers={teachers} 
              />
            )}

            {activeView === AppView.Notas && (
              <NotesManager notes={notes} setNotes={updateNotes} />
            )}

            {activeView === AppView.Library && (
              <DigitalLibrary books={books} setBooks={updateBooks} subjects={subjects} />
            )}

            {activeView === AppView.Browser && (
              <WebBrowser 
                initialQuery={browserQuery} 
                onClearQuery={() => setBrowserQuery('')}
              />
            )}

            {activeView === AppView.Personal && (
              <TeacherManager teachers={teachers} setTeachers={updateTeachers} subjects={subjects} />
            )}

            {activeView === AppView.Materias && (
              <SubjectManager subjects={subjects} setSubjects={(v) => { setSubjects(v); localStorage.setItem('cecyten_subjects', JSON.stringify(v)); }} cycle={cycle} groups={groups} />
            )}

            {activeView === AppView.InternalControl && (
              <InternalControl 
                entries={tracking} 
                setEntries={updateTracking}
                teachers={teachers}
                groups={groups}
              />
            )}

            {activeView === AppView.Config && (
              <ConfigPanel 
                groups={groups} 
                setGroups={updateGroups} 
                cycle={cycle} 
                setCycle={updateCycle} 
                weights={weights} 
                setWeights={(v) => { setWeights(v); localStorage.setItem('cecyten_weights', JSON.stringify(v)); }}
                onArchiveCycle={handleArchiveCycle}
              />
            )}

            {activeView === AppView.About && <About />}
            {activeView === AppView.History && <HistoryManager history={history} setSchedules={setSchedules} setActiveView={handleViewChange} deleteEntry={(id) => updateHistory(history.filter(h => h.id !== id))} />}
          </div>
        </div>
        
        <FloatingTools onQuickSearch={handleQuickSearch} />
      </main>
    </div>
  );
};

export default App;
