import { useContext } from "react";
import ClinicalDataContext from "./ClinicalDataContext";

export default function useClinicalData() {
  const context = useContext(ClinicalDataContext);
  if (!context) {
    throw new Error("useClinicalData debe usarse dentro de ClinicalDataProvider");
  }
  return context;
}
