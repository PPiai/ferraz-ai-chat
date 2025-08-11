import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Upload: React.FC = () => {
  const { user, setHasUploaded } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!files || !files.length || !user) {
      setError("Selecione ao menos um arquivo.");
      return;
    }
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // Tentativa direta no webhook externo; idealmente trocar para Edge Function proxy
      const form = new FormData();
      form.append("id_cliente", String(user.id_cliente));
      form.append("nome_cliente", user.nome_cliente);
      // Envia apenas o primeiro arquivo para simplificar; pode-se iterar se necessário
      form.append("file", files[0]);

      const resp = await fetch("https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/upload", {
        method: "POST",
        body: form,
      });

      if (!resp.ok) throw new Error("Falha no upload");

      setSuccess("Upload concluído!");
      setHasUploaded(true);
      setTimeout(() => navigate("/chat"), 600);
    } catch (e: any) {
      setError(e?.message || "Falha ao enviar arquivos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO title="Upload de Arquivos – Chat IA" description="Envie seus arquivos para habilitar o chat com IA." />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Envie seus arquivos</CardTitle>
          <CardDescription>
            Para interagir com a IA, é necessário anexar seus dados ao sistema. Formatos suportados: imagens (JPG, PNG) e áudios (MP3, WAV).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              accept="image/jpeg,image/png,audio/mpeg,audio/wav"
              className="block w-full text-sm"
            />
            <Button onClick={handleUpload} variant="hero" disabled={loading}>
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
          {error && <p className="text-destructive mt-3 text-sm">{error}</p>}
          {success && <p className="text-green-600 mt-3 text-sm">{success}</p>}
        </CardContent>
      </Card>
    </main>
  );
};

export default Upload;
