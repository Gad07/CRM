const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, downloadMediaMessage } = require('@whiskeysockets/baileys');
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
// Real WhatsApp Chats Store (Phone -> { id, phone, name, last_message, timestamp, unread, messages: [] })
const chatsMap = new Map();
const contactsMap = new Map();
const lidToPhoneMap = new Map();
const phoneToLidMap = new Map();

function getCanonicalChatKey(remoteJid) {
  if (!remoteJid) return '';
  if (remoteJid.includes('@g.us')) return remoteJid; // Groups are keyed by group JID
  if (remoteJid.includes('@lid')) {
    const cleanLid = remoteJid.replace('@lid', '');
    if (lidToPhoneMap.has(cleanLid)) {
      return lidToPhoneMap.get(cleanLid);
    }
    return cleanLid;
  }
  return remoteJid.replace('@s.whatsapp.net', '').replace(/[^\d]/g, '');
}

function registerContact(c) {
  if (!c || !c.id) return;
  const id = c.id;
  const name = c.name || c.notify || c.verifiedName;
  const cleanPhone = id.replace('@s.whatsapp.net', '').replace(/[^\d]/g, '');

  if (c.lid) {
    const cleanLid = c.lid.replace('@lid', '');
    lidToPhoneMap.set(cleanLid, cleanPhone);
    phoneToLidMap.set(cleanPhone, cleanLid);
  }

  if (name) {
    contactsMap.set(id, name);
    if (cleanPhone) contactsMap.set(cleanPhone, name);
    if (c.lid) {
      contactsMap.set(c.lid, name);
      contactsMap.set(c.lid.replace('@lid', ''), name);
    }

    const canonicalKey = getCanonicalChatKey(id);
    if (chatsMap.has(canonicalKey)) {
      const ch = chatsMap.get(canonicalKey);
      if (!ch.contact_name || ch.contact_name.startsWith('+') || ch.contact_name.includes('@')) {
        ch.contact_name = name;
      }
    }
  }

  // KEY FIX: if a LID→phone mapping was just established, migrate any chat stored
  // under the LID key into the canonical phone-keyed chat so they don't appear as two separate chats
  if (c.lid && cleanPhone) {
    const cleanLid = c.lid.replace('@lid', '');
    const lidChat = chatsMap.get(cleanLid);
    if (lidChat) {
      const phoneChat = chatsMap.get(cleanPhone);
      if (phoneChat) {
        // Merge LID messages into the phone chat (avoid duplicates)
        const existingIds = new Set(phoneChat.messages.map(m => m.id));
        for (const msg of lidChat.messages) {
          if (!existingIds.has(msg.id)) {
            phoneChat.messages.push(msg);
            existingIds.add(msg.id);
          }
        }
        phoneChat.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        const last = phoneChat.messages[phoneChat.messages.length - 1];
        if (last) {
          phoneChat.last_message = last.text;
          phoneChat.last_time = new Date(last.timestamp).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' });
        }
        if (name && (!phoneChat.contact_name || phoneChat.contact_name.startsWith('+'))) {
          phoneChat.contact_name = name;
        }
      } else {
        // No phone chat yet – just rename and re-key the LID chat under the phone key
        lidChat.id = `chat-wa-${cleanPhone}`;
        lidChat.phone = `${cleanPhone}@s.whatsapp.net`;
        if (name) lidChat.contact_name = name;
        chatsMap.set(cleanPhone, lidChat);
      }
      // Remove the stale LID-keyed entry
      chatsMap.delete(cleanLid);
    }
  }
}

function extractMessageText(m) {
  if (!m || !m.message) return '';
  return (
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    m.message.imageMessage?.caption ||
    m.message.documentMessage?.caption ||
    (m.message.audioMessage ? (m.message.audioMessage.ptt ? '🎙️ Nota de voz' : '🎵 Audio') : '') ||
    (m.message.imageMessage ? '📷 Foto' : '') ||
    (m.message.videoMessage ? '🎥 Video' : '') ||
    (m.message.stickerMessage ? '💟 Sticker' : '') ||
    (m.message.contactMessage ? '👤 Contacto' : '') ||
    (m.message.locationMessage ? '📍 Ubicación' : '') ||
    'Mensaje multimedia'
  );
}

async function processMessage(m) {
  if (!m || !m.key) return null;
  const remoteJid = m.key.remoteJid;
  if (!remoteJid || remoteJid === 'status@broadcast') {
    return null; // Skip status broadcasts
  }

  const isGroup = remoteJid.includes('@g.us');
  const canonicalKey = getCanonicalChatKey(remoteJid);
  if (!canonicalKey) return null;

  const fromMe = !!m.key.fromMe;
  const text = extractMessageText(m);
  if (!text) return null;

  // Extract rich media metadata and download binary payload
  let media = null;
  const msg = m.message;
  if (msg) {
    if (msg.imageMessage) {
      let dataUrl = null;
      try {
        const buffer = await downloadMediaMessage(m, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock?.updateMediaMessage });
        if (buffer) {
          dataUrl = `data:${msg.imageMessage.mimetype || 'image/jpeg'};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {
        if (msg.imageMessage.jpegThumbnail) {
          const buf = Buffer.isBuffer(msg.imageMessage.jpegThumbnail) ? msg.imageMessage.jpegThumbnail : Buffer.from(msg.imageMessage.jpegThumbnail);
          dataUrl = `data:image/jpeg;base64,${buf.toString('base64')}`;
        }
      }
      media = {
        type: 'image',
        caption: msg.imageMessage.caption || '',
        thumbnail: dataUrl,
        mimetype: msg.imageMessage.mimetype || 'image/jpeg'
      };
    } else if (msg.audioMessage) {
      let audioUrl = null;
      try {
        const buffer = await downloadMediaMessage(m, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock?.updateMediaMessage });
        if (buffer) {
          audioUrl = `data:${msg.audioMessage.mimetype || 'audio/ogg; codecs=opus'};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {}
      media = {
        type: 'audio',
        audioUrl: audioUrl,
        seconds: msg.audioMessage.seconds || 0,
        isVoiceNote: !!msg.audioMessage.ptt
      };
    } else if (msg.documentMessage) {
      let docUrl = null;
      try {
        const buffer = await downloadMediaMessage(m, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock?.updateMediaMessage });
        if (buffer) {
          docUrl = `data:${msg.documentMessage.mimetype || 'application/octet-stream'};base64,${buffer.toString('base64')}`;
        }
      } catch (err) {}
      media = {
        type: 'document',
        docUrl: docUrl,
        fileName: msg.documentMessage.fileName || msg.documentMessage.title || 'Documento',
        fileSize: msg.documentMessage.fileLength || 0,
        mimetype: msg.documentMessage.mimetype || 'application/pdf'
      };
    } else if (msg.stickerMessage) {
      let stickerUrl = null;
      try {
        const buffer = await downloadMediaMessage(m, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock?.updateMediaMessage });
        if (buffer) {
          stickerUrl = `data:image/webp;base64,${buffer.toString('base64')}`;
        }
      } catch (err) {}
      media = {
        type: 'sticker',
        thumbnail: stickerUrl
      };
    } else if (msg.locationMessage) {
      media = {
        type: 'location',
        latitude: msg.locationMessage.degreesLatitude,
        longitude: msg.locationMessage.degreesLongitude,
        name: msg.locationMessage.name || msg.locationMessage.address || 'Ubicación compartida'
      };
    }
  }

  const myPhone = connectionState.user?.phone || '';
  const myName = connectionState.user?.name || '';
  const isSelfChat = canonicalKey === myPhone;
  const isLidJid = remoteJid.includes('@lid');

  let senderName = '';
  if (isSelfChat) {
    senderName = 'Tú (Notas Personales)';
  } else if (isGroup) {
    senderName = contactsMap.get(remoteJid) || (fromMe ? null : m.pushName) || 'Grupo de WhatsApp';
  } else {
    // For LID JIDs: try contactsMap first, then pushName from any direction
    // NEVER set the chat name to our own name (myName/Gad Palma)
    const mappedName = contactsMap.get(canonicalKey) || contactsMap.get(remoteJid);
    const pushName = m.pushName;
    const safePushName = (!fromMe && pushName && pushName !== myName) ? pushName : null;
    // For LID chats, also check if lidToPhoneMap can give us a resolved phone to look up
    const resolvedPhone = isLidJid ? lidToPhoneMap.get(canonicalKey) : null;
    const resolvedName = resolvedPhone ? (contactsMap.get(resolvedPhone) || contactsMap.get(`${resolvedPhone}@s.whatsapp.net`)) : null;
    senderName = mappedName || resolvedName || safePushName || (isLidJid ? null : `+${canonicalKey}`) || `+${canonicalKey}`;
  }

  const timestamp = m.messageTimestamp
    ? new Date(Number(m.messageTimestamp) * 1000).toISOString()
    : new Date().toISOString();

  const msgObj = {
    id: m.key.id || `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender: fromMe ? 'agent' : 'contact',
    text: text,
    media: media,
    timestamp: timestamp,
    status: fromMe ? 'sent' : 'delivered',
    isReal: true
  };

  // Update or create chat thread
  let chat = chatsMap.get(canonicalKey);
  if (!chat) {
    chat = {
      id: `chat-wa-${canonicalKey}`,
      contact_name: senderName,
      phone: remoteJid,
      company_name: isGroup ? 'Grupo WhatsApp' : isSelfChat ? 'Personal' : 'WhatsApp',
      deal_title: isGroup ? 'Chat Grupal' : 'Conversación directa',
      deal_value: 0,
      deal_id: `wa-${canonicalKey}`,
      unread_count: fromMe ? 0 : 1,
      last_message: text,
      last_time: new Date(timestamp).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }),
      assigned_rep: 'WhatsApp',
      response_delay_minutes: 0,
      messages: [],
      has_real_messages: true,
      timestamp: timestamp
    };
    chatsMap.set(canonicalKey, chat);
  } else {
    if (senderName && !senderName.startsWith('+') && !senderName.includes('@') && (!chat.contact_name || chat.contact_name.startsWith('+') || chat.contact_name.includes('@'))) {
      chat.contact_name = senderName;
    }
  }

  // Avoid duplicates & cap message history to prevent RAM exhaustion on Render (512MB limit)
  if (!chat.messages.some(existing => existing.id === msgObj.id)) {
    chat.messages.push(msgObj);
    if (chat.messages.length > 40) {
      chat.messages = chat.messages.slice(-40);
    }
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
  const canonicalKey = getCanonicalChatKey(remoteJid);
  if (!canonicalKey) return;

  const myPhone = connectionState.user?.phone || '';
  const isSelfChat = canonicalKey === myPhone;

  let name = '';
  if (isSelfChat) {
    name = 'Tú (Notas Personales)';
  } else {
    name = c.name || contactsMap.get(remoteJid) || contactsMap.get(canonicalKey) || (isGroup ? 'Grupo WhatsApp' : `+${canonicalKey}`);
  }

  let chat = chatsMap.get(canonicalKey);
  if (!chat) {
    chat = {
      id: `chat-wa-${canonicalKey}`,
      contact_name: name,
      phone: remoteJid,
      company_name: isGroup ? 'Grupo WhatsApp' : isSelfChat ? 'Personal' : 'WhatsApp',
      deal_title: isGroup ? 'Chat Grupal' : 'Conversación de WhatsApp',
      deal_value: 0,
      deal_id: `wa-${canonicalKey}`,
      unread_count: c.unreadCount || 0,
      last_message: 'Conversación de WhatsApp',
      last_time: c.conversationTimestamp ? new Date(Number(c.conversationTimestamp) * 1000).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' }) : 'Reciente',
      assigned_rep: 'WhatsApp',
      response_delay_minutes: 0,
      messages: [],
      has_real_messages: true,
      timestamp: c.conversationTimestamp ? new Date(Number(c.conversationTimestamp) * 1000).toISOString() : new Date().toISOString()
    };
    chatsMap.set(canonicalKey, chat);
  } else if (name && !name.startsWith('+') && !name.includes('@')) {
    chat.contact_name = name;
  }
}

let isStarting = false;

async function startBaileys() {
  if (isStarting) return;
  isStarting = true;

  try {
    if (sock) {
      try {
        sock.ev.removeAllListeners('connection.update');
        sock.ev.removeAllListeners('creds.update');
        sock.ev.removeAllListeners('messages.upsert');
        sock.ev.removeAllListeners('chats.set');
        sock.ev.removeAllListeners('chats.upsert');
        sock.ev.removeAllListeners('contacts.set');
        sock.ev.removeAllListeners('contacts.upsert');
        sock.ev.removeAllListeners('messaging-history.set');
        sock.end();
      } catch (err) {}
    }

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
      browser: Browsers.ubuntu('Chrome'),
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 1000,
      syncFullHistory: true
    });

    isStarting = false;

    sock.ev.on('creds.update', saveCreds);

    // Initial History & Contacts Sync from Phone
    sock.ev.on('contacts.set', ({ contacts }) => {
      if (Array.isArray(contacts)) contacts.forEach(c => registerContact(c));
    });

    sock.ev.on('contacts.upsert', (contacts) => {
      if (Array.isArray(contacts)) contacts.forEach(c => registerContact(c));
    });

    sock.ev.on('chats.set', ({ chats }) => {
      console.log(`📥 [WhatsApp Baileys] chats.set: ${chats?.length || 0} chats`);
      if (Array.isArray(chats)) chats.forEach(c => registerChat(c));
    });

    sock.ev.on('chats.upsert', (chats) => {
      if (Array.isArray(chats)) chats.forEach(c => registerChat(c));
    });

    sock.ev.on('messaging-history.set', async ({ chats, contacts, messages }) => {
      console.log(`📥 [WhatsApp Baileys] Sincronizando historial completo: ${chats?.length || 0} chats, ${contacts?.length || 0} contactos, ${messages?.length || 0} mensajes recibidos del teléfono.`);

      if (Array.isArray(contacts)) {
        contacts.forEach(c => registerContact(c));
      }

      if (Array.isArray(chats)) {
        chats.forEach(c => registerChat(c));
      }

      if (Array.isArray(messages)) {
        for (const m of messages) {
          await processMessage(m);
        }
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
        const res = await processMessage(m);
        if (res && !m.key.fromMe) {
          console.log(`📩 [WhatsApp Mensaje] De ${res.chat.contact_name} (+${res.chat.phone}): "${res.message.text}"`);
        }
      }
    });

    // Track Message Status Updates (Delivered, Read / Blue Checks)
    sock.ev.on('messages.update', async (updates) => {
      if (!updates || updates.length === 0) return;
      for (const update of updates) {
        const { key, update: msgUpdate } = update;
        if (!key || !msgUpdate) continue;
        const msgId = key.id;
        const statusVal = msgUpdate.status;

        // Map Baileys status number to string status
        // 2: ERROR/PENDING, 3: SERVER_ACK/SENT, 4: DELIVERY_ACK/DELIVERED, 5: READ, 6: PLAYED
        let newStatus = null;
        if (statusVal === 3 || statusVal === 'SENT') newStatus = 'sent';
        if (statusVal === 4 || statusVal === 'DELIVERED') newStatus = 'delivered';
        if (statusVal === 5 || statusVal === 6 || statusVal === 'READ' || statusVal === 'PLAYED') newStatus = 'read';

        if (newStatus) {
          chatsMap.forEach((chat) => {
            const m = chat.messages.find((msg) => msg.id === msgId);
            if (m) {
              m.status = newStatus;
            }
          });
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
    // Include lidToPhoneMap so the frontend can resolve LID numbers → real phone numbers
    const lidMap = Object.fromEntries(lidToPhoneMap);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ chats: chatsList, lidMap }));
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
    res.end(JSON.stringify({ messages: allMsgs.slice(-200) }));
    return;
  }

  // 4. POST /api/send: Send a real WhatsApp message or media (images, documents)
  if (url.pathname === '/api/send' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const { to, message, media } = JSON.parse(bodyStr || '{}');

        if (!to || (!message && !media)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Faltan parámetros requeridos: to, message o media' }));
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

          try {
            const results = await sock.onWhatsApp(cleanPhone);
            if (results && results.length > 0 && results[0].exists && results[0].jid) {
              jid = results[0].jid;
            } else if (results && results.length > 0 && results[0].jid) {
              jid = results[0].jid;
            }
          } catch (e) {
            console.warn('onWhatsApp lookup warning:', e.message);
          }
        }

        console.log(`🚀 [WhatsApp Baileys Enviando] A ${jid}: "${message || (media ? media.type : '')}"`);

        let sent = null;
        let sentMedia = null;

        if (media && media.base64) {
          const buffer = Buffer.from(media.base64, 'base64');
          if (media.type === 'image') {
            sent = await sock.sendMessage(jid, { image: buffer, caption: message || media.caption || '' });
            sentMedia = { type: 'image', thumbnail: `data:${media.mimetype || 'image/jpeg'};base64,${media.base64}`, caption: message };
          } else if (media.type === 'document') {
            sent = await sock.sendMessage(jid, {
              document: buffer,
              fileName: media.fileName || 'archivo',
              mimetype: media.mimetype || 'application/octet-stream',
              caption: message || ''
            });
            sentMedia = {
              type: 'document',
              fileName: media.fileName || 'Archivo',
              docUrl: `data:${media.mimetype || 'application/octet-stream'};base64,${media.base64}`
            };
          } else {
            sent = await sock.sendMessage(jid, { text: message || '' });
          }
        } else {
          sent = await sock.sendMessage(jid, { text: message });
        }

        const cleanPhone = jid.replace('@s.whatsapp.net', '').replace('@g.us', '');
        const now = new Date().toISOString();
        const sentMsg = {
          id: sent?.key?.id || `msg-${Date.now()}`,
          sender: 'agent',
          text: message || (media ? `[${media.type === 'image' ? 'Imagen' : 'Archivo'} enviado]` : ''),
          media: sentMedia,
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
            last_message: sentMsg.text,
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
        chat.last_message = sentMsg.text;
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

  // 5. POST /api/read: Mark chat messages as read on WhatsApp
  if (url.pathname === '/api/read' && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => { bodyStr += chunk; });
    req.on('end', async () => {
      try {
        const { to } = JSON.parse(bodyStr || '{}');
        if (!to || !sock) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false }));
          return;
        }

        const cleanPhone = String(to).replace(/[^\d]/g, '');
        const chat = chatsMap.get(cleanPhone);
        if (chat) {
          chat.unread_count = 0;
          // Collect unread message keys to send read receipts
          const keysToRead = chat.messages
            .filter(m => m.sender === 'contact' && m.status !== 'read')
            .map(m => ({ remoteJid: `${cleanPhone}@s.whatsapp.net`, id: m.id, fromMe: false }));

          if (keysToRead.length > 0) {
            try {
              await sock.readMessages(keysToRead);
            } catch (e) {
              console.warn('readMessages error:', e.message);
            }
          }
          chat.messages.forEach(m => {
            if (m.sender === 'contact') m.status = 'read';
          });
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
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

// Periodic Memory Management Routine (Keeps RAM < 250MB on Render 512MB free tier)
setInterval(() => {
  try {
    const memory = process.memoryUsage();
    const heapMb = Math.round(memory.heapUsed / 1024 / 1024);
    const rssMb = Math.round(memory.rss / 1024 / 1024);

    if (rssMb > 250 || heapMb > 200) {
      console.log(`🧹 [CRM Memory Cleanup] Memoria RSS: ${rssMb}MB, Heap: ${heapMb}MB. Liberando espacio...`);
      chatsMap.forEach((chat) => {
        if (chat.messages && chat.messages.length > 25) {
          chat.messages = chat.messages.slice(-25);
        }
      });
      if (global.gc) {
        global.gc();
      }
    }
  } catch (e) {}
}, 3 * 60 * 1000);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🟢 Servidor WhatsApp Baileys escuchando en puerto ${PORT}`);
  console.log(`🔗 API de Estado: http://0.0.0.0:${PORT}/api/status`);
  console.log(`====================================================`);
  startBaileys();
});
