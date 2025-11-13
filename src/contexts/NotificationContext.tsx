// src/context/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  initSocket,
  subscribeToNotifications,
  disconnectSocket,
} from "@/service/socket";
import { toast } from "sonner";

export interface Notification {
  id?: string;
  titre: string;
  message: string;
  [key: string]: any;
}

interface NotificationContextType {
  notifications: Notification[];
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
});

export const useNotifications = () => useContext(NotificationContext);

interface NotificationProviderProps {
  userId: string;
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  userId,
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!userId) return;

    console.log("[CONTEXT] Initialisation du socket pour userId:", userId);
    const socket = initSocket(userId);

    console.log("socket context :", socket);

    const unsubscribe = subscribeToNotifications((notif: any) => {
      console.log("[CONTEXT] Nouvelle notification:", notif);
      setNotifications((prev) => [notif, ...prev]);
      toast.message(`📩 ${notif.titre}`, {
        // description facultative
        description: notif.message,
        action: notif.link
          ? {
              label: "Voir",
              onClick: () => {
                window.location.href = notif.link; // ouvre le lien de la notification
              },
            }
          : undefined,
      });

      console.log(`📩 ${notif.titre}`);
    });

    return () => {
      unsubscribe();
      disconnectSocket();
    };
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};
