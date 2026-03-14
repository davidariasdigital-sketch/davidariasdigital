import { useState, useRef } from "react";
import { Sparkles, Send, X, Loader2 } from "lucide-react";

interface QuotationAIAssistantProps {
  currentDescription: string;
  quotationTitle: string;
  onApply: (text: string) => void;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quotation-assistant`;

const QuotationAIAssistant = ({ currentDescription, quotationTitle, onApply }: QuotationAIAssistantProps) => {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");

    const context = `Título: ${quotationTitle}\nDescripción actual: ${currentDescription || "(vacía)"}`;
    const messages = [
      {
        role: "user" as const,
        content: `Redacta un objetivo/descripción profesional para esta cotización. ${prompt}\n\nContexto:\n${context}`,
      },
    ];

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages, quotationContext: context }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({}));
        setResult(err.error || "Error al generar. Intenta de nuevo.");
        setLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulated += content;
              setResult(accumulated);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        setResult("Error de conexión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    onApply(result);
    setOpen(false);
    setResult("");
    setPrompt("");
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary font-bold hover:underline"
        title="Asistente IA para descripción"
      >
        <Sparkles size={13} /> Redactar con IA
      </button>
    );
  }

  return (
    <div className="dash-tile rounded-xl p-4 space-y-3 border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
          <Sparkles size={13} /> Asistente IA
        </div>
        <button type="button" onClick={() => { setOpen(false); abortRef.current?.abort(); }} className="text-[hsl(var(--dash-text-muted))] hover:text-[hsl(var(--dash-text))]">
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-2">
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), generate())}
          placeholder="Ej: Sesión de fotos para catálogo de moda..."
          className="dash-input rounded-lg px-3 py-2 text-xs flex-1"
          disabled={loading}
        />
        <button
          type="button"
          onClick={generate}
          disabled={loading || !prompt.trim()}
          className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
        </button>
      </div>

      {result && (
        <div className="space-y-2">
          <p className="text-xs text-[hsl(var(--dash-text))] whitespace-pre-wrap leading-relaxed bg-background/80 rounded-lg p-3 border border-[hsl(var(--dash-card-border))]">
            {result}
          </p>
          <button
            type="button"
            onClick={handleApply}
            disabled={loading}
            className="text-xs font-bold text-primary hover:underline"
          >
            ✓ Usar esta descripción
          </button>
        </div>
      )}
    </div>
  );
};

export default QuotationAIAssistant;
