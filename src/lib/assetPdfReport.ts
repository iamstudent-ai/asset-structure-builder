// assetPdfReport.ts — Single-asset PDF report (company-specific logo, clean header)
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Asset, ASSET_FIELDS } from "@/types/asset";
import { getCompanyLogo } from "@/lib/settingsService";

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

  // Clean header (no colored background)
  const company = asset["Company"] || "";
  const logoUrl = await getCompanyLogo(company);
  const logoData = logoUrl ? await loadLogoAsBase64(logoUrl) : null;

  if (logoData) {
    try { doc.addImage(logoData, "PNG", 14, 10, 22, 22); } catch {}
  }

  const textLeft = logoData ? 40 : 14;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(company || "ITAM", textLeft, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text("Asset Detail Report", textLeft, 24);

  doc.setFontSize(8);
  doc.text(`Generated: ${dateStr}`, pw - 14, 18, { align: "right" });
  doc.text(`Asset ID: ${asset["Asset ID"]}`, pw - 14, 24, { align: "right" });

  // Divider
  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(14, 36, pw - 14, 36);

  doc.setTextColor(0);

  const fields = ASSET_FIELDS.filter((f) => f !== "S.NO");
  const bodyRows = fields.map((f) => [f, String(asset[f] ?? "N/A")]);

  autoTable(doc, {
    startY: 42,
    head: [["Field", "Value"]],
    body: bodyRows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [240, 244, 250], textColor: 40, fontSize: 9.5, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 55, textColor: 60 } },
    margin: { left: 14, right: 14 },
  });

  doc.setFontSize(7);
  doc.setTextColor(140);
  doc.text("This is a system generated report", 14, ph - 8);
  doc.text("Page 1", pw - 25, ph - 8);

  doc.save(`Asset_${asset["Asset ID"]}_${now.toISOString().slice(0, 10)}.pdf`);
};
