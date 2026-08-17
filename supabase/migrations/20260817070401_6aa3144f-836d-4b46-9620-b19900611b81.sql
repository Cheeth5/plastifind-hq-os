-- 1. Profile fields for onboarding
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name text,
  ADD COLUMN IF NOT EXISTS last_name text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS job_role text,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS presence_status text NOT NULL DEFAULT 'offline',
  ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;

-- 2. Permission catalogue
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated read permissions" ON public.role_permissions;
CREATE POLICY "authenticated read permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND (rp.permission = _permission OR rp.permission = '*')
  );
$$;

CREATE OR REPLACE FUNCTION public.my_permissions()
RETURNS TABLE(permission text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT DISTINCT rp.permission
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON rp.role = ur.role
  WHERE ur.user_id = auth.uid();
$$;

-- 3. Seed the catalogue
DELETE FROM public.role_permissions;
INSERT INTO public.role_permissions (role, permission) VALUES
  ('founder','*'),
  ('admin','*')
ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'administrator'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','company.manage','projects.view','projects.manage','tasks.view','tasks.manage',
  'engineering.view','engineering.manage','research.view','product.view','product.manage',
  'business.view','crm.view','crm.manage','marketing.view','marketing.manage','media.view','media.manage',
  'finance.view','funding.view','docs.view','docs.manage','legal.view','team.view','ops.view',
  'users.manage','audit.view','security.view','messaging.use','messaging.moderate','settings.manage'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'engineering'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','projects.view','projects.manage','tasks.view','tasks.manage',
  'engineering.view','engineering.manage','product.view','product.manage','research.view','docs.view','docs.manage',
  'team.view','media.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'software_dev'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','projects.view','projects.manage','tasks.view','tasks.manage',
  'engineering.view','engineering.manage','product.view','research.view','docs.view','docs.manage','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'ai_engineer'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','projects.view','projects.manage','tasks.view','tasks.manage',
  'engineering.view','engineering.manage','product.view','research.view','docs.view','docs.manage','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'designer'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','projects.view','tasks.view','tasks.manage','product.view',
  'media.view','media.manage','marketing.view','docs.view','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'marketing'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','marketing.view','marketing.manage','media.view','media.manage',
  'crm.view','docs.view','tasks.view','tasks.manage','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'finance'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','finance.view','finance.manage','funding.view','funding.manage',
  'business.view','docs.view','tasks.view','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'business'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','business.view','crm.view','crm.manage','funding.view','funding.manage',
  'finance.view','marketing.view','docs.view','tasks.view','tasks.manage','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'operations'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','ops.view','projects.view','projects.manage','tasks.view','tasks.manage',
  'docs.view','team.view','media.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'intern'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','tasks.view','projects.view','docs.view','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'mentor'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','projects.view','tasks.view','docs.view','team.view','messaging.use','business.view'
]) AS p ON CONFLICT DO NOTHING;

INSERT INTO public.role_permissions (role, permission)
SELECT 'viewer'::public.app_role, p FROM unnest(ARRAY[
  'dashboard.view','company.view','tasks.view','projects.view','docs.view','team.view','messaging.use'
]) AS p ON CONFLICT DO NOTHING;

-- 4. Founder bootstrap + safer defaults for new sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;

  IF lower(NEW.email) = 'cheithchouk@gmail.com' THEN
    _role := 'founder';
  ELSE
    _role := 'viewer';
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role) ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- Promote the permanent founder account if it already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'founder'::public.app_role FROM auth.users WHERE lower(email) = 'cheithchouk@gmail.com'
ON CONFLICT DO NOTHING;

-- 5. Role management rules
DROP POLICY IF EXISTS "founder manages roles" ON public.user_roles;
CREATE POLICY "founder manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'founder')
    OR (public.has_permission(auth.uid(), 'users.manage') AND role <> 'founder' AND user_id <> auth.uid())
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'founder')
    OR (public.has_permission(auth.uid(), 'users.manage') AND role <> 'founder' AND user_id <> auth.uid())
  );
GRANT INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;

-- Protect the founder account from being disabled / stripped
CREATE OR REPLACE FUNCTION public.protect_founder_profile()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(COALESCE(OLD.email,'')) = 'cheithchouk@gmail.com' AND NEW.disabled THEN
    RAISE EXCEPTION 'Le compte fondateur ne peut pas être désactivé.';
  END IF;
  IF NEW.disabled IS DISTINCT FROM OLD.disabled
     AND auth.uid() = NEW.id
     AND NOT public.has_permission(auth.uid(), 'users.manage') THEN
    RAISE EXCEPTION 'Action non autorisée.';
  END IF;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS protect_founder ON public.profiles;
CREATE TRIGGER protect_founder BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_founder_profile();

-- Admins may manage other people's profiles (disable / correct details)
DROP POLICY IF EXISTS "admins manage profiles" ON public.profiles;
CREATE POLICY "admins manage profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.has_permission(auth.uid(), 'users.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'users.manage'));

-- 6. Restrict sensitive business data
DROP POLICY IF EXISTS "workspace members full access" ON public.expenses;
CREATE POLICY "finance reads expenses" ON public.expenses FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.view'));
CREATE POLICY "finance writes expenses" ON public.expenses FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'finance.manage'));

DROP POLICY IF EXISTS "workspace members full access" ON public.budgets;
CREATE POLICY "finance reads budgets" ON public.budgets FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.view'));
CREATE POLICY "finance writes budgets" ON public.budgets FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'finance.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'finance.manage'));

DROP POLICY IF EXISTS "workspace members full access" ON public.funding_opportunities;
CREATE POLICY "funding read" ON public.funding_opportunities FOR SELECT TO authenticated
  USING (public.has_permission(auth.uid(), 'funding.view'));
CREATE POLICY "funding write" ON public.funding_opportunities FOR ALL TO authenticated
  USING (public.has_permission(auth.uid(), 'funding.manage'))
  WITH CHECK (public.has_permission(auth.uid(), 'funding.manage'));

-- Notifications must stay private to their recipient
DROP POLICY IF EXISTS "workspace members full access" ON public.notifications;

-- 7. Messaging upgrades
ALTER TABLE public.conversation_members
  ADD COLUMN IF NOT EXISTS muted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS favorite boolean NOT NULL DEFAULT false;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS image_url text;

CREATE INDEX IF NOT EXISTS messages_conversation_created_idx ON public.messages (conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conversation_members_user_idx ON public.conversation_members (user_id);
CREATE INDEX IF NOT EXISTS message_reactions_message_idx ON public.message_reactions (message_id);
CREATE INDEX IF NOT EXISTS comments_entity_idx ON public.comments (entity_table, entity_id);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications (user_id, created_at DESC);

-- Moderators may remove any message
DROP POLICY IF EXISTS "moderators delete messages" ON public.messages;
CREATE POLICY "moderators delete messages" ON public.messages FOR DELETE TO authenticated
  USING (public.has_permission(auth.uid(), 'messaging.moderate'));

-- 8. Presence
CREATE TABLE IF NOT EXISTS public.user_presence (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'online',
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.user_presence TO authenticated;
GRANT ALL ON public.user_presence TO service_role;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read presence" ON public.user_presence;
CREATE POLICY "read presence" ON public.user_presence FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "write own presence" ON public.user_presence;
CREATE POLICY "write own presence" ON public.user_presence FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "update own presence" ON public.user_presence;
CREATE POLICY "update own presence" ON public.user_presence FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP TRIGGER IF EXISTS touch_user_presence ON public.user_presence;
CREATE TRIGGER touch_user_presence BEFORE UPDATE ON public.user_presence
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();