import { fetchClientsList, fetchTechniciansList } from "@/lib/fetch-catalog";
import { fetchAuthUser } from "@/lib/fetch-session";
import { fetchReservationsList } from "@/lib/fetch-reservations";
import { parseReservationsListQuery } from "@/lib/list-query";
import { CreateReservationForm } from "./create-reservation-form";
import { ReservationsListView } from "./reservations-list-view";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReservationsPage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const listQuery = parseReservationsListQuery(sp);

  const [clientsResult, techResult, reservationsResult, authResult] = await Promise.all([
    fetchClientsList({ page: 1, pageSize: 100 }),
    fetchTechniciansList({ page: 1, pageSize: 100 }),
    fetchReservationsList(listQuery),
    fetchAuthUser(),
  ]);

  const clients = clientsResult.ok ? clientsResult.data.items : [];
  const technicians = techResult.ok ? techResult.data.items : [];
  const reservations = reservationsResult.ok ? reservationsResult.data.items : [];
  const total = reservationsResult.ok ? reservationsResult.data.total : 0;
  const isAdmin = authResult.ok && authResult.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reservas</h1>
        <p className="text-muted-foreground text-sm">
          Consulta las citas ordenadas por técnico y fecha. Cancelar no borra el registro: el estado
          pasa a cancelado y queda trazabilidad para auditoría.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-foreground">Agenda</h2>
        {!reservationsResult.ok ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">
            No se pudo cargar el listado de reservas.
          </p>
        ) : (
          <>
            <ReservationsListView
              items={reservations}
              total={total}
              query={listQuery}
              pathname="/dashboard/reservations"
              isAdmin={isAdmin}
            />
            {!isAdmin ? (
              <p className="text-muted-foreground text-xs">
                Tu rol es solo lectura: puedes ver la agenda, pero no cancelar ni crear reservas desde
                esta vista.
              </p>
            ) : null}
          </>
        )}
      </section>

      {!clientsResult.ok || !techResult.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No se pudieron cargar clientes o técnicos. Intenta de nuevo más tarde.
        </p>
      ) : isAdmin ? (
        <CreateReservationForm clients={clients} technicians={technicians} />
      ) : (
        <p className="text-muted-foreground rounded-lg border border-border/80 bg-muted/30 px-4 py-3 text-sm">
          Solo los administradores pueden crear nuevas reservas. Si necesitas una cita, contacta a un
          administrador.
        </p>
      )}
    </div>
  );
}
