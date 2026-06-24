import { Patient, PatientFile, Appointment } from './types';

// Simple simulated encryption helper to convert text into encrypted-style gibberish
export function encryptText(text: string): string {
  if (!text) return '';
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch (e) {
    return `[ENCRIPTADO_AES_256_${text.length * 3}]`;
  }
}

export function decryptText(encryptedBlob: string): string {
  try {
    return decodeURIComponent(escape(atob(encryptedBlob)));
  } catch (e) {
    return encryptedBlob;
  }
}

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    name: 'Sofía Mendoza Alarcón',
    email: 'sofia.mendoza@email.com',
    phone: '+56 9 8765 4321',
    birthDate: '1998-03-12',
    age: 28,
    occupation: 'Estudiante de Doctorado',
    status: 'active',
    notes: 'Paciente derivada por psiquiatra. Diagnóstico de Ansiedad Generalizada (TAG). Muestra buena disposición a la terapia conductual.',
    avatarColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    id: 'pat-2',
    name: 'Carlos Ortega Valenzuela',
    email: 'carlos.ortega@techcorp.io',
    phone: '+56 9 1234 5678',
    birthDate: '1984-07-25',
    age: 42,
    occupation: 'Ingeniero de Software Senior',
    status: 'active',
    notes: 'Proceso de duelo complicado (6 meses de pérdida de cónyuge). Presenta rumiaciones de culpa, anhedonia y problemas de insomnio.',
    avatarColor: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  {
    id: 'pat-3',
    name: 'Mariana Ríos Figueroa',
    email: 'marianarios_design@gmail.com',
    phone: '+56 9 5555 4444',
    birthDate: '1991-11-04',
    age: 35,
    occupation: 'Directora Creativa',
    status: 'on_hold',
    notes: 'Terapia individual y de pareja. En pausa por viaje laboral. Enfocada en asertividad en relaciones afectivas y manejo del burnout.',
    avatarColor: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  {
    id: 'pat-4',
    name: 'Felipe Duarte Castro',
    email: 'feliped_castro@estudiantes.cl',
    phone: '+56 9 9900 8822',
    birthDate: '2007-01-19',
    age: 19,
    occupation: 'Estudiante Universitario (Primer año)',
    status: 'active',
    notes: 'TDAH con dificultades de autoorganización y desregulación emocional. Trabajando técnicas de estructuración de tiempo y autocompasión.',
    avatarColor: 'bg-teal-100 text-teal-800 border-teal-300'
  }
];

export const INITIAL_FILES: Record<string, PatientFile[]> = {
  'pat-1': [
    {
      id: 'file-1a',
      name: 'Test_Hamilton_Ansiedad_2025.pdf',
      size: '1.2 MB',
      category: 'test_result',
      uploadDate: '2025-11-14',
      year: 2025,
      content: 'RESULTADOS DEL TEST DE HAMILTON: Ansiedad moderada-alta (Puntuación: 24). Se observa hipervigilancia, somatización, tensión muscular e insomnio de conciliación. Recomendación: Intervención Cognitivo-Conductual enfocada en reestructuración cognitiva y habilidades de afrontamiento.'
    },
    {
      id: 'file-1b',
      name: 'Notas_Clinicas_Sesion_8.docx',
      size: '243 KB',
      category: 'session_note',
      uploadDate: '2026-03-02',
      year: 2026,
      content: 'NOTAS CLINICAS SESIÓN 8 (2026-03-02): La paciente reporta disminución en la frecuencia de crisis de pánico. Logró aplicar respiración controlada y autoconversión positiva. Se continuará trabajando en reestructuración de pensamientos catastrofistas.'
    }
  ],
  'pat-2': [
    {
      id: 'file-2a',
      name: 'Expediente_Inicial_DSM5.pdf',
      size: '3.4 MB',
      category: 'clinical_report',
      uploadDate: '2024-12-10',
      year: 2024,
      content: 'EXPEDIENTE INICIAL SUMMARY: Varón de 42 años que acude voluntariamente tras pérdida de su cónyuge hace 6 meses. Presenta síntomas de duelo complicado, apatía, aislamiento social deliberado y anhedonia profunda. Sin antecedentes psiquiátricos previos relevantes.'
    },
    {
      id: 'file-2b',
      name: 'Inventario_Depresion_Beck.xlsx',
      size: '512 KB',
      category: 'test_result',
      uploadDate: '2025-06-15',
      year: 2025,
      content: 'COMENTARIOS INVENTARIO DE BECK II: Puntuación de 30, indicadora de depresión grave. Elevada presencia de síntomas somáticos, fatiga cognitiva y sentimientos de culpa no resueltos. Próxima sesión centrada en reatribución cognitiva.'
    }
  ],
  'pat-3': [
    {
      id: 'file-3a',
      name: 'Plan_Terapeutico_Asertividad.docx',
      size: '410 KB',
      category: 'consent_form',
      uploadDate: '2025-09-08',
      year: 2025,
      content: 'PLAN DE TRATAMIENTO: Foco en establecimiento de límites sanos en el ámbito laboral y familiar frente a la fatiga crónica ("burnout"). Se acuerdan tareas intersesión de registro de asertividad.'
    }
  ],
  'pat-4': []
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-1',
    patientId: 'pat-1',
    patientName: 'Sofía Mendoza Alarcón',
    date: '2026-06-22', // Today (from current system time)
    time: '14:30',
    duration: 50,
    type: 'cognitive_therapy',
    status: 'confirmed',
    notes: 'Revisión grupal del automonitoreo de pánico y entrenamiento en solución de problemas.'
  },
  {
    id: 'app-2',
    patientId: 'pat-2',
    patientName: 'Carlos Ortega Valenzuela',
    date: '2026-06-22', // Today
    time: '16:00',
    duration: 50,
    type: 'follow_up',
    status: 'pending',
    notes: 'Acompañamiento en ritual de despedida y procesamiento emocional del enojo sano.'
  },
  {
    id: 'app-3',
    patientId: 'pat-4',
    patientName: 'Felipe Duarte Castro',
    date: '2026-06-23', // Tomorrow
    time: '10:00',
    duration: 50,
    type: 'cognitive_therapy',
    status: 'confirmed',
    notes: 'Entrenamiento en planificación diaria con mapas mentales y anclajes táctiles.'
  },
  {
    id: 'app-4',
    patientId: 'pat-3',
    patientName: 'Mariana Ríos Figueroa',
    date: '2026-06-25',
    time: '18:00',
    duration: 50,
    type: 'follow_up',
    status: 'pending',
    notes: 'Recontacto post-pausa. Evaluación de disparadores emocionales en ambiente de alta presión.'
  }
];

export const CATEGORY_LABELS = {
  clinical_report: 'Informe Clínico',
  session_note: 'Nota de Sesión',
  test_result: 'Resultado de Test',
  consent_form: 'Consentimiento',
  other: 'Otro Documento'
};

export const TYPE_LABELS = {
  cognitive_therapy: 'Terapia Cognitivo-Conductual',
  family_therapy: 'Terapia Familiar o Pareja',
  psychoanalysis: 'Análisis Terapéutico',
  first_session: 'Primera Consulta / Evaluación',
  follow_up: 'Sesión de Seguimiento o Control'
};
