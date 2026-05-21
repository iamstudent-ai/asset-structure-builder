import { Asset } from "@/types/asset";
import { Card, CardContent } from "@/components/ui/card";
import { HardDrive, Building2 } from "lucide-react";

interface DashboardSummaryProps {
  assets: Asset[];
  companyFilter: string | null;
  onCompanySelect: (company: string | null) => void;
}

const DashboardSummary = ({ assets, companyFilter, onCompanySelect }: DashboardSummaryProps) => {
  const total = assets.length;

  // Company counts
  const companies: Record<string, number> = {};
  assets.forEach((a) => {
    const company = a["Company"] || "Unknown";
    companies[company] = (companies[company] || 0) + 1;
  });

  return (
    <div className="space-y-5">
      {/* Total Assets hero card */}
      <Card className="shadow-md hover:shadow-lg transition-shadow rounded-2xl border-0 bg-gradient-to-br from-primary/10 via-card to-accent/10">
        <CardContent className="py-5 px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/15 text-primary">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-foreground leading-none">{total}</p>
              <p className="text-xs text-muted-foreground mt-1.5">Total Assets</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Online
          </div>
        </CardContent>
      </Card>

      {/* Company filter cards */}
      {Object.keys(companies).length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Filter by Company</p>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x scrollbar-thin">
            <button
              onClick={() => onCompanySelect(null)}
              className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                companyFilter === null
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:border-emerald-400/60 hover:text-foreground hover:shadow-sm"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              All Companies
            </button>
            {Object.entries(companies).sort().map(([company, count]) => (
              <button
                key={company}
                onClick={() => onCompanySelect(companyFilter === company ? null : company)}
                className={`shrink-0 snap-start inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all ${
                  companyFilter === company
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:border-emerald-400/60 hover:text-foreground hover:shadow-sm"
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
