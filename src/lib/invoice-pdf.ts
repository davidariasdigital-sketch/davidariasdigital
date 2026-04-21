import jsPDF from "jspdf";

interface InvoiceData {
  concept: string;
  amount: number;
  clientName: string;
  createdAt: string;
  notes: string | null;
  due_date: string | null;
}

// Brand colors
const DARK: [number, number, number] = [26, 26, 26];
const MUSTARD: [number, number, number] = [225, 173, 1];
const WHITE: [number, number, number] = [255, 255, 255];
const MID_GRAY: [number, number, number] = [120, 120, 120];
const LIGHT_GRAY: [number, number, number] = [200, 200, 200];

// Personal info
const FULL_NAME = "DAVID ALEJANDRO ARIAS SALAZAR";
const CC = "1.006.101.693";
const CC_CITY = "Cali";
const NEQUI = "3108781633";
const ADDRESS = "Calle 6ª #53a-38 Nueva Tequendama";
const CITY = "Santiago de Cali, Colombia";

function numberToWords(n: number): string {
  const units = ["", "un", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];

  if (n === 0) return "cero";
  if (n === 100) return "cien";

  let result = "";

  if (n >= 1_000_000) {
    const millions = Math.floor(n / 1_000_000);
    if (millions === 1) {
      result += "un millón";
    } else {
      result += numberToWords(millions) + " millones";
    }
    n %= 1_000_000;
    if (n > 0) result += " ";
  }

  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) {
      result += "mil";
    } else {
      result += numberToWords(thousands) + " mil";
    }
    n %= 1000;
    if (n > 0) result += " ";
  }

  if (n >= 100) {
    result += hundreds[Math.floor(n / 100)];
    n %= 100;
    if (n > 0) result += " ";
  }

  if (n >= 20) {
    const t = tens[Math.floor(n / 10)];
    const u = n % 10;
    if (u === 0) {
      result += t;
    } else {
      result += t + " y " + units[u];
    }
  } else if (n >= 10) {
    result += teens[n - 10];
  } else if (n > 0) {
    result += units[n];
  }

  return result;
}

function amountInWords(amount: number): string {
  const intPart = Math.floor(amount);
  const words = numberToWords(intPart);
  // Capitalize first letter
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return capitalized;
}

function formatCOP(value: number): string {
  return `$${Number(value).toLocaleString("es-CO")} COP`;
}

function formatDateLong(dateStr: string): string {
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
  ];
  const d = new Date(dateStr);
  return `${months[d.getMonth()]} ${d.getDate()} de ${d.getFullYear()}`;
}

export function buildInvoicePDF(inv: InvoiceData, existingDoc?: jsPDF): jsPDF {
  const doc = existingDoc ?? new jsPDF();
  if (existingDoc) doc.addPage();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentWidth = pw - margin * 2;

  // ─── HEADER BAND ───
  doc.setFillColor(...DARK);
  doc.rect(0, 0, pw, 50, "F");

  // Mustard accent line
  doc.setFillColor(...MUSTARD);
  doc.rect(0, 50, pw, 2.5, "F");

  // Title
  doc.setFontSize(32);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text("CUENTA DE COBRO", margin, 33);

  // Date (right side)
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text(`Santiago de Cali, ${formatDateLong(inv.createdAt)}`, pw - margin, 33, { align: "right" });

  let y = 68;

  // ─── CLIENT NAME (who owes) ───
  doc.setFillColor(250, 249, 245);
  doc.rect(margin, y - 6, contentWidth, 28, "F");
  doc.setFillColor(...MUSTARD);
  doc.rect(margin, y - 6, 3, 28, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  doc.text("CLIENTE", margin + 10, y + 1);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(inv.clientName.toUpperCase(), margin + 10, y + 14);

  y += 38;

  // ─── DEBE A ───
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text("DEBE A:", margin, y);
  y += 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text(FULL_NAME, margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  doc.text(`C.C. ${CC} de ${CC_CITY}`, margin, y);
  y += 16;

  // ─── POR CONCEPTO DE ───
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text("POR CONCEPTO DE:", margin, y);
  y += 8;

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...DARK);
  const conceptLines = doc.splitTextToSize(inv.concept, contentWidth);
  doc.text(conceptLines, margin, y);
  y += conceptLines.length * 6 + 14;

  // ─── VALOR ───
  doc.setFillColor(...DARK);
  doc.roundedRect(margin, y - 6, contentWidth, 36, 3, 3, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...LIGHT_GRAY);
  doc.text("VALOR", margin + 10, y + 3);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...WHITE);
  const wordsText = `${amountInWords(inv.amount)} (${formatCOP(inv.amount)}).`;
  const valueLines = doc.splitTextToSize(wordsText, contentWidth - 20);
  doc.text(valueLines, margin + 10, y + 12);

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...MUSTARD);
  doc.text(formatCOP(inv.amount), contentWidth + margin - 10, y + 24, { align: "right" });

  y += 48;

  // ─── PAYMENT INFO ───
  doc.setFillColor(250, 249, 245);
  doc.roundedRect(margin, y - 4, contentWidth, 22, 2, 2, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  const paymentText = `El pago se puede realizar por medio de transferencia bancaria a la cuenta de NEQUI No. ${NEQUI} a nombre de ${FULL_NAME}. C.C ${CC}`;
  const paymentLines = doc.splitTextToSize(paymentText, contentWidth - 16);
  doc.text(paymentLines, margin + 8, y + 4);

  y += 34;

  // ─── SIGNATURE ───
  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 20, margin + 80, y + 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...DARK);
  doc.text("David Alejandro Arias Salazar", margin, y + 28);

  y += 40;

  // ─── FOOTER ───
  const footerY = ph - 22;

  doc.setDrawColor(...MUSTARD);
  doc.setLineWidth(0.5);
  doc.line(margin, footerY - 6, pw - margin, footerY - 6);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MID_GRAY);
  doc.text(ADDRESS, margin, footerY);
  doc.text(CITY, margin, footerY + 4);

  if (inv.due_date) {
    const dueStr = new Date(inv.due_date + "T00:00:00").toLocaleDateString("es-CO", {
      year: "numeric", month: "long", day: "numeric",
    });
    doc.text(`El pago debe realizarse antes del ${dueStr}`, pw - margin, footerY, { align: "right" });
  }

  doc.setFontSize(5);
  doc.setTextColor(...LIGHT_GRAY);
  doc.text("Documento generado automáticamente", pw / 2, footerY + 10, { align: "center" });

  if (!existingDoc) {
    const safeName = inv.clientName.toLowerCase().replace(/\s+/g, "-");
    doc.save(`cuenta-de-cobro-${safeName}.pdf`);
  }
  return doc;
}

export function generateInvoicePDF(inv: InvoiceData) {
  return buildInvoicePDF(inv);
}
