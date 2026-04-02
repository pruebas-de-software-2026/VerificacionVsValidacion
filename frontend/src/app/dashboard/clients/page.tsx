import { CreateClientForm } from "./create-client-form";
import { ClientsListView } from "./clients-list-view";
import { fetchClientsList } from "@/lib/fetch-catalog";
import { parseClientsListQuery } from "@/lib/list-query";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const query = parseClientsListQuery(sp);
  const result = await fetchClientsList(query);

  const clients = result.ok ? result.data.items : [];
  const total = result.ok ? result.data.total : 0;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Clientes</h1>
        <p className="text-muted-foreground text-sm">
          Catálogo maestro de clientes. Solo administradores pueden crear o editar registros.
        </p>
      </header>
      <CreateClientForm />
      {!result.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No se pudo cargar el listado. Intenta de nuevo más tarde.
        </p>
      ) : null}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Listado</h2>
        <ClientsListView
          clients={clients}
          total={total}
          query={query}
          pathname="/dashboard/clients"
        />
      </section>
    </div>
  );
}
