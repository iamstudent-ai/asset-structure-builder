// Users.tsx — Admin-only user management
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Shield, ShieldOff, UserCheck, UserX, Users as UsersIcon } from "lucide-react";

interface AdminUserRow {
  id: string;
  email: string;
  display_name: string;
  role: "admin" | "user";
  disabled: boolean;
  created_at: string;
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

const Users = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [form, setForm] = useState({ display_name: "", email: "", password: "", role: "user" as "user" | "admin" });
  const [creating, setCreating] = useState(false);

  const call = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, ...payload },
    });
    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const load = async () => {
    try {
      setLoading(true);
      const data = await call("list");
      setRows(data.users || []);
    } catch (e: any) {
      toast({ title: "Failed to load users", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const filtered = rows.filter((r) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      r.email.toLowerCase().includes(q) ||
      r.display_name.toLowerCase().includes(q) ||
      r.role.toLowerCase().includes(q)
    );
  });

  const handleCreate = async () => {
    if (!form.email || !form.password) {
      toast({ title: "Email and password are required", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      await call("create", form);
      toast({ title: "User created" });
      setForm({ display_name: "", email: "", password: "", role: "user" });
      setAddOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Create failed", description: e.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const setRole = async (id: string, role: "admin" | "user") => {
    setBusyId(id);
    try {
      await call("set_role", { user_id: id, role });
      setRows((p) => p.map((r) => (r.id === id ? { ...r, role } : r)));
      toast({ title: "Role updated" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const setDisabled = async (id: string, disabled: boolean) => {
    setBusyId(id);
    try {
      await call("set_disabled", { user_id: id, disabled });
      setRows((p) => p.map((r) => (r.id === id ? { ...r, disabled } : r)));
      toast({ title: disabled ? "User disabled" : "User enabled" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <UsersIcon className="h-5 w-5 text-primary" /> User Management
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Create accounts, assign roles, and enable or disable access.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9 w-56"
                />
              </div>
              <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-9">
                    <Plus className="h-4 w-4 mr-1" /> Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} className="h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Email *</Label>
                      <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Password *</Label>
                      <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-9" />
                    </div>
                    <div>
                      <Label className="text-xs">Role</Label>
                      <Select value={form.role} onValueChange={(v: "user" | "admin") => setForm({ ...form, role: v })}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Non-Admin / User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell></TableRow>
                  ) : filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No users found.</TableCell></TableRow>
                  ) : filtered.map((r) => {
                    const isSelf = r.id === user.id;
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.display_name || "—"}{isSelf && <span className="text-xs text-muted-foreground ml-1">(you)</span>}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.email}</TableCell>
                        <TableCell>
                          {r.role === "admin" ? (
                            <Badge className="bg-primary/10 text-primary border-primary/20"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
                          ) : (
                            <Badge variant="secondary">User</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {r.disabled ? (
                            <Badge variant="destructive">Disabled</Badge>
                          ) : (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{fmtDate(r.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex gap-1">
                            {r.role === "admin" ? (
                              <Button size="sm" variant="outline" className="h-8" disabled={isSelf || busyId === r.id} onClick={() => setRole(r.id, "user")}>
                                <ShieldOff className="h-3.5 w-3.5 mr-1" /> Demote
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="h-8" disabled={busyId === r.id} onClick={() => setRole(r.id, "admin")}>
                                <Shield className="h-3.5 w-3.5 mr-1" /> Promote
                              </Button>
                            )}
                            {r.disabled ? (
                              <Button size="sm" variant="outline" className="h-8" disabled={busyId === r.id} onClick={() => setDisabled(r.id, false)}>
                                <UserCheck className="h-3.5 w-3.5 mr-1" /> Enable
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="h-8 text-destructive hover:text-destructive" disabled={isSelf || busyId === r.id} onClick={() => setDisabled(r.id, true)}>
                                <UserX className="h-3.5 w-3.5 mr-1" /> Disable
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Users;
