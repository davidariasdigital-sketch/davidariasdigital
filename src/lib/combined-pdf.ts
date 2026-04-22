import { buildQuotationPDF } from "./quotation-pdf";
import { buildInvoicePDF } from "./invoice-pdf";

interface QuotationItem { description: string; amount: number; entregables?: string[]; }

interface QuotationLike {
  title: string;
  description: string | null;
  items: QuotationItem[];
  total: number;
  status: string;
  created_at: string;
  client_name?: string | null;
  client_tax_id?: string | null;
  clients?: { name: string } | null;
  conditions?: string[];
  delivery_date?: string | null;
  costos?: string[];
  requisitos?: string[];
}

interface InvoiceLike {
  concept: string;
  amount: number;
  clientName: string;
  clientTaxId?: string | null;
  createdAt: string;
  notes: string | null;
  due_date: string | null;
}

/**
 * Genera un único PDF que contiene la cotización seguida de la cuenta de cobro.
 */
export async function generateCombinedQuotationInvoicePDF(
  quotation: QuotationLike,
  invoice: InvoiceLike,
) {
  const doc = await buildQuotationPDF(quotation as any);
  buildInvoicePDF(invoice, doc);

  const clientName = quotation.client_name || quotation.clients?.name || invoice.clientName || "cliente";
  const safeTitle = quotation.title.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_ÁÉÍÓÚÑÜ]/gi, "");
  const safeClient = clientName.toUpperCase().replace(/\s+/g, "_").replace(/[^A-Z0-9_ÁÉÍÓÚÑÜ]/gi, "");
  const d = new Date(quotation.created_at);
  const fileDate = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

  doc.save(`COTIZACION_Y_CUENTA_${safeTitle}_${safeClient}_${fileDate}.pdf`);
}
