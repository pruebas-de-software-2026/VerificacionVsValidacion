import { CreateClientForm } from "./create-client-form";
import { ClientsTable } from "./clients-table";
import { fetchClientsList } from "@/lib/fetch-catalog";

export default async function ClientsPage() {
  const result = await fetchClientsList();

  const clients = result.ok ? result.data.items : [];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Clientes</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Catálogo maestro de clientes. Solo administradores pueden crear o editar registros.
        </p>
      </header>
      <CreateClientForm />
      {!result.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">No se pudo cargar el listado. Intenta de nuevo más tarde.</p>
      ) : null}
      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Listado</h2>
        <ClientsTable clients={clients} />
      </section>
    </div>
  );
}
