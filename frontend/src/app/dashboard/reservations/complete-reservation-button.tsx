"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { completeReservationAction, type ReservationActionState } from "./actions";

const initial: ReservationActionState = {};

type Props = {
  reservationId: string;
};

export function CompleteReservationButton({ reservationId }: Props) {
  const [state, formAction, pending] = useActionState(completeReservationAction, initial);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="reservationId" value={reservationId} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "Marcando…" : "Completar"}
      </Button>
      {state.error ? (
        <span className="max-w-[12rem] text-right text-xs text-red-600 dark:text-red-400">{state.error}</span>
      ) : null}
    </form>
  );
}
