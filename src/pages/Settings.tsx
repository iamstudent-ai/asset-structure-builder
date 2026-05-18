import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Image as ImageIcon, ArrowLeft, Trash2, Building2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  listCompanyLogos,
  uploadCompanyLogo,
  removeCompanyLogo,
} from "@/lib/settingsService";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [companies, setCompanies] = useState<string[]>([]);
  const [customCompany, setCustomCompany] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [logos, setLogos] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  const loadAll = async () => {
    const [{ data: assetRows }, logoMap] = await Promise.all([
      supabase.from("assets").select("company"),
      listCompanyLogos(),
    ]);
    const set = new Set<string>();
    (assetRows || []).forEach((r: any) => {
      if (r.company && r.company.trim()) set.add(r.company.trim());
    });
    Object.keys(logoMap).forEach((c) => set.add(c));
    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    setCompanies(sorted);
    setLogos(logoMap);
    if (!selectedCompany && sorted.length > 0) setSelectedCompany(sorted[0]);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCompany = (customCompany.trim() || selectedCompany).trim();
  const activeLogo = activeCompany ? logos[activeCompany] : null;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!activeCompany) {
      toast({ title: "Select a company", description: "Choose or enter a company first.", variant: "destructive" });
      return;
    }
    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast({ title: "Invalid file", description: "Only PNG/JPG files allowed.", variant: "destructive" });
      return;
    }
    try {
      setUploading(true);
      const url = await uploadCompanyLogo(activeCompany, file);
      setLogos((prev) => ({ ...prev, [activeCompany]: url }));
      setCompanies((prev) => (prev.includes(activeCompany) ? prev : [...prev, activeCompany].sort()));
      setSelectedCompany(activeCompany);
      setCustomCompany("");
      toast({ title: "Logo Saved", description: `Logo for "${activeCompany}" updated.` });
    } catch (err: any) {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    if (!activeCompany || !activeLogo) return;
    try {
      await removeCompanyLogo(activeCompany);
      setLogos((prev) => {
        const next = { ...prev };
        delete next[activeCompany];
        return next;
      });
      toast({ title: "Logo Removed", description: `Logo for "${activeCompany}" deleted.` });
    } catch (err: any) {
      toast({ title: "Remove Error", description: err.message, variant: "destructive" });
    }
  };

  if (!isAdmin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background p-8 text-center text-muted-foreground">
          Access denied. Admin only.
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[900px] mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Advanced Settings</h1>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Company-Wise Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm text-muted-foreground">
                Upload a logo for each company. PDF reports automatically use the logo of the
                report's company. If no logo is set, the report is generated without one.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Select Company</label>
                  <Select
                    value={selectedCompany}
                    onValueChange={(v) => { setSelectedCompany(v); setCustomCompany(""); }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Choose a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.length === 0 && (
                        <div className="px-3 py-2 text-xs text-muted-foreground">No companies yet</div>
                      )}
                      {companies.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c} {logos[c] ? "•  logo set" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Or enter new company</label>
                  <Input
                    placeholder="e.g. Acme Corp"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/30 min-h-[120px] flex items-center justify-center">
                {activeLogo ? (
                  <img
                    src={activeLogo}
                    alt={`${activeCompany} logo`}
                    className="max-h-24 max-w-[220px] object-contain"
                  />
                ) : (
                  <div className="text-xs text-muted-foreground flex flex-col items-center gap-2">
                    <ImageIcon className="h-6 w-6 opacity-50" />
                    {activeCompany ? `No logo set for "${activeCompany}"` : "Select or enter a company"}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || !activeCompany}
                  className="h-9 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : activeLogo ? "Update Logo" : "Upload Logo"}
                </Button>
                {activeLogo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRemove}
                    className="h-9 gap-1.5 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Logo
                  </Button>
                )}
              </div>

              {Object.keys(logos).length > 0 && (
                <div className="pt-4 border-t">
                  <div className="text-xs font-medium text-muted-foreground mb-2">
                    Configured Logos ({Object.keys(logos).length})
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(logos).map(([co, url]) => (
                      <button
                        key={co}
                        type="button"
                        onClick={() => { setSelectedCompany(co); setCustomCompany(""); }}
                        className={`border rounded-md p-2 text-left transition hover:border-primary ${
                          activeCompany === co ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="h-12 flex items-center justify-center bg-muted/40 rounded mb-1.5">
                          <img src={url} alt={co} className="max-h-10 max-w-full object-contain" />
                        </div>
                        <div className="text-xs font-medium truncate">{co}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;
