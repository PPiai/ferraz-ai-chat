// Supabase Edge Function: Login using Supabase DB
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function cors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Headers", "* , Authorization, Content-Type");
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
    const { nome_cliente, senha_cliente } = await req.json();

    if (!nome_cliente || !senha_cliente) {
      return cors(new Response(JSON.stringify({ error: "Credenciais inválidas" }), { status: 400 }));
    }

    const { data, error } = await supabase
      .from("users")
      .select("id_cliente, nome_cliente, has_uploaded")
      .eq("nome_cliente", nome_cliente)
      .eq("senha_cliente", senha_cliente)
      .maybeSingle();

    if (error) {
      return cors(new Response(JSON.stringify({ error: error.message }), { status: 500 }));
    }

    if (!data) {
      return cors(new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 }));
    }

    return cors(new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type": "application/json" } }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ error: (e as any)?.message || "Erro interno" }), { status: 500 }));
  }
});
