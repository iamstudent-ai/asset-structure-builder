import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Image, Save, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getSetting, upsertSetting, uploadBrandingLogo } from "@/lib/settingsService";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getSetting("logo_url").then(setLogoUrl);
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      toast({ title: "Invalid file", description: "Only PNG/JPG files allowed.", variant: "destructive" });
      return;
    }

    try {
      setUploading(true);
      const url = await uploadBrandingLogo(file);
      await upsertSetting("logo_url", url);
      setLogoUrl(url);
      toast({ title: "Logo Updated", description: "Company logo saved successfully." });
    } catch (err: any) {
      toast({ title: "Upload Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
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
        <div className="max-w-[800px] mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="h-8">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            <h1 className="text-xl font-bold text-foreground">Advanced Settings</h1>
          </div>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Image className="h-4 w-4 text-primary" />
                Company Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload your company logo. It will appear in all generated PDF reports.
              </p>

              {logoUrl && (
                <div className="border rounded-lg p-4 bg-muted/30 flex items-center justify-center">
                  <img
                    src={logoUrl}
                    alt="Company Logo"
                    className="max-h-24 max-w-[200px] object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
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
                  disabled={uploading}
                  className="h-9 gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploading ? "Uploading..." : "Upload Logo"}
                </Button>
                {logoUrl && (
                  <span className="text-xs text-green-600 font-medium">✓ Logo configured</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Settings;
