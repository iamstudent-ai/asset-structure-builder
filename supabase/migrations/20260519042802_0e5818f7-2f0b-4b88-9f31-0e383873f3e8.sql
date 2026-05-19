-- 1) user_roles: replace permissive ALL policy with explicit INSERT/UPDATE/DELETE having WITH CHECK
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) profiles: restrict SELECT so users only see their own profile; admins see all
DROP POLICY IF EXISTS "Profiles viewable by authenticated users" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Storage: restrict branding bucket writes to admins; restrict API listing to admins
DROP POLICY IF EXISTS "branding 1ym05q3_0" ON storage.objects;
DROP POLICY IF EXISTS "branding 1ym05q3_1" ON storage.objects;
DROP POLICY IF EXISTS "branding 1ym05q3_2" ON storage.objects;
DROP POLICY IF EXISTS "branding 1ym05q3_3" ON storage.objects;

CREATE POLICY "Admins can list branding"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload branding"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update branding"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete branding"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'branding' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 4) Lock down SECURITY DEFINER function. has_role is used in RLS policies (runs as policy owner),
-- so revoke direct EXECUTE from API roles to prevent calling it directly.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated;