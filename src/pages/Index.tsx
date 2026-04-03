import { useState } from "react";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import AssetTable from "@/components/AssetTable";
import AssetDetail from "@/components/AssetDetail";
import DashboardSummary from "@/components/DashboardSummary";
import CsvUpload from "@/components/CsvUpload";

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const handleSave = (updated: Asset) => {
    setAssets((prev) =>
      prev.map((a) => (a["Asset ID"] === updated["Asset ID"] ? updated : a))
    );
    setSelectedAsset(updated);
  };

  const handleImport = (newAssets: Asset[]) => {
    setAssets((prev) => [...prev, ...newAssets]);
  };

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
        <CsvUpload
          existingAssetIds={assets.map((a) => a["Asset ID"])}
          onImport={handleImport}
        />
        <AssetTable assets={assets} onViewAsset={setSelectedAsset} />
      </div>
    </div>
  );
};

export default Index;
