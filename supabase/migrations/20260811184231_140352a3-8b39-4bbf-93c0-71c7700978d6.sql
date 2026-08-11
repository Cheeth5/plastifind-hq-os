CREATE TYPE public.conversation_type AS ENUM ('dm','group','channel');

CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.conversation_type NOT NULL DEFAULT 'group',
  name text,
  description text,
  project_id uuid,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.conversation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  last_read_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (conversation_id, user_id)
);

CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL DEFAULT '',
  parent_id uuid REFERENCES public.messages(id) ON DELETE CASCADE,
  attachment_path text,
  attachment_name text,
  attachment_type text,
  mentions uuid[] NOT NULL DEFAULT '{}',
  pinned boolean NOT NULL DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX messages_conversation_created_idx ON public.messages (conversation_id, created_at DESC);

CREATE TABLE public.message_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  emoji text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_table text NOT NULL,
  entity_id uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  body text NOT NULL,
  parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
  mentions uuid[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX comments_entity_idx ON public.comments (entity_table, entity_id, created_at);

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal';
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversation_members TO authenticated;
GRANT ALL ON public.conversation_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.message_reactions TO authenticated;
GRANT ALL ON public.message_reactions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

CREATE OR REPLACE FUNCTION public.is_conversation_member(_conversation_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.conversation_members m WHERE m.conversation_id = _conversation_id AND m.user_id = _user_id);
$$;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members read conversations" ON public.conversations FOR SELECT TO authenticated
  USING (public.is_conversation_member(id, auth.uid()) OR created_by = auth.uid());
CREATE POLICY "users create conversations" ON public.conversations FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
CREATE POLICY "members update conversations" ON public.conversations FOR UPDATE TO authenticated
  USING (public.is_conversation_member(id, auth.uid())) WITH CHECK (public.is_conversation_member(id, auth.uid()));
CREATE POLICY "creator deletes conversation" ON public.conversations FOR DELETE TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "members read membership" ON public.conversation_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "members add membership" ON public.conversation_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid())
    OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid()));
CREATE POLICY "self update membership" ON public.conversation_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "self remove membership" ON public.conversation_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.conversations c WHERE c.id = conversation_id AND c.created_by = auth.uid()));

CREATE POLICY "members read messages" ON public.messages FOR SELECT TO authenticated
  USING (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "members send messages" ON public.messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "author updates message" ON public.messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_conversation_member(conversation_id, auth.uid()))
  WITH CHECK (public.is_conversation_member(conversation_id, auth.uid()));
CREATE POLICY "author deletes message" ON public.messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "members read reactions" ON public.message_reactions FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.is_conversation_member(m.conversation_id, auth.uid())));
CREATE POLICY "members add reactions" ON public.message_reactions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.messages m WHERE m.id = message_id AND public.is_conversation_member(m.conversation_id, auth.uid())));
CREATE POLICY "self remove reactions" ON public.message_reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "team reads comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "team writes comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "author updates comment" ON public.comments FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "author deletes comment" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "self reads notifications" ON public.notifications;
DROP POLICY IF EXISTS "self updates notifications" ON public.notifications;
DROP POLICY IF EXISTS "self deletes notifications" ON public.notifications;
DROP POLICY IF EXISTS "team creates notifications" ON public.notifications;
CREATE POLICY "self reads notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "team creates notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "self updates notifications" ON public.notifications FOR UPDATE TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid()) WITH CHECK (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "self deletes notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER update_conversation_members_updated_at BEFORE UPDATE ON public.conversation_members FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;