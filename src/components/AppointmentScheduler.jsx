import { useMemo, useState } from 'react';
import { TYPE_LABELS } from '../utils';
import {
  CalendarDays, Clock, Plus, Trash2, CheckCircle, AlertCircle, XCircle,
  Sparkles, Calendar, Video, Share2
} from 'lucide-react';
import { getAvailableSlots } from '../utils/bookingSlots';
import useAuth from '../context/useAuth';

export default function AppointmentScheduler(props) {
  const appointmentList = props.appointments;
  const patientsList = props.patients;
  const { user } = useAuth();

  const [showAddForm, setShowAddForm] = useState(false);
  const [appointPatientId, setAppointPatientId] = useState(patientsList[0]?.id || '');
  const [appointDate, setAppointDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointTime, setAppointTime] = useState('');
  const [appointDuration, setAppointDuration] = useState(50);
  const [appointNotes, setAppointNotes] = useState('');
  const [appointFilter, setAppointFilter] = useState('all');
  const [statusMsg, setStatusMsg] = useState('');
  const availableTimes = useMemo(
    () => getAvailableSlots({
      date: appointDate,
      availability: props.availability,
      appointments: appointmentList,
      duration: appointDuration,
    }),
    [appointDate, appointDuration, appointmentList, props.availability],
  );

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!appointPatientId) {
      setStatusMsg('⚠️ Selecciona un paciente registrado en la clínica');
      return;
    }
    if (!appointTime || !availableTimes.includes(appointTime)) {
      setStatusMsg('⚠️ Selecciona uno de los horarios disponibles.');
      return;
    }

    const patient = patientsList.find(p => p.id === appointPatientId);
    const patientName = patient ? patient.name : 'Paciente Registrado';

    const newAppointment = {
      id: `app-${Date.now()}`,
      patientId: appointPatientId,
      patientName: patientName,
      patientEmail: patient?.email || '',
      date: appointDate,
      time: appointTime,
      duration: Number(appointDuration) || 50,
      type: 'session',
      status: 'pending',
      notes: appointNotes || 'Sesión programada.',
      meetingPlatform: 'google_meet',
      meetingUrl: '',
    };

    try {
      await props.onAddAppointment(newAppointment);
      setAppointNotes('');
      setShowAddForm(false);
      setStatusMsg('🎉 Cita creada en Google Calendar con su enlace de Meet.');
    } catch (error) {
      setStatusMsg(`⚠️ ${error.message || 'No se pudo sincronizar la cita con Google Calendar.'}`);
    }
    setTimeout(() => setStatusMsg(''), 6500);
  };

  const shareManagementLink = async (appointment) => {
    try {
      const path = await props.onGetSharePath(appointment.id);
      const url = new URL(path, window.location.origin).toString();
      if (navigator.share) {
        await navigator.share({
          title: "Gestiona tu cita",
          text: `Gestiona tu cita del ${appointment.date} a las ${appointment.time}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setStatusMsg("¡Enlace de gestión copiado!");
      }
    } catch (error) {
      if (error?.name !== "AbortError") setStatusMsg("No se pudo compartir el enlace.");
    }
  };

  const filteredAppointments = appointmentList
    .filter((app) => {
      if (appointFilter === 'all') return app.status !== 'completed';
      if (appointFilter === 'archived') return app.status === 'completed';
      return app.status === appointFilter;
    })
    .sort((a, b) => {
      const datetimeA = `${a.date}T${a.time}`;
      const datetimeB = `${b.date}T${b.time}`;
      return datetimeA.localeCompare(datetimeB);
    });

  const totalCount = appointmentList.length;
  const pendingCount = appointmentList.filter(a => a.status === 'pending').length;
  const confirmedCount = appointmentList.filter(a => a.status === 'confirmed').length;
  const completedCount = appointmentList.filter(a => a.status === 'completed').length;

  return (
    <div id="scheduler_wrapper" className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* LEFT PANEL */}
      <div className="lg:col-span-4 space-y-6">
        <div id="agenda_stats_card" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Estado de Consultas
          </h2>

          <div className="grid grid-cols-2 gap-2 text-center">
            {[
              { filter: 'all', label: 'Activas', count: totalCount - completedCount, activeClass: 'bg-indigo-50/50 border-indigo-200 text-indigo-800 font-bold' },
              { filter: 'confirmed', label: 'Confirmadas', count: confirmedCount, activeClass: 'bg-emerald-50/50 border-emerald-200 text-emerald-800 font-bold' },
              { filter: 'pending', label: 'Pendientes', count: pendingCount, activeClass: 'bg-amber-50/50 border-amber-200 text-amber-800 font-bold' },
              { filter: 'archived', label: 'Archivadas', count: completedCount, activeClass: 'bg-slate-100 border-slate-300 text-slate-700 font-bold' },
            ].map(({ filter, label, count, activeClass }) => (
              <div
                key={filter}
                onClick={() => setAppointFilter(filter)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${appointFilter === filter ? activeClass : 'bg-slate-50/50 border-transparent text-slate-500 hover:bg-slate-50'}`}
              >
                <p className="text-sm">{label}</p>
                <p className="text-lg font-bold">{count}</p>
              </div>
            ))}
          </div>

          <button
            id="btn_toggle_add_appoint"
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-100 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Agendar Nueva Cita
          </button>
        </div>

        {/* GOOGLE CALENDAR SYNC */}
        <div id="google_calendar_card" className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3.5">
          <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${user?.calendarConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Google Calendar Sync</h3>
                <p className={`text-[10px] font-bold ${user?.calendarConnected ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {user?.calendarConnected ? '🟢 Integrado y conectado' : '🟠 Requiere conexión'}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-600 leading-relaxed">
            {user?.calendarConnected
              ? 'Las citas nuevas, modificadas o canceladas se actualizan automáticamente en Google Calendar.'
              : 'Vuelve a identificarte con Google una vez para autorizar Calendar.'}
          </p>
          {!user?.calendarConnected && (
            <button
              type="button"
              onClick={() => { window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`; }}
              className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Conectar Google Calendar
            </button>
          )}
        </div>

        <div className="bg-slate-100 p-4 rounded-3xl border border-slate-200/40 text-[11px] text-slate-500 leading-relaxed">
          <Sparkles className="h-4 w-4 text-indigo-600 mb-1" />
          <p className="font-semibold text-slate-700">Integración con Expedientes:</p>
          Las citas agendadas aquí se sincronizan automáticamente en el módulo de pacientes.
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="lg:col-span-8 space-y-6">
        {statusMsg && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl text-emerald-800 text-xs font-bold shadow-sm">
            {statusMsg}
          </div>
        )}

        {showAddForm && (
          <div id="booking_form_card" className="bg-white p-6 rounded-3xl border border-dashed border-indigo-200 bg-indigo-50/10 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-indigo-600" />
              Ingresa los Detalles de la Cita Médica
            </h3>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
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

              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800">
                <strong>Google Meet:</strong> al conectar Calendar, el enlace se creará automáticamente y se enviará al paciente. No tendrás que pegarlo manualmente.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="appoint_date_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fecha</label>
                  <input
                    id="appoint_date_input"
                    type="date"
                    required
                    value={appointDate}
                    onChange={(e) => { setAppointDate(e.target.value); setAppointTime(''); }}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  />
                </div>

                <div>
                  <label htmlFor="appoint_time_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hora</label>
                  <select
                    id="appoint_time_input"
                    value={appointTime}
                    onChange={(e) => setAppointTime(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                  >
                    <option value="">Selecciona un hueco...</option>
                    {availableTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="appoint_duration_input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Duración</label>
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

              <div>
                <label htmlFor="appoint_notes" className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Motivo Clínico</label>
                <textarea
                  id="appoint_notes"
                  rows={2}
                  placeholder="Ej: Trabajar asertividad frente a pánico social"
                  value={appointNotes}
                  onChange={(e) => setAppointNotes(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                />
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-white text-slate-500">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md font-bold">
                  Reservar Cita
                </button>
              </div>
            </form>
          </div>
        )}

        {/* APPOINTMENTS LIST */}
        <div id="appointments_board" className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{appointFilter === 'archived' ? 'Historial de sesiones' : 'Próximas sesiones'}</h3>
              <p className="text-[11px] text-slate-400">Filtrado por el estado seleccionado a la izquierda</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-xl border flex items-center gap-1">
              <Clock className="h-3 w-3" /> Horario: Local
            </span>
          </div>

          <div className="space-y-3">
            {filteredAppointments.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border border-dashed">
                <CalendarDays className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-semibold">No tienes consultas programadas</p>
              </div>
            ) : (
              filteredAppointments.map((app) => {
                const label = TYPE_LABELS[app.type] || 'Sesión Clínica';

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
                    className={`p-4 rounded-2xl border border-slate-100 bg-white transition-all hover:border-indigo-150 flex flex-col md:flex-row md:items-center justify-between gap-4 ${app.status === 'cancelled' ? 'opacity-60 bg-slate-50/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-indigo-50 text-indigo-700 p-2.5 rounded-2xl mt-0.5 flex flex-col items-center justify-center font-bold text-xs h-12 w-12 border border-indigo-100 flex-shrink-0">
                        <span className="text-[10px] font-normal leading-none uppercase text-indigo-400">Hora</span>
                        <span className="text-sm leading-none mt-1">{app.time}</span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-bold text-slate-800">{app.patientName}</h4>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {label}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusBadgeColor}`}>
                            <StatusIcon className="h-2.5 w-2.5" />
                            {app.status === 'confirmed' ? 'Confirmada' : app.status === 'pending' ? 'Pendiente' : app.status === 'completed' ? 'Completada' : 'Cancelada'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span>📅 {readableDate} ({app.duration} min)</span>
                          <span className="italic text-slate-500">Objetivo: {app.notes}</span>
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                          <Video className="h-3 w-3 text-indigo-500" />
                          <span>
                            {app.meetingPlatform === 'zoom'
                              ? 'Zoom'
                              : app.meetingPlatform === 'in_person'
                                ? 'Presencial'
                                : 'Google Meet'}
                          </span>
                          {app.meetingUrl && (
                            <a
                              href={app.meetingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 underline"
                            >
                              Abrir videollamada
                            </a>
                          )}
                          {!app.meetingUrl && app.status === 'confirmed' && (
                            <a href="https://meet.google.com/new" target="_blank" rel="noreferrer" className="text-indigo-600 underline">
                              Crear reunión en Meet
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end md:self-center">
                      <button type="button" onClick={() => shareManagementLink(app)} className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold uppercase text-indigo-600 hover:bg-indigo-50 rounded-lg">
                        <Share2 className="h-3 w-3" /> Compartir
                      </button>
                      {app.status !== 'confirmed' && app.status !== 'completed' && (
                        <button onClick={() => props.onUpdateAppointmentStatus(app.id, 'confirmed')} className="px-2 py-1 text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer">
                          Confirmar
                        </button>
                      )}
                      {app.status === 'confirmed' && (
                        <button onClick={() => props.onUpdateAppointmentStatus(app.id, 'completed')} className="px-2 py-1 text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg cursor-pointer">
                          Terminar y archivar
                        </button>
                      )}
                      {app.status !== 'cancelled' && (
                        <button onClick={() => props.onUpdateAppointmentStatus(app.id, 'cancelled')} className="px-2 py-1 text-[10px] font-semibold uppercase bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg cursor-pointer">
                          Cancelar
                        </button>
                      )}
                      <button onClick={() => props.onDeleteAppointment(app.id)} className="p-1.5 text-slate-350 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer">
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
