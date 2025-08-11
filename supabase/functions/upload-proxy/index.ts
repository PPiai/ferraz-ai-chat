// Supabase Edge Function: Proxy para webhook de upload (evita CORS)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const TARGET = "https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/upload";

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
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return cors(new Response(JSON.stringify({ error: "Content-Type deve ser multipart/form-data" }), { status: 400 }));
    }

    const form = await req.formData();
    const fd = new FormData();
    for (const [k, v] of form.entries()) {
      fd.append(k, v as any);
    }

    const resp = await fetch(TARGET, { method: "POST", body: fd });
    const text = await resp.text();
    const headers = new Headers({ "Content-Type": resp.headers.get("content-type") || "text/plain" });
    return cors(new Response(text, { status: resp.status, headers }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ error: e?.message || "Erro no proxy" }), { status: 500 }));
  }
});
