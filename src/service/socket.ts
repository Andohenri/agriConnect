import { io, Socket } from "socket.io-client";

/**
 * Socket client minimal aligné avec votre backend NestJS
 * - Pas de namespace ni de path par défaut
 * - Le serveur attend `userId` dans `handshake.query` (comme dans `BaseGateway`)
 * - Evénements côté serveur :
 *    - client -> server: 'sendMessage' (payload conforme à MessagePayload)
 *    - server -> client: 'newMessage' (payload message)
 *    - server -> client: 'notification' (pour notifications)
 *
 * Variables d'environnement :
 *  - VITE_API_WS_URL (ex: http://localhost:3000)
 *  - VITE_API_WS_PATH (facultatif si vous avez customisé le path côté serveur)
 *  - VITE_DEBUG_SOCKETS (any) -> active les logs debug
 */

type InitOptions = {
  userId?: string; // required by your BaseGateway (handshake.query.userId)
  token?: string; // optional (if you later migrate to auth via token)
  path?: string; // optional custom socket.io path
  autoConnect?: boolean;
};

const DEBUG = !!import.meta.env.VITE_DEBUG_SOCKETS;
let socket: Socket | null = null;

const log = (...args: any[]) => {
  if (DEBUG) console.debug("[SOCKET]", ...args);
};

export function initSocket(options: InitOptions = {}) {
  if (typeof window === "undefined") return null;
  const { userId, token, path, autoConnect = true } = options;

  if (socket && socket.connected) return socket;

  const base = (import.meta.env.VITE_API_WS_URL as string) || window.location.origin;
  
  const socketPath = path ?? (import.meta.env.VITE_API_WS_PATH as string) ?? undefined;

  log("initSocket", { base, socketPath, userId, tokenProvided: !!token });

  socket = io(base, {
    transports: ["websocket"],
    auth: token ? { token } : undefined,
    query: userId ? { userId } : undefined,
    path: socketPath,
    autoConnect,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => log("connected", socket?.id));
  socket.on("disconnect", (reason) => log("disconnect", reason));
  socket.on("connect_error", (err: any) => {
    console.error("[SOCKET] connect_error", err?.message ?? err);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export function subscribe<T = any>(event: string, cb: (payload: T) => void) {
  if (!socket) return () => {};
  const handler = (p: T) => cb(p);
  socket.on(event, handler);
  return () => socket?.off(event, handler);
}

export function emit(event: string, payload?: any, ack?: (...args: any[]) => void) {
  if (!socket) return;
  if (ack) socket.emit(event, payload, ack);
  else socket.emit(event, payload);
}

// Convenience helpers matching your backend
export function sendMessage(payload: any, ack?: (...args: any[]) => void) {
  emit("sendMessage", payload, ack);
}

export function subscribeToNewMessage(cb: (m: any) => void) {
  return subscribe("newMessage", cb);
}

export function subscribeToNotifications(cb: (n: any) => void) {
  return subscribe("notification", cb);
}

export function joinConversation(conversationId: string) {
  emit("conversation:join", { conversationId });
}

export function leaveConversation(conversationId: string) {
  emit("conversation:leave", { conversationId });
}

export default {
  initSocket,
  getSocket,
  disconnectSocket,
  subscribe,
  emit,
  sendMessage,
  subscribeToNewMessage,
  subscribeToNotifications,
  joinConversation,
  leaveConversation,
};
