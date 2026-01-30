
import React, { useState, useRef } from 'react';
import { Teacher, Subject, StaffRole, EmploymentType, LaborStatus, ContactInfo, TeacherSocial } from '../types';
import { 
  UserPlus, 
  Trash2, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  User, 
  Users, 
  ShieldCheck, 
  X, 
  GraduationCap, 
  Briefcase, 
  Palette,
  Search,
  Upload,
  Power,
  Edit3,
  CheckCircle2,
  Plus,
  Hash,
  Share2,
  AtSign,
  Globe,
  Info
} from 'lucide-react';

interface TeacherManagerProps {
  teachers: Teacher[];
  setTeachers: (teachers: Teacher[]) => void;
  subjects: Subject[];
}

const TeacherManager: React.FC<TeacherManagerProps> = ({ teachers, setTeachers, subjects }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const initialForm: Teacher = {
    id: '',
    name: '',
    role: 'DOCENTE',
    alias: '',
    phones: [{ value: '', label: 'PERSONAL' }],
    emails: [{ value: '', label: 'PERSONAL' }],
    address: '',
    degree: '',
    photo: '',
    assignedSubjects: [],
    maxHoursPerWeek: 20,
    availability: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    color: '#3b82f6',
    socials: [],
    belongsToUnion: false,
    isUnionLead: false,
    isActive: true,
    employmentType: 'PERMANENTE',
    laborStatus: 'ACTIVO',
    totalPermitDays: 9,
    usedPermitDays: 0,
    absenceHistory: []
  };

  const [form, setForm] = useState<Teacher>(initialForm);

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsAdding(true);
  };

  const handleEdit = (t: Teacher) => {
    setEditingId(t.id);
    setForm(t);
    setIsAdding(true);
  };

  const handleSave = () => {
    if (form.name) {
      const sanitizedForm = {
        ...form,
        name: form.name.toUpperCase(),
        alias: (form.alias || '').toUpperCase(),
        id: editingId || Math.random().toString(36).substr(2, 9),
      };

      if (editingId) {
        setTeachers(teachers.map(t => t.id === editingId ? sanitizedForm : t));
      } else {
        setTeachers([...teachers, sanitizedForm]);
      }
      setIsAdding(false);
      setEditingId(null);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { 
      alert("Cámara no disponible."); 
      setShowCamera(false); 
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      setForm({ ...form, photo: canvas.toDataURL('image/jpeg') });
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setShowCamera(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({...form, photo: reader.result as string});
      reader.readAsDataURL(file);
    }
  };

  const addContact = (type: 'phones' | 'emails') => {
    setForm({
      ...form,
      [type]: [...form[type], { value: '', label: 'PERSONAL' }]
    });
  };

  const updateContact = (type: 'phones' | 'emails', index: number, field: keyof ContactInfo, value: string) => {
    const newList = [...form[type]];
    newList[index] = { ...newList[index], [field]: value };
    setForm({ ...form, [type]: newList });
  };

  const removeContact = (type: 'phones' | 'emails', index: number) => {
    if (form[type].length <= 1) return;
    setForm({
      ...form,
      [type]: form[type].filter((_, i) => i !== index)
    });
  };

  const addSocial = () => {
    setForm({
      ...form,
      socials: [...form.socials, { platform: 'FACEBOOK', url: '' }]
    });
  };

  const updateSocial = (index: number, field: keyof TeacherSocial, value: string) => {
    const newList = [...form.socials];
    newList[index] = { ...newList[index], [field]: value };
    setForm({ ...form, socials: newList });
  };

  const removeSocial = (index: number) => {
    setForm({
      ...form,
      socials: form.socials.filter((_, i) => i !== index)
    });
  };

  const filteredStaff = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.alias?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Users size={24} /></div>
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase italic leading-none">Gestión de Personal</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">EMSaD 16 El Macho • Control Administrativo</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Nombre o Alias..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500" 
            />
          </div>
          <button 
            onClick={handleOpenAdd} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            Añadir Personal
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="bg-white border-2 border-blue-500/20 p-8 rounded-[3rem] shadow-2xl animate-in zoom-in-95 space-y-10">
           <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  {editingId ? <Edit3 size={20}/> : <UserPlus size={20}/>}
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase italic">{editingId ? 'Editar Expediente' : 'Nuevo Registro'}</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all"><X size={24} /></button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Foto y Estatus */}
              <div className="lg:col-span-3 space-y-8">
                 <div className="w-full aspect-square bg-slate-100 rounded-[2.5rem] overflow-hidden relative group border-2 border-dashed border-slate-300 flex items-center justify-center shadow-inner">
                    {form.photo ? (
                      <img src={form.photo} className="w-full h-full object-cover" />
                    ) : (
                      <User size={80} className="text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                       <button onClick={startCamera} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><Camera size={14}/> Cámara</button>
                       <label className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 cursor-pointer">
                          <Upload size={14}/> Archivo <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
                       </label>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Power size={12}/> Estatus Laboral</label>
                       <button 
                        onClick={() => setForm({...form, isActive: !form.isActive})} 
                        className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-[11px] font-black uppercase ${form.isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-rose-100 text-rose-600'}`}
                       >
                          {form.isActive ? 'Personal Activo' : 'Personal Inactivo'}
                       </button>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><ShieldCheck size={12}/> Sindicato</label>
                       <button 
                        onClick={() => setForm({...form, belongsToUnion: !form.belongsToUnion})} 
                        className={`w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all text-[11px] font-black uppercase border-2 ${form.belongsToUnion ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border-slate-200'}`}
                       >
                          {form.belongsToUnion ? 'Sindicalizado (SITACECYTEN)' : 'No Sindicalizado'}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Datos Detallados */}
              <div className="lg:col-span-9 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><User size={12}/> Nombre Completo</label>
                       <input 
                        type="text" 
                        value={form.name} 
                        onChange={e => setForm({...form, name: e.target.value})} 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500" 
                        placeholder="EJ: HUMBERTO REYES" 
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Hash size={12}/> Alias (Horario)</label>
                       <input 
                        type="text" 
                        value={form.alias} 
                        onChange={e => setForm({...form, alias: e.target.value})} 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500" 
                        placeholder="EJ: PROFE HUMBERTO" 
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Briefcase size={12}/> Rol Institucional</label>
                       <select 
                        value={form.role} 
                        onChange={e => setForm({...form, role: e.target.value as StaffRole})} 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none appearance-none"
                       >
                          <option value="DOCENTE">DOCENTE</option>
                          <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                          <option value="DIRECTIVO">DIRECTIVO</option>
                          <option value="OTROS">OTROS</option>
                       </select>
                    </div>
                    {form.role === 'DOCENTE' && (
                       <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Palette size={12}/> Color en Horario</label>
                          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                             <input 
                              type="color" 
                              value={form.color} 
                              onChange={e => setForm({...form, color: e.target.value})} 
                              className="w-12 h-10 rounded-xl border-none p-0 cursor-pointer overflow-hidden" 
                             />
                             <span className="text-[9px] font-black text-slate-500 uppercase">Identificador Visual</span>
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><GraduationCap size={12}/> Perfil Académico (Opcional)</label>
                    <input 
                      type="text" 
                      value={form.degree} 
                      onChange={e => setForm({...form, degree: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:border-blue-500" 
                      placeholder="EJ: LICENCIADO EN CIENCIAS NATURALES" 
                    />
                 </div>

                 {/* Sección de Teléfonos */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Phone size={12}/> Teléfonos</label>
                       <button onClick={() => addContact('phones')} className="text-blue-600 hover:text-blue-800"><Plus size={18}/></button>
                    </div>
                    {form.phones.map((phone, idx) => (
                       <div key={idx} className="flex gap-2 items-center">
                          <select 
                            value={phone.label} 
                            onChange={e => updateContact('phones', idx, 'label', e.target.value)}
                            className="bg-slate-100 text-[10px] font-black uppercase px-3 py-3 rounded-xl border-none outline-none w-32"
                          >
                             <option value="PERSONAL">PERSONAL</option>
                             <option value="LABORAL">LABORAL</option>
                             <option value="OTRO">OTRO</option>
                          </select>
                          <input 
                            type="tel" 
                            value={phone.value} 
                            onChange={e => updateContact('phones', idx, 'value', e.target.value)}
                            placeholder="TELÉFONO"
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          />
                          <button onClick={() => removeContact('phones', idx)} className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                       </div>
                    ))}
                 </div>

                 {/* Sección de Correos */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><AtSign size={12}/> Correos</label>
                       <button onClick={() => addContact('emails')} className="text-blue-600 hover:text-blue-800"><Plus size={18}/></button>
                    </div>
                    {form.emails.map((email, idx) => (
                       <div key={idx} className="flex gap-2 items-center">
                          <select 
                            value={email.label} 
                            onChange={e => updateContact('emails', idx, 'label', e.target.value)}
                            className="bg-slate-100 text-[10px] font-black uppercase px-3 py-3 rounded-xl border-none outline-none w-32"
                          >
                             <option value="PERSONAL">PERSONAL</option>
                             <option value="INSTITUCIONAL">INSTITUCIONAL</option>
                             <option value="LABORAL">LABORAL</option>
                             <option value="OTRO">OTRO</option>
                          </select>
                          <input 
                            type="email" 
                            value={email.value} 
                            onChange={e => updateContact('emails', idx, 'value', e.target.value)}
                            placeholder="CORREO ELECTRÓNICO"
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          />
                          <button onClick={() => removeContact('emails', idx)} className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                       </div>
                    ))}
                 </div>

                 {/* Sección de Redes Sociales */}
                 <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><Globe size={12}/> Redes Sociales</label>
                       <button onClick={addSocial} className="text-blue-600 hover:text-blue-800"><Plus size={18}/></button>
                    </div>
                    {form.socials.map((social, idx) => (
                       <div key={idx} className="flex gap-2 items-center">
                          <select 
                            value={social.platform} 
                            onChange={e => updateSocial(idx, 'platform', e.target.value)}
                            className="bg-slate-100 text-[10px] font-black uppercase px-3 py-3 rounded-xl border-none outline-none w-32"
                          >
                             <option value="FACEBOOK">FACEBOOK</option>
                             <option value="WHATSAPP">WHATSAPP</option>
                             <option value="INSTAGRAM">INSTAGRAM</option>
                             <option value="LINKEDIN">LINKEDIN</option>
                             <option value="TWITTER">TWITTER / X</option>
                          </select>
                          <input 
                            type="text" 
                            value={social.url} 
                            onChange={e => updateSocial(idx, 'url', e.target.value)}
                            placeholder="URL O NOMBRE DE USUARIO"
                            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          />
                          <button onClick={() => removeSocial(idx)} className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                       </div>
                    ))}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-2 flex items-center gap-2"><MapPin size={12}/> Domicilio Actual</label>
                    <textarea 
                      value={form.address} 
                      onChange={e => setForm({...form, address: e.target.value})} 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-xs font-bold outline-none focus:border-blue-500 resize-none h-24" 
                      placeholder="DIRECCIÓN COMPLETA..." 
                    />
                 </div>

                 <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                    <button onClick={() => setIsAdding(false)} className="px-6 py-4 text-[11px] font-black text-slate-400 uppercase hover:text-rose-500 transition-all">Cancelar</button>
                    <button 
                      onClick={handleSave} 
                      className="px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all flex items-center gap-3"
                    >
                      {editingId ? <CheckCircle2 size={18}/> : <Plus size={18}/>}
                      {editingId ? 'Actualizar Expediente' : 'Guardar en Matriz'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
           <div className="w-full max-w-lg bg-white p-4 rounded-[3rem] shadow-2xl overflow-hidden relative">
             <video ref={videoRef} autoPlay className="w-full h-auto rounded-[2.2rem] shadow-inner" />
             <div className="mt-8 flex gap-4">
                <button onClick={() => {
                  if (videoRef.current?.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
                  }
                  setShowCamera(false);
                }} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[1.5rem] font-black uppercase text-xs">Cerrar</button>
                <button onClick={capturePhoto} className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase text-xs shadow-xl">Capturar Foto</button>
             </div>
           </div>
        </div>
      )}

      {/* Grid de Personal Registrado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(t => (
          <div 
            key={t.id} 
            className={`group bg-white rounded-[2.5rem] p-6 border-2 transition-all relative overflow-hidden flex flex-col h-full ${!t.isActive ? 'opacity-50 grayscale border-slate-100' : 'border-slate-100 shadow-sm hover:border-blue-500/30 hover:shadow-xl hover:-translate-y-1'}`}
          >
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-[1.8rem] overflow-hidden border-2 border-slate-50 shadow-sm bg-slate-50 shrink-0 relative">
                {t.photo ? <img src={t.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100"><User size={32} /></div>}
                {t.isActive && (
                   <div className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${t.laborStatus === 'ACTIVO' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-slate-900 uppercase italic truncate leading-none mb-1">{t.name}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{t.alias || 'SIN ALIAS'}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{t.role}</span>
                </div>

                <div className="space-y-1.5">
                   {t.phones.length > 0 && (
                     <div className="flex items-center gap-2 text-slate-500">
                        <Phone size={10} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase truncate">{t.phones[0].value}</span>
                     </div>
                   )}
                   {t.emails.length > 0 && (
                     <div className="flex items-center gap-2 text-slate-500">
                        <Mail size={10} className="text-emerald-400" />
                        <span className="text-[10px] font-bold lowercase truncate">{t.emails[0].value}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
               <div className="flex gap-1.5">
                  <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase ${t.belongsToUnion ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'}`}>
                    {t.belongsToUnion ? 'SINDICALIZADO' : 'CONFIANZA'}
                  </span>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => handleEdit(t)} className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
                  <button onClick={() => {
                    if(confirm(`¿Eliminar expediente de ${t.name}?`)) setTeachers(teachers.filter(x => x.id !== t.id));
                  }} className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-sm"><Trash2 size={16}/></button>
               </div>
            </div>
            
            {t.isActive && t.role === 'DOCENTE' && (
              <div className="absolute top-0 right-0 w-16 h-1 bg-current" style={{ color: t.color }}></div>
            )}
          </div>
        ))}
      </div>

      {teachers.length === 0 && (
        <div className="bg-white border-2 border-dashed border-slate-200 py-40 rounded-[4rem] text-center flex flex-col items-center gap-4">
           <Users size={64} strokeWidth={1} className="text-slate-200" />
           <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sin personal registrado en la matriz operativa</p>
        </div>
      )}
    </div>
  );
};

export default TeacherManager;
