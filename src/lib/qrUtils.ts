import QRCode from "qrcode";

export const buildAssetUrl = (assetId: string): string => {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/asset/${encodeURIComponent(assetId)}`;
};

export async function generateQrDataUrl(text: string, size = 256): Promise<string> {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
