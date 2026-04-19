import jsPDF from "jspdf";

interface QuotationItem {
  description: string;
  amount: number;
  entregables?: string[];
}

interface Quotation {
  title: string;
  description: string | null;
  items: QuotationItem[];
  total: number;
  status: string;
  created_at: string;
  clients?: { name: string } | null;
  conditions?: string[];
  delivery_date?: string | null;
  costos?: string[];
  requisitos?: string[];
}

// Brand colors
const DARK: [number, number, number] = [26, 26, 26];
const MUSTARD: [number, number, number] = [225, 173, 1];
const WHITE: [number, number, number] = [255, 255, 255];
const LIGHT_GRAY: [number, number, number] = [180, 180, 180];
const MID_GRAY: [number, number, number] = [120, 120, 120];
const ROW_ALT: [number, number, number] = [245, 245, 242];
const ROW_WHITE: [number, number, number] = [255, 255, 255];

// Contact info
const BUSINESS_NAME = "David Arias";
const BUSINESS_EMAIL = "davidariasdigital@gmail.com";
const BUSINESS_PHONE = "+57 310 878 1633";

function generateQuotationNumber(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `COT-${y}${m}${day}-${seq}`;
}

function formatCOP(value: number): string {
  return `$${Number(value).toLocaleString("es-CO")} COP`;
}

function getExpirationDate(createdAt: string): string {
  const d = new Date(createdAt);
  d.setMonth(d.getMonth() + 1);
  return d.toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function generateQuotationPDF(q: Quotation) {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pw - margin * 2;
  const quotationNum = generateQuotationNumber(q.created_at);

  const useFont = (style: string) => {
    if (style === "bold") {
      doc.setFont("helvetica", "bold");
    } else if (style === "light") {
      doc.setFont("helvetica", "normal");
    } else {
      doc.setFont("helvetica", "normal");
    }
  };

  // ─── HEADER BAND ───
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pw, 42, "F");

  // Mustard accent line
  doc.setFillColor(...MUSTARD);
  doc.rect(0, 42, pw, 2, "F");

  // Logo
  try {
    const logoImg = await loadImage("/images/digital-logo.png");
    doc.addImage(logoImg, "PNG", margin, 8, 55, 26);
  } catch {
    doc.setFontSize(28);
    useFont("bold");
    doc.setTextColor(...MUSTARD);
    doc.text("COTIZACIÓN", margin, 27);
  }

  // Quotation number & date
  doc.setFontSize(9);
  useFont("normal");
  doc.setTextColor(...WHITE);
  const dateStr = new Date(q.created_at).toLocaleDateString("es-CO", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.text(quotationNum, pw - margin, 22, { align: "right" });
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(dateStr, pw - margin, 30, { align: "right" });

  // Status badge removed from PDF per user request

  let y = 54;

  // ─── CLIENT INFO (right) ───
  const clientDisplayName = (q as any).client_name || q.clients?.name;
  if (clientDisplayName) {
    const boxX = pw / 2 + 10;
    const boxW = pw - margin - boxX;
    const boxY = 50;
    doc.setFillColor(...MUSTARD);
    doc.rect(boxX, boxY, 2, 18, "F");
    doc.setFillColor(250, 249, 245);
    doc.rect(boxX + 2, boxY, boxW - 2, 18, "F");

    doc.setFontSize(7);
    useFont("light");
    doc.setTextColor(...MID_GRAY);
    doc.text("CLIENTE", boxX + 6, boxY + 5);
    doc.setFontSize(11);
    useFont("bold");
    doc.setTextColor(...DARK);
    doc.text(clientDisplayName, boxX + 6, boxY + 13);
  }

  y += 6;

  // Generation date
  if (q.delivery_date) {
    const deliveryStr = new Date(q.delivery_date).toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc.setFontSize(8);
    useFont("normal");
    doc.setTextColor(...MID_GRAY);
    doc.text(`Fecha de generación: ${deliveryStr}`, margin, y);
    y += 5;
  }

  y += 8;

  // ─── TITLE & DESCRIPTION ───
  doc.setFontSize(14);
  useFont("bold");
  doc.setTextColor(...DARK);
  doc.text(q.title, margin, y);
  y += 7;

  if (q.description) {
    doc.setFontSize(9);
    useFont("normal");
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
  useFont("bold");
  doc.setTextColor(...MUSTARD);
  doc.text("#", colNum + 4, y + 1);
  doc.text("CONCEPTO", colDesc, y + 1);
  doc.text("MONTO", colAmt - 4, y + 1, { align: "right" });
  y += rowH + 2;

  // ─── TABLE ROWS ───
  useFont("normal");
  q.items.forEach((item, i) => {
    if (y > ph - 80) { doc.addPage(); y = 25; }

    const isAlt = i % 2 === 0;
    const bg = isAlt ? ROW_ALT : ROW_WHITE;
    const descLines = doc.splitTextToSize(item.description || "—", contentWidth - 55);
    const entregables = item.entregables ?? [];
    const entMaxW = colAmt - colDesc - 50;
    const entregablesH = entregables.length > 0
      ? entregables.reduce((sum, ent) => {
          const lines = doc.splitTextToSize(`• ${ent}`, entMaxW);
          return sum + lines.length * 3.5;
        }, 6)
      : 0;
    const cellH = Math.max(rowH, descLines.length * 4.5 + 4 + entregablesH);

    doc.setFillColor(...bg);
    doc.rect(margin, y - 4, contentWidth, cellH, "F");

    doc.setFontSize(8);
    doc.setTextColor(...MID_GRAY);
    doc.text(String(i + 1), colNum + 4, y + 1);

    doc.setTextColor(...DARK);
    useFont("normal");
    doc.text(descLines, colDesc, y + 1);

    doc.setTextColor(...DARK);
    useFont("bold");
    doc.text(formatCOP(item.amount), colAmt - 4, y + 1, { align: "right" });
    useFont("normal");

    // Entregables under concept
    if (entregables.length > 0) {
      let ey = y + descLines.length * 4.5 + 2;
      const entMaxW = colAmt - colDesc - 50;
      doc.setFontSize(7);
      useFont("bold");
      doc.setTextColor(...MUSTARD);
      doc.text("Entregables:", colDesc, ey);
      ey += 4;
      useFont("normal");
      doc.setFontSize(7);
      doc.setTextColor(...MID_GRAY);
      entregables.forEach((ent) => {
        const entLines = doc.splitTextToSize(`• ${ent}`, entMaxW);
        doc.text(entLines, colDesc + 2, ey);
        ey += entLines.length * 3.5;
      });
    }

    y += cellH;
  });

  // Thin line under table
  doc.setDrawColor(...LIGHT_GRAY);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pw - margin, y);

  // ─── TOTAL BLOCK ───
  y += 6;
  const totalBoxW = 90;
  const totalBoxX = pw - margin - totalBoxW;
  const totalBoxH = 28;

  doc.setFillColor(...DARK);
  doc.roundedRect(totalBoxX, y, totalBoxW, totalBoxH, 3, 3, "F");

  doc.setFontSize(7);
  useFont("light");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`${q.items.length} concepto${q.items.length !== 1 ? "s" : ""} · Precio incluye retención en la fuente`, totalBoxX + 6, y + 8);

  doc.setFontSize(14);
  useFont("bold");
  doc.setTextColor(...MUSTARD);
  doc.text(formatCOP(q.total), totalBoxX + totalBoxW - 6, y + 22, { align: "right" });

  doc.setFontSize(8);
  doc.setTextColor(...WHITE);
  doc.text("TOTAL", totalBoxX + 6, y + 22);

  // ─── COSTOS SECTION ───
  y += totalBoxH + 10;

  if (q.costos && q.costos.length > 0) {
    if (y > ph - 60) { doc.addPage(); y = 25; }

    doc.setFontSize(9);
    useFont("bold");
    doc.setTextColor(...DARK);
    doc.text("COSTOS INCLUIDOS", margin, y);
    y += 6;

    doc.setFontSize(8);
    useFont("normal");
    doc.setTextColor(...MID_GRAY);

    q.costos.forEach((costo) => {
      if (y > ph - 20) { doc.addPage(); y = 25; }
      doc.setFillColor(...MUSTARD);
      doc.circle(margin + 2, y - 1.2, 1.2, "F");
      doc.text(costo, margin + 6, y);
      y += 5;
    });
    y += 4;
  }

  // ─── REQUISITOS SECTION ───
  if (q.requisitos && q.requisitos.length > 0) {
    if (y > ph - 60) { doc.addPage(); y = 25; }

    doc.setFontSize(9);
    useFont("bold");
    doc.setTextColor(...DARK);
    doc.text("REQUISITOS", margin, y);
    y += 6;

    doc.setFontSize(8);
    useFont("normal");
    doc.setTextColor(...MID_GRAY);

    q.requisitos.forEach((req) => {
      if (y > ph - 20) { doc.addPage(); y = 25; }
      doc.setFillColor(...MUSTARD);
      doc.circle(margin + 2, y - 1.2, 1.2, "F");
      doc.text(req, margin + 6, y);
      y += 5;
    });
    y += 4;
  }

  // ─── TERMS & CONDITIONS ───
  y += 8;
  if (y > ph - 70) { doc.addPage(); y = 25; }

  doc.setFontSize(9);
  useFont("bold");
  doc.setTextColor(...DARK);
  doc.text("CONDICIONES", margin, y);
  y += 6;

  doc.setFontSize(7.5);
  useFont("light");
  doc.setTextColor(...MID_GRAY);

  const defaultTerms = [
    `Forma de pago: 40% al finalizar la sesión y 60% al momento de entregar el contenido total finalizado.`,
    `La entrega del contenido total editado se coordina directamente con el cliente.`,
    `Si se exceden las horas de grabación durante la jornada, se hará un cobro adicional de $80.000 COP por cada hora que transcurra.`,
    `Modelos, utilería o algún elemento a solicitud del cliente tiene un costo adicional según el requerimiento.`,
    `Todos los precios están expresados en pesos colombianos (COP) e incluyen retención en la fuente.`,
    `Esta cotización tiene una validez de 30 días a partir de la fecha de emisión.`,
  ];

  const terms = (q.conditions && q.conditions.length > 0 ? q.conditions : defaultTerms).map(t => `• ${t}`);

  terms.forEach((term) => {
    const lines = doc.splitTextToSize(term, contentWidth);
    if (y + lines.length * 4 > ph - 20) { doc.addPage(); y = 25; }
    doc.text(lines, margin, y);
    y += lines.length * 4 + 2;
  });

  // ─── CONTACT INFO ───
  y += 10;
  if (y > ph - 40) { doc.addPage(); y = 25; }

  doc.setDrawColor(...MUSTARD);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pw - margin, y);
  y += 8;

  doc.setFontSize(10);
  useFont("bold");
  doc.setTextColor(...DARK);
  doc.text(BUSINESS_NAME, margin, y);
  y += 5;
  doc.setFontSize(8);
  useFont("normal");
  doc.setTextColor(...MID_GRAY);
  doc.text(BUSINESS_EMAIL, margin, y);
  y += 4;
  doc.text(BUSINESS_PHONE, margin, y);

  // ─── VALIDITY DATE ───
  y += 10;
  doc.setFontSize(9);
  useFont("normal");
  doc.setTextColor(...DARK);
  doc.text(`Cotización válida hasta ${getExpirationDate(q.created_at)}`, margin, y);

  // ─── FOOTER ───
  const footerY = ph - 12;
  doc.setDrawColor(...MUSTARD);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 4, pw - margin, footerY - 4);

  doc.setFontSize(6);
  useFont("light");
  doc.setTextColor(200, 200, 200);
  doc.text("Documento generado automáticamente", pw / 2, footerY, { align: "center" });

  const safeTitle = q.title.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_ÁÉÍÓÚÑÜ]/gi, "");
  const safeClient = (q.clients?.name || "SIN_CLIENTE").toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_ÁÉÍÓÚÑÜ]/gi, "");
  const d = new Date(q.created_at);
  const fileDate = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  doc.save(`COTIZACION_${safeTitle}_${safeClient}_${fileDate}.pdf`);
}
