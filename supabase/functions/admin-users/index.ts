// admin-users edge function — admin-only user management
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return json({ error: "Missing auth" }, 401);

    // Identify caller
    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Invalid session" }, 401);
    const callerId = userData.user.id;

    // Admin (service-role) client for everything below
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Verify caller is admin
    const { data: roleRow } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", callerId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;

    if (action === "list") {
      const { data: usersList, error: lerr } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      if (lerr) return json({ error: lerr.message }, 500);
      const ids = usersList.users.map((u) => u.id);
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        admin.from("profiles").select("user_id, display_name, email, disabled").in("user_id", ids),
        admin.from("user_roles").select("user_id, role").in("user_id", ids),
      ]);
      const pMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p]));
      const rMap = new Map((roles ?? []).map((r: any) => [r.user_id, r.role]));
      const result = usersList.users.map((u) => ({
        id: u.id,
        email: u.email ?? pMap.get(u.id)?.email ?? "",
        display_name: pMap.get(u.id)?.display_name ?? "",
        role: rMap.get(u.id) ?? "user",
        disabled: pMap.get(u.id)?.disabled ?? false,
        created_at: u.created_at,
        banned_until: (u as any).banned_until ?? null,
      }));
      return json({ users: result });
    }

    if (action === "create") {
      const { email, password, display_name, role } = body;
      if (!email || !password) return json({ error: "email and password required" }, 400);
      const { data: created, error: cerr } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { display_name: display_name ?? email.split("@")[0] },
      });
      if (cerr) return json({ error: cerr.message }, 400);
      const newId = created.user!.id;
      // handle_new_user trigger creates profile + default role; override if admin requested
      if (role === "admin") {
        await admin.from("user_roles").upsert({ user_id: newId, role: "admin" }, { onConflict: "user_id,role" });
        await admin.from("user_roles").delete().eq("user_id", newId).eq("role", "user");
      }
      return json({ ok: true, id: newId });
    }

    if (action === "set_role") {
      const { user_id, role } = body;
      if (!user_id || !["admin", "user"].includes(role)) return json({ error: "invalid args" }, 400);
      if (user_id === callerId && role !== "admin")
        return json({ error: "You cannot demote yourself" }, 400);
      await admin.from("user_roles").delete().eq("user_id", user_id);
      const { error: ierr } = await admin.from("user_roles").insert({ user_id, role });
      if (ierr) return json({ error: ierr.message }, 500);
      return json({ ok: true });
    }

    if (action === "set_disabled") {
      const { user_id, disabled } = body;
      if (!user_id || typeof disabled !== "boolean") return json({ error: "invalid args" }, 400);
      if (user_id === callerId && disabled)
        return json({ error: "You cannot disable yourself" }, 400);
      const { error: perr } = await admin.from("profiles").update({ disabled }).eq("user_id", user_id);
      if (perr) return json({ error: perr.message }, 500);
      // Also ban the auth user so existing sessions get rejected on refresh
      const banDuration = disabled ? "876000h" : "none";
      const { error: berr } = await admin.auth.admin.updateUserById(user_id, { ban_duration: banDuration } as any);
      if (berr) return json({ error: berr.message }, 500);
      return json({ ok: true });
    }

    if (action === "reset_password") {
      const { user_id, password } = body;
      if (!user_id || !password || typeof password !== "string" || password.length < 6) {
        return json({ error: "user_id and password (min 6 chars) required" }, 400);
      }
      const { error: uerr } = await admin.auth.admin.updateUserById(user_id, { password });
      if (uerr) return json({ error: uerr.message }, 500);
      return json({ ok: true });

    return json({ error: "Unknown action" }, 400);
  } catch (e: any) {
    return json({ error: e?.message ?? "Internal error" }, 500);
  }
});
