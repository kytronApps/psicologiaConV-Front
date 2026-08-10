import { Clock3 } from "lucide-react";
import useClinicalData from "../context/useClinicalData";
import useAuth from "../context/useAuth";

const DAYS = [
  [1, "Lunes"],
  [2, "Martes"],
  [3, "Miércoles"],
  [4, "Jueves"],
  [5, "Viernes"],
  [6, "Sábado"],
  [0, "Domingo"],
];

export default function AvailabilitySettings() {
  const { availability, updateAvailability } = useClinicalData();
  const { user } = useAuth();

  const toggleDay = (day) => {
    const days = availability.days.includes(day)
      ? availability.days.filter((value) => value !== day)
      : [...availability.days, day];
    updateAvailability({ ...availability, days });
  };

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Clock3 className="h-4 w-4 text-indigo-600" /> Disponibilidad para reservas
          </h2>
          <p className="text-xs text-slate-500">Los pacientes solo verán huecos dentro de estos días y horas.</p>
        </div>
        <a href={`/reservar/${user?.id || ''}`} target="_blank" rel="noreferrer" className="rounded-xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
          Ver página pública
        </a>
      </div>

      <div className="flex flex-wrap gap-2">
        {DAYS.map(([day, label]) => (
          <button key={day} type="button" onClick={() => toggleDay(day)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${availability.days.includes(day) ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Desde
          <input type="time" value={availability.start} onChange={(event) => updateAvailability({ ...availability, start: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" />
        </label>
        <label className="text-[10px] font-bold uppercase text-slate-400">
          Hasta
          <input type="time" value={availability.end} onChange={(event) => updateAvailability({ ...availability, end: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700" />
        </label>
      </div>
    </section>
  );
}
