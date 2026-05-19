"use client";

import {
  useEffect, useRef, useState, useCallback, useMemo,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, CornerDownLeft, Hash, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandPaletteStore } from "../store/command-palette.store";
import { useCommandPaletteItems } from "../hooks/use-command-palette";
import type { CommandItem } from "../types";

/* ─── Kbd hint ───────────────────────────────────────────────────── */

function KbdKey({ children }: { children: string }) {
  return (
    <kbd className="inline-flex min-w-[18px] items-center justify-center rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
      {children}
    </kbd>
  );
}

function KbdHint({ keys }: { keys: string[] }) {
  return (
    <div className="flex items-center gap-0.5">
      {keys.map((k) => (
        <KbdKey key={k}>{k}</KbdKey>
      ))}
    </div>
  );
}

/* ─── Command item row ───────────────────────────────────────────── */

interface CommandItemRowProps {
  item: CommandItem;
  isFocused: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

function CommandItemRow({ item, isFocused, onMouseEnter, onClick }: CommandItemRowProps) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isFocused) {
      ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [isFocused]);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-100",
        isFocused
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent/50"
      )}
    >
      {/* Focus bar */}
      <div
        className={cn(
          "absolute left-0 top-1/2 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-all duration-150",
          isFocused ? "h-5 opacity-100" : "h-0 opacity-0"
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors duration-100",
          isFocused
            ? "bg-primary/15 text-primary"
            : "bg-muted/70 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
        )}
      >
        <item.icon className="h-3.5 w-3.5" />
      </div>

      {/* Label + sublabel */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-snug">{item.label}</p>
        {item.sublabel && (
          <p
            className={cn(
              "mt-0.5 truncate text-[11px] leading-snug transition-colors",
              isFocused ? "text-accent-foreground/60" : "text-muted-foreground"
            )}
          >
            {item.sublabel}
          </p>
        )}
      </div>

      {/* Badge */}
      {item.badge && (
        <span
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold",
            item.badge.className
          )}
        >
          {item.badge.label}
        </span>
      )}

      {/* Right side: shortcut or enter hint */}
      <div className="ml-auto shrink-0">
        {item.shortcut ? (
          <div
            className={cn(
              "transition-opacity duration-100",
              isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            )}
          >
            <KbdHint keys={item.shortcut} />
          </div>
        ) : isFocused ? (
          <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
        ) : null}
      </div>
    </button>
  );
}

/* ─── Group header ───────────────────────────────────────────────── */

function GroupHeader({ label }: { label: string }) {
  return (
    <div className="mb-0.5 flex items-center gap-2 px-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

/* ─── Empty state ────────────────────────────────────────────────── */

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-muted/40">
        <Search className="h-5 w-5 text-muted-foreground/50" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          Sin resultados para &ldquo;{query}&rdquo;
        </p>
        <p className="text-xs text-muted-foreground">
          Probá buscar por nombre, dirección, email o ID
        </p>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */

export function CommandPalette() {
  const { isOpen, query, open, close, setQuery, recentItems } = useCommandPaletteStore();
  const [focusedIndex, setFocusedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Debounced query for search */
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 120);
    return () => clearTimeout(t);
  }, [query]);

  const groups = useCommandPaletteItems(debouncedQuery);

  /* Flat item list for keyboard navigation */
  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  /* Item → index map for O(1) lookup in render */
  const itemIndexMap = useMemo(() => {
    const m = new Map<string, number>();
    flatItems.forEach((item, i) => m.set(item.id, i));
    return m;
  }, [flatItems]);

  /* Reset focus when results change */
  useEffect(() => {
    setFocusedIndex(0);
  }, [debouncedQuery]);

  /* Global Ctrl+K / Cmd+K */
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) close();
        else open();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, open, close]);

  /* Auto-focus input */
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 60);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  /* Keyboard navigation */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusedIndex((i) => (i < flatItems.length - 1 ? i + 1 : i));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusedIndex((i) => (i > 0 ? i - 1 : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatItems[focusedIndex];
        if (item) item.onSelect();
      } else if (e.key === "Escape") {
        close();
      }
    },
    [flatItems, focusedIndex, close]
  );

  const handleItemClick = useCallback(
    (item: CommandItem) => {
      item.onSelect();
    },
    []
  );

  const hasQuery = debouncedQuery.trim().length > 0;
  const isEmpty = hasQuery && flatItems.length === 0;
  const showEmpty = !isOpen;

  if (showEmpty) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]"
            onClick={close}
          />

          {/* Container */}
          <div className="fixed left-1/2 top-[14%] z-50 w-full max-w-[640px] -translate-x-1/2 px-4">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden rounded-2xl border border-border/50 bg-background/95 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
              onKeyDown={handleKeyDown}
            >
              {/* ─── Input ─────────────────────────────────────────── */}
              <div className="flex items-center gap-3 border-b border-border/50 px-4 py-3.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground/70" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocusedIndex(0);
                  }}
                  placeholder="Buscar propiedades, contratos, inquilinos…"
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/50"
                  aria-label="Buscar"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Limpiar búsqueda"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <KbdKey>Esc</KbdKey>
                </div>
              </div>

              {/* ─── Results ───────────────────────────────────────── */}
              <div className="max-h-[min(496px,60vh)] overflow-y-auto overscroll-contain">
                {isEmpty ? (
                  <EmptyState query={debouncedQuery} />
                ) : (
                  <div className="p-2 pb-1">
                    {groups.map((group) => (
                      <div key={group.id} className="mb-3 last:mb-1">
                        <GroupHeader label={group.label} />
                        <div className="space-y-0.5">
                          {group.items.map((item) => {
                            const idx = itemIndexMap.get(item.id) ?? 0;
                            return (
                              <CommandItemRow
                                key={item.id}
                                item={item}
                                isFocused={focusedIndex === idx}
                                onMouseEnter={() => setFocusedIndex(idx)}
                                onClick={() => handleItemClick(item)}
                              />
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Footer ────────────────────────────────────────── */}
              <div className="flex items-center gap-4 border-t border-border/40 bg-muted/20 px-4 py-2">
                <div className="flex items-center gap-3.5 text-[10px] text-muted-foreground/70">
                  <span className="flex items-center gap-1.5">
                    <KbdHint keys={["↑", "↓"]} />
                    <span>Navegar</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <KbdKey>↵</KbdKey>
                    <span>Seleccionar</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <KbdKey>Esc</KbdKey>
                    <span>Cerrar</span>
                  </span>
                </div>

                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground/40">
                  {recentItems.length > 0 && !hasQuery && (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>{recentItems.length} reciente{recentItems.length !== 1 ? "s" : ""}</span>
                      <span className="mx-1">·</span>
                    </>
                  )}
                  <Hash className="h-3 w-3" />
                  <span>RentFlow</span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
