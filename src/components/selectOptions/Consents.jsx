import ConsentForm from "../ConsentForm";
import useClinicalData from "../../context/useClinicalData";

const Consents = () => {
  const { patients, addFile } = useClinicalData();

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Carta de consentimiento</h1>
        <p className="text-sm text-slate-500">
          Genera, firma y asocia consentimientos al expediente del paciente.
        </p>
      </div>
      <ConsentForm patients={patients} onAddFile={addFile} />
    </section>
  );
};

export default Consents;
