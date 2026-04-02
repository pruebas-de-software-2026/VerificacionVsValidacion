"use client";

import { Filter, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
};

export function ListFilterCollapsible({
  title = "Búsqueda y filtros",
  children,
  defaultOpen = true,
  className,
}: Props) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={cn("w-full", className)}>
      <CollapsibleTrigger className="border-border/80 bg-muted/30 hover:bg-muted/50 flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors">
        <span className="flex items-center gap-2">
          <Filter className="text-muted-foreground size-4" aria-hidden />
          {title}
        </span>
        <ChevronDown className="text-muted-foreground size-4 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="border-border/80 space-y-4 border border-t-0 rounded-b-lg bg-background/80 px-3 py-4 sm:px-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
