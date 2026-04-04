// AddAssetForm.tsx — Manual form to add a single new asset.
// All 18 fields are shown; Asset ID must be unique.
// S.NO is auto-generated. Date fields use date inputs.

import { useState } from "react";
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
}

/** Build an empty asset template */
const emptyAsset = (sno: number): Asset => ({
  "S.NO": sno,
  "Company": "",
  "Asset ID": "",
  "Asset Category": "",
  "Brand": "",
  "Model": "",
  "OS": "",
  "Asset Owner": "",
  "Serial Number": "",
  "Assigned User": "",
  "Location": "",
  "Office": "",
  "Department": "",
  "Data Classification": "",
  "Purchase Date": "",
  "EOL/EOS": "",
  "Warranty End Date": "",
  "Lifecycle Status": "",
});

/** Fields the user fills in (all except S.NO which is auto) */
const FORM_FIELDS = ASSET_FIELDS.filter((f) => f !== "S.NO");

const AddAssetForm = ({ existingAssetIds, nextSno, onAdd }: AddAssetFormProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Asset>(emptyAsset(nextSno));
  const [errors, setErrors] = useState<Partial<Record<keyof Asset, string>>>({});
  const { toast } = useToast();

  const updateField = (field: keyof Asset, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: field === "S.NO" ? Number(value) || 0 : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Asset, string>> = {};

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!String(draft[field]).trim()) {
        newErrors[field] = "Required";
      }
    }

    // Check Asset ID uniqueness
    const id = String(draft["Asset ID"]).trim().toLowerCase();
    if (id && existingAssetIds.some((eid) => eid.toLowerCase() === id)) {
      newErrors["Asset ID"] = "Asset ID already exists";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    // Trim all string fields
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
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="h-8">
        <Plus className="h-4 w-4 mr-1" /> Add New Asset
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
          <Plus className="h-4 w-4" /> Add New Asset
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {FORM_FIELDS.map((field) => {
            const isRequired = REQUIRED_FIELDS.includes(field);
            const fieldType = FIELD_TYPES[field];
            return (
              <div key={field} className="flex flex-col gap-0.5">
                <label className="text-xs text-muted-foreground">
                  {field} {isRequired && <span className="text-destructive">*</span>}
                </label>
                <Input
                  type={fieldType === "date" ? "date" : "text"}
                  value={String(draft[field] ?? "")}
                  onChange={(e) => updateField(field, e.target.value)}
                  placeholder={field}
                  className="h-8 text-sm"
                />
                {errors[field] && (
                  <span className="text-xs text-destructive">{errors[field]}</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={handleSubmit} className="h-8">
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
