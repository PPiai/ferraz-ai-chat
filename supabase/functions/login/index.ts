// Supabase Edge Function: Login via MySQL
// Requires environment variables configured in Supabase project:
// MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB_NAME

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { Client } from "https://deno.land/x/mysql@v2.12.1/mod.ts";

function cors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Headers", "*\n, Authorization, Content-Type");
  res.headers.set("Access-Control-Allow-Methods", "POST,OPTIONS");
  return res;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
  if (req.method !== "POST") return cors(new Response("Method Not Allowed", { status: 405 }));

  try {
    const { nome_cliente, senha_cliente } = await req.json();
    if (!nome_cliente || !senha_cliente) {
      return cors(new Response(JSON.stringify({ error: "Credenciais inválidas" }), { status: 400 }));
    }

    const client = await new Client().connect({
      hostname: Deno.env.get("MYSQL_HOST")!,
      port: Number(Deno.env.get("MYSQL_PORT") || 3306),
      username: Deno.env.get("MYSQL_USER")!,
      password: Deno.env.get("MYSQL_PASSWORD")!,
      db: Deno.env.get("MYSQL_DB_NAME")!,
    });

    const rows = await client.execute(
      "SELECT id_cliente, nome_cliente FROM users WHERE nome_cliente = ? AND senha_cliente = ? LIMIT 1",
      [nome_cliente, senha_cliente]
    );

    await client.close();

    if (!rows.rows?.length) {
      return cors(new Response(JSON.stringify({ error: "Não autorizado" }), { status: 401 }));
    }

    const user = rows.rows[0] as { id_cliente: number; nome_cliente: string };
    return cors(new Response(JSON.stringify({ ...user, hasUploaded: false }), { status: 200, headers: { "Content-Type": "application/json" } }));
  } catch (e) {
    return cors(new Response(JSON.stringify({ error: e?.message || "Erro interno" }), { status: 500 }));
  }
});
