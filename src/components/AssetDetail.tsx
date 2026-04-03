import { useState } from "react";
import { Asset, EDITABLE_FIELDS, REQUIRED_FIELDS } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, Cpu, Users, MapPin, ShieldCheck, Pencil, Save, X } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onSave?: (updated: Asset) => void;
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd-MM-yyyy");
  } catch {
    return dateStr;
  }
};

const isEditable = (field: keyof Asset) => EDITABLE_FIELDS.includes(field);

const Field = ({
  label,
  value,
  editing,
  editable,
  onChange,
  error,
}: {
  label: string;
  value: string | number;
  editing: boolean;
  editable: boolean;
  onChange?: (val: string) => void;
  error?: string;
}) => {
  const canEdit = editing && editable;
  return (
    <div className={`flex flex-col gap-0.5 p-3 rounded-md ${canEdit ? "bg-primary/5 border border-primary/20" : "bg-muted/40"}`}>
      <span className="text-xs text-muted-foreground">
        {label} {editable && <span className="text-primary">(editable)</span>}
      </span>
      {canEdit ? (
        <>
          <Input
            value={String(value)}
            onChange={(e) => onChange?.(e.target.value)}
            className="h-7 text-sm px-2"
          />
          {error && <span className="text-xs text-destructive">{error}</span>}
        </>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <Card>
    <CardHeader className="pb-2 pt-4 px-4">
      <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
        {icon} {title}
      </CardTitle>
    </CardHeader>
    <CardContent className="px-4 pb-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      {children}
    </CardContent>
  </Card>
);

const AssetDetail = ({ asset, onBack, onSave }: AssetDetailProps) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Asset>({ ...asset });
  const [errors, setErrors] = useState<Partial<Record<keyof Asset, string>>>({});
  const { toast } = useToast();

  const updateField = (field: keyof Asset, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof Asset, string>> = {};
    for (const field of REQUIRED_FIELDS) {
      if (isEditable(field) && !String(draft[field]).trim()) {
        newErrors[field] = "This field is required";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    // Trim all editable text fields
    const trimmed = { ...draft };
    for (const field of EDITABLE_FIELDS) {
      if (typeof trimmed[field] === "string") {
        (trimmed as any)[field] = (trimmed[field] as string).trim();
      }
    }
    setDraft(trimmed);

    if (!validate()) {
      toast({ title: "Validation Error", description: "Please fix errors before saving.", variant: "destructive" });
      return;
    }
    onSave?.(trimmed);
    setEditing(false);
    toast({ title: "Saved", description: "Asset updated successfully." });
  };

  const handleCancel = () => {
    setDraft({ ...asset });
    setErrors({});
    setEditing(false);
  };

  const f = (field: keyof Asset, display?: string) => (
    <Field
      label={field}
      value={display ?? draft[field]}
      editing={editing}
      editable={isEditable(field)}
      onChange={(v) => updateField(field, v)}
      error={errors[field]}
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="h-8">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to List
          </Button>
          <span className="text-sm text-muted-foreground">
            Viewing: <span className="font-medium text-foreground">{asset["Asset ID"]}</span>
          </span>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-8">
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button size="sm" onClick={handleSave} className="h-8">
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setEditing(true)} className="h-8">
              <Pencil className="h-4 w-4 mr-1" /> Edit
            </Button>
          )}
        </div>
      </div>

      <Section title="Basic Info" icon={<Info className="h-4 w-4" />}>
        {f("S.NO")}
        {f("Company")}
        {f("Asset ID")}
        {f("Asset Category")}
      </Section>

      <Section title="Hardware Info" icon={<Cpu className="h-4 w-4" />}>
        {f("Brand")}
        {f("Model")}
        {f("OS")}
        {f("Serial Number")}
      </Section>

      <Section title="Ownership" icon={<Users className="h-4 w-4" />}>
        {f("Asset Owner")}
        {f("Assigned User")}
        {f("Department")}
      </Section>

      <Section title="Location" icon={<MapPin className="h-4 w-4" />}>
        {f("Location")}
        {f("Office")}
      </Section>

      <Section title="Lifecycle" icon={<ShieldCheck className="h-4 w-4" />}>
        {f("Data Classification")}
        {f("Purchase Date", formatDate(draft["Purchase Date"]))}
        {f("EOL/EOS", formatDate(draft["EOL/EOS"]))}
        {f("Warranty End Date", formatDate(draft["Warranty End Date"]))}
        {f("Lifecycle Status")}
      </Section>
    </div>
  );
};

export default AssetDetail;
