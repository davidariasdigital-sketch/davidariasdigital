import jsPDF from "jspdf";

interface ScriptParts {
  hook: string;
  cuerpo: string;
  cta: string;
}

export function downloadScriptPDF(title: string, parts: ScriptParts, format?: string | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  const maxW = pageW - margin * 2;
  let y = margin;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(26, 26, 26);
  const titleLines = doc.splitTextToSize(title || "Sin título", maxW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 24;

  if (format) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text(`Formato: ${format}`, margin, y);
    y += 18;
  }

  // Divider
  doc.setDrawColor(225, 173, 1);
  doc.setLineWidth(1.5);
  doc.line(margin, y, margin + 60, y);
  y += 24;

  const sections: { label: string; text: string; color: [number, number, number] }[] = [
    { label: "HOOK", text: parts.hook, color: [217, 70, 239] },
    { label: "CUERPO", text: parts.cuerpo, color: [56, 189, 248] },
    { label: "CTA", text: parts.cta, color: [16, 185, 129] },
  ];

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  for (const s of sections) {
    ensureSpace(60);
    // Label bar
    doc.setFillColor(...s.color);
    doc.rect(margin, y - 2, 4, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(s.label, margin + 12, y + 10);
    y += 24;

    // Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(26, 26, 26);
    const text = (s.text || "—").trim() || "—";
    const lines = doc.splitTextToSize(text, maxW);
    for (const line of lines) {
      ensureSpace(18);
      doc.text(line, margin, y);
      y += 16;
    }
    y += 18;
  }

  const safeName = (title || "guion").replace(/[^a-z0-9\-_\s]/gi, "").trim().replace(/\s+/g, "_") || "guion";
  doc.save(`${safeName}.pdf`);
}
