import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Printer } from "lucide-react";
import { buildAssetUrl, generateQrDataUrl } from "@/lib/qrUtils";

interface Props {
  assets: Asset[];
  trigger?: React.ReactNode;
}

// Grid presets: labels per A4 page
const LAYOUTS: Record<string, { cols: number; rows: number; label: string }> = {
  "12": { cols: 3, rows: 4, label: "12 / page (large)" },
  "24": { cols: 4, rows: 6, label: "24 / page (medium)" },
  "40": { cols: 5, rows: 8, label: "40 / page (small)" },
};

const BulkQrPrint = ({ assets, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [perPage, setPerPage] = useState<keyof typeof LAYOUTS>("24");
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || assets.length === 0) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const map: Record<string, string> = {};
      for (const a of assets) {
        map[a["Asset ID"]] = await generateQrDataUrl(buildAssetUrl(a["Asset ID"]), 200);
        if (cancelled) return;
      }
      if (!cancelled) {
        setQrMap(map);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [open, assets]);

  const layout = LAYOUTS[perPage];

  const handlePrint = () => window.print();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div onClick={(e) => e.stopPropagation()}>
        {trigger ? (
          <span onClick={() => setOpen(true)}>{trigger}</span>
        ) : (
          <Button size="sm" variant="outline" className="h-9 gap-1.5" onClick={() => setOpen(true)} disabled={assets.length === 0}>
            <Printer className="h-3.5 w-3.5" />
            Print QR Labels ({assets.length})
          </Button>
        )}
      </div>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none print:overflow-visible print:shadow-none print:border-0 print:p-0">
        <DialogHeader className="print:hidden">
          <DialogTitle>Print QR Labels · {assets.length} asset(s)</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-3 print:hidden">
          <span className="text-sm">Labels per A4 page:</span>
          <Select value={perPage} onValueChange={(v) => setPerPage(v as keyof typeof LAYOUTS)}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(LAYOUTS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Generating QR codes...</div>
        ) : (
          <div
            className="qr-print-sheet"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              gap: "4mm",
            }}
          >
            {assets.map((a) => (
              <div
                key={a["Asset ID"]}
                className="qr-label"
                style={{
                  border: "1px solid #000",
                  padding: "2mm",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                  background: "#fff",
                  color: "#000",
                  fontFamily: "Arial, sans-serif",
                }}
              >
                <div style={{ fontSize: "9pt", fontWeight: 700, lineHeight: 1.1, marginBottom: "1mm" }}>
                  {a["Company"] || "—"}
                </div>
                {qrMap[a["Asset ID"]] && (
                  <img
                    src={qrMap[a["Asset ID"]]}
                    alt={a["Asset ID"]}
                    style={{ width: "70%", height: "auto", aspectRatio: "1/1" }}
                  />
                )}
                <div style={{ fontSize: "8pt", fontWeight: 600, marginTop: "1mm" }}>{a["Asset ID"]}</div>
                <div style={{ fontSize: "7pt" }}>{a["Asset Category"]}</div>
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="print:hidden">
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          <Button onClick={handlePrint} disabled={loading}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkQrPrint;
