import { io, Socket } from "socket.io-client";

/**
 * Socket client manager
 * - Supporte option namespace/path/token/userId
 * - Si votre backend NestJS n'utilise PAS de namespace, laissez `namespace` undefined
 * - Variables d'env utilisables :
 *    VITE_API_WS_URL    (ex: http://localhost:3000)
 *    VITE_API_WS_PATH   (ex: /socket.io)  // laisse undefined si vous utilisez le path par défaut
 *    VITE_DEBUG_SOCKETS (any) -> si défini active les logs console
 *
 * Usage (messages + notifications partagent le même namespace par défaut) :
 *   const s = initSocket({ token, userId });
 *   const sNotif = initSocket({ namespace: 'notifications', token });
 *
 */

type InitOptions = {
  namespace?: string; // ex: 'messages' ou 'notifications' (si vous n'utilisez pas de namespace, omettez)
  token?: string; // JWT à envoyer via auth
  userId?: string; // fallback (handshake query)
  path?: string; // socket.io path si custom
  autoConnect?: boolean; // default true
};

type NotificationData = {
  id?: string;
  titre: string;
  message: string;
  [key: string]: any;
};

const sockets = new Map<string, Socket | null>();

const debug = (...args: any[]) => {
  if (import.meta.env.VITE_DEBUG_SOCKETS) console.debug("[SOCKET]", ...args);
};

function keyFor(namespace?: string) {
  return namespace ? namespace : "default";
}

function buildUrl(base: string, namespace?: string) {
  if (!namespace) return base.replace(/\/$/, "");
  return `${base.replace(/\/$/, "")}/${namespace.replace(/^\//, "")}`;
}

/**
 * Initialise (ou récupère) une socket pour un namespace donné.
 * - Si backend n'utilise pas de namespace, n'en passez pas.
 */
export function initSocket(options: InitOptions = {}) {
  if (typeof window === "undefined") return null;
  const { namespace, token, userId, path, autoConnect = true } = options;

  const k = keyFor(namespace);
  const existing = sockets.get(k);
  if (existing && existing.connected) return existing;

  const base = (import.meta.env.VITE_API_WS_URL as string) || (import.meta.env.VITE_API_URL as string) || "http://localhost:3000";
  const socketPath = path ?? (import.meta.env.VITE_API_WS_PATH as string) ?? undefined;
  const url = buildUrl(base, namespace);

  debug("initSocket", { url, path: socketPath, namespace, userId, tokenProvided: !!token });

  const s: Socket = io(url, {
    transports: ["websocket"],
    auth: token ? { token } : undefined,
    query: userId ? { userId } : undefined,
    path: socketPath,
    autoConnect,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  s.on("connect", () => debug(`connected ${k}`, s.id));
  s.on("disconnect", (reason) => debug(`disconnect ${k}`, reason));
  s.on("connect_error", (err: any) => {
    console.error(`[SOCKET:${k}] connect_error`, err?.message ?? err);
    if (err?.message === "Invalid namespace") {
      console.error(`[SOCKET:${k}] Invalid namespace — vérifiez VITE_API_WS_URL et que le serveur n'utilise pas de namespace`);
    }
  });

  sockets.set(k, s);
  return s;
}

export function getSocket(namespace?: string) {
  return sockets.get(keyFor(namespace)) ?? null;
}

export function disconnectSocket(namespace?: string) {
  const k = keyFor(namespace);
  const s = sockets.get(k);
  if (!s) return;
  s.disconnect();
  sockets.delete(k);
}

export function subscribe<T = any>(namespace: string | undefined, event: string, cb: (payload: T) => void) {
  const s = getSocket(namespace);
  if (!s) return () => {};
  const handler = (p: T) => cb(p);
  s.on(event, handler);
  return () => s.off(event, handler);
}

export function emit(namespace: string | undefined, event: string, payload?: any, ack?: (...args: any[]) => void) {
  const s = getSocket(namespace);
  if (!s) return;
  if (ack) s.emit(event, payload, ack);
  else s.emit(event, payload);
}

// Helpers spécifiques convenus
export function joinConversation(conversationId: string, namespace?: string) {
  emit(namespace, "conversation:join", { conversationId });
}

export function leaveConversation(conversationId: string, namespace?: string) {
  emit(namespace, "conversation:leave", { conversationId });
}

export function subscribeToNotifications(cb: (n: NotificationData) => void) {
  return subscribe<NotificationData>(undefined, "notification", cb);
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  subscribe,
  emit,
  joinConversation,
  leaveConversation,
  subscribeToNotifications,
};
