import { Asset } from "@/types/asset";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, HardDrive, Server, Laptop } from "lucide-react";

interface DashboardSummaryProps {
  assets: Asset[];
}

const DashboardSummary = ({ assets }: DashboardSummaryProps) => {
  const total = assets.length;
  const categories: Record<string, number> = {};
  assets.forEach((a) => {
    categories[a["Asset Category"]] = (categories[a["Asset Category"]] || 0) + 1;
  });

  const icons: Record<string, React.ReactNode> = {
    Laptop: <Laptop className="h-5 w-5" />,
    Desktop: <Monitor className="h-5 w-5" />,
    Server: <Server className="h-5 w-5" />,
    Monitor: <Monitor className="h-5 w-5" />,
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card>
        <CardContent className="pt-4 pb-3 flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            <HardDrive className="h-5 w-5" />
          </div>
          <div>
            <p className="text-2xl font-semibold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">Total Assets</p>
          </div>
        </CardContent>
      </Card>
      {Object.entries(categories).slice(0, 3).map(([cat, count]) => (
        <Card key={cat}>
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent/10 text-accent">
              {icons[cat] || <HardDrive className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{cat}s</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardSummary;
