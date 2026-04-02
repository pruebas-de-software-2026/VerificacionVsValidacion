"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { buildListHref } from "./build-list-href";

type Props = {
  pathname: string;
  /** Valor inicial desde la URL (servidor). */
  defaultValue: string;
  /** Parámetros a conservar al actualizar `q` (sin `page`; se fuerza `page=1`). */
  mergeBase: Record<string, string | number | undefined | null>;
  placeholder?: string;
  debounceMs?: number;
};

export function UrlSearchField({
  pathname,
  defaultValue,
  mergeBase,
  placeholder = "Buscar…",
  debounceMs = 400,
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const mergeRef = useRef(mergeBase);

  useEffect(() => {
    mergeRef.current = mergeBase;
  }, [mergeBase]);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = value.trim();
      const cur = defaultValue.trim();
      if (trimmed === cur) {
        return;
      }
      router.replace(
        buildListHref(pathname, {
          ...mergeRef.current,
          q: trimmed || undefined,
          page: 1,
        }),
        { scroll: false },
      );
    }, debounceMs);
    return () => clearTimeout(t);
  }, [value, debounceMs, defaultValue, pathname, router]);

  return (
    <div className="relative max-w-md flex-1">
      <Search
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2"
        aria-hidden
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-9 pr-3 pl-9"
        aria-label={placeholder}
      />
    </div>
  );
}
