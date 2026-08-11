import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

/* --------------------------------- session -------------------------------- */

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user ?? null;
    },
    staleTime: 5 * 60_000,
  });
}

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles-directory"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return (data ?? []) as Row[];
    },
    staleTime: 60_000,
  });
}

export function useProfileMap() {
  const { data } = useProfiles();
  return useMemo(() => {
    const map: Record<string, Row> = {};
    for (const p of data ?? []) map[p['id'] as string] = p;
    return map;
  }, [data]);
}

export function displayName(profile?: Row, fallback = "Membre") {
  if (!profile) return fallback;
  return (profile['full_name'] as string) || (profile['email'] as string) || fallback;
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

/* ------------------------------ conversations ----------------------------- */

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*, conversation_members(user_id, last_read_at)")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      type: "dm" | "group" | "channel";
      name?: string | null;
      description?: string | null;
      memberIds: string[];
    }) => {
      const { data: userData } = await supabase.auth.getUser();
      const me = userData.user?.id;
      if (!me) throw new Error("Session expirée");
      const { data, error } = await supabase
        .from("conversations")
        .insert({ type: input.type, name: input.name ?? null, description: input.description ?? null })
        .select()
        .single();
      if (error) throw error;
      const members = Array.from(new Set([me, ...input.memberIds]));
      const { error: mErr } = await supabase
        .from("conversation_members")
        .insert(members.map((user_id) => ({ conversation_id: data.id, user_id })));
      if (mErr) throw mErr;
      return data as Row;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Conversation créée");
    },
    onError: (e: Error) => toast.error("Création impossible", { description: e.message }),
  });
}

/* --------------------------------- messages -------------------------------- */

export function useMessages(conversationId?: string) {
  return useQuery({
    queryKey: ["messages", conversationId],
    enabled: !!conversationId,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("*, message_reactions(id, emoji, user_id)")
        .eq("conversation_id", conversationId!)
        .order("created_at", { ascending: true })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useSendMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      body: string;
      parent_id?: string | null;
      attachment_path?: string | null;
      attachment_name?: string | null;
      attachment_type?: string | null;
      mentions?: string[];
    }) => {
      if (!conversationId) throw new Error("Aucune conversation sélectionnée");
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          body: input.body,
          parent_id: input.parent_id ?? null,
          attachment_path: input.attachment_path ?? null,
          attachment_name: input.attachment_name ?? null,
          attachment_type: input.attachment_type ?? null,
          mentions: input.mentions ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
      if ((input.mentions ?? []).length) {
        await supabase.from("notifications").insert(
          (input.mentions ?? []).map((uid) => ({
            user_id: uid,
            title: "Vous avez été mentionné",
            body: input.body.slice(0, 140),
            category: "message",
            priority: "high",
            link: "/messages",
          })),
        );
      }
      return data as Row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
    onError: (e: Error) => toast.error("Envoi impossible", { description: e.message }),
  });
}

export function useUpdateMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Row }) => {
      const { error } = await supabase.from("messages").update(values as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
    onError: (e: Error) => toast.error("Action impossible", { description: e.message }),
  });
}

export function useDeleteMessage(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
    onError: (e: Error) => toast.error("Suppression impossible", { description: e.message }),
  });
}

export function useToggleReaction(conversationId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji, existingId }: { messageId: string; emoji: string; existingId?: string }) => {
      if (existingId) {
        const { error } = await supabase.from("message_reactions").delete().eq("id", existingId);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.from("message_reactions").insert({ message_id: messageId, emoji });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages", conversationId] }),
    onError: (e: Error) => toast.error("Réaction impossible", { description: e.message }),
  });
}

/** Realtime sync for a conversation's messages and reactions. */
export function useRealtimeMessages(conversationId?: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, () => {
        qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "message_reactions" }, () => {
        qc.invalidateQueries({ queryKey: ["messages", conversationId] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, qc]);
}

/** Presence + typing indicator for a conversation. */
export function usePresence(conversationId: string | undefined, userId: string | undefined, name: string) {
  const qc = useQueryClient();
  useEffect(() => {
    if (!conversationId || !userId) return;
    const channel = supabase.channel(`presence-${conversationId}`, { config: { presence: { key: userId } } });
    channel
      .on("presence", { event: "sync" }, () => {
        qc.setQueryData(["presence", conversationId], channel.presenceState());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") await channel.track({ name, typing: false, at: Date.now() });
      });
    (window as any).__pfPresence = channel;
    return () => {
      supabase.removeChannel(channel);
      (window as any).__pfPresence = undefined;
    };
  }, [conversationId, userId, name, qc]);

  const presence = useQuery<Record<string, any[]>>({
    queryKey: ["presence", conversationId],
    enabled: !!conversationId,
    initialData: {},
    queryFn: async () => ({}),
    staleTime: Infinity,
  });

  const setTyping = (typing: boolean) => {
    const ch = (window as any).__pfPresence;
    if (ch) ch.track({ name, typing, at: Date.now() });
  };

  return { state: presence.data ?? {}, setTyping };
}

export function useMarkRead(conversationId?: string, userId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!conversationId || !userId) return;
      await supabase
        .from("conversation_members")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("user_id", userId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });
}

/* --------------------------------- comments -------------------------------- */

export function useComments(entityTable: string, entityId?: string) {
  return useQuery({
    queryKey: ["comments", entityTable, entityId],
    enabled: !!entityId,
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("entity_table", entityTable)
        .eq("entity_id", entityId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useAddComment(entityTable: string, entityId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { body: string; parent_id?: string | null }) => {
      if (!entityId) throw new Error("Élément introuvable");
      const { error } = await supabase.from("comments").insert({
        entity_table: entityTable,
        entity_id: entityId,
        body: input.body,
        parent_id: input.parent_id ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", entityTable, entityId] }),
    onError: (e: Error) => toast.error("Commentaire impossible", { description: e.message }),
  });
}

export function useDeleteComment(entityTable: string, entityId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", entityTable, entityId] }),
    onError: (e: Error) => toast.error("Suppression impossible", { description: e.message }),
  });
}

/* ------------------------------ notifications ------------------------------ */

export function useNotifications() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("notifications-stream")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => {
        qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return useQuery({
    queryKey: ["notifications"],
    queryFn: async (): Promise<Row[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

export function useMarkNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      if (!ids.length) return;
      const { error } = await supabase.from("notifications").update({ read: true }).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60_000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" }).format(new Date(iso));
};
