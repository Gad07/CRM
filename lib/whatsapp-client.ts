/**
 * Cliente Oficial de Producción Meta WhatsApp Cloud API v21.0
 * Envía mensajes REALES directamente a la API Graph de Meta.
 * También incluye soporte para Twilio for WhatsApp.
 */

export interface SendWhatsAppMessageOptions {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  messageText: string;
}

export interface SendTwilioWhatsAppOptions {
  accountSid: string;
  authToken: string;
  fromNumber: string;  // e.g. "+14155238886"
  toNumber: string;
  messageText: string;
}

export interface SendWhatsAppTemplateOptions {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  templateName: string;
  languageCode?: string;
  components?: object[];
}

/** Envía mensaje de texto vía Meta WhatsApp Cloud API v21.0 */
export async function sendRealWhatsAppMessage({
  phoneNumberId,
  accessToken,
  recipientPhone,
  messageText
}: SendWhatsAppMessageOptions) {
  const formattedPhone = recipientPhone.replace(/[^\d]/g, '');

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: messageText
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al enviar mensaje vía Meta WhatsApp Cloud API v21.0');
  }

  return data;
}

/** Envía mensaje de plantilla aprobada vía Meta WhatsApp Cloud API v21.0 */
export async function sendWhatsAppTemplate({
  phoneNumberId,
  accessToken,
  recipientPhone,
  templateName,
  languageCode = 'es',
  components = []
}: SendWhatsAppTemplateOptions) {
  const formattedPhone = recipientPhone.replace(/[^\d]/g, '');
  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'Error al enviar plantilla de WhatsApp');
  }

  return data;
}

/** Envía mensaje vía Twilio for WhatsApp */
export async function sendTwilioWhatsAppMessage({
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  messageText
}: SendTwilioWhatsAppOptions) {
  const cleanTo = toNumber.replace(/[^\d+]/g, '');
  const cleanFrom = fromNumber.startsWith('+') ? fromNumber : `+${fromNumber}`;

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const body = new URLSearchParams({
    From: `whatsapp:${cleanFrom}`,
    To: `whatsapp:${cleanTo.startsWith('+') ? cleanTo : `+${cleanTo}`}`,
    Body: messageText,
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Error al enviar mensaje vía Twilio for WhatsApp');
  }

  return data;
}
