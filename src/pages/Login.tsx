import React, { useState } from "react";
import SEO from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(nome, senha);
    setLoading(false);
    if (!res.ok) setError(res.error || "Erro ao entrar");
    else navigate("/upload");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <SEO title="Login – Chat IA Sales Ops" description="Acesse o chat com IA com suas credenciais." />
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Entrar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-sm">Nome do cliente</label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-sm">Senha</label>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Sua senha" />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Ao entrar, você concorda em enviar seus arquivos na próxima etapa para habilitar o chat.
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default Login;
