// Index.tsx — Main page for IT Asset Management.
// Manages global asset state and switches between list/detail views.
// All data currently in-memory (mock); ready for API replacement.

import { useState } from "react";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import AssetTable from "@/components/AssetTable";
import AssetDetail from "@/components/AssetDetail";
import DashboardSummary from "@/components/DashboardSummary";
import CsvUpload from "@/components/CsvUpload";
import AddAssetForm from "@/components/AddAssetForm";

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  /** Update an existing asset by Asset ID */
  const handleSave = (updated: Asset) => {
    setAssets((prev) =>
      prev.map((a) => (a["Asset ID"] === updated["Asset ID"] ? updated : a))
    );
    setSelectedAsset(updated);
  };

  /** Append imported assets from CSV */
  const handleImport = (newAssets: Asset[]) => {
    setAssets((prev) => [...prev, ...newAssets]);
  };

  /** Add a single manually-created asset */
  const handleAddAsset = (asset: Asset) => {
    setAssets((prev) => [...prev, asset]);
  };

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

  // Compute next S.NO for manual add
  const nextSno = assets.length > 0
    ? Math.max(...assets.map((a) => a["S.NO"])) + 1
    : 1;

  // List view
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            IT Asset Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Track and manage all company assets
          </p>
        </div>

        <DashboardSummary assets={assets} />

        {/* Import & Add actions */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <AddAssetForm
              existingAssetIds={assets.map((a) => a["Asset ID"])}
              nextSno={nextSno}
              onAdd={handleAddAsset}
            />
          </div>
          <CsvUpload
            existingAssetIds={assets.map((a) => a["Asset ID"])}
            onImport={handleImport}
          />
        </div>

        <AssetTable assets={assets} onViewAsset={setSelectedAsset} />
      </div>
    </div>
  );
};

export default Index;
