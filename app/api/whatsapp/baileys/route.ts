import { NextRequest, NextResponse } from "next/server";

const BAILEYS_URL = "http://127.0.0.1:3001";

export async function GET() {
  try {
    const res = await fetch(`${BAILEYS_URL}/api/status`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    if (!res.ok) {
      return NextResponse.json({
        connected: false,
        state: "server_offline",
        message: "El servidor de Baileys no está corriendo en el puerto 3001."
      }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({
      connected: false,
      state: "server_offline",
      message: "Servidor local de WhatsApp no detectado. Inicia 'npm run whatsapp:server'."
    }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, to, message } = body;

    if (action === "disconnect") {
      const res = await fetch(`${BAILEYS_URL}/api/disconnect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (action === "send" || (!action && to && message)) {
      const res = await fetch(`${BAILEYS_URL}/api/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, message })
      });
      const data = await res.json();
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({
      error: err.message || "Error conectando con el motor de WhatsApp",
      connected: false
    }, { status: 500 });
  }
}
