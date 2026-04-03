import { useState } from "react";
import { mockAssets } from "@/data/mockAssets";
import { Asset } from "@/types/asset";
import AssetTable from "@/components/AssetTable";
import DashboardSummary from "@/components/DashboardSummary";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [assets] = useState<Asset[]>(mockAssets);
  const { toast } = useToast();

  const handleViewAsset = (asset: Asset) => {
    toast({
      title: `Asset: ${asset["Asset ID"]}`,
      description: `Assigned to ${asset["Assigned User"]} — Detail page coming in Phase 3.`,
    });
  };

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
        <AssetTable assets={assets} onViewAsset={handleViewAsset} />
      </div>
    </div>
  );
};

export default Index;
