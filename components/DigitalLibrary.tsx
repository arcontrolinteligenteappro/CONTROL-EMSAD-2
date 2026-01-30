
import React, { useState } from 'react';
import { DigitalBook, Subject } from '../types';
import { 
  Book, Search, Upload, Filter, Plus, FileText, Download, 
  ExternalLink, Trash2, Bookmark, BookOpen, Cloud
} from 'lucide-react';

interface DigitalLibraryProps {
  books: DigitalBook[];
  setBooks: (books: DigitalBook[]) => void;
  subjects: Subject[];
}

const DigitalLibrary: React.FC<DigitalLibraryProps> = ({ books, setBooks, subjects }) => {
  const [search, setSearch] = useState('');
  const [filterSub, setFilterSub] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [newBook, setNewBook] = useState<Partial<DigitalBook>>({
    title: '', author: '', type: 'PDF', category: 'APOYO'
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBook({
          ...newBook,
          title: file.name.split('.')[0].toUpperCase(),
          type: file.name.split('.').pop()?.toUpperCase() as any || 'PDF',
          localData: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveBook = () => {
    if (newBook.title) {
      const book: DigitalBook = {
        id: Math.random().toString(36).substr(2, 9),
        title: newBook.title as string,
        author: newBook.author || 'AUTOR DESCONOCIDO',
        type: newBook.type || 'PDF',
        category: newBook.category || 'APOYO',
        subjectId: newBook.subjectId,
        url: newBook.url,
        localData: newBook.localData,
        cover: `https://source.unsplash.com/random/200x300/?book,${newBook.category}`
      };
      setBooks([book, ...books]);
      setIsUploading(false);
      setNewBook({ title: '', author: '', type: 'PDF', category: 'APOYO' });
    }
  };

  const filteredBooks = books.filter(b => 
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())) &&
    (filterSub ? b.subjectId === filterSub : true)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Book size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Biblioteca Digital</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Recursos Educativos EMSaD 16</p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
            <input 
              type="text" 
              placeholder="BUSCAR LIBRO..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>
          <button onClick={() => setIsUploading(true)} className="px-6 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg flex items-center gap-2">
            <Upload size={16} /> Subir Recurso
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button onClick={() => setFilterSub('')} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border transition-all ${!filterSub ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}>Todos</button>
        {subjects.map(s => (
          <button key={s.id} onClick={() => setFilterSub(s.id)} className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border transition-all whitespace-nowrap ${filterSub === s.id ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'}`}>
            {s.name}
          </button>
        ))}
      </div>

      {/* Upload Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl space-y-6 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 uppercase italic text-center">Agregar Recurso Digital</h3>
            
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-[2rem] cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                <Cloud size={32} className="text-indigo-400 mb-2"/>
                <span className="text-[9px] font-black text-slate-400 uppercase">Seleccionar Archivo (PDF, DOC, TXT)</span>
                <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt,.epub" />
              </label>
              
              <input type="text" placeholder="TÍTULO DEL LIBRO" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none uppercase" />
              <input type="text" placeholder="AUTOR / EDITORIAL" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value.toUpperCase()})} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none uppercase" />
              
              <div className="grid grid-cols-2 gap-4">
                <select value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value as any})} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none">
                  <option value="OFICIAL">MODELO OFICIAL</option>
                  <option value="APOYO">MATERIAL APOYO</option>
                  <option value="REFORZAMIENTO">REFORZAMIENTO</option>
                </select>
                <select value={newBook.subjectId} onChange={e => setNewBook({...newBook, subjectId: e.target.value})} className="px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none">
                  <option value="">GENERAL (SIN MATERIA)</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button onClick={() => setIsUploading(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase">Cancelar</button>
              <button onClick={saveBook} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg">Guardar Libro</button>
            </div>
          </div>
        </div>
      )}

      {/* Books Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all flex flex-col relative overflow-hidden">
            <div className="aspect-[2/3] bg-slate-100 rounded-[2rem] mb-4 relative overflow-hidden flex items-center justify-center">
               <div className={`absolute inset-0 opacity-10 bg-gradient-to-tr ${book.category === 'OFICIAL' ? 'from-emerald-500' : 'from-indigo-500'} to-slate-900`}></div>
               <BookOpen size={40} className="text-slate-300"/>
               {/* Overlay Actions */}
               <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  {book.localData ? (
                    <a href={book.localData} download={book.title} className="p-3 bg-white text-indigo-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><Download size={20}/></a>
                  ) : (
                    <a href={book.url} target="_blank" className="p-3 bg-white text-indigo-600 rounded-xl shadow-lg hover:scale-110 transition-transform"><ExternalLink size={20}/></a>
                  )}
                  <button onClick={() => setBooks(books.filter(b => b.id !== book.id))} className="p-3 bg-rose-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={20}/></button>
               </div>
            </div>
            
            <div className="flex-1 space-y-1">
               <div className="flex justify-between items-start">
                  <span className={`text-[7px] font-black px-2 py-0.5 rounded-lg uppercase ${book.type === 'PDF' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'}`}>{book.type}</span>
                  {book.subjectId && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Asignado a materia"></span>}
               </div>
               <h4 className="text-[10px] font-black text-slate-900 uppercase leading-tight line-clamp-2 pt-2">{book.title}</h4>
               <p className="text-[8px] font-bold text-slate-400 uppercase truncate">{book.author}</p>
            </div>
          </div>
        ))}
        
        {/* Add Card */}
        <button onClick={() => setIsUploading(true)} className="aspect-[2/3] rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:text-indigo-500 hover:border-indigo-300 hover:bg-indigo-50 transition-all group">
           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform"><Plus size={24}/></div>
           <span className="text-[9px] font-black uppercase tracking-widest">Añadir</span>
        </button>
      </div>
    </div>
  );
};

export default DigitalLibrary;
