## Plan: User Management module + Asset History editing

This is a focused enhancement. Nothing in login, schema, reports, QR, upload, branding, or filters changes.

---

### Phase 1 — Database changes (migration)

**`profiles` table**
- Add `disabled boolean NOT NULL DEFAULT false`
- Admins can update any profile (to toggle disabled / change name); users still update only their own non-admin fields.

**`asset_history` table**
- Add `last_modified_by text`
- Add `last_modified_at timestamptz`
- Replace admin-only RLS with: any authenticated user can `INSERT` and `UPDATE`. `DELETE` stays admin-only.

**Login block for disabled users**
- Add a `BEFORE` trigger on `auth.users`? Not allowed (reserved schema). Instead: enforce in app — `AuthContext` checks `profiles.disabled` after sign-in; if true, sign out immediately and show "Account disabled" toast.

---

### Phase 2 — Edge function `admin-users`

A single secure edge function (uses `SUPABASE_SERVICE_ROLE_KEY` internally) with actions:
- `list` — return all users (auth + profile + role + disabled)
- `create` — create auth user, set display name, assign role
- `set_role` — promote/demote (admin ↔ user)
- `set_disabled` — toggle disabled flag (also calls `auth.admin.updateUserById` with `ban_duration` to truly block sessions)
- `delete` — optional, omitted for safety

Every action verifies the caller is an admin via `private.has_role()` before doing anything. Non-admin callers get 403.

---

### Phase 3 — Frontend

**New page `/users` (admin-only, guarded)**
- Table: Name, Email, Role, Status (Active/Disabled), Created
- Search box (client-side filter)
- "Add User" dialog: name, email, password, role
- Row actions: Promote/Demote, Disable/Enable
- Modern, responsive, lightweight (existing shadcn components only — no new libs)

**Navbar**
- Add "Users" link, visible only when `isAdmin`

**AuthContext**
- After fetching profile, if `disabled === true` → `signOut()` + toast "Your account has been disabled."

**Asset History (`AssetHistory.tsx`)**
- `canEdit` = any authenticated user (was `isAdmin` only)
- Add Edit button per entry → inline form with Save / Cancel
- On save: update entry + set `last_modified_by` and `last_modified_at`
- Display "Edited by X on DD-MM-YYYY | hh:mm AM/PM" when present
- Delete remains admin-only

**`assetHistoryService.ts`**
- Add `updateHistoryEntry(id, patch)` that sets `last_modified_by` and `last_modified_at`
- Extend `AssetHistoryEntry` type with the two new fields

---

### Admin-only surfaces (unchanged / confirmed)
- User Management (new)
- Branding Settings, Advanced Settings, System Settings (existing)

---

### What does NOT change
- 18-field asset schema
- Login flow, session handling, `private.has_role()`
- Reports, QR, CSV upload, branding bucket, filters, dashboard
- All existing RLS on `assets`, `app_settings`, `user_roles`, `profiles` (only adds `disabled` + admin-update policy)

---

### Order of execution
1. Run migration (Phase 1) — needs your approval
2. Deploy `admin-users` edge function (Phase 2)
3. Build frontend (Phase 3)
4. Validate: create user, disable/enable, role change, non-admin edits history, audit fields render

Shall I proceed with **Phase 1 (the migration)**?