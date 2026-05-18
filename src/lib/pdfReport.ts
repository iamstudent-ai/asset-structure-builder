// pdfReport.ts — Multi-asset PDF report (company-specific logo when uniform, clean header)
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

export const generateAssetReport = async (assets: Asset[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const now = new Date();
  const dateStr = now.toLocaleString();
  const pw = doc.internal.pageSize.getWidth();

  // Only show a logo if all assets share the same company
  const companies = Array.from(new Set(assets.map((a) => a["Company"]).filter(Boolean)));
  const singleCompany = companies.length === 1 ? companies[0] : null;
  const logoUrl = singleCompany ? await getCompanyLogo(singleCompany) : null;
  const logoData = logoUrl ? await loadLogoAsBase64(logoUrl) : null;

  if (logoData) {
    try { doc.addImage(logoData, "PNG", 10, 8, 18, 18); } catch {}
  }

  const textLeft = logoData ? 32 : 14;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20);
  doc.text(singleCompany || "ITAM Report", textLeft, 16);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(110);
  doc.text(`Generated: ${dateStr}`, textLeft, 22);
  doc.text(`Total Assets: ${assets.length}`, textLeft, 27);

  doc.setDrawColor(220);
  doc.setLineWidth(0.3);
  doc.line(10, 32, pw - 10, 32);
  doc.setTextColor(0);

  const headers = ASSET_FIELDS.filter((f) => f !== "S.NO");
  const headRow = ["#", ...headers];
  const bodyRows = assets.map((a, i) =>
    [String(i + 1), ...headers.map((f) => String(a[f] ?? "N/A"))]
  );

  autoTable(doc, {
    startY: 36,
    head: [headRow],
    body: bodyRows,
    styles: { fontSize: 6, cellPadding: 1.5 },
    headStyles: { fillColor: [240, 244, 250], textColor: 40, fontSize: 6.5, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 252] },
    margin: { left: 8, right: 8 },
    didDrawPage: () => {
      const ph = doc.internal.pageSize.getHeight();
      doc.setFontSize(7);
      doc.setTextColor(140);
      doc.text("This is a system generated report", 14, ph - 8);
      doc.text(
        `Page ${doc.getCurrentPageInfo().pageNumber}`,
        doc.internal.pageSize.getWidth() - 25,
        ph - 8
      );
    },
  });

  doc.save(`ITAM_Report_${now.toISOString().slice(0, 10)}.pdf`);
};
