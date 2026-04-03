import { useState } from "react";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import AssetTable from "@/components/AssetTable";
import AssetDetail from "@/components/AssetDetail";
import DashboardSummary from "@/components/DashboardSummary";

const Index = () => {
  const [assets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  if (selectedAsset) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-[1400px] mx-auto">
          <AssetDetail asset={selectedAsset} onBack={() => setSelectedAsset(null)} />
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
        <AssetTable assets={assets} onViewAsset={setSelectedAsset} />
      </div>
    </div>
  );
};

export default Index;
