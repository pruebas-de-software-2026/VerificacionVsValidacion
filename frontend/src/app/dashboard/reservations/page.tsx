import Link from "next/link";
import { fetchClientsList, fetchTechniciansList } from "@/lib/fetch-catalog";
import { Button } from "@/components/ui/button";
import { CreateReservationForm } from "./create-reservation-form";

export default async function ReservationsPage() {
  const [clientsResult, techResult] = await Promise.all([fetchClientsList(), fetchTechniciansList()]);

  if (
    (!clientsResult.ok && clientsResult.error === "unauthorized") ||
    (!techResult.ok && techResult.error === "unauthorized")
  ) {
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

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Reservas</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Crea citas sin solapamiento: si el técnico ya está ocupado en ese horario, verás un mensaje de conflicto.
        </p>
      </header>
      {!clientsResult.ok || !techResult.ok ? (
        <p className="text-sm text-amber-800 dark:text-amber-200">
          No se pudieron cargar clientes o técnicos. Intenta de nuevo más tarde.
        </p>
      ) : null}
      <CreateReservationForm clients={clients} technicians={technicians} />
    </div>
  );
}
