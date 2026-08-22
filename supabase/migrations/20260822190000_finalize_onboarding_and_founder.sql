-- Existing accounts created before onboarding was introduced are not first-time users.
UPDATE public.profiles
SET onboarding_completed = true
WHERE onboarding_completed = false;

-- Keep the permanent founder identity and role authoritative in the database.
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users WHERE lower(email) = 'cheithchouk@gmail.com'
);

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'founder'::public.app_role
FROM auth.users
WHERE lower(email) = 'cheithchouk@gmail.com'
ON CONFLICT DO NOTHING;

DROP POLICY IF EXISTS "founder manages roles" ON public.user_roles;
CREATE POLICY "founder manages roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'founder')
    OR (
      public.has_permission(auth.uid(), 'users.manage')
      AND role NOT IN ('founder', 'administrator')
      AND user_id <> auth.uid()
    )
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'founder')
    OR (
      public.has_permission(auth.uid(), 'users.manage')
      AND role NOT IN ('founder', 'administrator')
      AND user_id <> auth.uid()
    )
  );