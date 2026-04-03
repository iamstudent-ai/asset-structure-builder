import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Info, Cpu, Users, MapPin, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
}

const formatDate = (dateStr: string) => {
  try {
    return format(parseISO(dateStr), "dd-MM-yyyy");
  } catch {
    return dateStr;
  }
};

const Field = ({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className={`flex flex-col gap-0.5 p-3 rounded-md ${highlight ? "bg-primary/5 border border-primary/20" : "bg-muted/40"}`}>
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-sm font-medium ${highlight ? "text-primary" : "text-foreground"}`}>
      {value}
    </span>
  </div>
);

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

const AssetDetail = ({ asset, onBack }: AssetDetailProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="h-8">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to List
        </Button>
        <span className="text-sm text-muted-foreground">
          Viewing: <span className="font-medium text-foreground">{asset["Asset ID"]}</span>
        </span>
      </div>

      <Section title="Basic Info" icon={<Info className="h-4 w-4" />}>
        <Field label="S.NO" value={asset["S.NO"]} />
        <Field label="Company" value={asset["Company"]} />
        <Field label="Asset ID" value={asset["Asset ID"]} />
        <Field label="Asset Category" value={asset["Asset Category"]} />
      </Section>

      <Section title="Hardware Info" icon={<Cpu className="h-4 w-4" />}>
        <Field label="Brand" value={asset["Brand"]} />
        <Field label="Model" value={asset["Model"]} />
        <Field label="OS" value={asset["OS"]} />
        <Field label="Serial Number" value={asset["Serial Number"]} highlight />
      </Section>

      <Section title="Ownership" icon={<Users className="h-4 w-4" />}>
        <Field label="Asset Owner" value={asset["Asset Owner"]} />
        <Field label="Assigned User" value={asset["Assigned User"]} />
        <Field label="Department" value={asset["Department"]} />
      </Section>

      <Section title="Location" icon={<MapPin className="h-4 w-4" />}>
        <Field label="Location" value={asset["Location"]} />
        <Field label="Office" value={asset["Office"]} />
      </Section>

      <Section title="Lifecycle" icon={<ShieldCheck className="h-4 w-4" />}>
        <Field label="Data Classification" value={asset["Data Classification"]} />
        <Field label="Purchase Date" value={formatDate(asset["Purchase Date"])} />
        <Field label="EOL/EOS" value={formatDate(asset["EOL/EOS"])} />
        <Field label="Warranty End Date" value={formatDate(asset["Warranty End Date"])} />
        <Field label="Lifecycle Status" value={asset["Lifecycle Status"]} />
      </Section>
    </div>
  );
};

export default AssetDetail;
