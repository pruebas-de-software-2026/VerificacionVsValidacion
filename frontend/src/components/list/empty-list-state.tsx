import Link from "next/link";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  /** Si hay filtros activos, mostrar acción para limpiar. */
  clearHref?: string;
  clearLabel?: string;
};

export function EmptyListState({
  title,
  description,
  clearHref,
  clearLabel = "Limpiar filtros",
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/15 px-6 py-14 text-center">
      <div className="bg-muted/60 text-muted-foreground flex size-14 items-center justify-center rounded-2xl">
        <Inbox className="size-7" strokeWidth={1.5} />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-foreground font-medium">{title}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>
      {clearHref ? (
        <Button variant="outline" size="sm" asChild>
          <Link href={clearHref}>{clearLabel}</Link>
        </Button>
      ) : null}
    </div>
  );
}
