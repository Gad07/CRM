import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const socketRes = await fetch('http://localhost:3001/api/qr', { cache: 'no-store' });
    if (socketRes.ok) {
      const data = await socketRes.json();
      return NextResponse.json({
        status: 'waiting_for_scan',
        timestamp: Date.now(),
        qr_token: data.pairing_qr,
        qr_code_url: data.qr_image
      });
    }
  } catch {
    // Fallback if socket server is starting
  }

  const timestamp = Date.now();
  const refString = Math.random().toString(36).substring(2, 15);
  const publicKey = 'B' + Math.random().toString(36).substring(2, 15);
  const identityKey = 'C' + Math.random().toString(36).substring(2, 15);

  const qrPairingToken = `1@${refString},${publicKey},${identityKey}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrPairingToken)}`;

  return NextResponse.json({
    status: 'waiting_for_scan',
    timestamp,
    qr_token: qrPairingToken,
    qr_code_url: qrCodeUrl
  });
}
