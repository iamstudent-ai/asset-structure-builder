DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'assets_asset_id_key'
      AND conrelid = 'public.assets'::regclass
  ) THEN
    ALTER TABLE public.assets DROP CONSTRAINT assets_asset_id_key;
  END IF;
END $$;

DROP INDEX IF EXISTS public.assets_asset_id_key;
DROP INDEX IF EXISTS public.idx_assets_asset_id_unique;

CREATE INDEX IF NOT EXISTS idx_assets_asset_id_lookup ON public.assets (asset_id);