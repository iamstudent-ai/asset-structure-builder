-- Move has_role to a private schema so it's not exposed through the API.
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;

-- Recreate policies that reference public.has_role to use private.has_role instead
-- user_roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id OR private.has_role(auth.uid(), 'admin'::public.app_role));

-- assets
DROP POLICY IF EXISTS "Admins can delete assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can insert assets" ON public.assets;
DROP POLICY IF EXISTS "Admins can update assets" ON public.assets;

CREATE POLICY "Admins can delete assets" ON public.assets
FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert assets" ON public.assets
FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update assets" ON public.assets
FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- app_settings
DROP POLICY IF EXISTS "Admins can delete settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.app_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.app_settings;

CREATE POLICY "Admins can delete settings" ON public.app_settings
FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert settings" ON public.app_settings
FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update settings" ON public.app_settings
FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- asset_history
DROP POLICY IF EXISTS "Admins can delete asset history" ON public.asset_history;
DROP POLICY IF EXISTS "Admins can insert asset history" ON public.asset_history;
DROP POLICY IF EXISTS "Admins can update asset history" ON public.asset_history;

CREATE POLICY "Admins can delete asset history" ON public.asset_history
FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert asset history" ON public.asset_history
FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update asset history" ON public.asset_history
FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- storage.objects (branding)
DROP POLICY IF EXISTS "Admins can list branding" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload branding" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update branding" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete branding" ON storage.objects;

CREATE POLICY "Admins can list branding" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'branding' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can upload branding" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'branding' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update branding" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'branding' AND private.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (bucket_id = 'branding' AND private.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete branding" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'branding' AND private.has_role(auth.uid(), 'admin'::public.app_role));

-- Finally drop the exposed public.has_role
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);