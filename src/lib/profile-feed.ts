import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Row } from "@/lib/db";
import { uploadFile } from "@/lib/db";
import { useCurrentUser } from "@/lib/collab";

export function useProfilePosts(authorId?: string) {
  return useQuery({
    queryKey: ["profile-posts", authorId],
    enabled: !!authorId,
    retry: 1,
    queryFn: async (): Promise<Row[]> => {
      try {
        // NOTE: profile_posts.author_id has no FK to profiles in the base
        // migration, so PostgREST embeds with `!*_fkey` hints fail. Fetch
        // posts + child tables first, then join authors client-side.
        // Step 1: posts alone (never fails on embed). Likes/comments are
        // fetched separately so one bad embed can't hide the whole feed.
        const { data, error } = await supabase
          .from("profile_posts")
          .select("*")
          .eq("author_id", authorId!)
          .is("repost_of", null)
          .order("created_at", { ascending: false })
          .limit(50);
        if (error) throw error;
        const posts = (data ?? []) as unknown as Row[];
        if (!posts.length) return posts;

        const postIds = posts.map((p) => p["id"] as string);

        // Step 2: children (best-effort — feed stays visible even if empty).
        const likesByPost: Record<string, Row[]> = {};
        const commentsByPost: Record<string, Row[]> = {};
        const originalsById: Record<string, Row> = {};
        try {
          const [{ data: likes }, { data: comments }] = await Promise.all([
            supabase.from("profile_post_likes").select("*").in("post_id", postIds),
            supabase
              .from("profile_post_comments")
              .select("*")
              .in("post_id", postIds)
              .order("created_at", { ascending: true }),
          ]);
          for (const l of (likes ?? []) as unknown as Row[]) {
            const pid = l["post_id"] as string;
            (likesByPost[pid] ??= []).push(l);
          }
          for (const c of (comments ?? []) as unknown as Row[]) {
            const pid = c["post_id"] as string;
            (commentsByPost[pid] ??= []).push(c);
          }
        } catch (e) {
          console.warn("[profile-feed] likes/comments fetch failed (non-blocking):", e);
        }

        // Step 3: reposted originals (only the self-FK, which always exists).
        const repostIds = [
          ...new Set(posts.map((p) => p["repost_of"] as string | null).filter(Boolean)),
        ] as string[];
        // Normal wall posts have repost_of = null so this is skipped; kept for safety.
        if (repostIds.length) {
          try {
            const { data: originals } = await supabase
              .from("profile_posts")
              .select("*")
              .in("id", repostIds);
            for (const o of (originals ?? []) as unknown as Row[]) {
              originalsById[o["id"] as string] = o;
            }
          } catch (e) {
            console.warn("[profile-feed] originals fetch failed (non-blocking):", e);
          }
        }

        // Collect every user id we need profiles for (authors, commenters, originals).
        const ids = new Set<string>();
        for (const p of posts) {
          if (p["author_id"]) ids.add(p["author_id"] as string);
          for (const c of commentsByPost[p["id"] as string] ?? []) {
            if (c["user_id"]) ids.add(c["user_id"] as string);
          }
          const orig = p["repost_of"] ? (originalsById[p["repost_of"] as string] ?? null) : null;
          if (orig?.["author_id"]) ids.add(orig["author_id"] as string);
        }
        const byId: Record<string, Row> = {};
        if (ids.size) {
          const { data: profiles, error: pErr } = await supabase
            .from("profiles")
            .select("*")
            .in("id", [...ids]);
          if (!pErr) {
            for (const pr of (profiles ?? []) as unknown as Row[]) {
              byId[pr["id"] as string] = pr;
            }
          } else {
            console.warn("[profile-feed] profiles fetch failed (non-blocking):", pErr);
          }
        }

        return posts.map((p) => {
          const pid = p["id"] as string;
          const comments = (commentsByPost[pid] ?? []).map((c) => ({
            ...c,
            author: byId[c["user_id"] as string] ?? null,
          }));
          const origRaw = p["repost_of"] ? (originalsById[p["repost_of"] as string] ?? null) : null;
          const original = origRaw
            ? { ...origRaw, author: byId[origRaw["author_id"] as string] ?? null }
            : null;
          return {
            ...p,
            author: byId[p["author_id"] as string] ?? null,
            likes: likesByPost[pid] ?? [],
            comments,
            original,
          };
        });
      } catch (e) {
        console.error("[profile-feed] useProfilePosts failed:", e);
        throw friendlyPostError(e);
      }
    },
  });
}

function friendlyPostError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  // PostgREST schema cache = migration never applied on this project.
  if (/schema cache|PGRST205|Could not find the table/i.test(msg)) {
    return new Error(
      "Table « profile_posts » introuvable sur Supabase : appliquez la migration 20260902000000_profile_posts.sql dans le SQL Editor du projet emamjnjojllpwovjtsqm, puis rechargez.",
    );
  }
  return e instanceof Error ? e : new Error(msg);
}

export function useCreatePost(authorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ body, image }: { body: string; image?: File | null }) => {
      if (!body.trim() && !image) throw new Error("Publication vide");
      const { data: me } = await supabase.auth.getUser();
      const writerId = me.user?.id ?? authorId;
      if (!writerId) throw new Error("Non connecté");
      let image_path: string | null = null;
      if (image) image_path = await uploadFile(image, "messages");
      try {
        // NOTE: always write author_id = auth.uid() so the RLS
        // WITH CHECK (author_id = auth.uid()) passes. The `authorId` arg is
        // only the wall being viewed (for cache invalidation).
        const { data, error } = await supabase
          .from("profile_posts")
          .insert({ author_id: writerId, body: body.trim(), image_path })
          .select()
          .single();
        if (error) throw error;
        return data as Row;
      } catch (e) {
        throw friendlyPostError(e);
      }
    },
    onSuccess: (post, vars) => {
      // Invalidate the viewed wall AND the writer's own wall (they can differ
      // when posting on someone else's wall), plus the generic key used by reposts.
      qc.invalidateQueries({ queryKey: ["profile-posts", authorId] });
      const writerId = (post as Row)?.["author_id"] as string | undefined;
      if (writerId && writerId !== authorId) {
        qc.invalidateQueries({ queryKey: ["profile-posts", writerId] });
      }
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      toast.success(vars.image ? "Publication avec image envoyée" : "Publication envoyée");
    },
    onError: (e: Error) => toast.error("Publication impossible", { description: e.message }),
  });
}

export function useDeletePost(authorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("profile_posts").delete().eq("id", postId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-posts", authorId] });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
    },
    onError: (e: Error) => toast.error("Suppression impossible", { description: e.message }),
  });
}

export function useToggleLike(authorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      const { data: me } = await supabase.auth.getUser();
      const uid = me.user?.id;
      if (!uid) throw new Error("Non connecté");
      if (liked) {
        const { error } = await supabase
          .from("profile_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", uid);
        if (error) throw error;
        return;
      }
      const { error } = await supabase
        .from("profile_post_likes")
        .insert({ post_id: postId, user_id: uid });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-posts", authorId] });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
    },
    onError: (e: Error) => toast.error("Action impossible", { description: e.message }),
  });
}

export function useAddComment(authorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, body }: { postId: string; body: string }) => {
      const { data: me } = await supabase.auth.getUser();
      const uid = me.user?.id;
      if (!uid) throw new Error("Non connecté");
      const { error } = await supabase
        .from("profile_post_comments")
        .insert({ post_id: postId, user_id: uid, body: body.trim() });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-posts", authorId] });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
    },
    onError: (e: Error) => toast.error("Commentaire impossible", { description: e.message }),
  });
}

export function useRepost(authorId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ postId, comment }: { postId: string; comment?: string }) => {
      const { data: me } = await supabase.auth.getUser();
      const uid = me.user?.id;
      if (!uid) throw new Error("Non connecté");
      const { data: existing } = await supabase
        .from("profile_posts")
        .select("id")
        .eq("repost_of", postId)
        .eq("author_id", uid)
        .maybeSingle();
      if (existing) {
        await supabase
          .from("profile_posts")
          .delete()
          .eq("id", (existing as Row)["id"]);
        return { reposted: false };
      }
      const { error } = await supabase.from("profile_posts").insert({
        author_id: uid,
        body: comment ?? "",
        repost_of: postId,
      });
      if (error) throw error;
      return { reposted: true };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile-posts", authorId] });
      qc.invalidateQueries({ queryKey: ["profile-posts"] });
      toast.success("Repartage mis à jour");
    },
    onError: (e: Error) => toast.error("Repartage impossible", { description: e.message }),
  });
}

/** Realtime sync for a profile's feed. */
export function useRealtimeProfilePosts() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("profile-posts-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "profile_posts" }, () => {
        qc.invalidateQueries({ queryKey: ["profile-posts"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "profile_post_likes" }, () => {
        qc.invalidateQueries({ queryKey: ["profile-posts"] });
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profile_post_comments" },
        () => {
          qc.invalidateQueries({ queryKey: ["profile-posts"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}
