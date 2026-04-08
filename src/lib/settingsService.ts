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
  // Try update first
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

export async function uploadBrandingLogo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "png";
  const path = `logo.${ext}`;

  // Remove old file (ignore errors)
  await supabase.storage.from("branding").remove([path]);

  const { error } = await supabase.storage
    .from("branding")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabase.storage.from("branding").getPublicUrl(path);
  return data.publicUrl;
}
