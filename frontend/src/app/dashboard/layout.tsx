import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Reservas técnicas
          </span>
          <nav className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/clients">Clientes</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/technicians">Técnicos</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/reservations">Reservas</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sesión</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Inicio</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
