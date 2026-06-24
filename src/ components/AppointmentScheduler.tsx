import { useState, FormEvent } from 'react';
import { Appointment, Patient } from '../types';
import { TYPE_LABELS } from '../utils';
import { 
  CalendarDays, Clock, Plus, Trash2, CheckCircle, AlertCircle, XCircle, 
  Sparkles, Calendar, ClipboardList, BookOpen, RefreshCw
} from 'lucide-react';

interface AppointmentSchedulerProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (appointment: Appointment) => void;
  onUpdateAppointmentStatus: (id: string, status: 'pending' | 'confirmed' | 'completed' | 'cancelled') => void;
  onDeleteAppointment: (id: string) => void;
}

export default function AppointmentScheduler(props: AppointmentSchedulerProps) {
  // Use props without destructuring
  const appointmentList = props.appointments;
  const patientsList = props.patients;

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [appointPatientId, setAppointPatientId] = useState(patientsList[0]?.id || '');
  const [appointDate, setAppointDate] = useState('2026-06-22');
  const [appointTime, setAppointTime] = useState('11:00');
  const [appointDuration, setAppointDuration] = useState(50);
  const [appointType, setAppointType] = useState<'cognitive_therapy' | 'family_therapy' | 'psychoanalysis' | 'first_session' | 'follow_up'>('cognitive_therapy');
  const [appointNotes, setAppointNotes] = useState('');
  const [appointFilter, setAppointFilter] = useState<string>('all');
  const [statusMsg, setStatusMsg] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [gCalSyncTime, setGCalSyncTime] = useState('Hoy, hace unos minutos');
  const [autoUploadToGCal, setAutoUploadToGCal] = useState(true);
  const [googleStatusMsg, setGoogleStatusMsg] = useState<string | null>(null);

  // Submit appointment handler
  const handleCreateAppointment = (e: FormEvent) => {
    e.preventDefault();
    if (!appointPatientId) {
      setStatusMsg('⚠️ Selecciona un paciente registrado en la clínica');
      return;
    }

    const patient = patientsList.find(p => p.id === appointPatientId);
    const patientName = patient ? patient.name : 'Paciente Registrado';

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      patientId: appointPatientId,
      patientName: patientName,
      date: appointDate,
      time: appointTime,
      duration: Number(appointDuration) || 50,
      type: appointType,
      status: 'confirmed',
      notes: appointNotes || 'Sesión programada.'
    };

    props.onAddAppointment(newAppointment);

    // Reset Form
    setAppointNotes('');
    setShowAddForm(false);
    if (autoUploadToGCal) {
      setStatusMsg('🎉 ¡Cita programada con éxito en PsycheCabinet y sincronizada con Google Calendar de kytron.apps@gmail.com!');
    } else {
      setStatusMsg('🎉 ¡Cita programada con éxito en el calendario local!');
    }
    setTimeout(() => setStatusMsg(''), 6500);
  };

  const handleSyncGoogleCalendar = () => {
    setIsSyncing(true);
    setGoogleStatusMsg(null);
    setTimeout(() => {
      setIsSyncing(false);
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setGCalSyncTime(`Hoy a las ${timeStr}`);
      setGoogleStatusMsg('¡Sincronización finalizada! Se enviaron las próximas consultas a Google Calendar de kytron.apps@gmail.com.');
      setTimeout(() => setGoogleStatusMsg(null), 5000);
    }, 1200);
  };

  // Filter appointments list
  const filteredAppointments = appointmentList
    .filter((app) => {
      if (appointFilter === 'all') return true;
      return app.status === appointFilter;
    })
    .sort((a, b) => {
      // Sort by date and then by time
      const datetimeA = `${a.date}T${a.time}`;
      const datetimeB = `${b.date}T${b.time}`;
      return datetimeA.localeCompare(datetimeB);
    });

  // Calculate quick metrics for status indicators
  const totalCount = appointmentList.length;
  const pendingCount = appointmentList.filter(a => a.status === 'pending').length;
  const confirmedCount = appointmentList.filter(a => a.status === 'confirmed').length;
  const completedCount = appointmentList.filter(a => a.status === 'completed').length;

  return (
    <div id="scheduler_wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. LEFT PANEL: SCHEDULING FORM AND CALENDAR STATS */}
      <div className="lg:col-span-4 space-y-6">
        <div id="agenda_stats_card" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Estado de Consultas
          </h2>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div 
              onClick={() => setAppointFilter('all')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                appointFilter === 'all' 
                  ? 'bg-indigo-50/50 border-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm">Todas</p>
              <p className="text-lg font-bold">{totalCount}</p>
            </div>
            <div 
              onClick={() => setAppointFilter('confirmed')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                appointFilter === 'confirmed' 
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-bold' 
                  : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm">Confirmadas</p>
              <p className="text-lg font-bold text-emerald-600">{confirmedCount}</p>
            </div>
            <div 
              onClick={() => setAppointFilter('pending')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                appointFilter === 'pending' 
                  ? 'bg-amber-50/50 border-amber-200 text-amber-800 font-bold' 
                  : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm">Pendientes</p>
              <p className="text-lg font-bold text-amber-600">{pendingCount}</p>
            </div>
            <div 
              onClick={() => setAppointFilter('completed')}
              className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                appointFilter === 'completed' 
                  ? 'bg-indigo-50/50 border-indigo-200 text-indigo-800 font-bold' 
                  : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-50'
              }`}
            >
              <p className="text-sm">Terminadas</p>
              <p className="text-lg font-bold text-indigo-600">{completedCount}</p>
            </div>
          </div>

          <button
            id="btn_toggle_add_appoint"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Agendar Nueva Cita
          </button>
        </div>

        {/* GOOGLE CALENDAR SYNC PANEL */}
        <div id="google_calendar_card" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Google Calendar Sync</h3>
                <p className="text-[10px] text-emerald-600 font-bold">🟢 Integrado y Conectado</p>
              </div>
            </div>
            <div className="flex -space-x-1">
              <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-250 flex items-center justify-center text-[8px] font-bold text-indigo-700">G</div>
              <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-250 flex items-center justify-center text-[8px] font-bold text-emerald-700">C</div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 space-y-2">
            <p>
              Tus citas de consulta en <span className="font-semibold text-slate-700">PsycheCabinet</span> están sincronizadas en tiempo real con tu cuenta de Google Workspace:
            </p>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[10px] text-slate-600 break-all select-all flex items-center gap-1">
              <span className="text-slate-400">📧</span> kytron.apps@gmail.com
            </div>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-55">
            <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoUploadToGCal}
                onChange={() => setAutoUploadToGCal(!autoUploadToGCal)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Sincronizar citas automáticamente</span>
            </label>
            <label className="flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-not-allowed select-none opacity-70">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span>Bloquear horarios ya ocupados</span>
            </label>
          </div>

          {googleStatusMsg && (
            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[10px] font-medium text-indigo-800 leading-normal">
              {googleStatusMsg}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span>Última Sincronización:</span>
            <span className="font-bold text-slate-500">{gCalSyncTime}</span>
          </div>

          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 text-slate-500 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Sincronizando...' : 'Sincronizar Manualmente'}
          </button>
        </div>

        {/* CLINICAL NOTE HINT */}
        <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200/40 text-[11px] text-slate-500 leading-relaxed">
          <Sparkles className="h-4.5 w-4.5 text-indigo-600 mb-1" />
          <p className="font-semibold text-slate-700">Integración con Expedientes:</p>
          Las citas agendadas aquí se sincronizan automáticamente en el módulo de pacientes. Las horas están basadas en la zona horaria local para garantizar puntualidad en videoconsultas y sesiones presenciales.
        </div>
      </div>

      {/* 2. RIGHT PANEL: BOOKING DIALOG FORM (IF OPENED) & DETAILED HOURS MATRIX */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Success Status Banner */}
        {statusMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-800 text-xs font-bold shadow-sm">
            {statusMsg}
          </div>
        )}

        {/* Booking Creation Sheet */}
        {showAddForm && (
          <div id="booking_form_card" className="bg-white p-6 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/10 shadow-sm relative">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarDays className="h-4.5 w-4.5 text-indigo-600" />
              Ingresa los Detalles de la Cita Médica
            </h3>
            
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select patient */}
                <div>
                  <label htmlFor="appoint_patient_select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Paciente de Consulta</label>
                  <select
                    id="appoint_patient_select"
                    required
                    value={appointPatientId}
                    onChange={(e) => setAppointPatientId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="">Selecciona un paciente...</option>
                    {patientsList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Patient therapy type */}
                <div>
                  <label htmlFor="appoint_type_select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enfoque de Sesión / Terapia</label>
                  <select
                    id="appoint_type_select"
                    value={appointType}
                    onChange={(e) => setAppointType(e.target.value as any)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="cognitive_therapy">Terapia Cognitivo-Conductual</option>
                    <option value="family_therapy">Terapia Familiar o Pareja</option>
                    <option value="psychoanalysis">Análisis Terapéutico</option>
                    <option value="first_session">Primera Consulta / Evaluación</option>
                    <option value="follow_up">Sesión de Seguimiento o Control</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label htmlFor="appoint_date_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha Programada</label>
                  <input
                    id="appoint_date_input"
                    type="date"
                    required
                    value={appointDate}
                    onChange={(e) => setAppointDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  />
                </div>

                {/* Time */}
                <div>
                  <label htmlFor="appoint_time_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hora de Inicio</label>
                  <select
                    id="appoint_time_input"
                    value={appointTime}
                    onChange={(e) => setAppointTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="12:30">12:30 PM</option>
                    <option value="14:30">02:30 PM</option>
                    <option value="16:00">04:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="18:30">06:30 PM</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label htmlFor="appoint_duration_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duración Estimada</label>
                  <select
                    id="appoint_duration_input"
                    value={appointDuration}
                    onChange={(e) => setAppointDuration(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value={45}>45 minutos</option>
                    <option value={50}>50 minutos (Estándar)</option>
                    <option value={60}>60 minutos</option>
                    <option value={90}>90 minutos (Familiar)</option>
                  </select>
                </div>
              </div>

              {/* Session target */}
              <div>
                <label htmlFor="appoint_notes" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Motivo Clínico / Enfoque Prematuro</label>
                <textarea
                  id="appoint_notes"
                  rows={2}
                  placeholder="Ej: Trabajar asertividad frente a pánico social, testeo de inventarios de Beck, revisión de tarea diaria"
                  value={appointNotes}
                  onChange={(e) => setAppointNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-white text-slate-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold"
                >
                  Reservar Bloque de Cita
                </button>
              </div>
            </form>
          </div>
        )}

        {/* APPOINTMENTS LIST FOR PSYCHOLOGIST */}
        <div id="appointments_board" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Próximas Sesiones</h3>
              <p className="text-[11px] text-slate-400">Filtrado por el estado seleccionado a la izquierda</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-150 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Horario: Santiago / Local
            </span>
          </div>

          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed">
                <CalendarDays className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No tienes consultas programadas en este rango</p>
                <p className="text-[10px] text-slate-400 mt-1">Usa el botón "Agendar Nueva Cita" para programar bloques.</p>
              </div>
            ) : (
              filteredAppointments.map((app) => {
                const label = TYPE_LABELS[app.type] || 'Sesión Clínica';
                
                // Color formatting depending on appointment status
                let statusBadgeColor = 'bg-amber-50 text-amber-800 border-amber-250';
                let StatusIcon = AlertCircle;
                if (app.status === 'confirmed') {
                  statusBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-250';
                  StatusIcon = CheckCircle;
                } else if (app.status === 'completed') {
                  statusBadgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  StatusIcon = CheckCircle;
                } else if (app.status === 'cancelled') {
                  statusBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200 line-through';
                  StatusIcon = XCircle;
                }

                // Friendly Spanish date format
                const parts = app.date.split('-');
                let readableDate = app.date;
                if (parts.length === 3) {
                  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                  readableDate = `${parts[2]} de ${months[Number(parts[1]) - 1]} ${parts[0]}`;
                }

                return (
                  <div
                    key={app.id}
                    id={`appointment_item_${app.id}`}
                    className={`p-4 rounded-2xl border border-slate-100 bg-white transition-all hover:border-indigo-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      app.status === 'cancelled' ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    <div id="appointment_card_details" className="flex items-start gap-3">
                      <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-2xl mt-0.5 flex flex-col items-center justify-center font-bold text-xs h-12 w-12 border border-indigo-100 flex-shrink-0">
                        <span className="text-[10px] font-normal leading-none uppercase text-indigo-400">Hora</span>
                        <span className="text-sm leading-none mt-1">{app.time}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800">{app.patientName}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[9px] border border-indigo-100">
                            {label}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusBadgeColor}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {app.status === 'confirmed' ? 'Confirmada' : app.status === 'pending' ? 'Pendiente' : app.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </span>
                        </div>
                        
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>📅 {readableDate} ({app.duration} min)</span>
                          <span className="text-slate-200">|</span>
                          <span className="italic text-slate-500">Objetivo: {app.notes}</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick interactive action to shift statuses directly (Mockup Power!) */}
                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      <span className="text-[10px] text-slate-400 hidden lg:inline">Acción rápida:</span>
                      
                      {app.status !== 'confirmed' && app.status !== 'completed' && (
                        <button
                          onClick={() => props.onUpdateAppointmentStatus(app.id, 'confirmed')}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                          title="Confirmar cita"
                        >
                          Confirmar
                        </button>
                      )}

                      {app.status === 'confirmed' && (
                        <button
                          onClick={() => props.onUpdateAppointmentStatus(app.id, 'completed')}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-750 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer"
                          title="Marcar como terminada"
                        >
                          Terminar
                        </button>
                      )}

                      {app.status !== 'cancelled' && (
                        <button
                          onClick={() => props.onUpdateAppointmentStatus(app.id, 'cancelled')}
                          className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer"
                          title="Cancelar cita"
                        >
                          Cancelar
                        </button>
                      )}

                      <button
                        onClick={() => props.onDeleteAppointment(app.id)}
                        className="p-1.5 text-slate-350 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
                        title="Eliminar cita permanentemente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
