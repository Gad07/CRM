const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3001;
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

// Real WhatsApp Chats Store (Phone -> { id, phone, name, last_message, timestamp, unread, messages: [] })
const chatsMap = new Map();
const contactsMap = new Map();

function extractMessageText(m) {
  if (!m || !m.message) return '';
  return (
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.documentMessage?.caption ||
    (m.message.audioMessage ? '[Nota de Voz]' : '') ||
    (m.message.imageMessage ? '[Foto]' : '') ||
    (m.message.videoMessage ? '[Video]' : '') ||
    (m.message.stickerMessage ? '[Sticker]' : '') ||
    (m.message.contactMessage ? '[Contacto]' : '') ||
    (m.message.locationMessage ? '[Ubicación]' : '') ||
    '[Mensaje multimedia]'
  );
}

function processMessage(m) {
  if (!m || !m.key) return null;
  const remoteJid = m.key.remoteJid;
  if (!remoteJid || remoteJid === 'status@broadcast') {
    return null; // Skip status broadcasts
  }

  const isGroup = remoteJid.includes('@g.us');
  const cleanPhone = isGroup
    ? remoteJid.replace('@g.us', '')
    : remoteJid.replace('@s.whatsapp.net', '').replace(/[^\d]/g, '');
  if (!cleanPhone) return null;

  const fromMe = !!m.key.fromMe;
  const text = extractMessageText(m);
  if (!text) return null;

  const senderName = isGroup
    ? (contactsMap.get(remoteJid) || m.pushName || 'Grupo de WhatsApp')
    : (contactsMap.get(cleanPhone) || m.pushName || `+${cleanPhone}`);

  const timestamp = m.messageTimestamp
    ? new Date(Number(m.messageTimestamp) * 1000).toISOString()
    : new Date().toISOString();

  const msgObj = {
    id: m.key.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: fromMe ? 'agent' : 'contact',
    text: text,
    timestamp: timestamp,
    status: fromMe ? 'sent' : 'delivered',
    isReal: true
  };

  // Update or create chat thread
  let chat = chatsMap.get(cleanPhone);
  if (!chat) {
    chat = {
      id: `chat-wa-${cleanPhone}`,
      contact_name: senderName,
      phone: isGroup ? remoteJid : cleanPhone,
      company_name: isGroup ? 'Grupo WhatsApp' : 'WhatsApp',
      deal_title: isGroup ? 'Chat Grupal' : 'Conversación directa',
      deal_value: 0,
      deal_id: `wa-${cleanPhone}`,
      unread_count: fromMe ? 0 : 1,
      last_message: text,
      last_time: new Date(timestamp).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      assigned_rep: 'WhatsApp',
      response_delay_minutes: 0,
      messages: [],
      has_real_messages: true,
      timestamp: timestamp
    };
    chatsMap.set(cleanPhone, chat);
  }

  if (senderName && !senderName.startsWith('+')) {
    chat.contact_name = senderName;
  }

  // Avoid duplicates
  if (!chat.messages.some(existing => existing.id === msgObj.id)) {
    chat.messages.push(msgObj);
    chat.last_message = text;
    chat.last_time = new Date(timestamp).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
    chat.timestamp = timestamp;
    if (!fromMe) {
      chat.unread_count = (chat.unread_count || 0) + 1;
    }
  }

  return { chat, message: msgObj };
}

function registerChat(c) {
  if (!c || !c.id || c.id === 'status@broadcast') return;
  const remoteJid = c.id;
  const isGroup = remoteJid.includes('@g.us');
  const cleanKey = remoteJid.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@g.us', '');

  const name = c.name || contactsMap.get(remoteJid) || contactsMap.get(cleanKey) || (isGroup ? 'Grupo WhatsApp' : `+${cleanKey}`);

  let chat = chatsMap.get(cleanKey) || chatsMap.get(remoteJid);
  if (!chat) {
    chat = {
      id: `chat-wa-${cleanKey}`,
      contact_name: name,
      phone: remoteJid,
      company_name: isGroup ? 'Grupo WhatsApp' : 'WhatsApp',
      deal_title: isGroup ? 'Chat Grupal' : 'Conversación de WhatsApp',
      deal_value: 0,
      deal_id: `wa-${cleanKey}`,
      unread_count: c.unreadCount || 0,
      last_message: 'Conversación de WhatsApp',
      last_time: c.conversationTimestamp ? new Date(Number(c.conversationTimestamp) * 1000).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
      assigned_rep: 'WhatsApp',
      response_delay_minutes: 0,
      messages: [],
      has_real_messages: true,
      timestamp: c.conversationTimestamp ? new Date(Number(c.conversationTimestamp) * 1000).toISOString() : new Date().toISOString()
    };
    chatsMap.set(cleanKey, chat);
  } else if (name && !name.startsWith('+')) {
    chat.contact_name = name;
  }
}

let isStarting = false;

async function startBaileys() {
  if (isStarting) return;
  isStarting = true;

  try {
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    connectionState.state = 'connecting';
    connectionState.lastUpdated = new Date().toISOString();

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: 'silent' }),
      browser: Browsers.macOS('Desktop'),
      syncFullHistory: true
    });

    sock.ev.on('creds.update', saveCreds);

    // Initial History & Contacts Sync from Phone
    sock.ev.on('contacts.set', ({ contacts }) => {
      if (Array.isArray(contacts)) {
        contacts.forEach(c => {
          const id = c.id || '';
          const name = c.name || c.notify || c.verifiedName;
          if (name) {
            contactsMap.set(id, name);
            const clean = id.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@g.us', '');
            contactsMap.set(clean, name);
          }
        });
      }
    });

    sock.ev.on('contacts.upsert', (contacts) => {
      if (Array.isArray(contacts)) {
        contacts.forEach(c => {
          const id = c.id || '';
          const name = c.name || c.notify || c.verifiedName;
          if (name) {
            contactsMap.set(id, name);
            const clean = id.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@g.us', '');
            contactsMap.set(clean, name);
          }
        });
      }
    });

    sock.ev.on('chats.set', ({ chats }) => {
      console.log(`📥 [WhatsApp Baileys] chats.set: ${chats?.length || 0} chats`);
      if (Array.isArray(chats)) chats.forEach(c => registerChat(c));
    });

    sock.ev.on('chats.upsert', (chats) => {
      if (Array.isArray(chats)) chats.forEach(c => registerChat(c));
    });

    sock.ev.on('messaging-history.set', ({ chats, contacts, messages }) => {
      console.log(`📥 [WhatsApp Baileys] Sincronizando historial completo: ${chats?.length || 0} chats, ${contacts?.length || 0} contactos, ${messages?.length || 0} mensajes recibidos del teléfono.`);

      if (Array.isArray(contacts)) {
        contacts.forEach(c => {
          const id = c.id || '';
          const name = c.name || c.notify || c.verifiedName;
          if (name) {
            contactsMap.set(id, name);
            const clean = id.replace('@s.whatsapp.net', '').replace('@lid', '').replace('@g.us', '');
            contactsMap.set(clean, name);
          }
        });
      }

      if (Array.isArray(chats)) {
        chats.forEach(c => registerChat(c));
      }

      if (Array.isArray(messages)) {
        messages.forEach(m => processMessage(m));
      }
    });

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

        console.log(`⚠️ [WhatsApp Baileys] Conexión cerrada (Código ${statusCode}). Reintentando: ${shouldReconnect}`);
        isStarting = false;

        if (statusCode === DisconnectReason.loggedOut || statusCode === 440) {
          console.log(`🔒 [WhatsApp Baileys] Código ${statusCode}. Limpiando credenciales para nuevo emparejamiento limpio...`);
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
          } catch (err) {}
          setTimeout(() => startBaileys(), 2000);
        } else if (shouldReconnect) {
          setTimeout(() => startBaileys(), 3000);
        }
      } else if (connection === 'open') {
        isStarting = false;
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

    // Real-Time Incoming & Outgoing Messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (!messages || messages.length === 0) return;

      for (const m of messages) {
        const res = processMessage(m);
        if (res && !m.key.fromMe) {
          console.log(`📩 [WhatsApp Mensaje] De ${res.chat.contact_name} (+${res.chat.phone}): "${res.message.text}"`);
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

// HTTP API Server
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

  // 2. GET /api/chats: Retrieve real synced WhatsApp chats
  if (url.pathname === '/api/chats' && req.method === 'GET') {
    const chatsList = Array.from(chatsMap.values()).sort(
      (a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ chats: chatsList }));
    return;
  }

  // 3. GET /api/messages: List all recent messages
  if (url.pathname === '/api/messages' && req.method === 'GET') {
    const allMsgs = [];
    chatsMap.forEach(chat => {
      chat.messages.forEach(m => {
        allMsgs.push({
          id: m.id,
          from_phone: m.sender === 'contact' ? chat.phone : (connectionState.user?.phone || 'CRM'),
          to_phone: m.sender === 'agent' ? chat.phone : (connectionState.user?.phone || 'CRM'),
          contact_name: chat.contact_name,
          text: m.text,
          timestamp: m.timestamp,
          direction: m.sender === 'agent' ? 'outbound' : 'inbound',
          status: m.status
        });
      });
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ messages: allMsgs.slice(-200) }));
    return;
  }

  // 4. POST /api/send: Send a real WhatsApp message
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

        let jid = String(to).trim();
        if (jid.includes('@lid') || jid.includes('@g.us') || jid.includes('@s.whatsapp.net')) {
          // Valid full JID or LID
        } else if (jid.length > 14 && !jid.startsWith('52') && !jid.startsWith('50') && !jid.startsWith('1')) {
          jid = `${jid}@lid`;
        } else {
          const cleanPhone = jid.replace(/[^\d]/g, '');
          jid = `${cleanPhone}@s.whatsapp.net`;

          // Resolve exact verified WhatsApp JID (critical for Mexico +52 / international)
          try {
            const results = await sock.onWhatsApp(cleanPhone);
            if (results && results.length > 0 && results[0].exists && results[0].jid) {
              jid = results[0].jid;
              console.log(`🔎 [WhatsApp JID Resuelto]: ${cleanPhone} -> ${jid}`);
            } else if (results && results.length > 0 && results[0].jid) {
              jid = results[0].jid;
            }
          } catch (e) {
            console.warn('onWhatsApp lookup warning:', e.message);
          }
        }

        console.log(`🚀 [WhatsApp Baileys Enviando] A ${jid}: "${message}"`);
        const sent = await sock.sendMessage(jid, { text: message });

        const cleanPhone = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
        const now = new Date().toISOString();
        const sentMsg = {
          id: sent?.key?.id || `msg-${Date.now()}`,
          sender: 'agent',
          text: message,
          timestamp: now,
          status: 'sent',
          isReal: true
        };

        let chat = chatsMap.get(cleanPhone);
        if (!chat) {
          chat = {
            id: `chat-wa-${cleanPhone}`,
            contact_name: contactsMap.get(cleanPhone) || `+${cleanPhone}`,
            phone: cleanPhone,
            company_name: 'WhatsApp',
            deal_title: 'Conversación directa',
            deal_value: 0,
            deal_id: `wa-${cleanPhone}`,
            unread_count: 0,
            last_message: message,
            last_time: new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
            assigned_rep: 'Tú (CRM)',
            response_delay_minutes: 0,
            messages: [],
            has_real_messages: true,
            timestamp: now
          };
          chatsMap.set(cleanPhone, chat);
        }
        chat.messages.push(sentMsg);
        chat.last_message = message;
        chat.last_time = new Date().toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
        chat.timestamp = now;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message_id: sent?.key?.id || `msg-${Date.now()}`,
          to: cleanPhone,
          jid: jid,
          timestamp: now
        }));
      } catch (err) {
        console.error('Error enviando mensaje vía Baileys:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || 'Error al enviar mensaje' }));
      }
    });
    return;
  }

  // 5. POST /api/disconnect: Log out and reset session
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
      chatsMap.clear();

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

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🟢 Servidor WhatsApp Baileys escuchando en puerto ${PORT}`);
  console.log(`🔗 API de Estado: http://0.0.0.0:${PORT}/api/status`);
  console.log(`====================================================`);
  startBaileys();
});
