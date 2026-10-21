CREATE OR REPLACE FUNCTION public.is_active_member(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _user_id AND COALESCE(p.disabled, false) = false)
$$;
REVOKE EXECUTE ON FUNCTION public.is_active_member(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_active_member(uuid) TO authenticated;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['achievements','activity_log','business_canvas','company','competitions','competitors','components','contacts','decisions','documents','engineering_records','job_roles','legal_items','marketing_posts','media_assets','meeting_actions','meetings','milestones','organizations','products','projects','requirements','research_notes','risks','tasks','team_members','tests','university_items'] LOOP
    EXECUTE format('DROP POLICY IF EXISTS "workspace members full access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "workspace members full access" ON public.%I FOR ALL TO authenticated USING (public.is_active_member(auth.uid())) WITH CHECK (public.is_active_member(auth.uid()))', t);
  END LOOP;
END $$;

ALTER POLICY "team reads comments" ON public.comments USING (public.is_active_member(auth.uid()));
ALTER POLICY "team reads comments" ON public.profile_post_comments USING (public.is_active_member(auth.uid()));
ALTER POLICY "team reads likes" ON public.profile_post_likes USING (public.is_active_member(auth.uid()));
ALTER POLICY "team reads posts" ON public.profile_posts USING (public.is_active_member(auth.uid()));
ALTER POLICY "read presence" ON public.user_presence USING (public.is_active_member(auth.uid()));
ALTER POLICY "team creates notifications" ON public.notifications WITH CHECK (public.is_active_member(auth.uid()));
ALTER POLICY "profiles read" ON public.profiles USING (auth.uid() = id OR public.is_active_member(auth.uid()));
ALTER POLICY "roles read" ON public.user_roles USING (auth.uid() = user_id OR public.is_active_member(auth.uid()));
ALTER POLICY "authenticated read permissions" ON public.role_permissions USING (public.is_active_member(auth.uid()));