"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onLogout() {
    setPending(true);
    try {
      const res = await fetch("/backend/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={onLogout}>
      {pending ? "Cerrando…" : "Cerrar sesión"}
    </Button>
  );
}
