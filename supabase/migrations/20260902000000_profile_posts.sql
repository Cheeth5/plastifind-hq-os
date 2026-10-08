-- Social profile posts + shared profile_ext so members' profiles are viewable by others.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS profile_ext jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS public.profile_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL DEFAULT '',
  image_path text,
  repost_of uuid REFERENCES public.profile_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profile_posts_author_idx ON public.profile_posts (author_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.profile_post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.profile_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.profile_post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.profile_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS profile_post_comments_post_idx ON public.profile_post_comments (post_id, created_at);

ALTER TABLE public.profile_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_post_comments ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can see posts; authors manage their own.
DROP POLICY IF EXISTS "team reads posts" ON public.profile_posts;
CREATE POLICY "team reads posts" ON public.profile_posts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "author writes post" ON public.profile_posts;
CREATE POLICY "author writes post" ON public.profile_posts FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "author updates post" ON public.profile_posts;
CREATE POLICY "author updates post" ON public.profile_posts FOR UPDATE TO authenticated USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
DROP POLICY IF EXISTS "author deletes post" ON public.profile_posts;
CREATE POLICY "author deletes post" ON public.profile_posts FOR DELETE TO authenticated USING (author_id = auth.uid());

DROP POLICY IF EXISTS "team reads likes" ON public.profile_post_likes;
CREATE POLICY "team reads likes" ON public.profile_post_likes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "user toggles like" ON public.profile_post_likes;
CREATE POLICY "user toggles like" ON public.profile_post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "user removes like" ON public.profile_post_likes;
CREATE POLICY "user removes like" ON public.profile_post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "team reads comments" ON public.profile_post_comments;
CREATE POLICY "team reads comments" ON public.profile_post_comments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "user writes comment" ON public.profile_post_comments;
CREATE POLICY "user writes comment" ON public.profile_post_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "author updates comment" ON public.profile_post_comments;
CREATE POLICY "author updates comment" ON public.profile_post_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "author deletes comment" ON public.profile_post_comments;
CREATE POLICY "author deletes comment" ON public.profile_post_comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Allow members to update their own profile (for profile_ext sync).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'self updates profile'
  ) THEN
    CREATE POLICY "self updates profile" ON public.profiles
      FOR UPDATE TO authenticated
      USING (id = auth.uid()) WITH CHECK (id = auth.uid());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_posts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_post_likes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_post_comments TO authenticated;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_posts;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_post_likes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profile_post_comments;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;
