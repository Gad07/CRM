import { NextRequest, NextResponse } from "next/server";
import {
  getAllMessages,
  getMessagesSince,
  getMessagesByThread,
  getStoreMetadata,
  clearAllMessages,
} from "@/lib/whatsapp-message-store";

/**
 * GET /api/whatsapp/messages
 * Devuelve mensajes del store en memoria para polling de la UI.
 *
 * Query params:
 *   since=<ISO string>     — solo mensajes posteriores a esa fecha
 *   thread=<phone>         — solo mensajes de ese hilo
 */
const rawUrl = process.env.BAILEYS_SERVER_URL || process.env.NEXT_PUBLIC_BAILEYS_SERVER_URL || "http://127.0.0.1:3001";
const BAILEYS_URL = rawUrl.replace(/\/+$/, "");

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const thread = searchParams.get("thread");

  let localMessages: any[] = [];
  if (thread) {
    localMessages = getMessagesByThread(thread);
  } else if (since) {
    localMessages = getMessagesSince(since);
  } else {
    localMessages = getAllMessages();
  }

  // Also query Baileys server for live incoming messages from WhatsApp
  let baileysMessages: any[] = [];
  try {
    const res = await fetch(`${BAILEYS_URL}/api/messages`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
      const bData = await res.json();
      baileysMessages = bData.messages || [];
      if (since) {
        const sinceTs = new Date(since).getTime();
        baileysMessages = baileysMessages.filter((m: any) => new Date(m.timestamp).getTime() > sinceTs);
      }
    }
  } catch {}

  // Merge unique messages
  const map = new Map<string, any>();
  [...localMessages, ...baileysMessages].forEach((m) => {
    map.set(m.id, m);
  });

  const merged = Array.from(map.values());

  return NextResponse.json({
    messages: merged,
    meta: getStoreMetadata(),
  });
}

/**
 * DELETE /api/whatsapp/messages
 * Limpia todos los mensajes del store (útil para testing).
 */
export async function DELETE() {
  clearAllMessages();
  return NextResponse.json({ success: true, message: "Store limpiado correctamente." });
}
