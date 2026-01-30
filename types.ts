
export interface Subject {
  id: string;
  name: string;
  hoursPerWeek: number;
  color: string;
  category: 'basica' | 'propedueutica' | 'trabajo';
  semester: number;
  image?: string;
  isActive: boolean;
}

export type StaffRole = 'DOCENTE' | 'ADMINISTRATIVO' | 'DIRECTIVO' | 'OTROS';
export type EmploymentType = 'PERMANENTE' | 'TEMPORAL';
export type LaborStatus = 'ACTIVO' | 'INACTIVO' | 'LICENCIA';

export interface ContactInfo {
  value: string;
  label: string;
}

export interface TeacherSocial {
  platform: string;
  url: string;
}

export interface Attachment {
  name: string;
  type: string; // MIME type
  data: string; // Base64
  size: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  isFavorite: boolean;
  attachments: Attachment[]; 
  createdAt: string;
}

export interface Teacher {
  id: string;
  name: string;
  alias?: string;
  role: StaffRole;
  photo?: string;
  assignedSubjects: string[];
  maxHoursPerWeek: number;
  color: string;
  isActive: boolean;
  phones: ContactInfo[];
  emails: ContactInfo[];
  address?: string;
  degree?: string;
  socials: TeacherSocial[];
  belongsToUnion: boolean;
  isUnionLead: boolean;
  employmentType: EmploymentType;
  laborStatus: LaborStatus;
  availability: string[];
  totalPermitDays: number;
  usedPermitDays: number;
  absenceHistory: any[];
}

export interface AttendanceRecord {
  date: string;
  status: 'A' | 'R' | 'F'; 
}

export interface Grade {
  assignmentId: string;
  score: number;
}

export interface Student {
  id: string;
  name: string;
  curp?: string;
  attendance: AttendanceRecord[];
  grades: Grade[];
  alias?: string;
  photo?: string;
  phones?: ContactInfo[];
  emails?: ContactInfo[];
  address?: string;
}

export interface Assignment {
  id: string;
  title: string;
  weight: number; 
  category: 'TAREA' | 'TRABAJO' | 'PROYECTO' | 'EXAMEN';
}

export interface Group {
  id: string;
  name: string;
  semester: number;
  maleCount: number;
  femaleCount: number;
  color: string;
  tutorId?: string;
  whatsappLink?: string; // Nuevo campo para el enlace del grupo
  students: Student[];
  assignments: Assignment[];
  jefeGrupo?: Student;
}

export interface CloudConfig {
  isAuthenticated: boolean;
  userEmail?: string;
  lastSync?: string;
  autoSync: boolean;
}

export interface AppConfig {
  useAIScheduler: boolean;
  useOfficialCurriculumIA: boolean;
  useCalendarIA: boolean;
  useGroupAI: boolean;
  useGeneralAI: boolean;
  showInternalControl: boolean;
  showControlEscolar: boolean;
  showPlaneacion: boolean;
  showBitacora: boolean;
  maxAbsences: number;
  cloud: CloudConfig; 
}

export interface AcademicLog {
  id: string;
  teacherId: string;
  subjectId: string;
  groupId: string;
  topic: string;
  date: string;
  sequenceContent: string;
  isDelivered: boolean;
  activities: { id: string, label: string, completed: boolean }[];
}

export interface CalendarEvent {
  id: string;
  nombre: string;
  fecha: string;
  tipo: string;
  minuta?: string;
  asistio?: boolean;
}

export interface AcademicCycle {
  year: string;
  period: 'AGO-ENE' | 'FEB-JUL';
  config: AppConfig;
  directorName?: string;
  delegadoSindicalName?: string;
  academicLogs: AcademicLog[];
  calendarData?: {
    eventos: CalendarEvent[];
  };
}

export interface ScheduleData {
  groupId: string;
  slots: any[];
}

export interface HistoryEntry {
  id: string;
  label: string;
  timestamp: string;
  description: string;
  dataSnapshot: {
    teachers: Teacher[];
    groups: Group[];
    cycle: AcademicCycle;
    schedules: ScheduleData[];
    notes: Note[];
  };
}

export interface TrackingEntry {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: 'ACADEMICA' | 'SINDICAL' | 'PERSONAL' | 'INFRAESTRUCTURA';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  fecha: string;
  estado: 'PENDIENTE' | 'RESUELTO';
  vinculoId?: string;
}

export interface OptimizationWeights {
  alpha1: number; alpha2: number; alpha3: number; alpha4: number; alpha5: number;
}

export interface InteractiveActivity {
  type: 'PREGUNTA' | 'DEBATE' | 'LLUVIA_IDEAS' | 'EJERCICIO';
  instruction: string;
  question: string;
}

export interface Slide {
  title: string;
  content: string[];
  notes: string;
  teacherScript?: string;
  activity?: InteractiveActivity;
}

export interface ClassMaterial {
  topic: string;
  objective: string;
  slides: Slide[];
  examples: string[];
  resources: string[];
  homework: string[];
}

export interface DigitalBook {
  id: string;
  title: string;
  author: string;
  type: 'PDF' | 'WORD' | 'TXT' | 'EPUB';
  category: 'OFICIAL' | 'APOYO' | 'REFORZAMIENTO';
  subjectId?: string; // Vinculación a materia
  url?: string; // Para libros online
  localData?: string; // Base64 para archivos subidos
  cover?: string;
}

export enum AppView {
  Dashboard = 'dashboard',    
  EcosistemaIA = 'ia_hub',    
  Personal = 'personal',      
  Materias = 'materias',      
  Notas = 'notas',
  Classroom = 'classroom',
  InternalControl = 'internal',
  History = 'history',
  Config = 'config',
  About = 'about',
  Library = 'library',
  Browser = 'browser'
}
