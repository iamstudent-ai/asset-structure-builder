// Index.tsx — Main page for IT Asset Management.
// Manages global asset state with category filtering.

import { useState, useMemo } from "react";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import AssetTable from "@/components/AssetTable";
import AssetDetail from "@/components/AssetDetail";
import DashboardSummary from "@/components/DashboardSummary";
import CsvUpload from "@/components/CsvUpload";
import AddAssetForm from "@/components/AddAssetForm";
import CategoryFilter from "@/components/CategoryFilter";

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleSave = (updated: Asset) => {
    setAssets((prev) =>
      prev.map((a) => (a["Asset ID"] === updated["Asset ID"] ? updated : a))
    );
    setSelectedAsset(updated);
  };

  const handleImport = (newAssets: Asset[]) => {
    setAssets((prev) => [...prev, ...newAssets]);
  };

  const handleAddAsset = (asset: Asset) => {
    setAssets((prev) => [...prev, asset]);
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
    if (!categoryFilter) return assets;
    return assets.filter((a) => a["Asset Category"] === categoryFilter);
  }, [assets, categoryFilter]);

  // Detail view
  if (selectedAsset) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">
          <AssetDetail
            asset={selectedAsset}
            onBack={() => setSelectedAsset(null)}
            onSave={handleSave}
          />
        </div>
      </div>
    );
  }

  const nextSno = assets.length > 0
    ? Math.max(...assets.map((a) => a["S.NO"])) + 1
    : 1;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            IT Asset Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage all company assets
          </p>
        </div>

        <DashboardSummary assets={assets} />

        {/* Category filter */}
        <CategoryFilter
          categories={categoryNames}
          counts={categoryCounts}
          active={categoryFilter}
          onSelect={setCategoryFilter}
        />

        {/* Import & Add actions */}
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

        <AssetTable assets={filteredAssets} onViewAsset={setSelectedAsset} />
      </div>
    </div>
  );
};

export default Index;
