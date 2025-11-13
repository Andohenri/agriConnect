// src/api/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

interface NotificationData {
  id?: string;
  titre: string;
  message: string;
  [key: string]: any;
}

/**
 * Initialise le socket avec le userId
 */
export function initSocket(userId: string): Socket | null {
  if (typeof window === "undefined") return null;
  if (socket && socket.connected) return socket;

  const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

  console.log("[SOCKET] Tentative de connexion avec userId =", userId);

  socket = io(url, {
    transports: ["websocket"],
    query: { userId },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[SOCKET] ✅ Connecté au serveur:", socket?.id);
  });

  socket.on("disconnect", (reason : any) => {
    console.log("[SOCKET] 🔴 Déconnecté:", reason);
  });

  socket.on("connect_error", (err :any) => {
    console.error("[SOCKET] ❌ Erreur de connexion:", err.message);
  });

  return socket;
}

/**
 * S’abonner à la réception de notifications
 */
export function subscribeToNotifications(
  cb: (notif: NotificationData) => void
): () => void {
  if (!socket) return () => {};
  socket.on("notification", (notif: NotificationData) => {
    cb(notif);
  });
  return () => socket?.off("notification");
}

/**
 * Déconnecter le socket
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export default {
  initSocket,
  subscribeToNotifications,
  disconnectSocket,
};
