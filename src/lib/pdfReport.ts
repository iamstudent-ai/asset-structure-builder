// pdfReport.ts — Generate a professional PDF report of assets with branding logo
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

export const generateAssetReport = async (assets: Asset[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const now = new Date();
  const dateStr = now.toLocaleString();

  // Try to add logo
  const logoUrl = await getSetting("logo_url");
  let logoData: string | null = null;
  if (logoUrl) logoData = await loadLogoAsBase64(logoUrl);

  if (logoData) {
    try { doc.addImage(logoData, "PNG", 10, 6, 16, 16); } catch {}
  }

  const textLeft = logoData ? 30 : 14;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ITAM Report", textLeft, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${dateStr}`, textLeft, 24);
  doc.text(`Total Assets: ${assets.length}`, textLeft, 29);
  doc.setTextColor(0);

  const headers = ASSET_FIELDS.filter((f) => f !== "S.NO");
  const headRow = ["#", ...headers];
  const bodyRows = assets.map((a, i) =>
    [String(i + 1), ...headers.map((f) => String(a[f] ?? "N/A"))]
  );

  autoTable(doc, {
    startY: 34,
    head: [headRow],
    body: bodyRows,
    styles: { fontSize: 6, cellPadding: 1.5 },
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 6.5, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 8, right: 8 },
    didDrawPage: () => {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(140);
      doc.text("This is a system generated report", 14, pageHeight - 8);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        doc.internal.pageSize.getWidth() - 25,
        pageHeight - 8
      );
    },
  });

  doc.save(`ITAM_Report_${now.toISOString().slice(0, 10)}.pdf`);
};
