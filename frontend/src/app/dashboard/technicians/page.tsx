import { CreateTechnicianForm } from "./create-technician-form";
import { TechniciansTable } from "./technicians-table";
import { fetchTechniciansList } from "@/lib/fetch-catalog";

export default async function TechniciansPage() {
  const result = await fetchTechniciansList();

  const technicians = result.ok ? result.data.items : [];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Técnicos</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Gestión del equipo técnico. El interruptor actualiza el estado activo (solo administradores).
        </p>
      </header>
      <CreateTechnicianForm />
      {!result.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">No se pudo cargar el listado. Intenta de nuevo más tarde.</p>
      ) : null}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Listado</h2>
        <TechniciansTable technicians={technicians} />
      </section>
    </div>
  );
}
