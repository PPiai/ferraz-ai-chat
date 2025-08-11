// Supabase Edge Function: Proxy para webhook de upload (evita CORS)
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TARGET = "https://ferrazpiai-n8n-editor.uyk8ty.easypanel.host/webhook-test/upload";

function cors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Headers", "*, Authorization, Content-Type");
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  return res;
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceKey);

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

    // Se upload OK, atualiza status no banco
    if (resp.ok) {
      const id = form.get("id_cliente")?.toString();
      const nome = form.get("nome_cliente")?.toString();
      if (id && nome) {
        await supabase
          .from("users")
          .update({ has_uploaded: true })
          .eq("id_cliente", Number(id))
          .eq("nome_cliente", nome);
      }
    }

    const headers = new Headers({ "Content-Type": resp.headers.get("content-type") || "text/plain" });
    return cors(new Response(text, { status: resp.status, headers }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ error: e?.message || "Erro no proxy" }), { status: 500 }));
  }
});
