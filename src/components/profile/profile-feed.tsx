import { useEffect, useRef, useState } from "react";
import { useCurrentUser } from "@/lib/collab";
import { Heart, ImagePlus, Loader2, MessageCircle, Repeat2, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/collab";
import { useResolvedFileUrl } from "@/lib/use-resolved-url";
import {
  useAddComment,
  useCreatePost,
  useDeletePost,
  useProfilePosts,
  useRealtimeProfilePosts,
  useRepost,
  useToggleLike,
} from "@/lib/profile-feed";
import type { Row } from "@/lib/db";
import { cn } from "@/lib/utils";

function PostImage({ path, name }: { path: string; name?: string | null }) {
  const url = useResolvedFileUrl(path);
  if (!url) return <div className="h-32 animate-pulse rounded-xl bg-accent/60" />;
  return (
    <img
      src={url}
      alt={name ?? "Image"}
      loading="lazy"
      className="max-h-80 w-full rounded-xl border border-border object-cover"
    />
  );
}

function PostCard({
  post,
  meId,
  authorId,
  onProfileClick,
}: {
  post: Row;
  meId?: string;
  authorId: string;
  onProfileClick?: (userId: string) => void;
}) {
  const like = useToggleLike(authorId);
  const comment = useAddComment(authorId);
  const repost = useRepost(authorId);
  const remove = useDeletePost(authorId);
  const [showComments, setShowComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");

  const likes = (post["likes"] ?? []) as Row[];
  const comments = (post["comments"] ?? []) as Row[];
  const liked = likes.some((l) => l["user_id"] === meId);
  const original = post["original"] as Row | null;
  const display = original ?? post;
  const displayAuthor = display["author"] as Row | undefined;
  const isRepost = !!original;

  const submitComment = () => {
    if (!commentDraft.trim()) return;
    comment.mutate({ postId: post["id"] as string, body: commentDraft });
    setCommentDraft("");
  };

  return (
    <article className="rounded-xl border border-border/70 bg-card p-4">
      {isRepost && (
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5 text-primary" />
          {(post["author"] as Row | undefined)?.["full_name"] ?? "Vous"} a repartagé
        </p>
      )}

      <header className="flex items-center gap-2.5">
        <button
          onClick={() => onProfileClick?.(displayAuthor?.["id"] as string)}
          className="shrink-0"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-[11px] font-bold">
            {String(displayAuthor?.["full_name"] ?? "M")
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </span>
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {String(displayAuthor?.["full_name"] ?? "Membre")}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {timeAgo(display["created_at"] as string)}
          </p>
        </div>
        {display["author_id"] === meId && !isRepost && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => remove.mutate(post["id"] as string)}
            aria-label="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </header>

      {display["body"] && (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">
          {display["body"]}
        </p>
      )}
      {display["image_path"] && (
        <div className="mt-2">
          <PostImage path={display["image_path"] as string} name="publication" />
        </div>
      )}

      <footer className="mt-3 flex items-center gap-1 border-t border-border/60 pt-2">
        <button
          onClick={() => like.mutate({ postId: post["id"] as string, liked })}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            liked ? "text-rose-500" : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likes.length || ""}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" /> {comments.length || ""}
        </button>
        <button
          onClick={() => repost.mutate({ postId: post["id"] as string })}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
            isRepost
              ? "text-primary"
              : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Repeat2 className="h-4 w-4" />
        </button>
      </footer>

      {showComments && (
        <div className="mt-2 space-y-2 border-t border-border/60 pt-2">
          {comments.map((c) => {
            const ca = c["author"] as Row | undefined;
            return (
              <div key={c["id"]} className="flex gap-2">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-surface text-[10px] font-bold">
                  {String(ca?.["full_name"] ?? "M")
                    .split(" ")
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className="min-w-0 flex-1 rounded-lg bg-accent/40 px-3 py-1.5">
                  <p className="text-xs font-semibold">
                    {String(ca?.["full_name"] ?? "Membre")}{" "}
                    <span className="ml-1 font-normal text-muted-foreground">
                      {timeAgo(c["created_at"] as string)}
                    </span>
                  </p>
                  <p className="text-xs">{c["body"]}</p>
                </div>
              </div>
            );
          })}
          <div className="flex items-end gap-1.5 pt-1">
            <Textarea
              value={commentDraft}
              rows={1}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitComment();
                }
              }}
              placeholder="Écrire un commentaire…"
              className="min-h-9 flex-1 resize-none"
            />
            <Button
              size="icon"
              className="h-9 w-9"
              disabled={!commentDraft.trim() || comment.isPending}
              onClick={submitComment}
            >
              {comment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

export function FeedComposer({ authorId }: { authorId: string }) {
  const create = useCreatePost(authorId);
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    if (!body.trim() && !image) return;
    create.mutate(
      { body, image },
      {
        onSuccess: () => {
          setBody("");
          setImage(null);
          setPreview("");
        },
      },
    );
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card p-3">
      <Textarea
        value={body}
        rows={2}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Partagez une actualité, un projet, une réussite…"
        className="resize-none border-0 bg-transparent focus-visible:ring-0"
      />
      {preview && (
        <img
          src={preview}
          alt=""
          className="mt-2 max-h-48 rounded-lg border border-border object-cover"
        />
      )}
      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setImage(f);
            setPreview(f ? URL.createObjectURL(f) : "");
            e.target.value = "";
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => fileRef.current?.click()}
        >
          <ImagePlus className="mr-1.5 h-4 w-4" /> Image
        </Button>
        <Button size="sm" disabled={create.isPending || (!body.trim() && !image)} onClick={submit}>
          {create.isPending ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" />
          )}{" "}
          Publier
        </Button>
      </div>
    </div>
  );
}

export function ProfileFeed({
  authorId,
  compact = false,
  onProfileClick,
}: {
  authorId: string;
  compact?: boolean;
  onProfileClick?: (userId: string) => void;
}) {
  const { data: me } = useMeId();
  const { data: posts, isLoading } = useProfilePosts(authorId);
  useRealtimeProfilePosts();

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      {!compact && <h3 className="text-sm font-bold">Publications</h3>}
      {isLoading && <p className="text-xs text-muted-foreground">Chargement des publications…</p>}
      {!isLoading && (posts ?? []).length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          Aucune publication pour le moment.
        </p>
      )}
      {(posts ?? []).map((post) => (
        <PostCard
          key={post["id"] as string}
          post={post}
          meId={me ?? undefined}
          authorId={authorId}
          onProfileClick={onProfileClick}
        />
      ))}
    </div>
  );
}

function useMeId() {
  const { data } = useCurrentUser();
  return { data: data?.id ?? null };
}
