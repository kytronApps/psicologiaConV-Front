import PatientManager from "../PatientManager";
import useClinicalData from "../../context/useClinicalData";

const Patients = () => {
  const { patients, files, addPatient, addFile, updateFile, deleteFile } = useClinicalData();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Pacientes y expedientes</h1>
        <p className="text-sm text-slate-500">
          Crea pacientes, consulta sus fichas y prueba la gestión documental.
        </p>
      </div>
      <PatientManager
        patients={patients}
        files={files}
        onAddPatient={addPatient}
        onAddFile={addFile}
        onUpdateFile={updateFile}
        onDeleteFile={deleteFile}
      />
    </section>
  );
};

export default Patients;
