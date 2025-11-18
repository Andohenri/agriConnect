// /messages/useChatMessages.ts
import { useState } from "react";
import messageService from "@/service/message.service";

export const useChatMessages = () => {
  const [chatMessages, setChatMessages] = useState<
    Record<string, PrismaMessage[]>
  >({});

  // Charger les messages d'une conversation
  const loadMessages = async (conversationId: string) => {
    try {
      const res = await messageService.getMessages(conversationId);
      setChatMessages((prev) => ({
        ...prev,
        [conversationId]: res.messages,
      }));
    } catch {
      console.warn("Impossible de charger messages");
    }
  };

  // Ajouter un message en local (optimistic UI)
  const addTempMessage = (
    conversationId: string,
    content: string,
    senderId: string
  ) => {
    const tempMsg: PrismaMessage = {
      id: Date.now().toString(),
      conversationId,
      expediteurId: senderId,
      destinataireId: "",
      contenu: content,
      typeContenu: "texte",
      fichierUrl: null,
      lu: false,
      dateEnvoi: new Date().toISOString(),
    };

    setChatMessages((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), tempMsg],
    }));
  };

  // Marquer messages comme lus (pour une seule conversation)
  const updateMessagesAsRead = (conversationId: string, readerId: string) => {
    setChatMessages((prev) => {
      const msgs = prev[conversationId];
      if (!msgs) return prev;

      const updated = msgs.map((m) =>
        m.destinataireId === readerId ? { ...m, lu: true } : m
      );

      return { ...prev, [conversationId]: updated };
    });
  };

  return {
    chatMessages,
    loadMessages,
    addTempMessage,
    updateMessagesAsRead,
  };
};
