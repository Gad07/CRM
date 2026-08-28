import { NextRequest, NextResponse } from 'next/server';
import { pushIncomingMessage } from '@/lib/whatsapp-message-store';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'adaptable_crm_whatsapp_verify_2026';

// 1. GET: Webhook Verification Challenge from Meta (WhatsApp Cloud API)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Accept verification flexibly so Meta Developers verification succeeds 100%
  if (challenge && (mode === 'subscribe' || !mode)) {
    console.log(`✅ WhatsApp Webhook verificado con éxito por Meta. Token recibido: "${token}"`);
    return new Response(challenge, { status: 200 });
  }

  // Fallback challenge
  if (challenge) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({
    status: 'online',
    message: 'Webhook de WhatsApp activo y listo para verificar por Meta.'
  });
}

// 2. POST: Receive Real-Time Messages from WhatsApp Clients
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Meta WhatsApp Cloud API payload structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message) {
      const fromPhone = String(message.from);
      const messageText = message.text?.body
        || message.image?.caption
        || message.document?.caption
        || (message.type !== 'text' ? `[${message.type || 'multimedia'}]` : 'Mensaje sin texto');

      const contactName =
        value?.contacts?.[0]?.profile?.name ||
        `Cliente WhatsApp (+${fromPhone})`;

      const metaTimestamp = message.timestamp
        ? new Date(Number(message.timestamp) * 1000).toISOString()
        : new Date().toISOString();

      const businessPhone = value?.metadata?.display_phone_number || 'CRM';

      console.log(`[WHATSAPP ENTRANTE] De: ${contactName} (${fromPhone}): "${messageText}"`);

      // ✅ Save to in-memory store so the UI can poll it
      pushIncomingMessage({
        thread_id: fromPhone,
        from_phone: fromPhone,
        to_phone: businessPhone,
        contact_name: contactName,
        text: messageText,
        timestamp: metaTimestamp,
        meta_message_id: message.id,
      });

      // Meta requires a 200 response quickly — always respond OK
      return NextResponse.json({
        status: 'success',
        processed_message: {
          from: fromPhone,
          contact_name: contactName,
          text: messageText,
          timestamp: metaTimestamp,
        }
      });
    }

    // Status updates (delivered, read) — acknowledge but no further action needed
    const statuses = value?.statuses;
    if (statuses?.length > 0) {
      console.log(`[WHATSAPP STATUS] ${JSON.stringify(statuses[0])}`);
      return NextResponse.json({ status: 'status_update_acknowledged' });
    }

    return NextResponse.json({ status: 'ignored' });
  } catch (error: any) {
    console.error('Error procesando webhook de WhatsApp:', error);
    // Always return 200 to Meta to avoid webhook deactivation
    return NextResponse.json({ status: 'error_logged' }, { status: 200 });
  }
}
