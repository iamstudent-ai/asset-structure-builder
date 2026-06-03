import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Asset } from "@/types/asset";
import { fetchAssets, updateAsset } from "@/lib/assetService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AssetDetail from "@/components/AssetDetail";
import Navbar from "@/components/Navbar";

const AssetView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const all = await fetchAssets();
        const match = all.find((a) => a["Asset ID"] === id);
        setAsset(match || null);
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to load asset", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, toast]);

  const handleSave = async (updated: Asset) => {
    try {
      const saved = await updateAsset(updated);
      setAsset(saved);
      toast({ title: "Saved", description: "Asset updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/60 via-background to-emerald-50/30 p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">Loading asset...</div>
          ) : !asset ? (
            <div className="text-center py-12">
              <p className="text-lg font-semibold">Asset not found</p>
              <p className="text-sm text-muted-foreground mt-1">Asset ID: {id}</p>
            </div>
          ) : (
            <AssetDetail
              asset={asset}
              onBack={() => navigate("/")}
              onSave={isAdmin ? handleSave : undefined}
              readOnly={!isAdmin}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default AssetView;
