/**
 * WhatsApp Message Store — Singleton en memoria del proceso Node.js
 * Almacena mensajes entrantes del webhook de Meta y salientes desde la UI.
 * Funciona en desarrollo local y en Netlify Functions (durante la vida del proceso).
 */

export interface WhatsAppStoredMessage {
  id: string;
  thread_id: string;
  direction: 'inbound' | 'outbound';
  from_phone: string;
  to_phone: string;
  contact_name: string;
  text: string;
  timestamp: string;
  meta_message_id?: string;
  status: 'received' | 'sent' | 'delivered' | 'read' | 'failed';
}

const MAX_MESSAGES = 500;

const messageStore: {
  messages: WhatsAppStoredMessage[];
  lastUpdated: number;
} = (global as any).__waMessageStore ?? (() => {
  const store = { messages: [] as WhatsAppStoredMessage[], lastUpdated: Date.now() };
  (global as any).__waMessageStore = store;
  return store;
})();

export function pushIncomingMessage(msg: Omit<WhatsAppStoredMessage, 'id' | 'direction' | 'status'>): WhatsAppStoredMessage {
  const newMsg: WhatsAppStoredMessage = {
    ...msg,
    id: `wa-in-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    direction: 'inbound',
    status: 'received',
  };
  messageStore.messages.unshift(newMsg);
  if (messageStore.messages.length > MAX_MESSAGES) {
    messageStore.messages = messageStore.messages.slice(0, MAX_MESSAGES);
  }
  messageStore.lastUpdated = Date.now();
  return newMsg;
}

export function pushOutgoingMessage(msg: Omit<WhatsAppStoredMessage, 'id' | 'direction'>): WhatsAppStoredMessage {
  const newMsg: WhatsAppStoredMessage = {
    ...msg,
    id: `wa-out-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    direction: 'outbound',
  };
  messageStore.messages.unshift(newMsg);
  if (messageStore.messages.length > MAX_MESSAGES) {
    messageStore.messages = messageStore.messages.slice(0, MAX_MESSAGES);
  }
  messageStore.lastUpdated = Date.now();
  return newMsg;
}

export function getMessagesByThread(threadPhone: string): WhatsAppStoredMessage[] {
  return messageStore.messages
    .filter(m => m.thread_id === threadPhone)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function getAllMessages(): WhatsAppStoredMessage[] {
  return [...messageStore.messages];
}

export function getMessagesSince(sinceIso: string): WhatsAppStoredMessage[] {
  const since = new Date(sinceIso).getTime();
  return messageStore.messages.filter(m => new Date(m.timestamp).getTime() > since);
}

export function getAllThreadPhones(): string[] {
  return [...new Set(messageStore.messages.map(m => m.thread_id))];
}

export function clearAllMessages(): void {
  messageStore.messages = [];
  messageStore.lastUpdated = Date.now();
}

export function getStoreMetadata() {
  return {
    total_messages: messageStore.messages.length,
    last_updated: new Date(messageStore.lastUpdated).toISOString(),
    threads: getAllThreadPhones().length,
  };
}
