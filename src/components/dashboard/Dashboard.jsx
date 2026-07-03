import DashboardHeader from "./DashboardHeader";
import DashboardStats from "./DashboardStats";
import useAuth from "../../context/useAuth";
import SelectOptions from "./SelectOptions";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <DashboardHeader
        user={user}
        appointmentsToday={0}
      />
      <SelectOptions />
      
      <DashboardStats
        totalPatients={0}
        appointmentsToday={0}
      />
    </div>
  );
};

export default Dashboard;