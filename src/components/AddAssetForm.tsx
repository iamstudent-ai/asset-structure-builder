// AddAssetForm.tsx — Manual form with brand dropdown/combobox.

import { useState, useMemo } from "react";
import { Asset, ASSET_FIELDS, FIELD_TYPES, REQUIRED_FIELDS } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddAssetFormProps {
  existingAssetIds: string[];
  nextSno: number;
  onAdd: (asset: Asset) => void;
  allBrands?: string[];
}

const emptyAsset = (sno: number): Asset => ({
  "S.NO": sno, "Company": "", "Asset ID": "", "Asset Category": "",
  "Brand": "", "Model": "", "OS": "", "Asset Owner": "",
  "Serial Number": "", "Assigned User": "", "Location": "", "Office": "",
  "Department": "", "Data Classification": "", "Purchase Date": "",
  "EOL/EOS": "", "Warranty End Date": "", "Lifecycle Status": "",
});

const FORM_FIELDS = ASSET_FIELDS.filter((f) => f !== "S.NO");

const AddAssetForm = ({ existingAssetIds, nextSno, onAdd, allBrands = [] }: AddAssetFormProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Asset>(emptyAsset(nextSno));
  const [errors, setErrors] = useState<Partial<Record<keyof Asset, string>>>({});
  const [brandFocused, setBrandFocused] = useState(false);
  const { toast } = useToast();

  const updateField = (field: keyof Asset, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: field === "S.NO" ? Number(value) || 0 : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const filteredBrands = useMemo(() => {
    const q = String(draft["Brand"]).toLowerCase();
    if (!q) return allBrands;
    return allBrands.filter((b) => b.toLowerCase().includes(q));
  }, [draft, allBrands]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Asset, string>> = {};
    for (const field of REQUIRED_FIELDS) {
      if (!String(draft[field]).trim()) newErrors[field] = "Required";
    }
    const id = String(draft["Asset ID"]).trim().toLowerCase();
    if (id && existingAssetIds.some((eid) => eid.toLowerCase() === id)) {
      newErrors["Asset ID"] = "Asset ID already exists";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    const trimmed = { ...draft };
    for (const field of ASSET_FIELDS) {
      if (typeof trimmed[field] === "string") {
        (trimmed as any)[field] = (trimmed[field] as string).trim();
      }
    }
    trimmed["S.NO"] = nextSno;
    setDraft(trimmed);

    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fix highlighted fields.", variant: "destructive" });
      return;
    }

    onAdd(trimmed);
    setDraft(emptyAsset(nextSno + 1));
    setErrors({});
    setOpen(false);
    toast({ title: "Asset Added", description: `${trimmed["Asset ID"]} added successfully.` });
  };

  const handleCancel = () => {
    setDraft(emptyAsset(nextSno));
    setErrors({});
    setOpen(false);
  };

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)} className="h-9 shadow-sm">
        <Plus className="h-4 w-4 mr-1" /> Add New Asset
      </Button>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-foreground font-semibold">
          <Plus className="h-4 w-4 text-primary" /> Add New Asset
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FORM_FIELDS.map((field) => {
            const isRequired = REQUIRED_FIELDS.includes(field);
            const fieldType = FIELD_TYPES[field];
            const isBrand = field === "Brand";

            return (
              <div key={field} className="flex flex-col gap-0.5 relative">
                <label className="text-xs text-muted-foreground font-medium">
                  {field} {isRequired && <span className="text-destructive">*</span>}
                </label>
                <Input
                  type={fieldType === "date" ? "date" : "text"}
                  value={String(draft[field] ?? "")}
                  onChange={(e) => updateField(field, e.target.value)}
                  onFocus={() => isBrand && setBrandFocused(true)}
                  onBlur={() => isBrand && setTimeout(() => setBrandFocused(false), 200)}
                  placeholder={field}
                  className="h-8 text-sm shadow-sm"
                  autoComplete="off"
                />
                {/* Brand dropdown */}
                {isBrand && brandFocused && filteredBrands.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-32 overflow-y-auto rounded-md border bg-popover shadow-md">
                    {filteredBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors"
                        onMouseDown={() => updateField("Brand", b)}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
                {errors[field] && (
                  <span className="text-xs text-destructive">{errors[field]}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} className="h-8 shadow-sm">
            <Save className="h-4 w-4 mr-1" /> Save Asset
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddAssetForm;
