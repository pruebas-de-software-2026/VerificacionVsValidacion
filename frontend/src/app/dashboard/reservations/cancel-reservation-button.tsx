"use client";

import { Ban } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { cancelReservationAction, type ReservationActionState } from "./actions";

const initial: ReservationActionState = {};

type Props = {
  reservationId: string;
};

export function CancelReservationButton({ reservationId }: Props) {
  const [state, formAction, pending] = useActionState(cancelReservationAction, initial);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="reservationId" value={reservationId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending}
        className="gap-1.5 text-red-700 hover:bg-red-500/10 dark:text-red-400"
      >
        <Ban className="size-3.5" aria-hidden />
        {pending ? "Cancelando…" : "Cancelar reserva"}
      </Button>
      {state.error ? (
        <span className="max-w-[12rem] text-right text-xs text-red-600 dark:text-red-400">{state.error}</span>
      ) : null}
    </form>
  );
}
