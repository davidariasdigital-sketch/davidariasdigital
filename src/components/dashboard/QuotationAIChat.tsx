import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";


const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-assistant`;

interface Props {
  quotationContext: string;
  onClose: () => void;
}

const QuotationAIChat = ({ quotationContext, onClose }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult("");

    let fullText = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          quotationContext,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Error del asistente");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setResult(fullText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e) {
      console.error(e);
      setResult(`⚠️ ${e instanceof Error ? e.message : "Error desconocido"}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[85vh] flex flex-col liquid-glass-rainbow rounded-[var(--radius)] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Asistente de cotización</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        {!result && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-muted-foreground">
              Describe qué necesitas cotizar y la IA generará un resumen profesional.
            </p>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ej: Cotización para un video corporativo de 2 minutos con filmación en locación, edición y motion graphics..."
              className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[100px] resize-none"
              autoFocus
            />
            <button
              onClick={generate}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-primary text-primary-foreground text-sm font-semibold py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Generar cotización
                </>
              )}
            </button>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="prose prose-sm prose-invert max-w-none [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground [&_p]:text-muted-foreground [&_p]:text-sm [&_li]:text-muted-foreground [&_li]:text-sm [&_strong]:text-foreground [&_table]:w-full [&_th]:text-left [&_th]:text-xs [&_th]:text-muted-foreground [&_th]:uppercase [&_th]:tracking-wider [&_th]:pb-2 [&_td]:py-1.5 [&_td]:text-sm [&_td]:text-foreground [&_hr]:border-border">
              <div dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
            </div>

            {!isLoading && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setResult(""); setPrompt(""); }}
                  className="flex-1 text-sm font-semibold py-2.5 rounded-full border border-border text-foreground hover:bg-muted/50 transition-all"
                >
                  Nueva consulta
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-primary text-primary-foreground text-sm font-semibold py-2.5 rounded-full hover:shadow-lg transition-all"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuotationAIChat;
