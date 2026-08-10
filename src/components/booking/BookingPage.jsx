import { useEffect, useMemo, useState } from "react";
import { CalendarDays, HeartHandshake } from "lucide-react";
import { getAvailableSlots } from "../../utils/bookingSlots";
import { useParams } from "react-router-dom";

export default function BookingPage() {
  const { psychologistId } = useParams();
  const [availability, setAvailability] = useState({ days: [], start: "09:00", end: "17:00" });
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [managementPath, setManagementPath] = useState("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${apiUrl}/api/public/booking/${psychologistId}`)
      .then((response) => response.json())
      .then((data) => {
        setAvailability(data.availability);
        setAppointments(data.occupied || []);
      });
  }, [apiUrl, psychologistId]);

  const slots = useMemo(() => {
    return getAvailableSlots({ date, availability, appointments, duration: 50 });
  }, [availability, appointments, date]);

  const submit = async (event) => {
    event.preventDefault();
    const response = await fetch(`${apiUrl}/api/public/booking/${psychologistId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      patientName: name,
      patientEmail: email,
      date,
      time,
      duration: 50,
      }),
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "No se pudo solicitar la cita.");
      return;
    }
    setManagementPath(result.path);
    setMessage("Solicitud enviada. El profesional debe confirmarla.");
    setTime("");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <HeartHandshake className="mx-auto h-10 w-10 text-emerald-600" />
          <h1 className="mt-3 text-2xl font-bold text-slate-800">Reservar una cita</h1>
          <p className="text-sm text-slate-500">Selecciona uno de los horarios disponibles.</p>
        </div>
        <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre completo" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo electrónico" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <label className="block text-xs font-bold text-slate-500">
            Fecha
            <input required type="date" min={new Date().toISOString().slice(0, 10)} value={date} onChange={(event) => { setDate(event.target.value); setTime(""); }} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          </label>
          <div>
            <p className="mb-2 text-xs font-bold text-slate-500">Horas disponibles</p>
            <div className="flex flex-wrap gap-2">
              {date && slots.length === 0 && <p className="text-xs text-amber-700">No hay disponibilidad para ese día.</p>}
              {slots.map((slot) => (
                <button key={slot} type="button" onClick={() => setTime(slot)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${time === slot ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600'}`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <button disabled={!time} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-40">
            <CalendarDays className="h-4 w-4" /> Solicitar cita
          </button>
          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
          {managementPath && <a href={managementPath} className="block text-center text-sm font-bold text-indigo-700 underline">Gestionar esta cita</a>}
        </form>
      </div>
    </main>
  );
}
