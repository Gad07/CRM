import { NextRequest, NextResponse } from "next/server";
import { pushOutgoingMessage } from "@/lib/whatsapp-message-store";

/**
 * POST /api/whatsapp/send
 * Envía un mensaje de WhatsApp real mediante Meta Cloud API v21.0.
 * Centraliza el envío en el servidor para no exponer credenciales en el browser.
 *
 * Body: {
 *   to: string;           // Número destino (solo dígitos, con código de país)
 *   message: string;      // Texto del mensaje
 *   phoneNumberId?: string;  // Meta Phone Number ID (si no está en env)
 *   accessToken?: string;    // Meta Access Token (si no está en env)
 *   twilioMode?: boolean;    // Si true, usa Twilio en lugar de Meta
 *   twilioAccountSid?: string;
 *   twilioAuthToken?: string;
 *   twilioFrom?: string;
 *   fromPhone?: string;      // Número del agente (para registrar en historial)
 *   threadId?: string;       // ID del hilo (= número del contacto)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      to,
      message,
      phoneNumberId,
      accessToken,
      twilioMode,
      twilioAccountSid,
      twilioAuthToken,
      twilioFrom,
      fromPhone = "CRM",
      threadId,
    } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: to, message" },
        { status: 400 }
      );
    }

    const cleanTo = String(to).replace(/[^\d]/g, "");
    const thread = threadId || cleanTo;

    // ── MODE 1: Twilio ─────────────────────────────────────────────────────
    if (twilioMode) {
      const sid = twilioAccountSid || process.env.TWILIO_ACCOUNT_SID;
      const authToken = twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
      const from = twilioFrom || process.env.TWILIO_FROM_NUMBER;

      if (!sid || !authToken || !from) {
        return NextResponse.json(
          { error: "Credenciales de Twilio no configuradas (Account SID, Auth Token, From number)" },
          { status: 400 }
        );
      }

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
      const twilioBody = new URLSearchParams({
        From: `whatsapp:${from}`,
        To: `whatsapp:+${cleanTo}`,
        Body: message,
      });

      const twilioRes = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${authToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: twilioBody.toString(),
      });

      const twilioData = await twilioRes.json();

      if (!twilioRes.ok) {
        return NextResponse.json(
          { error: twilioData.message || "Error de Twilio API" },
          { status: 502 }
        );
      }

      // Register in local store
      pushOutgoingMessage({
        thread_id: thread,
        from_phone: from,
        to_phone: cleanTo,
        contact_name: "",
        text: message,
        timestamp: new Date().toISOString(),
        meta_message_id: twilioData.sid,
        status: "sent",
      });

      return NextResponse.json({
        success: true,
        provider: "twilio",
        message_id: twilioData.sid,
        to: cleanTo,
      });
    }

    // ── MODE 2: Meta Cloud API v21.0 ───────────────────────────────────────
    const phoneId = phoneNumberId || process.env.WA_PHONE_NUMBER_ID;
    const token = accessToken || process.env.WA_ACCESS_TOKEN;

    if (!phoneId || !token) {
      // No credentials: simulate locally and return success UI response
      pushOutgoingMessage({
        thread_id: thread,
        from_phone: fromPhone,
        to_phone: cleanTo,
        contact_name: "",
        text: message,
        timestamp: new Date().toISOString(),
        status: "sent",
      });

      return NextResponse.json({
        success: true,
        provider: "local_simulation",
        message_id: `local-${Date.now()}`,
        to: cleanTo,
        note: "Mensaje guardado localmente. Configura Phone Number ID y Access Token en /settings/whatsapp para enviar mensajes reales.",
      });
    }

    const metaUrl = `https://graph.facebook.com/v21.0/${phoneId}/messages`;

    const metaRes = await fetch(metaUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: cleanTo,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const metaData = await metaRes.json();

    if (!metaRes.ok) {
      return NextResponse.json(
        {
          error: metaData.error?.message || "Error de Meta Graph API",
          error_code: metaData.error?.code,
        },
        { status: 502 }
      );
    }

    const metaMessageId = metaData.messages?.[0]?.id;

    // Register in local store
    pushOutgoingMessage({
      thread_id: thread,
      from_phone: phoneId,
      to_phone: cleanTo,
      contact_name: "",
      text: message,
      timestamp: new Date().toISOString(),
      meta_message_id: metaMessageId,
      status: "sent",
    });

    return NextResponse.json({
      success: true,
      provider: "meta_cloud_api_v21",
      message_id: metaMessageId,
      to: cleanTo,
    });
  } catch (err: any) {
    console.error("[/api/whatsapp/send] Error:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al enviar mensaje" },
      { status: 500 }
    );
  }
}
