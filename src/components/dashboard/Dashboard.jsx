import DashboardStats from "./DashboardStats";
import useClinicalData from "../../context/useClinicalData";

const Dashboard = () => {
  const { patients, appointments } = useClinicalData();
  const today = new Date().toISOString().slice(0, 10);
  const appointmentsToday = appointments.filter(
    (appointment) => appointment.date === today,
  ).length;

  return (
    <div className="space-y-6">
      <DashboardStats
        totalPatients={patients.length}
        appointmentsToday={appointmentsToday}
      />
    </div>
  );
};

export default Dashboard;
