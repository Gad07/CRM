/**
 * Cliente Oficial de Producción Meta WhatsApp Cloud API
 * Envía mensajes REALES directamente a la API Graph de Meta
 */

export interface SendWhatsAppMessageOptions {
  phoneNumberId: string;
  accessToken: string;
  recipientPhone: string;
  messageText: string;
}

export async function sendRealWhatsAppMessage({
  phoneNumberId,
  accessToken,
  recipientPhone,
  messageText
}: SendWhatsAppMessageOptions) {
  const formattedPhone = recipientPhone.replace(/[^\d]/g, '');

  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

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
    throw new Error(data.error?.message || 'Error al enviar mensaje vía Meta WhatsApp Cloud API');
  }

  return data;
}
