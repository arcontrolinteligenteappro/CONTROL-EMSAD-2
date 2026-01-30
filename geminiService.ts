
import { GoogleGenAI, Type } from "@google/genai";
import { Subject, ClassMaterial } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_CONTEXT = `Eres ARCONTROL, el sistema experto del CECyTEN EMSaD 16 El Macho, Nayarit. 
Tu conocimiento base es el modelo educativo de Educación Media Superior a Distancia (EMSaD) y el MCCEMS (Marco Curricular Común de Educación Media Superior).
Todas tus respuestas deben ser específicas para este contexto institucional.`;

export const getInteractiveResponse = async (userPrompt: string, context: string): Promise<string> => {
  // Switch to standard flash model for text stability
  const model = 'gemini-3-flash-preview';
  try {
    const response = await ai.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: `${SYSTEM_CONTEXT}
        Contexto dinámico: ${context}. 
        Responde de forma concisa, útil y educativa.`,
      },
    });
    return response.text || "No pude procesar la solicitud.";
  } catch (error) {
    console.error(error);
    return "Error de conexión con mi núcleo de inteligencia.";
  }
};

export const generateScheduleFromPrompt = async (instruction: string, data: any): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Instrucción del usuario (Lenguaje Natural): "${instruction}".
    
    Contexto Institucional:
    - Bloques de tiempo: 50 min (07:00 inicio, receso 09:30 y 11:40).
    - Días: Lunes a Viernes.
    
    Tu tarea:
    Analiza el texto del usuario. Identifica Maestros, Materias, Grupos y restricciones de días/horas.
    Construye un horario JSON válido. Si faltan datos (ej: hora específica), asigna una lógica (ej: primeras horas).
    Si menciona "compactar", evita huecos entre clases.
    
    Formato de salida esperado (Array de ScheduleData):
    [{ groupId: "ID_GRUPO", slots: [{ day: "Lunes", startTime: "07:00", subjectId: "ID_MATERIA", teacherId: "ID_DOCENTE" }] }]
    `,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT} Actúa como un planificador escolar experto. Convierte texto libre en estructuras de datos de horarios precisas.`,
      responseMimeType: "application/json"
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateDetailedExam = async (instruction: string, subject: string, topics: string[]): Promise<{ applied: string, solved: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Instrucción del usuario: ${instruction}. Materia: ${subject}. Temas: ${topics.join(", ")}`,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT} 
      Genera un objeto JSON con dos campos: 'applied' (examen para imprimir al alumno) y 'solved' (examen con respuestas explicadas para el docente). 
      Usa un tono académico riguroso conforme al nivel bachillerato.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          applied: { type: Type.STRING },
          solved: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"applied": "", "solved": ""}');
};

export const solveProblemMultimodal = async (prompt: string, imageBase64?: string): Promise<string> => {
  const parts: any[] = [{ text: `${SYSTEM_CONTEXT} Resuelve/explica: ${prompt}` }];
  if (imageBase64) {
    parts.push({ inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } });
  }
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts }
  });
  return response.text || "";
};

export const analyzeTeacherInput = async (inputText: string, availableSubjects: Subject[]): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: inputText,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            assignedSubjects: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};

export const generateOptimizedSchedule = async (teachers: any[], subjects: any[], groups: any[], weights: any): Promise<any[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generar horario optimizado para CECyTEN Nayarit.
    Docentes disponibles: ${JSON.stringify(teachers.map(t => ({id: t.id, name: t.name, subjects: t.assignedSubjects})))}
    Grupos: ${JSON.stringify(groups.map(g => ({id: g.id, name: g.name})))}
    Materias: ${JSON.stringify(subjects.map(s => ({id: s.id, name: s.name, hours: s.hoursPerWeek})))}
    
    Objetivo:
    1. Cubrir las horas semanales de cada materia por grupo.
    2. Asignar al docente correcto según sus materias asignadas.
    3. Minimizar horas muertas (huecos intermedios).
    4. Respetar recesos (09:30-10:00 y 11:40-11:50).
    `,
    config: { responseMimeType: "application/json" }
  });
  return JSON.parse(response.text || "[]");
};

export const verifyOfficialCurriculum = async (subjects: Subject[]): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Audita la siguiente lista de materias contra el Marco Curricular Común de Educación Media Superior (MCCEMS) vigente para el subsistema EMSaD en Nayarit: ${JSON.stringify(subjects)}`,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT} Eres un auditor académico experto. Proporciona un dictamen detallado sobre la congruencia de la carga horaria, semestre y categorías según la normativa MCCEMS.`,
    },
  });
  return response.text || "No se pudo realizar la auditoría.";
};

export const generateDidacticSequence = async (params: any): Promise<string> => {
  const modePrompt = params.mode === 'MCCEMS' 
    ? "ESTRICTO APEGO AL MODELO MCCEMS VIGENTE (Progresiones, Categorías, Metas de Aprendizaje, Transversalidad)." 
    : "FORMATO LIBRE FLEXIBLE (Enfoque en actividades prácticas y gestión de tiempo del docente).";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Genera una secuencia didáctica completa.
    Modo: ${modePrompt}
    Docente: ${params.teacher}
    Materia: ${params.subject}
    Horas: ${params.hoursPerWeek}
    Tema: ${params.topic}
    Objetivo: ${params.objective}
    
    Estructura requerida:
    1. Datos de Identificación (Plantel CECyTEN EMSaD 16, Docente, etc).
    2. Elementos Curriculares (según el modo seleccionado).
    3. Secuencia Didáctica (Apertura, Desarrollo, Cierre) con tiempos estimados.
    4. Recursos y Materiales.
    5. Evaluación (Instrumentos y Criterios).
    
    Formato de salida: Markdown limpio y profesional listo para exportar a PDF.`,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT} Eres un experto en pedagogía. Genera documentos formales.`,
    },
  });
  return response.text || "No se pudo generar la secuencia didáctica.";
};

export const analyzeExternalSequence = async (imageBase64: string): Promise<{ activities: { label: string, time: number }[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { text: `${SYSTEM_CONTEXT} Analiza esta imagen de una planeación/secuencia didáctica. Extrae la lista de actividades principales y estima el tiempo en minutos para cada una. Devuelve un JSON.` },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                time: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || '{"activities": []}');
};

export const generateEvaluationInstrument = async (params: any): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Genera un instrumento de evaluación del tipo ${params.type} para la materia ${params.subject} sobre el tema ${params.topic}.`,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT} Eres un experto en evaluación educativa. Genera instrumentos claros, objetivos y alineados a las progresiones del MCCEMS para nivel bachillerato.`,
    },
  });
  return response.text || "No se pudo generar el instrumento de evaluación.";
};

export const generateClassMaterials = async (params: any): Promise<ClassMaterial> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Genera el material de clase para:
      Materia: ${params.subject}
      Tema: ${params.topic}
      Grupo: ${params.group}
      Semestre: ${params.semester}
      Docente: ${params.teacher}
      Fecha Actual: ${new Date().toLocaleDateString('es-MX')}
      
      Necesito una estructura altamente interactiva:
      1. Título y objetivo.
      2. Diapositivas explicativas. IMPORTANTE: Para cada diapositiva, incluye un 'teacherScript' (lo que el docente debe decir palabra por palabra, como un guion) y una 'activity' (una dinámica rápida para hacer con los alumnos, ej: Pregunta rápida, debate breve).
      3. Ejemplos contextualizados a Nayarit (zona rural/costera).
      4. Dinámica de clase sugerida.
      5. Tarea para casa.
      `,
    config: {
      systemInstruction: `${SYSTEM_CONTEXT}
      Eres un diseñador instruccional experto.
      Genera clases interactivas donde el docente tiene un rol de facilitador activo.
      Incluye guiones de oratoria ('teacherScript') que sean naturales y atractivos.
      Incluye dinámicas ('activity') en cada slide para mantener la atención.
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          objective: { type: Type.STRING },
          slides: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.ARRAY, items: { type: Type.STRING } },
                notes: { type: Type.STRING, description: "Notas técnicas breves" },
                teacherScript: { type: Type.STRING, description: "Guion textual de lo que el docente debe hablar en esta diapositiva para explicar el tema" },
                activity: {
                  type: Type.OBJECT,
                  description: "Una micro-actividad interactiva para esta diapositiva",
                  properties: {
                    type: { type: Type.STRING, enum: ['PREGUNTA', 'DEBATE', 'LLUVIA_IDEAS', 'EJERCICIO'] },
                    instruction: { type: Type.STRING, description: "Instrucción corta para el grupo" },
                    question: { type: Type.STRING, description: "La pregunta o tema específico a lanzar" }
                  }
                }
              }
            }
          },
          examples: { type: Type.ARRAY, items: { type: Type.STRING } },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } },
          homework: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });
  return JSON.parse(response.text || "{}");
};

export const parseGradebookFromImage = async (imageBase64: string, type: 'ATTENDANCE' | 'GRADES'): Promise<{ name: string, value: string }[]> => {
  const prompt = type === 'ATTENDANCE' 
    ? "Analiza esta imagen de una lista de asistencia escolar. Extrae los nombres de los alumnos y su estado de asistencia del día. Mapea símbolos a: 'A' (Asistencia/Punto/Check), 'F' (Falta/X/Vacio), 'R' (Retardo). Devuelve JSON: [{name, value: 'A'|'F'|'R'}]"
    : "Analiza esta imagen de una lista de calificaciones. Extrae los nombres de los alumnos y su calificación numérica o alfanumérica. Devuelve JSON: [{name, value}]";

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { text: `${SYSTEM_CONTEXT} ${prompt}` },
        { inlineData: { mimeType: "image/jpeg", data: imageBase64.split(",")[1] || imageBase64 } }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            value: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(response.text || "[]");
};
