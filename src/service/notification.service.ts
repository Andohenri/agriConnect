import Axios from "@/lib/axiosInstance";

// Même style que ton module Conversations
const BASE = "notifications";

export type NotificationType =
  | "commande"
  | "paiement"
  | "message"
  | "systeme"
  | "alerte";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  titre: string;
  message: string;
  lien?: string | null;
  reference_id?: string | null;
  reference_type?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  notificationId: string;
  lu: boolean;
  dateLecture?: string | null;
  notification: NotificationItem;
}

// --------------------------
// GET — récupérer TOUTES les notifications du user
// --------------------------
const getAll = async (): Promise<UserNotification[]> => {
  const res = await Axios.get(`${BASE}`);
  return res.data as UserNotification[];
};

// --------------------------
// PATCH — marquer une notif comme lue
// --------------------------
const markAsRead = async (userNotificationId: string): Promise<void> => {
  await Axios.patch(`${BASE}/${userNotificationId}/read`);
};

// --------------------------
// PATCH — marquer TOUTES comme lues
// --------------------------
const markAllAsRead = async (): Promise<void> => {
  await Axios.patch(`${BASE}/read-all`);
};


// --------------------------
// Get — count de TOUTES non lues
// --------------------------
const getUnreadCount = async (): Promise<number> => {
  const res = await Axios.get(`${BASE}/unread-count`);
  console.log('Mahefa ',res);
  
  return res.data as number;

};

export default {
  getAll,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
