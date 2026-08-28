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
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const since = searchParams.get("since");
  const thread = searchParams.get("thread");

  let messages;

  if (thread) {
    messages = getMessagesByThread(thread);
  } else if (since) {
    messages = getMessagesSince(since);
  } else {
    messages = getAllMessages();
  }

  return NextResponse.json({
    messages,
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
