// CsvUpload.tsx — CSV file import with partial upload support,
// duplicate/empty Asset ID skip, and N/A fill for empty fields.

import { useState, useRef } from "react";
import { Asset, ASSET_FIELDS } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Upload, CheckCircle, X, Download } from "lucide-react";
import { toast } from "sonner";

const MAX_PREVIEW_ROWS = 50;

interface CsvUploadProps {
  existingAssetIds: string[];
  onImport: (assets: Asset[]) => void;
}

const EXPECTED_HEADERS = ASSET_FIELDS.map((f) => String(f));

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { current += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ",") { result.push(current.trim()); current = ""; }
      else { current += ch; }
    }
  }
  result.push(current.trim());
  return result;
};

/** Normalize category value: trim + proper case */
const normalizeCategory = (val: string): string => {
  const trimmed = val.trim();
  if (!trimmed) return "N/A";
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};

/** Download a CSV template with correct headers + 1 sample row */
const downloadTemplate = () => {
  const sampleRow = [
    "1", "Acme Corp", "AST-001", "Laptop", "Dell", "Latitude 5520", "Windows 11",
    "IT Dept", "SN-12345", "John Doe", "HQ Building", "Office A", "Engineering",
    "Internal", "2024-01-15", "2027-01-15", "2026-01-15", "Active"
  ];
  const csv = EXPECTED_HEADERS.join(",") + "\n" + sampleRow.join(",") + "\n";
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "asset_template.csv";
  a.click();
  URL.revokeObjectURL(url);
};

const CsvUpload = ({ existingAssetIds, onImport }: CsvUploadProps) => {
  const [preview, setPreview] = useState<Asset[] | null>(null);
  const [skippedCount, setSkippedCount] = useState(0);
  const [skippedReasons, setSkippedReasons] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setPreview(null);
    setSkippedCount(0);
    setSkippedReasons([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (!file.name.endsWith(".csv")) {
      toast.error("Only .csv files are accepted.");
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      let text = (ev.target?.result as string).replace(/^\uFEFF/, "");
      const firstLine = text.split(/\r?\n/)[0] || "";
      const isTabDelimited = firstLine.includes("\t") && !firstLine.includes(",");
      if (isTabDelimited) text = text.replace(/\t/g, ",");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        toast.error("File is empty or has no data rows.");
        setPreview(null);
        return;
      }

      const rawHeaders = parseCsvLine(lines[0]);
      const normalize = (s: string) =>
        s.replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim().toLowerCase();

      const normalizedExpected = EXPECTED_HEADERS.map(normalize);
      const normalizedHeaders = rawHeaders.map(normalize);

      const headerIndexMap: Record<string, number> = {};
      const unmatchedExpected: string[] = [];

      for (let ei = 0; ei < EXPECTED_HEADERS.length; ei++) {
        const idx = normalizedHeaders.indexOf(normalizedExpected[ei]);
        if (idx === -1) unmatchedExpected.push(EXPECTED_HEADERS[ei]);
        else headerIndexMap[EXPECTED_HEADERS[ei]] = idx;
      }

      if (unmatchedExpected.length > 0) {
        toast.error(`Invalid CSV format. Missing columns: ${unmatchedExpected.join(", ")}`);
        setPreview(null);
        return;
      }

      const reasons: string[] = [];
      const parsed: Asset[] = [];
      let skipped = 0;
      let missingCount = 0;
      let dupCount = 0;
      const seenInFile = new Set<string>();
      const existingNorm = new Set<string>(
        existingAssetIds.map((id) => id.trim().toLowerCase()).filter(Boolean)
      );

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const row = {} as any;
        for (const field of EXPECTED_HEADERS) {
          const idx = headerIndexMap[field];
          const val = (values[idx] ?? "").trim();
          row[field] = val === "" ? "N/A" : val;
        }
        row["S.NO"] = Number(row["S.NO"]) || i;

        if (row["Asset Category"]) {
          row["Asset Category"] = normalizeCategory(row["Asset Category"]);
        }

        // Allow empty Asset ID (mark missing) and duplicates (mark warning)
        const rawId = (row["Asset ID"] ?? "").toString().trim();
        const isMissing = !rawId || rawId.toUpperCase() === "N/A";

        if (isMissing) {
          // Unique placeholder so DB NOT NULL constraint is satisfied; UI treats MISSING- as missing
          row["Asset ID"] = `MISSING-${Date.now()}-${i}`;
          missingCount++;
        } else {
          row["Asset ID"] = rawId;
          const norm = rawId.toLowerCase();
          if (existingNorm.has(norm) || seenInFile.has(norm)) {
            dupCount++;
            reasons.push(`Row ${i + 1}: Duplicate Asset ID "${rawId}" — imported with warning`);
          }
          seenInFile.add(norm);
        }
        parsed.push(row as Asset);
      }
      if (missingCount > 0) reasons.unshift(`${missingCount} row(s) imported as Missing Asset ID`);
      if (dupCount > 0) reasons.unshift(`${dupCount} row(s) imported as Duplicate Asset ID`);

      setSkippedCount(skipped);
      setSkippedReasons(reasons);
      setPreview(parsed.length > 0 ? parsed : null);
      if (parsed.length === 0 && skipped === 0) {
        toast.error("No valid data rows found.");
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    onImport(preview);
    toast.success(`${preview.length} record(s) added`);
    reset();
  };

  const previewRows = preview?.slice(0, MAX_PREVIEW_ROWS) ?? [];

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
          <Upload className="h-4 w-4" /> Upload CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
          />
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="h-7 text-xs gap-1">
            <Download className="h-3 w-3" /> Download Template
          </Button>
          {(preview || skippedCount > 0) && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Skipped rows info */}
        {skippedReasons.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded p-3 space-y-1 max-h-32 overflow-y-auto">
            {skippedReasons.map((r, i) => (
              <div key={i} className="text-xs text-amber-700 dark:text-amber-400">{r}</div>
            ))}
          </div>
        )}

        {/* Preview table */}
        {preview && preview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              {preview.length} valid row(s) ready to import
              {skippedCount > 0 && `, ${skippedCount} skipped`}
            </div>
            <div className="border rounded overflow-x-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    {["S.NO", "Asset ID", "Brand", "Model", "Serial Number", "Assigned User"].map((h) => (
                      <TableHead key={h} className="text-[10px] whitespace-nowrap">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{a["S.NO"]}</TableCell>
                      <TableCell className="text-xs">{a["Asset ID"]}</TableCell>
                      <TableCell className="text-xs">{a["Brand"]}</TableCell>
                      <TableCell className="text-xs">{a["Model"]}</TableCell>
                      <TableCell className="text-xs">{a["Serial Number"]}</TableCell>
                      <TableCell className="text-xs">{a["Assigned User"]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {preview.length > MAX_PREVIEW_ROWS && (
                <p className="text-[10px] text-muted-foreground p-2">
                  Showing {MAX_PREVIEW_ROWS} of {preview.length} rows
                </p>
              )}
            </div>
            <Button size="sm" onClick={confirmImport} className="h-8">
              <CheckCircle className="h-4 w-4 mr-1" /> Confirm Import ({preview.length} rows)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CsvUpload;
