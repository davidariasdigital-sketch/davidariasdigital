import jsPDF from "jspdf";

interface QuotationItem {
  description: string;
  amount: number;
}

interface Quotation {
  title: string;
  description: string | null;
  items: QuotationItem[];
  total: number;
  status: string;
  created_at: string;
  clients?: { name: string } | null;
}

export function generateQuotationPDF(q: Quotation) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 25;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("COTIZACIÓN", margin, y);
  y += 12;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Fecha: ${new Date(q.created_at).toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`, margin, y);
  y += 8;

  // Status
  const statusLabels: Record<string, string> = {
    borrador: "Borrador", enviada: "Enviada", aceptada: "Aceptada", rechazada: "Rechazada",
  };
  doc.text(`Estado: ${statusLabels[q.status] ?? q.status}`, margin, y);
  y += 12;

  // Line
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Title
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(q.title, margin, y);
  y += 8;

  // Client
  if (q.clients?.name) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Cliente: ${q.clients.name}`, margin, y);
    y += 8;
  }

  // Description
  if (q.description) {
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(q.description, pageWidth - margin * 2);
    doc.text(descLines, margin, y);
    y += descLines.length * 5 + 6;
  }

  y += 4;

  // Table header
  doc.setFillColor(245, 245, 240);
  doc.rect(margin, y - 4, pageWidth - margin * 2, 10, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(60, 60, 60);
  doc.text("Concepto", margin + 4, y + 2);
  doc.text("Monto", pageWidth - margin - 4, y + 2, { align: "right" });
  y += 12;

  // Items
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  q.items.forEach((item) => {
    if (y > 260) {
      doc.addPage();
      y = 25;
    }
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(item.description || "—", pageWidth - margin * 2 - 50);
    doc.text(descLines, margin + 4, y);
    doc.text(`$${Number(item.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y, { align: "right" });
    y += descLines.length * 5 + 4;

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageWidth - margin, y);
    y += 4;
  });

  // Total
  y += 4;
  doc.setDrawColor(200, 170, 50);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 80, y, pageWidth - margin, y);
  y += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text(`Total: $${Number(q.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y, { align: "right" });

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text("Documento generado automáticamente", pageWidth / 2, footerY, { align: "center" });

  doc.save(`cotizacion-${q.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
