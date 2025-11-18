import React, { useState, useEffect } from "react";
import ChatList from "@/components/composant/ChatList";
import ChatWindow from "@/components/composant/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import messageService from "@/service/message.service";
import {
  initSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
} from "@/service/socket";

const Messages: React.FC = () => {
  const { user } = useAuth();
  const currentUserId = user?.id ?? "1"; // fallback pour le dev

  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<Conversation[]>([]);
  const [chatMessages, setChatMessages] = useState<
    Record<string, PrismaMessage[]>
  >({});

  useEffect(() => {
    // charger conversations depuis l'API
    (async () => {
      try {
        const convs = await messageService.getConversations();
        if (Array.isArray(convs) && convs.length > 0) setChats(convs);
      } catch (err) {
        console.warn(
          "Impossible de charger les conversations, utilisation des données locales",
          err
        );
      }
    })();

    // initialiser socket
    const s = initSocket({ userId: user?.id });

    const onMessageCreated = (msg: PrismaMessage) => {
      const convId = msg.conversationId ?? "";
      // si conversation affichée -> ajouter au fil
      setChatMessages((prev) => {
        if (!convId) return prev;
        const list = prev[convId] || [];
        return { ...prev, [convId]: [...list, msg] };
      });

      // mettre à jour dernierMessage et compteurs
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          // augmenter compteur pour le destinataire
          const isDestP1 = msg.destinataireId === c.participant1Id;
          const isDestP2 = msg.destinataireId === c.participant2Id;
          return {
            ...c,
            dernierMessage: msg,
            dateDerniereActivite: msg.dateEnvoi,
            messagesNonLusP1: isDestP1
              ? c.messagesNonLusP1 + 1
              : c.messagesNonLusP1,
            messagesNonLusP2: isDestP2
              ? c.messagesNonLusP2 + 1
              : c.messagesNonLusP2,
          } as Conversation;
        })
      );
    };

    const onConversationUpdated = (
      payload: Partial<Conversation> & { id?: string }
    ) => {
      if (!payload.id) return;
      setChats((prev) =>
        prev.map((c) =>
          c.id === payload.id ? ({ ...c, ...payload } as Conversation) : c
        )
      );
    };

    const onConversationRead = (data: any) => {
      if (!data) return;
      const { conversationId, readerId } = data;

      setChatMessages((prev) => {
        const messages = prev[conversationId];
        if (!messages) return prev;

        // mettre tous les messages destinés au lecteur en "lu: true"
        const updatedMessages = messages.map((m) => {
          if (m.destinataireId === readerId) {
            return { ...m, lu: true };
          }
          return m;
        });

        return {
          ...prev,
          [conversationId]: updatedMessages,
        };
      });
    };

    s?.on("message:created", onMessageCreated);
    s?.on("message:updated", onConversationUpdated);
    s?.on("message:readed", onConversationRead);

    return () => {
      s?.off("message:created", onMessageCreated);
      s?.off("message:updated", onConversationUpdated);
      s?.off("message:readed", onConversationRead);
      // ne pas disconnect le socket global si utilisé ailleurs
      // disconnectSocket();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const other =
      selectedChat.participant1?.id === currentUserId
        ? selectedChat.participant2
        : selectedChat.participant1;
    const destinataireId = other?.id ?? "";

    // optimistic UI
    const tempMsg: PrismaMessage = {
      id: Date.now().toString(),
      expediteurId: currentUserId,
      destinataireId,
      contenu: messageInput,
      typeContenu: "texte",
      fichierUrl: null,
      lu: false,
      dateEnvoi: new Date().toISOString(),
      conversationId: selectedChat.id,
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), tempMsg],
    }));
    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              dernierMessage: tempMsg,
              dateDerniereActivite: tempMsg.dateEnvoi,
            }
          : c
      )
    );
    setMessageInput("");

    try {
      await messageService.sendMessage({
        conversationId: selectedChat.id,
        destinataireId,
        contenu: tempMsg.contenu,
        typeContenu: tempMsg.typeContenu,
      });
      // server devrait émettre 'message:created' — reconcile possible
      sendMessage({
        conversationId: selectedChat.id,
        destinataireId,
        contenu: tempMsg.contenu,
        typeContenu: tempMsg.typeContenu,
      });
    } catch (err) {
      console.error("Erreur envoi message", err);
      // TODO: rollback ou marquer erreur
    }
  };

  const handleSelectChat = (chat: Conversation) => {
    // leave previous
    if (selectedChat) leaveConversation(selectedChat.id);
    setSelectedChat(chat);

    // charger l'historique des messages
    (async () => {
      try {
        const msgs = await messageService.getMessages(chat.id);

        setChatMessages((prev) => ({ ...prev, [chat.id]: msgs.messages }));
      } catch (err) {
        console.warn("Impossible de charger messages", err);
      }
    })();

    // rejoindre la room socket
    joinConversation(chat.id);

    // reset unread for current user
    setChats((prev) =>
      prev.map((c) => {
        if (c.id !== chat.id) return c;
        if (c.participant1Id === currentUserId)
          return { ...c, messagesNonLusP1: 0 };
        return { ...c, messagesNonLusP2: 0 };
      })
    );

    // marquer comme lu côté backend si nécessaire
    (async () => {
      try {
        await messageService.markAsRead(chat.id);
      } catch (err) {
        // ignore
      }
    })();
  };

  const matchesQuery = (conv: Conversation, q: string) => {
    const other =
      conv.participant1?.id === currentUserId
        ? conv.participant2
        : conv.participant1;
    let name = "";
    let role = "";
    if (other) {
      const full = `${other.prenom ?? ""} ${other.nom ?? ""}`.trim();
      name = full !== "" ? full : other.email ?? "";
      role = other.role ?? "";
    }
    return (
      name.toLowerCase().includes(q) ||
      role.toLowerCase().includes(q) ||
      (conv.dernierMessage?.contenu ?? "").toLowerCase().includes(q)
    );
  };

  const filteredChats = chats.filter((chat) =>
    matchesQuery(chat, searchQuery.toLowerCase())
  );

  const currentMessages = selectedChat
    ? chatMessages[selectedChat.id] || []
    : [];
console.log(chatMessages);

    

  return (
    <section className="bg-gray-50 overflow-hidden p-0 pt-2">
      <div className=" mx-auto bg-white md:rounded-2xl h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          <div
            className={`${
              selectedChat ? "hidden md:flex" : "flex"
            } md:col-span-4 border-r border-gray-200 flex-col bg-white h-full overflow-hidden`}
          >
            <ChatList
              chats={filteredChats}
              selectedId={selectedChat?.id ?? null}
              searchQuery={searchQuery}
              currentUserId={currentUserId}
              onSearch={setSearchQuery}
              onSelect={handleSelectChat}
            />
          </div>

          <div
            className={`${
              !selectedChat ? "hidden md:flex" : "flex"
            } md:col-span-8 flex-col h-full overflow-hidden`}
          >
            {selectedChat ? (
              <ChatWindow
                selectedChat={selectedChat}
                messages={currentMessages}
                messageValue={messageInput}
                currentUserId={currentUserId}
                onChangeMessage={setMessageInput}
                onSendMessage={handleSendMessage}
                onBack={() => setSelectedChat(null)}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                  <div className="w-20 md:w-24 h-20 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6"></div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-sm text-gray-500 px-4">
                    Choisissez une conversation pour commencer à échanger
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Messages;



