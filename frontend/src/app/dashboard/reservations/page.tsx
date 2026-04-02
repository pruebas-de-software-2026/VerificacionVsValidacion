import Link from "next/link";
import { fetchClientsList, fetchTechniciansList } from "@/lib/fetch-catalog";
import { fetchAuthUser } from "@/lib/fetch-session";
import { fetchReservationsList } from "@/lib/fetch-reservations";
import { Button } from "@/components/ui/button";
import { CreateReservationForm } from "./create-reservation-form";
import { ReservationsTable } from "./reservations-table";

export default async function ReservationsPage() {
  const [clientsResult, techResult, reservationsResult, authResult] = await Promise.all([
    fetchClientsList(),
    fetchTechniciansList(),
    fetchReservationsList(),
    fetchAuthUser(),
  ]);

  const unauthorized =
    (!clientsResult.ok && clientsResult.error === "unauthorized") ||
    (!techResult.ok && techResult.error === "unauthorized") ||
    (!reservationsResult.ok && reservationsResult.error === "unauthorized");

  if (unauthorized) {
    return (
      <div className="space-y-4">
        <p className="text-zinc-700 dark:text-zinc-300">Debes iniciar sesión para gestionar reservas.</p>
        <Button asChild variant="outline">
          <Link href="/login">Ir al inicio de sesión</Link>
        </Button>
      </div>
    );
  }

  const clients = clientsResult.ok ? clientsResult.data.items : [];
  const technicians = techResult.ok ? techResult.data.items : [];
  const reservations = reservationsResult.ok ? reservationsResult.data.items : [];
  const isAdmin = authResult.ok && authResult.user.role === "ADMIN";

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Reservas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Consulta las próximas citas ordenadas por técnico y fecha. Cancelar no borra el registro: el estado pasa a
          cancelado y queda trazabilidad para auditoría.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Próximas reservas</h2>
        {!reservationsResult.ok ? (
          <p className="text-sm text-amber-800 dark:text-amber-200">No se pudo cargar el listado de reservas.</p>
        ) : (
          <>
            <ReservationsTable items={reservations} isAdmin={isAdmin} />
            {!isAdmin ? (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tu rol es solo lectura: puedes ver la agenda, pero no cancelar ni crear reservas desde esta vista.
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
        <p className="rounded-lg border border-zinc-200 bg-zinc-100/80 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
          Solo los administradores pueden crear nuevas reservas. Si necesitas una cita, contacta a un administrador.
        </p>
      )}
    </div>
  );
}
