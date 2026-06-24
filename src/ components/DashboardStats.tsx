import { Users, CalendarDays } from 'lucide-react';

interface DashboardStatsProps {
  totalPatients: number;
  appointmentsToday: number;
}

export default function DashboardStats(props: DashboardStatsProps) {
  const countPatients = props.totalPatients;
  const countAppointments = props.appointmentsToday;

  return (
    <div id="stats_container" className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div id="stat_patients" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl">
          <Users className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Historial Activos</p>
          <p className="text-2xl font-bold text-slate-800">{countPatients}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Fichas Clínicas Seguras</p>
        </div>
      </div>

      <div id="stat_appointments" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
        <div className="bg-indigo-50 text-indigo-700 p-3 rounded-xl">
          <CalendarDays className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Citas de Hoy</p>
          <p className="text-2xl font-bold text-slate-800">{countAppointments}</p>
          <p className="text-[11px] text-indigo-600 font-medium">Sincronizadas de Agenda</p>
        </div>
      </div>
    </div>
  );
}

