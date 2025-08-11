import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <main className="min-h-screen bg-[image:var(--gradient-surface)]">
      <SEO title="Chat IA Sales Ops – Assistente com RAG" description="Faça login, envie seus arquivos e converse com uma IA integrada via webhooks." />
      <section className="container max-w-5xl py-24 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-4">Seu copiloto de Sales Ops com IA</h1>
        <p className="text-lg text-muted-foreground mb-8">Autenticação por MySQL, upload de dados e chat bidirecional via webhooks, em uma experiência semelhante ao ChatGPT.</p>
        <div className="flex items-center justify-center gap-4">
          <a href="/login">
            <Button variant="hero" size="lg">Começar agora</Button>
          </a>
          <a href="/chat">
            <Button variant="outline" size="lg">Ver demo</Button>
          </a>
        </div>
      </section>
    </main>
  );
};

export default Index;
