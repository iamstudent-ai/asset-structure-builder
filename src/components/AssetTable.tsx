// AssetTable.tsx — Paginated, searchable table with category badges,
// striped rows, hover effects, and category filtering support.

import { useState, useMemo } from "react";
import { Asset, ASSET_FIELDS } from "@/types/asset";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Search, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import CategoryBadge from "@/components/CategoryBadge";

const ROWS_PER_PAGE = 10;

interface AssetTableProps {
  assets: Asset[];
  onViewAsset?: (asset: Asset) => void;
}

/** Display value — shows "N/A" for empty/null fields */
const displayValue = (val: string | number): string => {
  const s = String(val ?? "").trim();
  return s === "" ? "N/A" : s;
};

const AssetTable = ({ assets, onViewAsset }: AssetTableProps) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a["Asset ID"].toLowerCase().includes(q) ||
        a["Serial Number"].toLowerCase().includes(q) ||
        a["Assigned User"].toLowerCase().includes(q)
    );
  }, [assets, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageData = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE
  );

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Asset ID, Serial Number, or User..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9 shadow-sm"
          />
        </div>
        <span className="text-sm text-muted-foreground">
          {filtered.length} asset{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto shadow-sm bg-card">
        <Table className="min-w-[1400px]">
          <TableHeader>
            <TableRow className="bg-muted/60 hover:bg-muted/60">
              {ASSET_FIELDS.map((field) => (
                <TableHead
                  key={field}
                  className="whitespace-nowrap text-xs font-semibold tracking-wide"
                >
                  {field}
                </TableHead>
              ))}
              <TableHead className="text-xs font-semibold w-[70px] sticky right-0 bg-muted/60">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={ASSET_FIELDS.length + 1}
                  className="text-center text-muted-foreground py-12"
                >
                  No assets found.
                </TableCell>
              </TableRow>
            ) : (
              pageData.map((asset, idx) => (
                <TableRow
                  key={asset["Asset ID"]}
                  className={`cursor-pointer transition-colors hover:bg-primary/[0.04] ${
                    idx % 2 === 1 ? "bg-muted/30" : ""
                  }`}
                  onClick={() => onViewAsset?.(asset)}
                >
                  {ASSET_FIELDS.map((field) => (
                    <TableCell
                      key={field}
                      className="whitespace-nowrap text-xs max-w-[200px] truncate"
                      title={String(asset[field] ?? "")}
                    >
                      {field === "Asset Category" ? (
                        <CategoryBadge category={String(asset[field])} />
                      ) : (
                        displayValue(asset[field])
                      )}
                    </TableCell>
                  ))}
                  <TableCell className="sticky right-0 bg-card">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewAsset?.(asset);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs text-muted-foreground">
          Page {safePage} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 shadow-sm"
            disabled={safePage <= 1}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 shadow-sm"
            disabled={safePage >= totalPages}
            onClick={() => setPage(safePage + 1)}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssetTable;
