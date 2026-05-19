CREATE TABLE public.asset_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cost NUMERIC,
  vendor TEXT,
  updated_by TEXT NOT NULL DEFAULT '',
  activity_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_asset_history_asset_id ON public.asset_history(asset_id);
CREATE INDEX idx_asset_history_activity_date ON public.asset_history(activity_date DESC);

ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view asset history"
  ON public.asset_history FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Admins can insert asset history"
  ON public.asset_history FOR INSERT
  TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update asset history"
  ON public.asset_history FOR UPDATE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete asset history"
  ON public.asset_history FOR DELETE
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_asset_history_updated_at
  BEFORE UPDATE ON public.asset_history
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();