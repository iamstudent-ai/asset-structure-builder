import { Asset } from "@/types/asset";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, HardDrive, Server, Laptop, Building2 } from "lucide-react";
import { getCategoryStyle } from "@/lib/categoryColors";

interface DashboardSummaryProps {
  assets: Asset[];
  companyFilter: string | null;
  onCompanySelect: (company: string | null) => void;
}

const DashboardSummary = ({ assets, companyFilter, onCompanySelect }: DashboardSummaryProps) => {
  const total = assets.length;

  // Category counts
  const categories: Record<string, number> = {};
  assets.forEach((a) => {
    categories[a["Asset Category"]] = (categories[a["Asset Category"]] || 0) + 1;
  });

  // Company counts
  const companies: Record<string, number> = {};
  assets.forEach((a) => {
    const company = a["Company"] || "Unknown";
    companies[company] = (companies[company] || 0) + 1;
  });

  const icons: Record<string, React.ReactNode> = {
    Laptop: <Laptop className="h-5 w-5" />,
    Desktop: <Monitor className="h-5 w-5" />,
    Server: <Server className="h-5 w-5" />,
    Monitor: <Monitor className="h-5 w-5" />,
  };

  return (
    <div className="space-y-4">
      {/* Top summary row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-3 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground">Total Assets</p>
            </div>
          </CardContent>
        </Card>
        {Object.entries(categories).slice(0, 3).map(([cat, count]) => {
          const style = getCategoryStyle(cat);
          return (
            <Card key={cat} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${style.bg} ${style.icon}`}>
                  {icons[cat] || <HardDrive className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{cat}s</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Company filter cards */}
      {Object.keys(companies).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Filter by Company</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCompanySelect(null)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                companyFilter === null
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:shadow-sm"
              }`}
            >
              <Building2 className="h-3 w-3" />
              All Companies
            </button>
            {Object.entries(companies).sort().map(([company, count]) => (
              <button
                key={company}
                onClick={() => onCompanySelect(companyFilter === company ? null : company)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  companyFilter === company
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                {company} ({count})
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardSummary;
