import AppointmentScheduler from "../AppointmentScheduler";
import useClinicalData from "../../context/useClinicalData";
import AvailabilitySettings from "../AvailabilitySettings";

const Calendar = () => {
  const {
    appointments,
    patients,
    availability,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getSharePath,
  } = useClinicalData();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Agenda de citas</h1>
        <p className="text-sm text-slate-500">
          Prueba la agenda clínica. Google Calendar, Meet y Zoom se conectarán mediante sus APIs en la siguiente fase.
        </p>
      </div>
      <AvailabilitySettings />
      <AppointmentScheduler
        appointments={appointments}
        patients={patients}
        availability={availability}
        onAddAppointment={addAppointment}
        onUpdateAppointmentStatus={updateAppointmentStatus}
        onDeleteAppointment={deleteAppointment}
        onGetSharePath={getSharePath}
      />
    </section>
  );
};

export default Calendar;
