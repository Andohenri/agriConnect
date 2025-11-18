// /messages/useSocketEvents.ts
import { useEffect } from "react";
import { initSocket } from "@/service/socket";


export const useSocketEvents = ({
  currentUserId,
  addTempMessage,
  updateMessagesAsRead,
  loadConversations,
}: {
  currentUserId: string;
  addTempMessage: Function;
  updateMessagesAsRead: Function;
  loadConversations: Function;
}) => {
  useEffect(() => {
    const s = initSocket({ userId: currentUserId });

    // Nouveau message reçu
    const onMessageCreated = (msg: PrismaMessage) => {
      addTempMessage(msg.conversationId, msg.contenu, msg.expediteurId);
      loadConversations();
    };

    // Une conversation a été lue
    const onConversationRead = (data: any) => {
      if (!data) return;
      updateMessagesAsRead(data.conversationId, data.readerId);
    };

    s?.on("message:created", onMessageCreated);
    s?.on("conversation:readed", onConversationRead);

    return () => {
      s?.off("message:created", onMessageCreated);
      s?.off("conversation:readed", onConversationRead);
    };
  }, []);
};
