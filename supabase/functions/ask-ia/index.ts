// Supabase Edge Function: encaminha pergunta do usuário à IA via webhook
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TARGET = "https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/IA-rag";

function cors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Headers", "*, Authorization, Content-Type");
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  return res;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
  if (req.method !== "POST") return cors(new Response("Method Not Allowed", { status: 405 }));
  try {
    const payload = await req.json();
    const resp = await fetch(TARGET, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await resp.text();
    const headers = new Headers({ "Content-Type": resp.headers.get("content-type") || "application/json" });
    return cors(new Response(text, { status: resp.status, headers }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ error: e?.message || "Erro ao encaminhar" }), { status: 500 }));
  }
});
