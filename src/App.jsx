import { useState, useEffect } from 'react';
import { 
  HeartHandshake, LogOut, Database, KeyRound, ShieldAlert,
  Archive, CalendarCheck, HelpCircle, Lock, LayoutDashboard, Settings, PenTool
} from 'lucide-react';
import { Patient, PatientFile, Appointment, Psychologist } from './types';
import { INITIAL_PATIENTS, INITIAL_FILES, INITIAL_APPOINTMENTS } from './utils';
import Login from './components/Login';
import DashboardStats from './components/DashboardStats';
import PatientManager from './components/PatientManager';
import AppointmentScheduler from './components/AppointmentScheduler';
import ConsentForm from './components/ConsentForm';

export default function App() {
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [files, setFiles] = useState<Record<string, PatientFile[]>>({});
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'files' | 'appointments' | 'consent'>('files');

  // 1. Core State Initialization and Loading on Mount
  useEffect(() => {
    // Load logged in user if exists
    const storedUser = localStorage.getItem('psy_user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setUser(u);
      } catch (e) {
        // Fallback if parsing fails
      }
    }

    // Load patients
    const storedPatients = localStorage.getItem('psy_patients');
    if (storedPatients) {
      try {
        setPatients(JSON.parse(storedPatients));
      } catch (e) {
        setPatients(INITIAL_PATIENTS);
      }
    } else {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('psy_patients', JSON.stringify(INITIAL_PATIENTS));
    }

    // Load encrypted patient files
    const storedFiles = localStorage.getItem('psy_files');
    if (storedFiles) {
      try {
        setFiles(JSON.parse(storedFiles));
      } catch (e) {
        setFiles(INITIAL_FILES);
      }
    } else {
      setFiles(INITIAL_FILES);
      localStorage.setItem('psy_files', JSON.stringify(INITIAL_FILES));
    }

    // Load appointments
    const storedAppointments = localStorage.getItem('psy_appointments');
    if (storedAppointments) {
      try {
        setAppointments(JSON.parse(storedAppointments));
      } catch (e) {
        setAppointments(INITIAL_APPOINTMENTS);
      }
    } else {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('psy_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }
  }, []);

  // 2. Action Handlers safely syncing state and Local Storage
  const handleLoginSuccess = (email: string, name: string) => {
    const freshUser = { email: email, name: name };
    setUser(freshUser);
    localStorage.setItem('psy_user', JSON.stringify(freshUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('psy_user');
  };

  const handleAddPatient = (newPatient: Patient) => {
    const updated = [newPatient, ...patients];
    setPatients(updated);
    localStorage.setItem('psy_patients', JSON.stringify(updated));

    // Initialize empty file array for this patient
    const updatedFiles = { ...files, [newPatient.id]: [] };
    setFiles(updatedFiles);
    localStorage.setItem('psy_files', JSON.stringify(updatedFiles));
  };

  const handleAddFile = (patientId: string, newFile: PatientFile) => {
    const patientFiles = files[patientId] || [];
    const updatedPatientFiles = [newFile, ...patientFiles];
    const updatedFiles = { ...files, [patientId]: updatedPatientFiles };
    setFiles(updatedFiles);
    localStorage.setItem('psy_files', JSON.stringify(updatedFiles));
  };

  const handleAddAppointment = (newApp: Appointment) => {
    const updated = [newApp, ...appointments];
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  const handleUpdateAppointmentStatus = (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const updated = appointments.map((app) => {
      if (app.id === id) {
        return { ...app, status: status };
      }
      return app;
    });
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = appointments.filter((app) => app.id !== id);
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  // Reset demo state helper to original defaults
  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar la demo clínica de nuevo a sus valores de fábrica? Perderás cambios no guardados.')) {
      setPatients(INITIAL_PATIENTS);
      setFiles(INITIAL_FILES);
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('psy_patients', JSON.stringify(INITIAL_PATIENTS));
      localStorage.setItem('psy_files', JSON.stringify(INITIAL_FILES));
      localStorage.setItem('psy_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }
  };

  // Safe checks for dashboard statistics counter
  const totalPatientsCount = patients.length;
  
  let totalFilesCount = 0;
  const currentKeys = Object.keys(files);
  for (let i = 0; i < currentKeys.length; i++) {
    const key = currentKeys[i];
    totalFilesCount += (files[key] || []).length;
  }

  // Count appointments happening today (2026-06-22)
  const todayDateStr = "2026-06-22";
  const appointmentsToday = appointments.filter(a => a.date === todayDateStr && a.status !== 'cancelled').length;

  // Gatekeeper: If user is not authenticated, render Login
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="main_framework" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-200">
      
      {/* PROFESSIONAL CLINICAL HEADER */}
      <header id="clinical_navigation" className="bg-white border-b border-slate-150 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            
            {/* Logo area */}
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl text-white flex items-center justify-center shadow-sm">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-800">PsycheCabinet</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">v1.2 (Mockup Live)</span>
                </div>
                <p className="text-[9px] text-slate-450 uppercase font-semibold letter spacing tracking-widest">Workspace para Psicoterapeutas</p>
              </div>
            </div>

            {/* Surgeon / Doctor Identity */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{user.email}</span>
              </div>
              
              <div className="h-8 w-px bg-slate-200 hidden md:block" />

              {/* Reset Clinical Data */}
              <button
                id="btn_reset_clinic"
                onClick={handleResetData}
                className="p-1 px-2.5 text-[10px] font-bold text-slate-400 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 bg-slate-50/20 rounded-xl transition-all cursor-pointer"
                title="Restaurar base de datos a por defecto"
              >
                🔄 Restaurar Demo
              </button>

              {/* Logout button */}
              <button
                id="btn_logout_action"
                onClick={handleLogout}
                className="flex items-center gap-1.5 p-2 text-xs font-bold text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* CORE WORKSPACE CONTENT */}
      <main id="main_workspace_container" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        
        {/* STATS COUNT */}
        <DashboardStats 
          totalPatients={totalPatientsCount} 
          appointmentsToday={appointmentsToday} 
        />

        {/* RECTANGULAR TAB SWITCHER */}
        <div id="module_tabs_bar" className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto whitespace-nowrap">
          <button
            id="tab_trigger_files"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'files'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Archive className="h-4 w-4" />
            📂 Pacientes y Expedientes
          </button>
          
          <button
            id="tab_trigger_appointments"
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'appointments'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CalendarCheck className="h-4 w-4" />
            📅 Agenda de Citas (Google Calendar)
          </button>

          <button
            id="tab_trigger_consent"
            onClick={() => setActiveTab('consent')}
            className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'consent'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <PenTool className="h-4 w-4 text-emerald-600" />
            ✍️ Carta de Consentimiento
          </button>
        </div>

        {/* MODULAR SECTION VIEWS */}
        <div id="active_workspace_view" className="py-2">
          {activeTab === 'files' && (
            <PatientManager 
              patients={patients} 
              files={files} 
              onAddPatient={handleAddPatient} 
              onAddFile={handleAddFile} 
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentScheduler 
              appointments={appointments} 
              patients={patients} 
              onAddAppointment={handleAddAppointment} 
              onUpdateAppointmentStatus={handleUpdateAppointmentStatus} 
              onDeleteAppointment={handleDeleteAppointment} 
            />
          )}

          {activeTab === 'consent' && (
            <ConsentForm 
              patients={patients}
              onAddFile={handleAddFile}
            />
          )}
        </div>

      </main>

      {/* FOOTER */}
      <footer id="clinical_footer" className="bg-slate-100 border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PsycheCabinet. Herramienta de gestión para psicoterapeutas y clínicos.</p>
          <p className="mt-1 text-[10px] text-slate-350">Diseñado para el seguimiento Clínico y Sincronización con Google Calendar.</p>
        </div>
      </footer>

    </div>
  );
}
