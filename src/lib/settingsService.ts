import { supabase } from "@/integrations/supabase/client";

export async function getSetting(key: string): Promise<string | null> {
  const { data } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  return data?.value ?? null;
}

export async function upsertSetting(key: string, value: string): Promise<void> {
  const { data: existing } = await supabase
    .from("app_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("app_settings")
      .update({ value })
      .eq("key", key);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("app_settings")
      .insert({ key, value });
    if (error) throw error;
  }
}

export async function deleteSetting(key: string): Promise<void> {
  const { error } = await supabase.from("app_settings").delete().eq("key", key);
  if (error) throw error;
}

// ---------- Per-company branding ----------

const COMPANY_LOGO_PREFIX = "logo_url:";

function safeCompanyKey(company: string): string {
  return company.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function storagePath(company: string, ext: string): string {
  return `logos/${safeCompanyKey(company)}.${ext}`;
}

export async function getCompanyLogo(company: string): Promise<string | null> {
  if (!company) return null;
  return getSetting(COMPANY_LOGO_PREFIX + company.trim());
}

export async function listCompanyLogos(): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("app_settings")
    .select("key,value")
    .like("key", `${COMPANY_LOGO_PREFIX}%`);
  const out: Record<string, string> = {};
  (data || []).forEach((r: any) => {
    if (r.value) out[r.key.slice(COMPANY_LOGO_PREFIX.length)] = r.value;
  });
  return out;
}

export async function uploadCompanyLogo(company: string, file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = storagePath(company, ext);

  // Remove any prior variants
  await supabase.storage.from("branding").remove([
    storagePath(company, "png"),
    storagePath(company, "jpg"),
    storagePath(company, "jpeg"),
  ]);

  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  // Add cache-buster so updates show immediately
  const url = `${data.publicUrl}?t=${Date.now()}`;
  await upsertSetting(COMPANY_LOGO_PREFIX + company.trim(), url);
  return url;
}

export async function removeCompanyLogo(company: string): Promise<void> {
  await supabase.storage.from("branding").remove([
    storagePath(company, "png"),
    storagePath(company, "jpg"),
    storagePath(company, "jpeg"),
  ]);
  await deleteSetting(COMPANY_LOGO_PREFIX + company.trim());
}

// Legacy single-logo upload (kept for backwards compatibility, not used)
export async function uploadBrandingLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logo.${ext}`;
  await supabase.storage.from("branding").remove([path]);
  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}
