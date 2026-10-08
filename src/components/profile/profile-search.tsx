import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fullNameOf, roleLabel } from "@/lib/rbac";
import { ProfilePreviewModal } from "./profile-view";
import type { Row } from "@/lib/db";

/** Debounced search over workspace profiles, opens a read-only preview on click. */
export function ProfileSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const { data: results, isFetching } = useQuery({
    queryKey: ["profile-search", debounced],
    enabled: debounced.length > 0,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, full_name, email, role, department, avatar_url")
        .or(
          `full_name.ilike.%${debounced}%,first_name.ilike.%${debounced}%,last_name.ilike.%${debounced}%,email.ilike.%${debounced}%,department.ilike.%${debounced}%`,
        )
        .limit(8);
      if (error) throw error;
      return (data ?? []) as unknown as Row[];
    },
  });

  return (
    <div className={className}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un profil…"
          className="h-8 w-full rounded-lg border border-sidebar-border bg-sidebar-accent/40 pl-8 pr-7 text-xs outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40"
        />
        {isFetching && (
          <Loader2 className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {debounced.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {(results ?? []).length === 0 && !isFetching && (
            <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Aucun profil trouvé.</p>
          )}
          {(results ?? []).map((p) => {
            const name = fullNameOf(p, (p["email"] as string) ?? "Membre");
            return (
              <button
                key={p["id"] as string}
                onClick={() => setSelected(p["id"] as string)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-sidebar-accent"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border bg-surface text-[9px] font-bold">
                  {String(name).split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-semibold">{name}</span>
                  <span className="block truncate text-[10px] text-muted-foreground">
                    {roleLabel(p["role"] as string) || (p["department"] as string) || ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <ProfilePreviewModal
        userId={selected}
        open={!!selected}
        onOpenChange={(o) => {
          if (!o) setSelected(null);
        }}
      />
    </div>
  );
}
