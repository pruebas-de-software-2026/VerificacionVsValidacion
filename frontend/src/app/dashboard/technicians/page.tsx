import { CreateTechnicianForm } from "./create-technician-form";
import { TechniciansListView } from "./technicians-list-view";
import { fetchTechniciansList } from "@/lib/fetch-catalog";
import { parseTechniciansListQuery } from "@/lib/list-query";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TechniciansPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = parseTechniciansListQuery(sp);
  const result = await fetchTechniciansList(query);

  const technicians = result.ok ? result.data.items : [];
  const total = result.ok ? result.data.total : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Técnicos</h1>
        <p className="text-muted-foreground text-sm">
          Gestión del equipo técnico. El interruptor actualiza el estado activo (solo administradores).
        </p>
      </header>
      <CreateTechnicianForm />
      {!result.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No se pudo cargar el listado. Intenta de nuevo más tarde.
        </p>
      ) : null}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Listado</h2>
        <TechniciansListView
          technicians={technicians}
          total={total}
          query={query}
          pathname="/dashboard/technicians"
        />
      </section>
    </div>
  );
}
