import { useEffect, useState } from "react";
import { Asset } from "@/types/asset";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { buildAssetUrl, generateQrDataUrl, downloadDataUrl } from "@/lib/qrUtils";

interface Props {
  asset: Asset;
  trigger?: React.ReactNode;
}

const QrCodeDialog = ({ asset, trigger }: Props) => {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string>("");
  const url = buildAssetUrl(asset["Asset ID"]);

  useEffect(() => {
    if (open && !dataUrl) {
      generateQrDataUrl(url, 320).then(setDataUrl);
    }
  }, [open, dataUrl, url]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs hover:bg-primary/10 hover:text-primary">
            <QrCode className="h-3.5 w-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code · {asset["Asset ID"]}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-3">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR for ${asset["Asset ID"]}`} className="w-64 h-64 border rounded" />
          ) : (
            <div className="w-64 h-64 bg-muted animate-pulse rounded" />
          )}
          <div className="text-center text-xs text-muted-foreground break-all">{url}</div>
          <div className="text-sm font-medium text-center">
            {asset["Company"]} · {asset["Asset Category"]}
          </div>
          <Button
            size="sm"
            className="w-full"
            disabled={!dataUrl}
            onClick={() => downloadDataUrl(dataUrl, `${asset["Asset ID"]}-qr.png`)}
          >
            <Download className="h-4 w-4 mr-1" /> Download PNG
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QrCodeDialog;
