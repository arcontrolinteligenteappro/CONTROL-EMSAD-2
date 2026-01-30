
import React, { useState, useRef, useEffect } from 'react';
import { Note, Attachment } from '../types';
import { 
  StickyNote, 
  Plus, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Camera, 
  Star, 
  Trash2, 
  X, 
  Search, 
  Clock, 
  Download,
  Share2,
  FileText,
  Paperclip,
  File,
  Video,
  Music
} from 'lucide-react';

interface NotesManagerProps {
  notes: Note[];
  setNotes: (notes: Note[]) => void;
}

const NOTE_COLORS = [
  'bg-white',
  'bg-yellow-50',
  'bg-blue-50',
  'bg-emerald-50',
  'bg-rose-50',
  'bg-indigo-50',
  'bg-slate-900 text-white'
];

const NotesManager: React.FC<NotesManagerProps> = ({ notes, setNotes }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '', content: '', color: 'bg-white', isFavorite: false, attachments: []
  });
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'es-MX';
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewNote(prev => ({ ...prev, content: (prev.content || '') + ' ' + transcript }));
        setIsListening(false);
      };
    }
  }, []);

  const toggleMic = () => {
    if (isListening) recognitionRef.current.stop();
    else { setIsListening(true); recognitionRef.current.start(); }
  };

  const handleSave = () => {
    if (newNote.content || (newNote.attachments && newNote.attachments.length > 0)) {
      const note: Note = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        title: (newNote.title || 'NOTA RÁPIDA').toUpperCase(),
        content: newNote.content || '',
        color: newNote.color || 'bg-white',
        isFavorite: newNote.isFavorite || false,
        attachments: newNote.attachments || [],
        createdAt: new Date().toLocaleString()
      };
      setNotes([note, ...notes]);
      setIsAdding(false);
      setNewNote({ title: '', content: '', color: 'bg-white', isFavorite: false, attachments: [] });
    }
  };

  const toggleFavorite = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isFavorite: !n.isFavorite } : n));
  };

  const deleteNote = (id: string) => {
    if (confirm('¿Eliminar esta nota y sus archivos adjuntos?')) setNotes(notes.filter(n => n.id !== id));
  };

  // Fixed handleFileUpload by explicitly typing 'file' to avoid 'unknown' errors
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const attachment: Attachment = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: ev.target?.result as string
          };
          setNewNote(prev => ({ ...prev, attachments: [...(prev.attachments || []), attachment] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) return <ImageIcon size={14}/>;
    if (type.includes('pdf')) return <FileText size={14}/>;
    if (type.includes('video')) return <Video size={14}/>;
    if (type.includes('audio')) return <Music size={14}/>;
    return <File size={14}/>;
  };

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 no-print">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
               <StickyNote size={24} />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase italic leading-none">Bóveda Digital</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Resguardo de Archivos y Notas</p>
            </div>
         </div>
         <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
               <input 
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="BUSCAR EN LA BÓVEDA..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-500 shadow-inner"
               />
            </div>
            <button onClick={() => setIsAdding(true)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg flex items-center gap-3">
               <Plus size={18} /> Nueva Entrada
            </button>
         </div>
      </div>

      {isAdding && (
        <div className="bg-white border-2 border-blue-500/20 p-10 rounded-[4rem] shadow-2xl animate-in zoom-in-95 space-y-8">
           <div className="flex justify-between items-center border-b border-slate-100 pb-6">
              <h4 className="text-xl font-black text-slate-900 uppercase italic">Crear Entrada en Bóveda</h4>
              <button onClick={() => setIsAdding(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-all"><X size={24} /></button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <div className="md:col-span-8 space-y-6">
                 <input 
                  type="text" 
                  value={newNote.title} 
                  onChange={e => setNewNote({...newNote, title: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-[2rem] text-sm font-black uppercase outline-none focus:border-blue-500" 
                  placeholder="TÍTULO O REFERENCIA..." 
                 />
                 <div className="relative">
                    <textarea 
                      value={newNote.content} 
                      onChange={e => setNewNote({...newNote, content: e.target.value})}
                      className="w-full h-48 px-8 py-6 bg-slate-50 border border-slate-200 rounded-[2.5rem] text-sm font-medium outline-none focus:border-blue-500 resize-none shadow-inner" 
                      placeholder="DESCRIPCIÓN DE LOS ARCHIVOS O NOTA DE VOZ..." 
                    />
                    <button 
                      onClick={toggleMic}
                      className={`absolute bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-xl' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                       {isListening ? <MicOff size={24}/> : <Mic size={24}/>}
                    </button>
                 </div>
              </div>
              <div className="md:col-span-4 space-y-6">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Archivos Adjuntos</label>
                    
                    <label className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[2rem] cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all text-slate-400 hover:text-blue-600 group">
                       <Paperclip size={28} className="group-hover:scale-110 transition-transform"/>
                       <span className="text-[8px] font-black uppercase mt-3 text-center">Adjuntar Cualquier Archivo<br/>(PDF, DOC, JPG, ZIP)</span>
                       <input type="file" multiple onChange={handleFileUpload} className="hidden" />
                    </label>

                    {newNote.attachments && newNote.attachments.length > 0 && (
                       <div className="space-y-2 max-h-40 overflow-y-auto pr-2 scrollbar-hide">
                          {newNote.attachments.map((file, idx) => (
                             <div key={idx} className="flex items-center justify-between p-3 bg-slate-100 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-3 overflow-hidden">
                                   <div className="bg-white p-2 rounded-lg text-blue-600">
                                      {getFileIcon(file.type)}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[9px] font-bold text-slate-700 truncate uppercase">{file.name}</p>
                                      <p className="text-[8px] text-slate-400 font-bold">{(file.size / 1024).toFixed(1)} KB</p>
                                   </div>
                                </div>
                                <button onClick={() => setNewNote(prev => ({...prev, attachments: prev.attachments?.filter((_, i) => i !== idx)}))} className="text-rose-400 hover:text-rose-600"><X size={14}/></button>
                             </div>
                          ))}
                       </div>
                    )}
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Etiqueta de Color</label>
                    <div className="flex flex-wrap gap-2">
                       {NOTE_COLORS.map(c => (
                         <button key={c} onClick={() => setNewNote({...newNote, color: c})} className={`w-8 h-8 rounded-full border-2 transition-all ${newNote.color === c ? 'border-blue-600 scale-110' : 'border-slate-200'} ${c.split(' ')[0]}`} />
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 flex justify-end gap-4">
              <button onClick={() => setIsAdding(false)} className="px-8 py-4 text-[11px] font-black text-slate-400 uppercase">Descartar</button>
              <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-blue-600 transition-all">Guardar en Bóveda</button>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredNotes.map(note => (
           <div 
            key={note.id} 
            className={`${note.color} p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col h-[350px] relative group hover:shadow-2xl transition-all hover:-translate-y-2`}
           >
              <div className="flex justify-between items-start mb-6">
                 <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm"><StickyNote size={18}/></div>
                 <div className="flex gap-2">
                    <button onClick={() => toggleFavorite(note.id)} className={`p-2 transition-all ${note.isFavorite ? 'text-amber-500 scale-125' : 'text-slate-300 hover:text-amber-500 opacity-0 group-hover:opacity-100'}`}>
                       <Star size={18} fill={note.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => deleteNote(note.id)} className="p-2 text-rose-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100">
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>
              
              <div className="flex-1 space-y-4 min-w-0 flex flex-col">
                 <h4 className="text-sm font-black uppercase italic leading-tight truncate">{note.title}</h4>
                 <div className="text-[12px] font-medium leading-relaxed opacity-80 overflow-y-auto max-h-[80px] scrollbar-hide">
                    {note.content || 'Sin descripción...'}
                 </div>
                 
                 {/* Attachment Preview Area */}
                 <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 mt-2">
                    {note.attachments && note.attachments.map((att, i) => (
                       <div key={i} className="flex items-center gap-3 p-2 bg-white/40 rounded-xl border border-black/5">
                          <div className="text-slate-600">{getFileIcon(att.type)}</div>
                          <div className="min-w-0 flex-1">
                             <p className="text-[8px] font-bold uppercase truncate">{att.name}</p>
                          </div>
                          <a href={att.data} download={att.name} className="p-1 hover:bg-white rounded text-blue-600"><Download size={12}/></a>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                 <div className="flex items-center gap-2 text-[8px] font-black opacity-40 uppercase">
                    <Clock size={10} /> {note.createdAt}
                 </div>
                 <div className="text-[9px] font-black opacity-50 uppercase">
                    {note.attachments?.length || 0} Archivos
                 </div>
              </div>
           </div>
         ))}
      </div>

      {filteredNotes.length === 0 && (
        <div className="py-48 text-center bg-white border-2 border-dashed border-slate-200 rounded-[5rem]">
           <StickyNote size={80} strokeWidth={0.5} className="mx-auto text-slate-200 mb-6" />
           <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest italic">La bóveda está vacía</p>
        </div>
      )}
    </div>
  );
};

export default NotesManager;
