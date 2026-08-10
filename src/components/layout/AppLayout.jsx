import { Outlet } from "react-router-dom";
import DashboardHeader from "../dashboard/DashboardHeader";
import SelectOptions from "../dashboard/SelectOptions";
import useAuth from "../../context/useAuth";
import useClinicalData from "../../context/useClinicalData";

export default function AppLayout() {
  const { user } = useAuth();
  const { appointments } = useClinicalData();
  const today = new Date().toISOString().slice(0, 10);
  const appointmentsToday = appointments.filter(
    (appointment) => appointment.date === today,
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
          <DashboardHeader
            user={user}
            appointmentsToday={appointmentsToday}
          />
          <SelectOptions />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
