// CsvUpload.tsx — CSV file import with strict header validation,
// duplicate Asset ID detection, and preview (max 50 rows shown).
// No heavy libraries — uses native FileReader + custom CSV parser.

import { useState, useRef } from "react";
import { Asset, ASSET_FIELDS } from "@/types/asset";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from "@/components/ui/table";
import { Upload, AlertTriangle, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const MAX_PREVIEW_ROWS = 50;

interface CsvUploadProps {
  existingAssetIds: string[];
  onImport: (assets: Asset[]) => void;
}

const EXPECTED_HEADERS = ASSET_FIELDS.map((f) => String(f));

/** Parse a single CSV line, handling quoted fields */
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current.trim());
  return result;
};

const CsvUpload = ({ existingAssetIds, onImport }: CsvUploadProps) => {
  const [preview, setPreview] = useState<Asset[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const reset = () => {
    setPreview(null);
    setErrors([]);
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    if (!file.name.endsWith(".csv")) {
      setErrors(["Only .csv files are accepted. Please convert your Excel file to CSV first."]);
      setPreview(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      let text = (ev.target?.result as string).replace(/^\uFEFF/, ""); // strip BOM
      // Auto-detect tab-delimited files
      const firstLine = text.split(/\r?\n/)[0] || "";
      const isTabDelimited = firstLine.includes("\t") && !firstLine.includes(",");
      if (isTabDelimited) text = text.replace(/\t/g, ",");
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        setErrors(["File is empty or has no data rows."]);
        setPreview(null);
        return;
      }

      // Normalize headers: strip BOM, trim, collapse whitespace
      const rawHeaders = parseCsvLine(lines[0]);
      const normalize = (s: string) =>
        s.replace(/^\uFEFF/, "").replace(/\s+/g, " ").trim().toLowerCase();

      const normalizedExpected = EXPECTED_HEADERS.map(normalize);
      const normalizedHeaders = rawHeaders.map(normalize);

      // Build mapping from normalized expected → actual index
      const headerIndexMap: Record<string, number> = {};
      const unmatchedExpected: string[] = [];

      for (let ei = 0; ei < EXPECTED_HEADERS.length; ei++) {
        const idx = normalizedHeaders.indexOf(normalizedExpected[ei]);
        if (idx === -1) {
          unmatchedExpected.push(EXPECTED_HEADERS[ei]);
        } else {
          headerIndexMap[EXPECTED_HEADERS[ei]] = idx;
        }
      }

      if (unmatchedExpected.length > 0) {
        setErrors([
          "Invalid CSV format. Please ensure headers match the required format.",
          `Missing or incorrect columns: ${unmatchedExpected.join(", ")}`,
        ]);
        setPreview(null);
        return;
      }

      const rowErrors: string[] = [];
      const parsed: Asset[] = [];
      const seenIds = new Set<string>(existingAssetIds.map((id) => id.toLowerCase()));

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        const row = {} as any;
        for (const field of EXPECTED_HEADERS) {
          const idx = headerIndexMap[field];
          row[field] = values[idx] ?? "";
        }
        row["S.NO"] = Number(row["S.NO"]) || i;

        // Validate required fields
        if (!row["Asset ID"]?.trim()) {
          rowErrors.push(`Row ${i + 1}: Asset ID is empty`);
          continue;
        }
        if (!row["Serial Number"]?.trim()) {
          rowErrors.push(`Row ${i + 1}: Serial Number is empty`);
          continue;
        }

        // Check for duplicate Asset IDs
        const idLower = row["Asset ID"].toLowerCase();
        if (seenIds.has(idLower)) {
          rowErrors.push(`Row ${i + 1}: Duplicate Asset ID "${row["Asset ID"]}"`);
          continue;
        }
        seenIds.add(idLower);
        parsed.push(row as Asset);
      }

      setErrors(rowErrors);
      setPreview(parsed.length > 0 ? parsed : null);
      if (parsed.length === 0 && rowErrors.length === 0) {
        setErrors(["No valid data rows found."]);
      }
    };
    reader.readAsText(file);
  };

  const confirmImport = () => {
    if (!preview) return;
    onImport(preview);
    toast({ title: "Import Successful", description: `${preview.length} asset(s) added.` });
    reset();
  };

  // Limit preview display to MAX_PREVIEW_ROWS
  const previewRows = preview?.slice(0, MAX_PREVIEW_ROWS) ?? [];

  return (
    <Card>
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground font-medium">
          <Upload className="h-4 w-4" /> Upload CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-xs text-muted-foreground">
          Select a <strong>.csv</strong> file matching the asset template format.
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="text-xs file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
          />
          {(preview || errors.length > 0) && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Error display */}
        {errors.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded p-3 space-y-1 max-h-40 overflow-y-auto">
            {errors.map((err, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {err}
              </div>
            ))}
          </div>
        )}

        {/* Preview table */}
        {preview && preview.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              {preview.length} valid row(s) ready to import from "{fileName}"
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
