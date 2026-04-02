/** Etiquetas en español para rutas de validación (Zod) mostradas en formularios. */
const LABELS: Record<string, string> = {
  name: "Nombre",
  email: "Correo electrónico",
  phone: "Teléfono",
  address: "Dirección",
  specialty: "Especialidad",
  clientId: "Cliente",
  technicianId: "Técnico",
  date: "Fecha",
  startTime: "Hora de inicio",
  description: "Descripción",
  startAt: "Inicio",
  endAt: "Fin",
};

export function etiquetaCampo(path: string): string {
  return LABELS[path] ?? path;
}
