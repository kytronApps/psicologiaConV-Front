import { useState, useEffect } from 'react';
import {
  HeartHandshake, LogOut,
  Archive, CalendarCheck, PenTool
} from 'lucide-react';
import { INITIAL_PATIENTS, INITIAL_FILES, INITIAL_APPOINTMENTS } from './utils';
import Login from './components/Login';
import DashboardStats from './components/DashboardStats';
import PatientManager from './components/PatientManager';
import AppointmentScheduler from './components/AppointmentScheduler';
import ConsentForm from './components/ConsentForm';

export default function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [files, setFiles] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState('files');

  useEffect(() => {
    const storedUser = localStorage.getItem('psy_user');
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); } catch (e) {}
    }

    const storedPatients = localStorage.getItem('psy_patients');
    if (storedPatients) {
      try { setPatients(JSON.parse(storedPatients)); } catch (e) { setPatients(INITIAL_PATIENTS); }
    } else {
      setPatients(INITIAL_PATIENTS);
      localStorage.setItem('psy_patients', JSON.stringify(INITIAL_PATIENTS));
    }

    const storedFiles = localStorage.getItem('psy_files');
    if (storedFiles) {
      try { setFiles(JSON.parse(storedFiles)); } catch (e) { setFiles(INITIAL_FILES); }
    } else {
      setFiles(INITIAL_FILES);
      localStorage.setItem('psy_files', JSON.stringify(INITIAL_FILES));
    }

    const storedAppointments = localStorage.getItem('psy_appointments');
    if (storedAppointments) {
      try { setAppointments(JSON.parse(storedAppointments)); } catch (e) { setAppointments(INITIAL_APPOINTMENTS); }
    } else {
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('psy_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }
  }, []);

  const handleLoginSuccess = (email, name) => {
    const freshUser = { email, name };
    setUser(freshUser);
    localStorage.setItem('psy_user', JSON.stringify(freshUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('psy_user');
  };

  const handleAddPatient = (newPatient) => {
    const updated = [newPatient, ...patients];
    setPatients(updated);
    localStorage.setItem('psy_patients', JSON.stringify(updated));
    const updatedFiles = { ...files, [newPatient.id]: [] };
    setFiles(updatedFiles);
    localStorage.setItem('psy_files', JSON.stringify(updatedFiles));
  };

  const handleAddFile = (patientId, newFile) => {
    const patientFiles = files[patientId] || [];
    const updatedFiles = { ...files, [patientId]: [newFile, ...patientFiles] };
    setFiles(updatedFiles);
    localStorage.setItem('psy_files', JSON.stringify(updatedFiles));
  };

  const handleAddAppointment = (newApp) => {
    const updated = [newApp, ...appointments];
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  const handleUpdateAppointmentStatus = (id, status) => {
    const updated = appointments.map((app) => app.id === id ? { ...app, status } : app);
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  const handleDeleteAppointment = (id) => {
    const updated = appointments.filter((app) => app.id !== id);
    setAppointments(updated);
    localStorage.setItem('psy_appointments', JSON.stringify(updated));
  };

  const handleResetData = () => {
    if (window.confirm('¿Deseas restaurar la demo clínica a sus valores de fábrica? Perderás cambios no guardados.')) {
      setPatients(INITIAL_PATIENTS);
      setFiles(INITIAL_FILES);
      setAppointments(INITIAL_APPOINTMENTS);
      localStorage.setItem('psy_patients', JSON.stringify(INITIAL_PATIENTS));
      localStorage.setItem('psy_files', JSON.stringify(INITIAL_FILES));
      localStorage.setItem('psy_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
    }
  };

  const totalPatientsCount = patients.length;
  const todayDateStr = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(a => a.date === todayDateStr && a.status !== 'cancelled').length;

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const tabs = [
    { id: 'files', icon: <Archive className="h-4 w-4" />, label: '📂 Pacientes y Expedientes' },
    { id: 'appointments', icon: <CalendarCheck className="h-4 w-4" />, label: '📅 Agenda de Citas (Google Calendar)' },
    { id: 'consent', icon: <PenTool className="h-4 w-4 text-emerald-600" />, label: '✍️ Carta de Consentimiento' },
  ];

  return (
    <div id="main_framework" className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-200">

      <header id="clinical_navigation" className="bg-white border-b border-slate-150 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">

            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-xl text-white flex items-center justify-center shadow-sm">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-slate-800">PsycheCabinet</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">v1.2 (Mockup Live)</span>
                </div>
                <p className="text-[9px] text-slate-400 uppercase font-semibold tracking-widest">Workspace para Psicoterapeutas</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-emerald-600 font-semibold">{user.email}</span>
              </div>

              <div className="h-8 w-px bg-slate-200 hidden md:block" />

              <button
                id="btn_reset_clinic"
                onClick={handleResetData}
                className="px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/20 bg-slate-50/20 rounded-xl transition-all cursor-pointer"
              >
                🔄 Restaurar Demo
              </button>

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

      <main id="main_workspace_container" className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">

        <DashboardStats
          totalPatients={totalPatientsCount}
          appointmentsToday={appointmentsToday}
        />

        <div id="module_tabs_bar" className="flex border-b border-slate-200 mb-6 gap-2 overflow-x-auto whitespace-nowrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

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

      <footer id="clinical_footer" className="bg-slate-100 border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 PsycheCabinet. Herramienta de gestión para psicoterapeutas y clínicos.</p>
          <p className="mt-1 text-[10px]">Diseñado para el seguimiento Clínico y Sincronización con Google Calendar.</p>
        </div>
      </footer>

    </div>
  );
}
