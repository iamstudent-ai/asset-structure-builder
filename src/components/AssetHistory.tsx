// AssetHistory.tsx — Timeline of asset lifecycle activities
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { History, Pencil, Plus, Trash2, Wrench, X, Save } from "lucide-react";
import {
  ACTIVITY_TYPES,
  AssetHistoryEntry,
  addHistoryEntry,
  deleteHistoryEntry,
  fetchHistoryForAsset,
  formatHistoryDate,
  updateHistoryEntry,
} from "@/lib/assetHistoryService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
  assetId: string;
  readOnly?: boolean;
}

const typeColor: Record<string, string> = {
  Repair: "bg-amber-100 text-amber-800 border-amber-200",
  Upgrade: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Downgrade: "bg-orange-100 text-orange-800 border-orange-200",
  Replacement: "bg-blue-100 text-blue-800 border-blue-200",
  Maintenance: "bg-violet-100 text-violet-800 border-violet-200",
  "Ownership Change": "bg-pink-100 text-pink-800 border-pink-200",
  "Location Change": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Other Activity": "bg-slate-100 text-slate-800 border-slate-200",
};

const AssetHistory = ({ assetId, readOnly = false }: Props) => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<AssetHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ activity_type: "", description: "", cost: "", vendor: "" });

  const [form, setForm] = useState({
    activity_type: "Repair",
    description: "",
    cost: "",
    vendor: "",
  });

  // Any authenticated user can add/edit; only admins can delete.
  const canEdit = !readOnly && !!user;
  const canDelete = !readOnly && isAdmin;
  const actorName = user?.displayName || user?.email || "Unknown";

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchHistoryForAsset(assetId);
      setEntries(data);
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to load history", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [assetId]);

  const handleAdd = async () => {
    if (!form.description.trim()) {
      toast({ title: "Description required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addHistoryEntry({
        asset_id: assetId,
        activity_type: form.activity_type,
        description: form.description.trim(),
        cost: form.cost ? Number(form.cost) : null,
        vendor: form.vendor.trim() || null,
        updated_by: actorName,
      });
      toast({ title: "Entry added", description: "History updated." });
      setForm({ activity_type: "Repair", description: "", cost: "", vendor: "" });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (e: AssetHistoryEntry) => {
    setEditingId(e.id);
    setEditForm({
      activity_type: e.activity_type,
      description: e.description,
      cost: e.cost != null ? String(e.cost) : "",
      vendor: e.vendor ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm.description.trim()) {
      toast({ title: "Description required", variant: "destructive" });
      return;
    }
    try {
      const updated = await updateHistoryEntry(
        id,
        {
          activity_type: editForm.activity_type,
          description: editForm.description.trim(),
          cost: editForm.cost ? Number(editForm.cost) : null,
          vendor: editForm.vendor.trim() || null,
        },
        actorName,
      );
      setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      setEditingId(null);
      toast({ title: "Entry updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setEntries((prev) => prev.filter((e) => e.id !== id));
      toast({ title: "Deleted" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-semibold">
          <History className="h-4 w-4" /> Asset History
          <span className="text-xs font-normal text-muted-foreground/70">({entries.length})</span>
        </CardTitle>
        {canEdit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-4 w-4 mr-1" /> Add Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add History Entry</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Activity Type</Label>
                  <Select value={form.activity_type} onValueChange={(v) => setForm({ ...form, activity_type: v })}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Description / Notes *</Label>
                  <Textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What was done?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Cost</Label>
                    <Input
                      type="number"
                      value={form.cost}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                      placeholder="0.00"
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Vendor</Label>
                    <Input
                      value={form.vendor}
                      onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                      placeholder="Optional"
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Add Entry"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {loading ? (
          <div className="text-xs text-muted-foreground py-4 text-center">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-xs text-muted-foreground py-6 text-center flex flex-col items-center gap-1">
            <Wrench className="h-5 w-5 opacity-40" />
            No history entries yet.
          </div>
        ) : (
          <ol className="relative border-l border-border ml-2 space-y-3">
            {entries.map((e) => {
              const isEditing = editingId === e.id;
              return (
                <li key={e.id} className="ml-4 pl-1">
                  <span className="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-background" />
                  {isEditing ? (
                    <div className="space-y-2 bg-muted/40 p-2 rounded-md">
                      <div className="grid grid-cols-2 gap-2">
                        <Select value={editForm.activity_type} onValueChange={(v) => setEditForm({ ...editForm, activity_type: v })}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ACTIVITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          value={editForm.vendor}
                          onChange={(ev) => setEditForm({ ...editForm, vendor: ev.target.value })}
                          placeholder="Vendor"
                          className="h-8 text-xs"
                        />
                      </div>
                      <Textarea
                        rows={2}
                        value={editForm.description}
                        onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })}
                        className="text-xs"
                      />
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={editForm.cost}
                          onChange={(ev) => setEditForm({ ...editForm, cost: ev.target.value })}
                          placeholder="Cost"
                          className="h-8 text-xs w-32"
                        />
                        <div className="ml-auto flex gap-1">
                          <Button size="sm" variant="ghost" className="h-7 px-2" onClick={cancelEdit}>
                            <X className="h-3.5 w-3.5 mr-1" /> Cancel
                          </Button>
                          <Button size="sm" className="h-7 px-2" onClick={() => saveEdit(e.id)}>
                            <Save className="h-3.5 w-3.5 mr-1" /> Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${typeColor[e.activity_type] || typeColor["Other Activity"]}`}>
                          {e.activity_type}
                        </span>
                        <span className="text-xs text-muted-foreground">{formatHistoryDate(e.activity_date)}</span>
                        {canEdit && (
                          <div className="ml-auto flex items-center gap-0.5">
                            <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => startEdit(e)} title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {canDelete && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleDelete(e.id)} title="Delete">
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-foreground break-words">{e.description}</p>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                        {e.cost != null && <span>Cost: <strong className="text-foreground">{e.cost}</strong></span>}
                        {e.vendor && <span>Vendor: <strong className="text-foreground">{e.vendor}</strong></span>}
                        {e.updated_by && <span>By: <strong className="text-foreground">{e.updated_by}</strong></span>}
                      </div>
                      {e.last_modified_at && (
                        <div className="text-[11px] text-muted-foreground/80 mt-0.5 italic">
                          Edited by {e.last_modified_by || "Unknown"} on {formatHistoryDate(e.last_modified_at)}
                        </div>
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetHistory;
