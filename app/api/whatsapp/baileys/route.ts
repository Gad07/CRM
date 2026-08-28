import { NextRequest, NextResponse } from "next/server";

const PRIMARY_URL =
  process.env.BAILEYS_SERVER_URL ||
  process.env.NEXT_PUBLIC_BAILEYS_SERVER_URL ||
  "https://crm-whatsapp-server.onrender.com";

const CANDIDATE_URLS = [
  PRIMARY_URL.replace(/\/+$/, ""),
  "https://crm-whatsapp-server.onrender.com",
  "http://127.0.0.1:3001",
  "http://localhost:3001",
];

async function tryBaileysRequest(path: string, options?: RequestInit) {
  const tried = new Set<string>();

  for (const base of CANDIDATE_URLS) {
    if (tried.has(base)) continue;
    tried.add(base);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(`${base}${path}`, {
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        return { ok: true, data, status: res.status };
      }
    } catch {
      // Continue to next candidate
    }
  }

  return { ok: false, data: null, status: 503 };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    if (type === "chats") {
      const result = await tryBaileysRequest("/api/chats");
      if (result.ok && result.data) {
        return NextResponse.json(result.data);
      }
      return NextResponse.json({ chats: [] });
    }

    const result = await tryBaileysRequest("/api/status");
    if (result.ok && result.data) {
      return NextResponse.json(result.data);
    }

    return NextResponse.json({
      connected: false,
      state: "server_offline",
      message: "Servidor de WhatsApp no detectado en Render ni local.",
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({
      connected: false,
      state: "server_offline",
      message: err.message || "Error conectando al motor de WhatsApp.",
    }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, to, message } = body;

    if (action === "disconnect") {
      const result = await tryBaileysRequest("/api/disconnect", {
        method: "POST",
      });
      if (result.ok) return NextResponse.json(result.data);
      return NextResponse.json({ success: true });
    }

    if (action === "read") {
      const result = await tryBaileysRequest("/api/read", {
        method: "POST",
        body: JSON.stringify({ to }),
      });
      if (result.ok && result.data) return NextResponse.json(result.data);
      return NextResponse.json({ success: true });
    }

    if (action === "send" || (!action && to && (message || body.media))) {
      const result = await tryBaileysRequest("/api/send", {
        method: "POST",
        body: JSON.stringify({ to, message, media: body.media }),
      });
      if (result.ok && result.data) {
        return NextResponse.json(result.data);
      }
      return NextResponse.json({
        error: "No se pudo enviar el mensaje a través del servidor de WhatsApp.",
      }, { status: 502 });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Error conectando con el motor de WhatsApp",
      connected: false,
    }, { status: 500 });
  }
}
