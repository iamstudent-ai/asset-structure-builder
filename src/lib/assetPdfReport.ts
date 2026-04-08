// assetPdfReport.ts — Generate a professional PDF report for a single asset with branding logo
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Asset, ASSET_FIELDS } from "@/types/asset";
import { getSetting } from "@/lib/settingsService";

async function loadLogoAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export const generateSingleAssetReport = async (asset: Asset) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const now = new Date();
  const dateStr = now.toLocaleString();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  // Header bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pw, 28, "F");

  // Try to add logo
  const logoUrl = await getSetting("logo_url");
  if (logoUrl) {
    const logoData = await loadLogoAsBase64(logoUrl);
    if (logoData) {
      try { doc.addImage(logoData, "PNG", 10, 4, 20, 20); } catch {}
    }
  }

  const textLeft = logoUrl ? 34 : 14;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255);
  doc.text(asset["Company"] || "ITAM", textLeft, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Asset Detail Report", textLeft, 21);
  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, pw - 14, 14, { align: "right" });
  doc.text(`Asset ID: ${asset["Asset ID"]}`, pw - 14, 21, { align: "right" });

  doc.setTextColor(0);

  const fields = ASSET_FIELDS.filter((f) => f !== "S.NO");
  const bodyRows = fields.map((f) => [f, String(asset[f] ?? "N/A")]);

  autoTable(doc, {
    startY: 36,
    head: [["Field", "Value"]],
    body: bodyRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9.5, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
    margin: { left: 14, right: 14 },
  });

  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("This is a system generated report", 14, ph - 8);
  doc.text("Page 1", pw - 25, ph - 8);

  doc.save(`Asset_${asset["Asset ID"]}_${now.toISOString().slice(0, 10)}.pdf`);
};
