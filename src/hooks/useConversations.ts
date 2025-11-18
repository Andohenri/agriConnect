// /messages/useConversations.ts
import { useState } from "react";
import messageService from "@/service/message.service";

export const useConversations = (currentUserId: string) => {
  const [chats, setChats] = useState<Conversation[]>([]);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Charger toutes les conversations depuis l’API
  const loadConversations = async () => {
    try {
      const convs = await messageService.getConversations();
      if (Array.isArray(convs)) setChats(convs);
    } catch {
      console.warn("Impossible de charger conversations");
    }
  };

  // Sélection d’une conversation
  const selectChat = (chat: Conversation | null) => {
    setSelectedChat(chat);
  };

  // Remettre à zéro messages non lus pour l’utilisateur
  const resetUnreadCount = (conversationId: string, userId: string) => {
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;

        if (c.participant1Id === userId)
          return { ...c, messagesNonLusP1: 0 };

        return { ...c, messagesNonLusP2: 0 };
      })
    );
  };

  // Recherche de conversation
  const matchesQuery = (conv: Conversation, q: string) => {
    const other =
      conv.participant1?.id === currentUserId
        ? conv.participant2
        : conv.participant1;

    if (!other) return false;

    const full = `${other.prenom ?? ""} ${other.nom ?? ""}`.trim();
    const name = full || other.email || "";
    const role = other.role || "";
    const lastMsg = conv.dernierMessage?.contenu || "";

    return (
      name.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q) ||
      lastMsg.toLowerCase().includes(q)
    );
  };

  const filteredChats = chats.filter((c) =>
    matchesQuery(c, searchQuery.toLowerCase())
  );

  return {
    chats,
    filteredChats,
    selectedChat,
    searchQuery,
    setSearchQuery,
    selectChat,
    resetUnreadCount,
    loadConversations,
  };
};
