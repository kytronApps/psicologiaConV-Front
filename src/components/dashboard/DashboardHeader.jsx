import { CalendarDays, Sun } from "lucide-react";

const DashboardHeader = ({ user, appointmentsToday = 0 }) => {
  const currentHour = new Date().getHours();

  const getGreeting = () => {
    if (currentHour < 12) return "Buenos días";
    if (currentHour < 20) return "Buenas tardes";
    return "Buenas noches";
  };

  const getAppointmentMessage = () => {
    if (appointmentsToday === 0) {
      return "Hoy no tienes citas programadas.";
    }

    if (appointmentsToday === 1) {
      return "Hoy tienes 1 cita programada.";
    }

    return `Hoy tienes ${appointmentsToday} citas programadas.`;
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-4 mb-3">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sun className="h-5 w-5 text-amber-500" />

            <h1 className="text-2xl font-bold text-slate-800">
              {getGreeting()}
              {user?.name ? `, ${user.name}` : ""}
            </h1>
          </div>

          <p className="text-slate-500">
            Bienvenido de nuevo a <strong>Psicología Con V</strong>.
          </p>

          <div className="flex items-center gap-2 mt-2 text-sm text-emerald-700 font-medium">
            <CalendarDays className="h-5 w-5" />

            <span>{getAppointmentMessage()}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardHeader;
