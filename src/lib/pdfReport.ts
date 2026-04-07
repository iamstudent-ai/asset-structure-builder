// pdfReport.ts — Generate a professional PDF report of assets
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Asset, ASSET_FIELDS } from "@/types/asset";

export const generateAssetReport = (assets: Asset[]) => {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const now = new Date();
  const dateStr = now.toLocaleString();

  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("ITAM Report", 14, 18);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${dateStr}`, 14, 24);
  doc.text(`Total Assets: ${assets.length}`, 14, 29);
  doc.setTextColor(0);

  // Table headers (exclude S.NO — we generate it)
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
    didDrawPage: (data) => {
      // Footer on every page
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
