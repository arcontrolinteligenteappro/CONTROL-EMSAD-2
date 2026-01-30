
import { Subject, Group } from './types';

export const TIME_BLOCKS = [
  { start: "07:00", end: "07:50", id: 1 },
  { start: "07:50", end: "08:40", id: 2 },
  { start: "08:40", end: "09:30", id: 3 },
  { start: "09:30", end: "10:00", isBreak: true, label: "RECESO PRINCIPAL" },
  { start: "10:00", end: "10:50", id: 4 },
  { start: "10:50", end: "11:40", id: 5 },
  { start: "11:40", end: "11:50", isBreak: true, label: "RECESO CORTO" },
  { start: "11:50", end: "12:40", id: 6 },
  { start: "12:40", end: "13:30", id: 7 },
];

export const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'mat1', name: 'Matemáticas I', hoursPerWeek: 5, color: '#06b6d4', category: 'basica', semester: 1, isActive: true },
  { id: 'len1', name: 'Lengua y Comunicación I', hoursPerWeek: 4, color: '#3b82f6', category: 'basica', semester: 1, isActive: true },
  { id: 'ing1', name: 'Inglés I', hoursPerWeek: 3, color: '#10b981', category: 'basica', semester: 1, isActive: true },
  { id: 'qui1', name: 'Química I', hoursPerWeek: 4, color: '#8b5cf6', category: 'basica', semester: 1, isActive: true },
  { id: 'tic1', name: 'TIC I', hoursPerWeek: 3, color: '#ec4899', category: 'basica', semester: 1, isActive: true },
  { id: 'hum1', name: 'Humanidades I', hoursPerWeek: 4, color: '#f59e0b', category: 'basica', semester: 1, isActive: true },
  { id: 'soc1', name: 'Ciencias Sociales I', hoursPerWeek: 4, color: '#ef4444', category: 'basica', semester: 1, isActive: true },
  { id: 'lab1', name: 'Formación Laboral I', hoursPerWeek: 4, color: '#f97316', category: 'trabajo', semester: 1, isActive: true },
];

export const INSTITUTION_INFO = {
  name: "CECyTEN EMSaD 16 El Macho",
  sub: "Tecuala, Nayarit, México",
  author: "ChrisRey91",
  website: "www.arcontrolinteligente.com",
  systemName: "AR CONTROL HORARIO"
};

export const INITIAL_WEIGHTS = {
  alpha1: 0.9, 
  alpha2: 0.6, 
  alpha3: 1.0, 
  alpha4: 0.5, 
  alpha5: 0.95, 
};
