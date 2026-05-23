import { Asset } from "@/types/asset";
import { supabase } from "@/integrations/supabase/client";

// Maps frontend Asset fields to database column names
type AssetDisplayField = Exclude<keyof Asset, "_id">;
const fieldToColumn: Record<AssetDisplayField, string> = {
  "S.NO": "sno",
  "Company": "company",
  "Asset ID": "asset_id",
  "Asset Category": "asset_category",
  "Brand": "brand",
  "Model": "model",
  "OS": "os",
  "Asset Owner": "asset_owner",
  "Serial Number": "serial_number",
  "Assigned User": "assigned_user",
  "Location": "location",
  "Office": "office",
  "Department": "department",
  "Data Classification": "data_classification",
  "Purchase Date": "purchase_date",
  "EOL/EOS": "eol_eos",
  "Warranty End Date": "warranty_end_date",
  "Lifecycle Status": "lifecycle_status",
};

// Convert DB row to frontend Asset
function rowToAsset(row: any): Asset {
  return {
    _id: row.id,
    "S.NO": row.sno,
    "Company": row.company || "",
    "Asset ID": row.asset_id || "",
    "Asset Category": row.asset_category || "",
    "Brand": row.brand || "",
    "Model": row.model || "",
    "OS": row.os || "",
    "Asset Owner": row.asset_owner || "",
    "Serial Number": row.serial_number || "",
    "Assigned User": row.assigned_user || "",
    "Location": row.location || "",
    "Office": row.office || "",
    "Department": row.department || "",
    "Data Classification": row.data_classification || "",
    "Purchase Date": row.purchase_date || "",
    "EOL/EOS": row.eol_eos || "",
    "Warranty End Date": row.warranty_end_date || "",
    "Lifecycle Status": row.lifecycle_status || "",
  };
}

// Convert frontend Asset to DB row (for inserts/updates)
function assetToRow(asset: Asset) {
  return {
    sno: asset["S.NO"],
    company: asset["Company"],
    asset_id: asset["Asset ID"],
    asset_category: asset["Asset Category"],
    brand: asset["Brand"],
    model: asset["Model"],
    os: asset["OS"],
    asset_owner: asset["Asset Owner"],
    serial_number: asset["Serial Number"],
    assigned_user: asset["Assigned User"],
    location: asset["Location"],
    office: asset["Office"],
    department: asset["Department"],
    data_classification: asset["Data Classification"],
    purchase_date: asset["Purchase Date"],
    eol_eos: asset["EOL/EOS"],
    warranty_end_date: asset["Warranty End Date"],
    lifecycle_status: asset["Lifecycle Status"],
  };
}

export async function fetchAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from("assets")
    .select("*")
    .order("sno", { ascending: true });

  if (error) throw error;
  return (data || []).map(rowToAsset);
}

export async function addAsset(asset: Asset): Promise<Asset> {
  const { data, error } = await supabase
    .from("assets")
    .insert(assetToRow(asset))
    .select()
    .single();

  if (error) throw error;
  return rowToAsset(data);
}

export async function updateAsset(asset: Asset): Promise<Asset> {
  const row = assetToRow(asset);
  const query = supabase.from("assets").update(row);
  // Prefer internal row UUID so duplicate Asset IDs don't all get updated together.
  const { data, error } = asset._id
    ? await query.eq("id", asset._id).select().single()
    : await query.eq("asset_id", asset["Asset ID"]).select().single();

  if (error) throw error;
  return rowToAsset(data);
}

export async function importAssets(assets: Asset[]): Promise<Asset[]> {
  const rows = assets.map(assetToRow);
  const { data, error } = await supabase
    .from("assets")
    .insert(rows)
    .select();

  if (error) throw error;
  return (data || []).map(rowToAsset);
}

/** Delete by internal row UUID (preferred) or fallback to asset_id. */
export async function deleteAsset(idOrAssetId: string, isRowId = false): Promise<void> {
  const { error } = isRowId
    ? await supabase.from("assets").delete().eq("id", idOrAssetId)
    : await supabase.from("assets").delete().eq("asset_id", idOrAssetId);
  if (error) throw error;
}
