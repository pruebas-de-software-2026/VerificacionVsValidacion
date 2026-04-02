import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 font-sans dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8 text-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
            Reservas técnicas
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Panel de gestión
          </h1>
          <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
            Accede con tu cuenta de administrador para gestionar clientes y técnicos.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
