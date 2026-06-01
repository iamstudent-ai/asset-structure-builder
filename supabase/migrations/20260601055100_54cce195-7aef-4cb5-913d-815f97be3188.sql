DROP POLICY IF EXISTS "Users can fix duplicate or missing assets" ON public.assets;

CREATE POLICY "Users can fix duplicate or missing assets"
  ON public.assets FOR UPDATE
  TO authenticated
  USING (
    asset_id IS NULL
    OR btrim(asset_id) = ''
    OR upper(btrim(asset_id)) = 'N/A'
    OR upper(btrim(asset_id)) LIKE 'MISSING-%'
    OR (
      asset_id IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM public.assets a2
        WHERE a2.id <> assets.id
          AND lower(btrim(a2.asset_id)) = lower(btrim(assets.asset_id))
      )
    )
  )
  WITH CHECK (true);