// Index.tsx — Main page for IT Asset Management.
// Loads data from Supabase. Role-based UI controls.

import { useState, useMemo, useEffect } from "react";
import { Asset } from "@/types/asset";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAssets, addAsset, updateAsset, importAssets, deleteAsset } from "@/lib/assetService";
import AssetTable from "@/components/AssetTable";
import AssetDetail from "@/components/AssetDetail";
import DashboardSummary from "@/components/DashboardSummary";
import CsvUpload from "@/components/CsvUpload";
import AddAssetForm from "@/components/AddAssetForm";
import CategoryFilter from "@/components/CategoryFilter";
import Navbar from "@/components/Navbar";
import LiveClock from "@/components/LiveClock";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAssetReport } from "@/lib/pdfReport";

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const data = await fetchAssets();
      setAssets(data);
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to load assets", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updated: Asset) => {
    try {
      const saved = await updateAsset(updated);
      setAssets((prev) =>
        prev.map((a) => (a["Asset ID"] === saved["Asset ID"] ? saved : a))
      );
      setSelectedAsset(saved);
      toast({ title: "Saved", description: "Asset updated successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save", variant: "destructive" });
    }
  };

  const handleImport = async (newAssets: Asset[]) => {
    try {
      const imported = await importAssets(newAssets);
      setAssets((prev) => [...prev, ...imported]);
      toast({ title: "Imported", description: `${imported.length} asset(s) added.` });
    } catch (err: any) {
      toast({ title: "Import Error", description: err.message || "Failed to import", variant: "destructive" });
    }
  };

  const handleAddAsset = async (asset: Asset) => {
    try {
      const saved = await addAsset(asset);
      setAssets((prev) => [...prev, saved]);
      toast({ title: "Asset Added", description: `${saved["Asset ID"]} added successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to add asset", variant: "destructive" });
    }
  };

  const handleDeleteAssets = async (assetIds: string[]) => {
    try {
      for (const id of assetIds) {
        await deleteAsset(id);
      }
      setAssets((prev) => prev.filter((a) => !assetIds.includes(a["Asset ID"])));
      toast({ title: "Deleted", description: `${assetIds.length} asset(s) deleted successfully.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to delete", variant: "destructive" });
    }
  };

  // Category data
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => {
      counts[a["Asset Category"]] = (counts[a["Asset Category"]] || 0) + 1;
    });
    return counts;
  }, [assets]);

  const categoryNames = useMemo(() => Object.keys(categoryCounts).sort(), [categoryCounts]);

  const filteredAssets = useMemo(() => {
    let result = assets;
    if (companyFilter) {
      result = result.filter((a) => (a["Company"] || "Unknown") === companyFilter);
    }
    if (categoryFilter) {
      result = result.filter((a) => a["Asset Category"] === categoryFilter);
    }
    return result;
  }, [assets, categoryFilter, companyFilter]);

  // Detail view
  if (selectedAsset) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background p-4 md:p-8">
          <div className="max-w-[1400px] mx-auto">
            <AssetDetail
              asset={selectedAsset}
              onBack={() => setSelectedAsset(null)}
              onSave={isAdmin ? handleSave : undefined}
              readOnly={!isAdmin}
            />
          </div>
        </div>
      </>
    );
  }

  const nextSno = assets.length > 0
    ? Math.max(...assets.map((a) => a["S.NO"])) + 1
    : 1;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                IT Asset Management
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage all company assets
              </p>
            </div>
            <LiveClock />
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground animate-pulse">
              Loading assets...
            </div>
          ) : (
            <>
              <DashboardSummary
                assets={assets}
                companyFilter={companyFilter}
                onCompanySelect={setCompanyFilter}
              />

              {/* Category filter */}
              <CategoryFilter
                categories={categoryNames}
                counts={categoryCounts}
                active={categoryFilter}
                onSelect={setCategoryFilter}
              />

              {/* Admin-only: Import & Add actions */}
              {isAdmin && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <AddAssetForm
                      existingAssetIds={assets.map((a) => a["Asset ID"])}
                      nextSno={nextSno}
                      onAdd={handleAddAsset}
                      allBrands={[...new Set(assets.map((a) => a["Brand"]).filter(Boolean))].sort()}
                    />
                  </div>
                  <CsvUpload
                    existingAssetIds={assets.map((a) => a["Asset ID"])}
                    onImport={handleImport}
                  />
                </div>
              )}

              {/* Download Report */}
              {assets.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => generateAssetReport(filteredAssets)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Report
                  </Button>
                </div>
              )}

              <AssetTable
                assets={filteredAssets}
                onViewAsset={setSelectedAsset}
                onDeleteAssets={isAdmin ? handleDeleteAssets : undefined}
                isAdmin={isAdmin}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
