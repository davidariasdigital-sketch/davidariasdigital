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

// Brand colors
const DARK = [26, 26, 26] as const;       // #1A1A1A
const MUSTARD = [225, 173, 1] as const;    // #E1AD01
const WHITE = [255, 255, 255] as const;
const LIGHT_GRAY = [180, 180, 180] as const;
const MID_GRAY = [120, 120, 120] as const;
const ROW_ALT = [245, 245, 242] as const;
const ROW_WHITE = [255, 255, 255] as const;

function generateQuotationNumber(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `COT-${y}${m}${day}-${seq}`;
}

export function generateQuotationPDF(q: Quotation) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pw - margin * 2;
  const quotationNum = generateQuotationNumber(q.created_at);

  // ─── HEADER BAND ───
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pw, 42, "F");

  // Mustard accent line
  doc.setFillColor(...MUSTARD);
  doc.rect(0, 42, pw, 2, "F");

  // Title
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text("COTIZACIÓN", margin, 27);

  // Quotation number & date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  const dateStr = new Date(q.created_at).toLocaleDateString("es-MX", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.text(quotationNum, pw - margin, 22, { align: "right" });
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(dateStr, pw - margin, 30, { align: "right" });

  // Status badge
  const statusLabels: Record<string, string> = {
    borrador: "BORRADOR", enviada: "ENVIADA", aceptada: "ACEPTADA", rechazada: "RECHAZADA",
  };
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text(statusLabels[q.status] ?? q.status.toUpperCase(), pw - margin, 37, { align: "right" });

  let y = 54;

  // ─── BUSINESS INFO (left) & CLIENT INFO (right) ───
  const colMid = pw / 2;

  // Business info
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("David Creativo", margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  doc.text("contacto@davidcreativo.com", margin, y);
  y += 4;
  doc.text("+52 (555) 123-4567", margin, y);
  y += 4;
  doc.text("www.davidcreativo.com", margin, y);

  // Client box (right side)
  if (q.clients?.name) {
    const boxX = colMid + 10;
    const boxW = pw - margin - boxX;
    const boxY = 50;
    // Mustard left border
    doc.setFillColor(...MUSTARD);
    doc.rect(boxX, boxY, 2, 18, "F");
    // Light background
    doc.setFillColor(250, 249, 245);
    doc.rect(boxX + 2, boxY, boxW - 2, 18, "F");

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    doc.text("CLIENTE", boxX + 6, boxY + 5);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK);
    doc.text(q.clients.name, boxX + 6, boxY + 13);
  }

  y += 10;

  // ─── TITLE & DESCRIPTION ───
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(q.title, margin, y);
  y += 7;

  if (q.description) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MID_GRAY);
    const descLines = doc.splitTextToSize(q.description, contentWidth);
    doc.text(descLines, margin, y);
    y += descLines.length * 4.5 + 4;
  }

  y += 6;

  // ─── TABLE HEADER ───
  const colNum = margin;
  const colDesc = margin + 12;
  const colAmt = pw - margin;
  const rowH = 9;

  doc.setFillColor(...DARK);
  doc.rect(margin, y - 5, contentWidth, rowH + 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text("#", colNum + 4, y + 1);
  doc.text("CONCEPTO", colDesc, y + 1);
  doc.text("MONTO", colAmt - 4, y + 1, { align: "right" });
  y += rowH + 2;

  // ─── TABLE ROWS ───
  doc.setFont("helvetica", "normal");
  q.items.forEach((item, i) => {
    if (y > ph - 50) {
      doc.addPage();
      y = 25;
    }

    const isAlt = i % 2 === 0;
    const bg = isAlt ? ROW_ALT : ROW_WHITE;
    const descLines = doc.splitTextToSize(item.description || "—", contentWidth - 55);
    const cellH = Math.max(rowH, descLines.length * 4.5 + 4);

    doc.setFillColor(...bg);
    doc.rect(margin, y - 4, contentWidth, cellH, "F");

    doc.setFontSize(8);
    doc.setTextColor(...MID_GRAY);
    doc.text(String(i + 1), colNum + 4, y + 1);

    doc.setTextColor(...DARK);
    doc.text(descLines, colDesc, y + 1);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(
      `$${Number(item.amount).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
      colAmt - 4, y + 1, { align: "right" }
    );
    doc.setFont("helvetica", "normal");

    y += cellH;
  });

  // Thin line under table
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);

  // ─── TOTAL BLOCK ───
  y += 6;
  const totalBoxW = 80;
  const totalBoxX = pw - margin - totalBoxW;
  const totalBoxH = 28;

  doc.setFillColor(...DARK);
  doc.roundedRect(totalBoxX, y, totalBoxW, totalBoxH, 3, 3, "F");

  // Subtotal label
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`${q.items.length} concepto${q.items.length !== 1 ? "s" : ""}`, totalBoxX + 6, y + 8);
  doc.text("SUBTOTAL", totalBoxX + totalBoxW - 6, y + 8, { align: "right" });

  // Total amount
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text(
    `$${Number(q.total).toLocaleString("es-MX", { minimumFractionDigits: 2 })}`,
    totalBoxX + totalBoxW - 6, y + 22, { align: "right" }
  );

  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL", totalBoxX + 6, y + 22);

  // ─── FOOTER ───
  const footerY = ph - 25;

  // Mustard separator
  doc.setDrawColor(...MUSTARD);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY, pw - margin, footerY);

  // Terms
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  doc.text("Esta cotización tiene una validez de 30 días a partir de la fecha de emisión.", margin, footerY + 6);
  doc.text("Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA.", margin, footerY + 10);

  // Generated notice
  doc.setFontSize(6);
  doc.setTextColor(200, 200, 200);
  doc.text("Documento generado automáticamente", pw / 2, footerY + 16, { align: "center" });

  doc.save(`cotizacion-${q.title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
