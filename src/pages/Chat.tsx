import React, { useMemo, useRef, useState } from "react";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

const TypingDots: React.FC = () => (
  <div className="flex items-center gap-2 text-muted-foreground text-sm">
    <span className="animate-pulse">IA está digitando</span>
    <span className="inline-flex gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "120ms" }} />
      <span className="w-1.5 h-1.5 rounded-full bg-foreground/60 animate-bounce" style={{ animationDelay: "240ms" }} />
    </span>
  </div>
);

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }));
  };

  const attachmentsSummary = useMemo(() => {
    if (!files || !files.length) return [] as { tipo: string; file: File }[];
    const arr: { tipo: string; file: File }[] = [];
    Array.from(files).forEach((f) => {
      if (f.type.startsWith("image/")) arr.push({ tipo: "imagem", file: f });
      if (f.type.startsWith("audio/")) arr.push({ tipo: "audio", file: f });
    });
    return arr;
  }, [files]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    // 1) Se houver anexos, enviar cada um no webhook de upload para obter URLs (quando suportado pelo backend)
    const anexos: { tipo: "imagem" | "audio"; url: string }[] = [];
    try {
      for (const att of attachmentsSummary) {
        const form = new FormData();
        form.append("id_cliente", String(user.id_cliente));
        form.append("nome_cliente", user.nome_cliente);
        form.append("file", att.file);
        const resp = await fetch("https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/upload", { method: "POST", body: form });
        if (resp.ok) {
          // Espera-se que o backend retorne uma URL. Caso não, caímos no fallback abaixo
          const data = await resp.json().catch(() => null);
          const url = data?.url || "";
          if (url) anexos.push({ tipo: att.tipo as any, url });
        }
      }
    } catch {}

    // 2) Envia a pergunta para IA
    try {
      const payload = {
        pergunta_usuario: userMsg.content,
        nome_usuario: user.nome_cliente,
        id_usuario: user.id_cliente,
        anexos,
      };
      const resp = await fetch("https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/IA-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let aiText = "Desculpe, não consegui obter uma resposta agora.";
      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        aiText = data?.resposta || data?.message || JSON.stringify(data) || aiText;
      }

      const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: "ai", content: aiText };
      setMessages((m) => [...m, aiMsg]);
    } catch (e) {
      const aiMsg: ChatMessage = { id: crypto.randomUUID(), role: "ai", content: "Erro ao se comunicar com a IA." };
      setMessages((m) => [...m, aiMsg]);
    } finally {
      setLoading(false);
      setFiles(null);
      scrollToBottom();
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <SEO title="Chat – IA Sales Ops" description="Converse com a IA e receba respostas com seus dados." />
      <section className="container max-w-4xl flex-1 w-full py-6">
        <Card className="h-[70vh] flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => (
                <div key={m.id} className={`w-full flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="w-full flex justify-start">
                  <div className="max-w-[70%] rounded-lg px-4 py-2 bg-secondary">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t p-3">
              <div className="flex items-center gap-2">
                <label className="cursor-pointer text-sm px-3 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition" title="Anexar">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,audio/mpeg,audio/wav"
                    className="hidden"
                    onChange={(e) => (setFiles(e.target.files))}
                  />
                  Anexar
                </label>
                <Input
                  className="flex-1"
                  placeholder="Digite sua mensagem..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                />
                <Button variant="hero" onClick={sendMessage} disabled={loading}>
                  Enviar
                </Button>
              </div>
              {files && files.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">Anexos: {Array.from(files).map(f => f.name).join(", ")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
};

export default Chat;
