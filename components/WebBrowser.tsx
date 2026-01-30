
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, RefreshCcw, Star, MoreVertical, Plus, X, 
  Search, Globe, ShieldCheck, Download, HardDrive, MessageSquare, 
  Maximize2, Minimize2, Send, Bot, Sparkles, Loader2, ExternalLink,
  Wifi, Activity, Lock
} from 'lucide-react';
import { getInteractiveResponse } from '../geminiService';

interface Tab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

interface WebBrowserProps {
  initialQuery?: string;
  onClearQuery?: () => void;
}

const WebBrowser: React.FC<WebBrowserProps> = ({ initialQuery, onClearQuery }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: '1', title: 'Google', url: 'https://www.google.com/webhp?igu=1', favicon: 'https://www.google.com/favicon.ico' },
    { id: '2', title: 'CECyTEN Oficial', url: 'https://cecyten.nayarit.gob.mx/', favicon: '' }
  ]);
  const [activeTabId, setActiveTabId] = useState('1');
  const [urlInput, setUrlInput] = useState(tabs[0].url);
  const [showAiSidebar, setShowAiSidebar] = useState(true);
  const [aiQuery, setAiQuery] = useState('');
  const [aiHistory, setAiHistory] = useState<{role: 'user'|'ia', text: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [deviceIp, setDeviceIp] = useState<string>('Obteniendo IP...');
  const [isBridgeActive, setIsBridgeActive] = useState(false); // Proxy Mode
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Fetch Device IP on Mount
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setDeviceIp(data.ip);
      } catch (error) {
        setDeviceIp('Conexión Local');
      }
    };
    fetchIp();
  }, []);

  useEffect(() => {
    if (initialQuery && initialQuery.trim() !== '') {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(initialQuery)}&igu=1`;
      const newId = Math.random().toString();
      const newTab = { id: newId, title: initialQuery, url: searchUrl, favicon: 'https://www.google.com/favicon.ico' };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newId);
      setUrlInput(searchUrl);
      
      // Consume the query to prevent reopening on re-render
      if (onClearQuery) {
        onClearQuery();
      }
    }
  }, [initialQuery, onClearQuery]);

  // Update URL input when tab changes
  useEffect(() => {
    if (activeTab) {
      // If bridge is active, show the clean URL not the proxy one if possible, 
      // but for simplicity we show what's in the state.
      // We strip the proxy prefix for display if it exists
      const displayUrl = activeTab.url.replace('https://corsproxy.io/?', '');
      setUrlInput(displayUrl);
    }
  }, [activeTabId, activeTab]);

  const getProcessedUrl = (url: string) => {
    if (isBridgeActive) {
      // Use a CORS proxy to allow embedding of some external sites
      // Note: This is a public proxy example. 
      if (url.includes('corsproxy.io')) return url;
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }
    return url;
  };

  const handleNavigate = (e?: React.FormEvent) => {
    e?.preventDefault();
    let target = urlInput;
    if (!target.startsWith('http')) {
      if (target.includes('.') && !target.includes(' ')) {
         target = `https://${target}`;
      } else {
         target = `https://www.google.com/search?q=${encodeURIComponent(target)}&igu=1`;
      }
    }
    
    const updatedTabs = tabs.map(t => t.id === activeTabId ? { ...t, url: target, title: target } : t);
    setTabs(updatedTabs);
  };

  const addTab = () => {
    const newId = Math.random().toString();
    const newTab = { id: newId, title: 'Nueva Pestaña', url: 'https://www.google.com/webhp?igu=1' };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
    setUrlInput(newTab.url);
  };

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
      setUrlInput(newTabs[newTabs.length - 1].url);
    }
  };

  const toggleBridge = () => {
    setIsBridgeActive(!isBridgeActive);
    // Refresh current tab
    if (iframeRef.current) {
       setTimeout(() => {
          if (iframeRef.current) iframeRef.current.src = getProcessedUrl(activeTab.url);
       }, 100);
    }
  };

  const askAi = async () => {
    if (!aiQuery.trim()) return;
    const newHist = [...aiHistory, { role: 'user' as const, text: aiQuery }];
    setAiHistory(newHist);
    setAiQuery('');
    setIsAiLoading(true);

    const context = `El usuario está navegando en: ${activeTab.url}. IP Dispositivo: ${deviceIp}. Actúa como un copiloto de navegación web educativa.`;
    const response = await getInteractiveResponse(aiQuery, context);
    
    setAiHistory([...newHist, { role: 'ia' as const, text: response }]);
    setIsAiLoading(false);
  };

  return (
    <div className="flex h-[85vh] bg-[#dfe1e5] rounded-[1rem] overflow-hidden shadow-2xl border border-slate-400 no-print flex-col animate-in fade-in zoom-in-95 duration-500">
      
      {/* Title Bar / Tabs */}
      <div className="flex pt-2 px-2 gap-1 bg-[#dfe1e5] border-b border-slate-300 overflow-x-auto scrollbar-hide">
        {tabs.map(tab => (
          <div 
            key={tab.id}
            onClick={() => { setActiveTabId(tab.id); setUrlInput(tab.url); }}
            className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl max-w-[200px] min-w-[120px] text-xs font-medium cursor-pointer transition-all ${activeTabId === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'bg-transparent text-slate-600 hover:bg-white/40'}`}
          >
            {tab.favicon && <img src={tab.favicon} className="w-3 h-3 opacity-70" alt="" onError={(e) => e.currentTarget.style.display = 'none'}/>}
            <span className="truncate flex-1">{tab.title}</span>
            <button onClick={(e) => closeTab(tab.id, e)} className="opacity-0 group-hover:opacity-100 hover:bg-slate-200 p-0.5 rounded-full"><X size={10}/></button>
            {activeTabId === tab.id && (
               <div className="absolute bottom-0 left-0 right-0 h-1 bg-white z-10 w-full"></div>
            )}
          </div>
        ))}
        <button onClick={addTab} className="p-2 hover:bg-slate-300 rounded-full text-slate-600"><Plus size={16}/></button>
      </div>

      {/* Navigation Toolbar */}
      <div className="bg-white px-2 py-2 flex items-center gap-2 border-b border-slate-200 shadow-sm z-20">
         <div className="flex gap-1 text-slate-500">
            <button className="p-1.5 hover:bg-slate-100 rounded-full"><ArrowLeft size={16}/></button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full"><ArrowRight size={16}/></button>
            <button onClick={() => { if(iframeRef.current) iframeRef.current.src = getProcessedUrl(activeTab.url); }} className="p-1.5 hover:bg-slate-100 rounded-full"><RefreshCcw size={14}/></button>
         </div>

         <form onSubmit={handleNavigate} className="flex-1">
            <div className={`bg-slate-100 rounded-full px-4 py-1.5 flex items-center gap-3 border transition-all ${isBridgeActive ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 focus-within:bg-white focus-within:shadow focus-within:border-blue-300'}`}>
               {isBridgeActive ? <Activity size={12} className="text-emerald-500 animate-pulse"/> : <Globe size={12} className="text-slate-400"/>}
               <input 
                  className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-slate-700 placeholder:text-slate-400"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onFocus={(e) => e.target.select()}
               />
               <button type="button" className="p-1 hover:bg-slate-200 rounded-full"><Star size={12} className="text-slate-400"/></button>
            </div>
         </form>

         <div className="flex items-center gap-2 border-l border-slate-200 pl-2">
            <button 
               onClick={toggleBridge} 
               className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${isBridgeActive ? 'bg-emerald-100 text-emerald-700' : 'hover:bg-slate-100 text-slate-500'}`} 
               title={isBridgeActive ? "Puente IP Activo" : "Activar Puente IP"}
            >
               <Globe size={16}/>
               {isBridgeActive && <span className="text-[9px] font-black uppercase hidden sm:inline">Puente</span>}
            </button>
            
            <button onClick={() => setShowAiSidebar(!showAiSidebar)} className={`p-1.5 rounded-lg transition-all ${showAiSidebar ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 text-slate-500'}`} title="Panel IA">
               <Bot size={18}/>
            </button>
            <button className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500"><MoreVertical size={16}/></button>
         </div>
      </div>

      {/* Bookmarks Bar & IP Status */}
      <div className="bg-white px-4 py-1.5 flex justify-between items-center border-b border-slate-100 overflow-hidden">
         <div className="flex gap-4 text-[10px] font-medium text-slate-600 overflow-x-auto scrollbar-hide">
            <button className="flex items-center gap-1 hover:bg-slate-100 px-2 py-0.5 rounded-md"><HardDrive size={12}/> Drive</button>
            <button className="flex items-center gap-1 hover:bg-slate-100 px-2 py-0.5 rounded-md"><Globe size={12}/> CECyTEN</button>
            <button className="flex items-center gap-1 hover:bg-slate-100 px-2 py-0.5 rounded-md"><Search size={12}/> Scholar</button>
         </div>
         
         <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400">
               <Wifi size={10} className={deviceIp.includes('...') ? 'animate-pulse text-amber-500' : 'text-emerald-500'}/>
               <span>IP: {deviceIp}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-slate-400 hidden sm:flex">
               <Lock size={10} />
               <span>SSL Seguro</span>
            </div>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden bg-white">
         <div className="flex-1 relative bg-white group">
            <iframe 
               ref={iframeRef}
               src={getProcessedUrl(activeTab.url)} 
               className="w-full h-full border-none"
               sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
               title="browser-frame"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            />
            
            {/* Overlay for sites that refuse connection (Simulated/Fallback) */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity z-0 hover:pointer-events-auto transition-delay-500">
               <Globe size={40} className="text-slate-300 mb-3"/>
               <span className="text-xs font-black text-slate-400 uppercase mb-4">Visualización en Puente</span>
               <div className="flex gap-3 pointer-events-auto">
                  <a href={activeTab.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all">
                     <ExternalLink size={14}/> Abrir Pestaña Externa
                  </a>
                  <button onClick={toggleBridge} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg border transition-all ${isBridgeActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                     <Activity size={14}/> {isBridgeActive ? 'Desactivar Proxy' : 'Forzar Proxy'}
                  </button>
               </div>
            </div>
         </div>

         {/* AI Sidebar */}
         {showAiSidebar && (
            <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-xl z-30 animate-in slide-in-from-right">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h4 className="text-xs font-black uppercase text-indigo-600 flex items-center gap-2"><Sparkles size={14}/> Copiloto IA</h4>
                  <button onClick={() => setShowAiSidebar(false)}><X size={14} className="text-slate-400 hover:text-rose-500"/></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                  {aiHistory.length === 0 && (
                     <div className="text-center mt-10 opacity-50">
                        <MessageSquare size={40} className="mx-auto text-indigo-300 mb-2"/>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Haz preguntas sobre la página</p>
                     </div>
                  )}
                  {aiHistory.map((msg, i) => (
                     <div key={i} className={`p-3 rounded-2xl text-xs font-medium ${msg.role === 'user' ? 'bg-white border border-slate-100 ml-4' : 'bg-indigo-600 text-white mr-4'}`}>
                        {msg.text}
                     </div>
                  ))}
                  {isAiLoading && <div className="flex justify-center"><Loader2 size={20} className="animate-spin text-indigo-400"/></div>}
               </div>

               <div className="p-3 border-t border-slate-100 bg-white">
                  <div className="relative">
                     <input 
                        type="text" 
                        value={aiQuery} 
                        onChange={e => setAiQuery(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && askAi()}
                        placeholder="Preguntar a la IA..." 
                        className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
                     />
                     <button onClick={askAi} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all"><Send size={12}/></button>
                  </div>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};

export default WebBrowser;
