import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getAvailableSlots } from "../../utils/bookingSlots";

export default function ManageBookingPage() {
  const { token } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [availability, setAvailability] = useState({ days: [], start: "09:00", end: "17:00" });
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/public/appointments/${token}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const item = await response.json();
        setAppointment(item);
        setDate(item.date);
        setTime(item.time);
        const availabilityResponse = await fetch(`${apiUrl}/api/public/booking/${item.psychologistId}`);
        const data = await availabilityResponse.json();
        setAvailability(data.availability);
        setAppointments(data.occupied || []);
      })
      .finally(() => setLoading(false));
  }, [apiUrl, token]);
  const slots = useMemo(
    () => getAvailableSlots({
      date,
      availability,
      appointments,
      duration: appointment?.duration || 50,
      excludeAppointmentId: appointment?.id,
    }),
    [appointment?.duration, appointment?.id, appointments, availability, date],
  );

  if (loading) return <main className="p-10 text-center text-slate-600">Cargando cita...</main>;
  if (!appointment) {
    return <main className="p-10 text-center text-slate-600">La cita no existe o el enlace ya no es válido.</main>;
  }

  const updatePublic = async (changes) => {
    const response = await fetch(`${apiUrl}/api/public/appointments/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(changes),
    });
    if (!response.ok) throw new Error((await response.json()).error);
    const updated = await response.json();
    setAppointment(updated);
  };

  const saveChange = async () => {
    if (!slots.includes(time)) return;
    await updatePublic({ date, time, status: "pending" });
    setMessage("Cambio solicitado. El profesional debe confirmar el nuevo horario.");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <section className="mx-auto max-w-xl space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Gestionar mi cita</h1>
          <p className="text-sm text-slate-500">{appointment.patientName} · {appointment.date} a las {appointment.time}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={async () => { await updatePublic({ status: "confirmed" }); setMessage("Cita aceptada."); }} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white">Aceptar cita</button>
          <button onClick={async () => { await updatePublic({ status: "cancelled" }); setMessage("Cita cancelada."); }} className="rounded-xl bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">Cancelar cita</button>
        </div>
        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-bold text-slate-700">Solicitar otro horario</h2>
          <input type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <div className="mt-3 flex flex-wrap gap-2">
            {slots.map((slot) => <button key={slot} type="button" onClick={() => setTime(slot)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${time === slot ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}>{slot}</button>)}
            {date && slots.length === 0 && <p className="text-xs text-amber-700">No quedan huecos disponibles ese día.</p>}
          </div>
          <button type="button" disabled={!slots.includes(time)} onClick={saveChange} className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">Solicitar cambio</button>
        </div>
        {message && <p className="rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">{message}</p>}
      </section>
    </main>
  );
}
