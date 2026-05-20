// assetHistoryService.ts — CRUD for asset history entries
import { supabase } from "@/integrations/supabase/client";

export const ACTIVITY_TYPES = [
  "Repair",
  "Upgrade",
  "Downgrade",
  "Replacement",
  "Maintenance",
  "Ownership Change",
  "Location Change",
  "Other Activity",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface AssetHistoryEntry {
  id: string;
  asset_id: string;
  activity_type: string;
  description: string;
  cost: number | null;
  vendor: string | null;
  updated_by: string;
  activity_date: string;
  last_modified_by?: string | null;
  last_modified_at?: string | null;
}

export interface NewHistoryEntry {
  asset_id: string;
  activity_type: string;
  description: string;
  cost?: number | null;
  vendor?: string | null;
  updated_by: string;
  activity_date?: string;
}

export async function fetchHistoryForAsset(assetId: string): Promise<AssetHistoryEntry[]> {
  const { data, error } = await supabase
    .from("asset_history")
    .select("*")
    .eq("asset_id", assetId)
    .order("activity_date", { ascending: false });
  if (error) throw error;
  return (data || []) as AssetHistoryEntry[];
}

export async function addHistoryEntry(entry: NewHistoryEntry): Promise<AssetHistoryEntry> {
  const payload = {
    ...entry,
    activity_date: entry.activity_date || new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("asset_history")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as AssetHistoryEntry;
}

export async function updateHistoryEntry(
  id: string,
  patch: Partial<Pick<AssetHistoryEntry, "activity_type" | "description" | "cost" | "vendor">>,
  modifiedBy: string,
): Promise<AssetHistoryEntry> {
  const { data, error } = await supabase
    .from("asset_history")
    .update({
      ...patch,
      last_modified_by: modifiedBy,
      last_modified_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AssetHistoryEntry;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const { error } = await supabase.from("asset_history").delete().eq("id", id);
  if (error) throw error;
}

export function formatHistoryDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  let h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${dd}-${mm}-${yyyy} | ${String(h).padStart(2, "0")}:${min} ${ampm}`;
}
