import DashboardStats from "./DashboardStats";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-3xl font-bold text-slate-800 mb-8">
          Dashboard
        </h1>

        <DashboardStats
          totalPatients={0}
          appointmentsToday={0}
        />

      </div>
    </div>
  );
};

export default Dashboard;