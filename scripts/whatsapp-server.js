const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 3001;
const AUTH_FOLDER = path.join(__dirname, '..', 'baileys_auth_info');

// In-memory server state
let sock = null;
let connectionState = {
  connected: false,
  state: 'initializing', // 'initializing' | 'scan_qr' | 'connecting' | 'connected' | 'disconnected'
  qr: null,             // Data URL (image/png;base64,...)
  qrRaw: null,
  user: null,           // { id: '502xxxxxxxx', name: '...' }
  lastUpdated: new Date().toISOString(),
  lastError: null
};

// Recent message buffer
const recentMessages = [];

async function startBaileys() {
  try {
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    connectionState.state = 'connecting';
    connectionState.lastUpdated = new Date().toISOString();

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true, // Also prints in terminal for easy terminal scanning
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        connectionState.connected = false;
        connectionState.state = 'scan_qr';
        connectionState.qrRaw = qr;
        try {
          connectionState.qr = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
        } catch (e) {
          console.error('Error generando DataURL del QR:', e);
        }
        connectionState.lastUpdated = new Date().toISOString();
        console.log('📲 [WhatsApp Baileys] Nuevo código QR generado. Listo para escanear en la app de WhatsApp.');
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        connectionState.connected = false;
        connectionState.state = 'disconnected';
        connectionState.qr = null;
        connectionState.qrRaw = null;
        connectionState.user = null;
        connectionState.lastUpdated = new Date().toISOString();
        connectionState.lastError = lastDisconnect?.error?.message || 'Conexión cerrada';

        console.log(`⚠️ [WhatsApp Baileys] Conexión cerrada (Código ${statusCode}). Reintentando reconectar: ${shouldReconnect}`);

        if (statusCode === DisconnectReason.loggedOut) {
          console.log('🔒 [WhatsApp Baileys] Sesión cerrada desde el celular. Limpiando credenciales...');
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          } catch (err) {
            console.error('Error limpiando auth folder:', err);
          }
          setTimeout(() => startBaileys(), 3000);
        } else if (shouldReconnect) {
          setTimeout(() => startBaileys(), 3000);
        }
      } else if (connection === 'open') {
        connectionState.connected = true;
        connectionState.state = 'connected';
        connectionState.qr = null;
        connectionState.qrRaw = null;
        connectionState.lastError = null;

        const userJid = sock.user?.id || '';
        const phone = userJid.split(':')[0] || userJid.split('@')[0];
        const name = sock.user?.name || 'Usuario WhatsApp';

        connectionState.user = {
          id: userJid,
          phone: phone,
          name: name
        };
        connectionState.lastUpdated = new Date().toISOString();

        console.log(`✅ [WhatsApp Baileys] Conexión establecida con éxito! Teléfono vinculado: +${phone} (${name})`);
      }
    });

    // Handle Incoming Messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify' || !messages || messages.length === 0) return;

      for (const m of messages) {
        if (!m.message || m.key.fromMe) continue; // Skip messages sent by the user itself

        const remoteJid = m.key.remoteJid;
        if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
          continue; // Skip group chats and status broadcasts for CRM inbox simplicity
        }

        const cleanPhone = remoteJid.replace('@s.whatsapp.net', '');
        const text =
          m.message.conversation ||
          m.message.extendedTextMessage?.text ||
          m.message.imageMessage?.caption ||
          m.message.documentMessage?.caption ||
          (m.message.audioMessage ? '[Nota de Voz]' : '[Archivo Multimedia]');

        const senderName = m.pushName || `+${cleanPhone}`;
        const timestamp = new Date(Number(m.messageTimestamp) * 1000).toISOString();

        const messageData = {
          id: m.key.id || `wa-${Date.now()}`,
          from_phone: cleanPhone,
          to_phone: connectionState.user?.phone || 'CRM',
          contact_name: senderName,
          text: text,
          timestamp: timestamp,
          direction: 'inbound',
          status: 'received'
        };

        console.log(`📩 [WhatsApp Baileys Recibido] De ${senderName} (+${cleanPhone}): "${text}"`);
        recentMessages.unshift(messageData);
        if (recentMessages.length > 200) recentMessages.pop();

        // Forward to Next.js API if server is up
        try {
          const webhookUrl = 'http://localhost:3000/api/webhooks/whatsapp';
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entry: [{
                changes: [{
                  value: {
                    contacts: [{ profile: { name: senderName } }],
                    messages: [{
                      from: cleanPhone,
                      text: { body: text },
                      timestamp: Math.floor(new Date(timestamp).getTime() / 1000),
                      type: 'text'
                    }],
                    metadata: { display_phone_number: connectionState.user?.phone || 'CRM' }
                  }
                }]
              }]
            })
          }).catch(() => {});
        } catch (e) {
          // Ignore if Next.js webhook is offline
        }
      }
    });

  } catch (err) {
    console.error('❌ Error fatal iniciando Baileys:', err);
    connectionState.state = 'disconnected';
    connectionState.lastError = err.message;
    setTimeout(() => startBaileys(), 5000);
  }
}

// HTTP API Server for the Next.js CRM integration
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // 1. GET /api/status: Check real connection status & retrieve QR
  if (url.pathname === '/api/status' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(connectionState));
    return;
  }

  // 2. GET /api/messages: List recent received messages
  if (url.pathname === '/api/messages' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ messages: recentMessages }));
    return;
  }

  // 3. POST /api/send: Send a WhatsApp message through the active Baileys socket
  if (url.pathname === '/api/send' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const { to, message } = JSON.parse(bodyStr || '{}');

        if (!to || !message) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Faltan parámetros requeridos: to, message' }));
          return;
        }

        if (!connectionState.connected || !sock) {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'WhatsApp no está conectado. Escanea el código QR en el CRM primero.',
            connected: false
          }));
          return;
        }

        const cleanPhone = String(to).replace(/[^\d]/g, '');
        const jid = `${cleanPhone}@s.whatsapp.net`;

        console.log(`🚀 [WhatsApp Baileys Enviando] A +${cleanPhone}: "${message}"`);
        const sent = await sock.sendMessage(jid, { text: message });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message_id: sent?.key?.id || `msg-${Date.now()}`,
          to: cleanPhone,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error('Error enviando mensaje vía Baileys:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Error al enviar mensaje' }));
      }
    });
    return;
  }

  // 4. POST /api/disconnect: Log out and reset session
  if (url.pathname === '/api/disconnect' && req.method === 'POST') {
    try {
      if (sock) {
        await sock.logout().catch(() => {});
      }
      try {
        fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
      } catch (e) {}

      connectionState.connected = false;
      connectionState.state = 'scan_qr';
      connectionState.user = null;
      connectionState.qr = null;

      setTimeout(() => startBaileys(), 1500);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Sesión cerrada correctamente' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Default fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🟢 Servidor WhatsApp Baileys escuchando en puerto ${PORT}`);
  console.log(`🔗 API de Estado: http://localhost:${PORT}/api/status`);
  console.log(`====================================================`);
  startBaileys();
});
