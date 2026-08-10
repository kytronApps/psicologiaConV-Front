export function getPatientFolderCode(patient) {
  if (!patient || !patient.name) return "PAT-XXXX";
  const parts = patient.name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.map((word) => word[0].toUpperCase()).join("");
  const year = patient.birthDate ? patient.birthDate.split("-")[0] : "1990";
  return `${initials}${year}`;
}

export function getPatientPassword(patient) {
  if (!patient || !patient.name) return "paciente123";
  const firstName = patient.name.trim().split(/\s+/)[0].toLowerCase();
  const normalized = firstName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return `${normalized}123`;
}
