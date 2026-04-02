"use client";

import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type FormSearchableSelectOption = {
  value: string;
  label: string;
  /** Texto adicional indexado por la búsqueda (sin mostrar). */
  keywords?: string;
};

type Props = {
  name: string;
  options: FormSearchableSelectOption[];
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
};

export function FormSearchableSelect({
  name,
  options,
  id,
  placeholder = "Seleccionar…",
  searchPlaceholder = "Buscar…",
  emptyLabel = "Sin coincidencias.",
  required,
  defaultValue = "",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label;

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-expanded={open}
            className="h-9 w-full justify-between border-input font-normal shadow-sm"
          >
            <span className={cn("truncate", !label && "text-muted-foreground")}>
              {label ?? placeholder}
            </span>
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" aria-hidden />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>{emptyLabel}</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => {
                  const searchValue = [opt.value, opt.label, opt.keywords ?? ""].join(" ").trim();
                  return (
                    <CommandItem
                      key={opt.value}
                      value={searchValue}
                      className={cn(
                        "[&>svg:last-child]:hidden",
                        value === opt.value && "bg-muted font-medium",
                      )}
                      onSelect={() => {
                        setValue(opt.value);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate">{opt.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  );
}
