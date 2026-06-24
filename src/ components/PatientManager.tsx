import { useState, FormEvent, DragEvent } from 'react';
import { 
  Folder, FolderOpen, Search, UserPlus, FileText, Lock, 
  Upload, Filter, Eye, EyeOff, Plus, FileUp, CheckCircle, HelpCircle
} from 'lucide-react';
import { Patient, PatientFile } from '../types';
import { CATEGORY_LABELS } from '../utils';

// Dynamic helper to extract patient folder code (Initials + Birth Year)
export function getPatientFolderCode(patient: Patient): string {
  if (!patient || !patient.name) return 'PAT-XXXX';
  const parts = patient.name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.map(word => word[0].toUpperCase()).join('');
  const year = patient.birthDate ? patient.birthDate.split('-')[0] : '1990';
  return `${initials}${year}`;
}

// Generate expected clinical passcode: first name in lowercase + '123'
export function getPatientPassword(patient: Patient): string {
  if (!patient || !patient.name) return 'paciente123';
  const firstName = patient.name.trim().split(/\s+/)[0].toLowerCase();
  const normalized = firstName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${normalized}123`;
}

interface PatientManagerProps {
  patients: Patient[];
  files: Record<string, PatientFile[]>;
  onAddPatient: (patient: Patient) => void;
  onAddFile: (patientId: string, file: PatientFile) => void;
}

export default function PatientManager(props: PatientManagerProps) {
  const patientList = props.patients;
  const filesRecord = props.files;

  // Active state
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patientList[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  
  // Locked folders states
  const [unlockedPatientIds, setUnlockedPatientIds] = useState<string[]>([]);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Toggled file details (expanded file IDs)
  const [expandedFileIds, setExpandedFileIds] = useState<Record<string, boolean>>({});

  // Adding patient form states
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState(30);
  const [newPatientBirthDate, setNewPatientBirthDate] = useState('1990-01-01');
  const [newPatientEmail, setNewPatientEmail] = useState('');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [newPatientOccupation, setNewPatientOccupation] = useState('');
  const [newPatientNotes, setNewPatientNotes] = useState('');
  
  // Upload file form states
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'clinical_report' | 'session_note' | 'test_result' | 'consent_form' | 'other'>('session_note');
  const [uploadYear, setUploadYear] = useState<number>(2026);
  const [uploadNote, setUploadNote] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Filter patients by search query (checks initials code, name, or occupation)
  const filteredPatients = patientList.filter((pat) => {
    const code = getPatientFolderCode(pat).toLowerCase();
    const query = searchQuery.toLowerCase();
    return (
      code.includes(query) ||
      pat.name.toLowerCase().includes(query) ||
      pat.occupation.toLowerCase().includes(query)
    );
  });

  // Find currently selected patient
  const selectedPatient = patientList.find(p => p.id === selectedPatientId);
  
  // Get files of current patient
  const currentPatientFiles = selectedPatientId ? (filesRecord[selectedPatientId] || []) : [];

  // Filter files by year
  const filteredFiles = currentPatientFiles.filter((file) => {
    if (yearFilter === 'all') return true;
    return file.year.toString() === yearFilter;
  });

  // Calculate unique list of years
  const uniqueYears = Array.from(new Set(currentPatientFiles.map(f => f.year))).sort((a, b) => b - a);

  // Toggle expand/collapse document contents
  const toggleFileContent = (fileId: string) => {
    setExpandedFileIds(prev => ({
      ...prev,
      [fileId]: !prev[fileId]
    }));
  };

  // Add new patient handler
  const handleCreatePatientSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const colors = [
      'bg-indigo-50 text-indigo-700 border-indigo-200',
      'bg-emerald-50 text-emerald-700 border-emerald-200',
      'bg-teal-50 text-teal-700 border-teal-200',
      'bg-amber-50 text-amber-700 border-amber-200',
      'bg-rose-50 text-rose-700 border-rose-200'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: newPatientName,
      email: newPatientEmail || 'no-informado@correo.com',
      phone: newPatientPhone || '+56 9 ',
      birthDate: newPatientBirthDate || '1990-01-01',
      age: Number(newPatientAge) || 30,
      occupation: newPatientOccupation || 'No especificada',
      status: 'active',
      notes: newPatientNotes || 'Ficha clínica del paciente.',
      avatarColor: randomColor
    };

    props.onAddPatient(newPatient);
    setSelectedPatientId(newPatient.id);
    
    // Auto-unlock newly created patient folder
    setUnlockedPatientIds(prev => [...prev, newPatient.id]);
    
    // Reset form
    setNewPatientName('');
    setNewPatientAge(30);
    setNewPatientBirthDate('1990-01-01');
    setNewPatientEmail('');
    setNewPatientPhone('');
    setNewPatientOccupation('');
    setNewPatientNotes('');
    setShowAddPatient(false);
  };

  // Unlock password submission
  const handleUnlockSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    const requiredPassword = getPatientPassword(selectedPatient);
    if (passwordInput.trim() === requiredPassword) {
      setUnlockedPatientIds(prev => [...prev, selectedPatient.id]);
      setPasswordInput('');
      setPasswordError(null);
    } else {
      setPasswordError('❌ Contraseña clínica incorrecta. Inténtalo de nuevo.');
    }
  };

  // Upload file
  const handleUploadSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) {
      setStatusMsg('⚠️ Por favor ingresa o selecciona un archivo');
      return;
    }
    if (!uploadNote.trim()) {
      setStatusMsg('📝 Por favor escribe las anotaciones o el contenido clínico del archivo.');
      return;
    }

    const newFile: PatientFile = {
      id: `file-${Date.now()}`,
      name: uploadFileName.endsWith('.docx') || uploadFileName.endsWith('.pdf') || uploadFileName.endsWith('.txt') 
        ? uploadFileName 
        : `${uploadFileName}.docx`,
      size: `${Math.floor(Math.random() * 800) + 120} KB`,
      category: uploadCategory,
      uploadDate: new Date().toISOString().split('T')[0],
      year: Number(uploadYear),
      content: uploadNote
    };

    props.onAddFile(selectedPatientId, newFile);
    
    // Reset Upload States
    setUploadFileName('');
    setUploadNote('');
    setStatusMsg('🎉 ¡Archivo cargado y encriptado en el expediente!');
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles[0]) {
      const firstFile = droppedFiles[0];
      setUploadFileName(firstFile.name);
    }
  };

  const selectQuickMockFile = (name: string, content: string) => {
    setUploadFileName(name);
    setUploadNote(content);
  };

  return (
    <div id="patient_workstation" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* 1. LEFT SIDEBAR: PATIENT FOLDERS LIST */}
      <div id="pacientes_sidebar" className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Folder className="h-4 w-4 text-emerald-600" />
            Pacientes
          </h2>
          <button 
            id="btn_add_patient_folder"
            onClick={() => setShowAddPatient(!showAddPatient)}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all border border-emerald-100 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar
          </button>
        </div>

        {/* Searching patients */}
        <div className="relative mb-3">
          <Search className="absolute inset-y-0 left-3 h-3.5 w-3.5 text-slate-450 my-auto" />
          <input
            id="patient_search"
            type="text"
            placeholder="Buscar paciente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-150 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white text-slate-700 font-medium"
          />
        </div>

        {/* Add Patient Container */}
        {showAddPatient && (
          <form onSubmit={handleCreatePatientSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3 space-y-2.5">
            <h3 className="text-xs font-bold text-slate-700">Nueva Carpeta de Paciente</h3>
            <div>
              <input
                id="new_pat_name"
                type="text"
                required
                placeholder="Nombre completo"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-705 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Año / Nacimiento</label>
                <input
                  id="new_pat_birthdate"
                  type="date"
                  required
                  value={newPatientBirthDate}
                  onChange={(e) => setNewPatientBirthDate(e.target.value)}
                  className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Edad (Años)</label>
                <input
                  id="new_pat_age"
                  type="number"
                  required
                  placeholder="Edad"
                  value={newPatientAge}
                  onChange={(e) => setNewPatientAge(Number(e.target.value))}
                  className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-705"
                />
              </div>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Ocupación</label>
              <input
                id="new_pat_occupation"
                type="text"
                placeholder="Ocupación / Oficio"
                value={newPatientOccupation}
                onChange={(e) => setNewPatientOccupation(e.target.value)}
                className="w-full mt-0.5 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
              />
            </div>
            <div>
              <input
                id="new_pat_email"
                type="email"
                placeholder="Email corporativo / personal"
                value={newPatientEmail}
                onChange={(e) => setNewPatientEmail(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
              />
            </div>
            <div>
              <textarea
                id="new_pat_notes"
                placeholder="Sintomatología o notas introductorias..."
                rows={2}
                value={newPatientNotes}
                onChange={(e) => setNewPatientNotes(e.target.value)}
                className="w-full p-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-1.5 text-xs font-semibold pt-1">
              <button 
                type="button" 
                onClick={() => setShowAddPatient(false)} 
                className="px-2.5 py-1 text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm font-bold"
              >
                Crear Registro
              </button>
            </div>
          </form>
        )}

        {/* Folders iteration */}
        <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1">
          {filteredPatients.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No se encontraron pacientes.</p>
          ) : (
            filteredPatients.map((patient) => {
              const fileCount = filesRecord[patient.id]?.length || 0;
              const isSelected = selectedPatientId === patient.id;
              const isUnlocked = unlockedPatientIds.includes(patient.id);
              
              return (
                <div
                  key={patient.id}
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setYearFilter('all');
                    setPasswordInput('');
                    setPasswordError(null);
                  }}
                  id={`patient_item_${patient.id}`}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-emerald-50/75 border-emerald-200 text-slate-800 font-bold' 
                      : 'bg-white border-transparent hover:bg-slate-50/50 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isUnlocked ? (
                      <FolderOpen className="h-4.5 w-4.5 text-emerald-600 flex-shrink-0" />
                    ) : (
                      <Folder className="h-4.5 w-4.5 text-slate-400 flex-shrink-0" />
                    )}
                    <span className="text-xs text-slate-800 font-mono tracking-tight font-bold">{getPatientFolderCode(patient)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.1 bg-slate-100 rounded text-slate-500">
                      {fileCount} f
                    </span>
                    {isUnlocked ? (
                      <span className="text-[10px] text-emerald-600 font-bold">🔓</span>
                    ) : (
                      <span className="text-[10px] text-slate-300">🔒</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. RIGHT PANEL: DOCUMENTS LIST IN A MINIMALIST FOLDER VIEW */}
      <div id="patient_workspace_detail" className="lg:col-span-8 space-y-6">
        {selectedPatient ? (
          !unlockedPatientIds.includes(selectedPatientId) ? (
            <div id="patient_folder_locked_gate" className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto text-center space-y-6 my-8">
              <div className="flex justify-center">
                <div className="bg-amber-50 text-amber-600 p-4 rounded-full border border-amber-100 flex items-center justify-center">
                  <Lock className="h-10 w-10" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Expediente Clínico Integrado</p>
                <h2 className="text-xl font-black text-slate-800">
                  📁 Carpeta Protegida: <span className="font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-100">{getPatientFolderCode(selectedPatient)}</span>
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                  Por estrictos motivos de confidencialidad y secreto profesional, este expediente se encuentra encriptado localmente. Se requiere ingresar la contraseña de desbloqueo clínica.
                </p>
              </div>

              <form onSubmit={handleUnlockSubmit} className="space-y-4 max-w-xs mx-auto">
                <div className="space-y-1.5">
                  <input
                    type="password"
                    required
                    placeholder="Contraseña de la carpeta..."
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError(null);
                    }}
                    className="w-full px-4 py-2.5 text-center text-xs font-semibold border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 bg-slate-50/50"
                  />
                  {passwordError && (
                    <p className="text-[11px] text-rose-600 font-bold leading-none mt-1">
                      {passwordError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🔓 Desbloquear Carpeta
                </button>
              </form>

              <div id="development_creds_info" className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-left text-[11px] text-indigo-900 leading-relaxed space-y-1.5">
                <p className="font-extrabold flex items-center gap-1">
                  💡 <span>Indicaciones para la revisión:</span>
                </p>
                <p className="text-[10px] text-indigo-950 font-medium">
                  La contraseña clínica para cada carpeta es el primer nombre en minúsculas + <code className="font-bold font-mono">123</code>.
                </p>
                <div className="pt-1.5 border-t border-indigo-100 flex items-center justify-between text-[10px] font-bold font-mono">
                  <span>Carpeta: {getPatientFolderCode(selectedPatient)}</span>
                  <span className="bg-white text-indigo-800 px-2 py-0.5 rounded border border-indigo-200">Clave: {getPatientPassword(selectedPatient)}</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Header Mini Details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => {
                      // Lock patient again
                      setUnlockedPatientIds(prev => prev.filter(id => id !== selectedPatientId));
                      setPasswordInput('');
                      setPasswordError(null);
                    }}
                    className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                  >
                    🔒 Cerrar Carpeta
                  </button>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                       <h1 className="text-base font-bold text-slate-800">{selectedPatient.name}</h1>
                       <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-emerald-55 bg-emerald-50 text-emerald-850 text-emerald-800 border border-emerald-150 rounded flex items-center gap-0.5">
                         🔓 {getPatientFolderCode(selectedPatient)}
                       </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedPatient.occupation} • Tlf: {selectedPatient.phone} • {selectedPatient.email}
                    </p>
                  </div>
                  <div className="text-xs bg-slate-50 border border-slate-150 p-2.5 rounded-lg max-w-sm">
                    <span className="font-semibold text-slate-700">Motivo Clínico:</span> {selectedPatient.notes}
                  </div>
                </div>
              </div>

            {/* Folder tab layout & files */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <span>📁 Carpeta de Expediente</span>
                  </h2>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">Documentación Almacenada</p>
                </div>

                {/* Filter section by year */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Filter className="h-3 w-3" /> Filtrar por Año:
                  </span>
                  
                  <button
                    onClick={() => setYearFilter('all')}
                    className={`px-2 py-0.5 text-xs font-bold rounded ${
                      yearFilter === 'all'
                        ? 'bg-slate-800 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    Todos
                  </button>
                  {[2026, 2025, 2024].map((year) => {
                    const yearStr = year.toString();
                    return (
                      <button
                        key={year}
                        onClick={() => setYearFilter(yearStr)}
                        className={`px-2 py-0.5 text-xs font-bold rounded ${
                          yearFilter === yearStr
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIST OF FILES */}
              <div className="space-y-2">
                {filteredFiles.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
                    <p className="text-xs font-medium text-slate-400">Esta carpeta no posee archivos registrados para este año.</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => {
                    const isExpanded = !!expandedFileIds[file.id];
                    const categoryLabel = CATEGORY_LABELS[file.category] || 'Documento';

                    return (
                      <div 
                        key={file.id} 
                        id={`file_item_${file.id}`}
                        className="border border-slate-100 rounded-xl bg-white hover:border-slate-200/80 transition-all overflow-hidden"
                      >
                        {/* Header trigger */}
                        <div 
                          onClick={() => toggleFileContent(file.id)}
                          className="p-3.5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50"
                        >
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-slate-800">{file.name}</span>
                                <span className="text-[9px] font-bold px-1.5 py-0.1 bg-indigo-50 text-indigo-700 rounded border border-indigo-100">
                                  {categoryLabel}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5">Tamaño: {file.size} • Registrado el {file.uploadDate}</p>
                            </div>
                          </div>

                          <button className="text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all">
                            {isExpanded ? (
                              <>
                                <EyeOff className="h-3 w-3" /> Ocultar nota
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" /> Ver contenido
                              </>
                            )}
                          </button>
                        </div>

                        {/* Collapsible Content */}
                        {isExpanded && (
                          <div className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 font-sans text-xs text-slate-700 leading-relaxed space-y-2">
                            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-inner whitespace-pre-wrap font-sans">
                              {file.content}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* SIMPLIFIED COLLAPSIBLE NOTE CREATOR */}
            <div id="file_uploader_panel" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Añadir Documento o Nota Clínica</h3>
                  <p className="text-[11px] text-slate-450 mt-0.5">Registrar notas de evolución o informes médicos del paciente.</p>
                </div>
                <button
                  onClick={() => setShowUploadForm(!showUploadForm)}
                  className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all cursor-pointer"
                >
                  {showUploadForm ? '✕ Cerrar formulario' : '➕ Nueva nota/documento'}
                </button>
              </div>

              {statusMsg && (
                <div className="p-3 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500">
                  {statusMsg}
                </div>
              )}

              {showUploadForm && (
                <form onSubmit={handleUploadSubmit} className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label htmlFor="file_name_input" className="block text-[10px] font-bold text-slate-400 uppercase">Título / Nombre</label>
                      <input
                        id="file_name_input"
                        type="text"
                        required
                        placeholder="Ej: notas_sesion_12.docx"
                        value={uploadFileName}
                        onChange={(e) => setUploadFileName(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-755 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <label htmlFor="file_category_select" className="block text-[10px] font-bold text-slate-400 uppercase">Tipo de Documento</label>
                      <select
                        id="file_category_select"
                        value={uploadCategory}
                        onChange={(e) => setUploadCategory(e.target.value as any)}
                        className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-755 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      >
                        <option value="clinical_report">Informe Clínico</option>
                        <option value="session_note">Notas de Sesión</option>
                        <option value="test_result">Resultados de Test</option>
                        <option value="consent_form">Consentimiento Informado</option>
                        <option value="other">Otro Documento</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="file_year_select" className="block text-[10px] font-bold text-slate-400 uppercase">Año</label>
                      <select
                        id="file_year_select"
                        value={uploadYear}
                        onChange={(e) => setUploadYear(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-755 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                      >
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                        <option value={2024}>2024</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="file_text_details" className="block text-[10px] font-bold text-slate-400 uppercase">Anotaciones clínicas u observaciones</label>
                    <textarea
                      id="file_text_details"
                      required
                      rows={3}
                      placeholder="Escribe el contenido correspondiente a esta nota clínica..."
                      value={uploadNote}
                      onChange={(e) => setUploadNote(e.target.value)}
                      className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-lg text-slate-750 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  {/* Sample suggestions for fast clinical input */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 pt-1">
                    <span className="text-[9px] text-slate-400 font-bold">Plantillas rápidas:</span>
                    <button
                      type="button"
                      onClick={() => selectQuickMockFile('Evolucion_Sesion_9.docx', 'El paciente asiste de forma puntual. Menciona reducción de pánico diario tras aplicar técnicas cognitivo-conductuales de anclaje.')}
                      className="px-2 py-0.5 text-[9px] bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      📄 Evolución Sesión
                    </button>
                    <button
                      type="button"
                      onClick={() => selectQuickMockFile('Resultado_Test_Ansiedad.pdf', 'Puntaje: Ansiedad leve. Se observa mejoría sobresaliente comparada con la sesión del mes anterior.')}
                      className="px-2 py-0.5 text-[9px] bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      📊 Test de Ansiedad
                    </button>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      id="btn_submit_file"
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer"
                    >
                      <FileUp className="h-4 w-4" /> Registrar Nota
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )
      ) : (
        <p className="text-xs text-slate-400 text-center py-10 bg-white rounded-2xl border">
          Selecciona un paciente en el menú izquierdo para visualizar sus carpetas de expediente clínico.
        </p>
      )}
      </div>
    </div>
  );
}
