import { NextResponse } from 'next/server';

export async function GET() {
  const timestamp = Date.now();
  const safePairingUrl = `https://crm-adp.netlify.app/settings/whatsapp?pairing=${timestamp}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(safePairingUrl)}`;

  return NextResponse.json({
    status: 'waiting_for_scan',
    timestamp,
    qr_token: safePairingUrl,
    qr_code_url: qrCodeUrl
  });
}
