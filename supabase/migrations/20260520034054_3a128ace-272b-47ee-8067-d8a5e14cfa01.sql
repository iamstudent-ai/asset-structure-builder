-- 1. profiles.disabled
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;

-- Admins can update any profile
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

-- 2. asset_history audit fields
ALTER TABLE public.asset_history
  ADD COLUMN IF NOT EXISTS last_modified_by text,
  ADD COLUMN IF NOT EXISTS last_modified_at timestamptz;

-- Replace admin-only insert/update with authenticated insert/update
DROP POLICY IF EXISTS "Admins can insert asset history" ON public.asset_history;
DROP POLICY IF EXISTS "Admins can update asset history" ON public.asset_history;

CREATE POLICY "Authenticated users can insert asset history"
ON public.asset_history
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update asset history"
ON public.asset_history
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
-- DELETE policy (admin-only) remains as-is.