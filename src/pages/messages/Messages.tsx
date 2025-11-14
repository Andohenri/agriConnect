import React, { useState, useEffect } from "react";
import ChatList from "@/components/composant/ChatList";
import ChatWindow from "@/components/composant/ChatWindow";
import type { Chat as ChatItem } from "@/components/composant/ChatList";
import type { Message as Msg } from "@/components/composant/ChatWindow";

const Messages: React.FC = () => {
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<number, Msg[]>>({});

  const initialChats: ChatItem[] = [
    { id: 1, name: "Marie Rasoa", role: "Paysan", avatar: "👩‍🌾", lastMessage: "Le produit est prêt", time: "10:30", unread: 2, online: true },
    { id: 2, name: "AgriTrade SA", role: "Collecteur", avatar: "🏢", lastMessage: "Quand pouvons-nous récupérer?", time: "09:15", unread: 0, online: true },
    { id: 3, name: "Jean Rakoto", role: "Paysan", avatar: "👨‍🌾", lastMessage: "Merci pour la commande", time: "Hier", unread: 0, online: false },
    { id: 5, name: "Jean Rakoto", role: "Paysan", avatar: "👨‍🌾", lastMessage: "Merci pour la commande", time: "Hier", unread: 0, online: false },
    { id: 6, name: "Jean Rakoto", role: "Paysan", avatar: "👨‍🌾", lastMessage: "Merci pour la commande", time: "Hier", unread: 0, online: false },
    { id: 4, name: "Sophie Martin", role: "Collecteur", avatar: "👩‍💼", lastMessage: "La livraison est confirmée", time: "Hier", unread: 0, online: false },
    { id: 7, name: "Sophie Martin", role: "Collecteur", avatar: "👩‍💼", lastMessage: "La livraison est confirmée", time: "Hier", unread: 0, online: false },
    { id: 8, name: "Sophie Martin", role: "Collecteur", avatar: "👩‍💼", lastMessage: "La livraison est confirmée", time: "Hier", unread: 0, online: false },
  ];

  const initialMessages: Record<number, Msg[]> = {
    1: [ { id: 1, sender: "other", text: "Bonjour, est-ce que le riz est toujours disponible?", time: "09:00" }, { id: 2, sender: "me", text: "Oui, nous avons 500kg en stock", time: "09:05" } ],
    2: [ { id: 1, sender: "other", text: "Bonjour, est-ce que le riz est toujours disponible?", time: "09:00" }, { id: 2, sender: "me", text: "Oui, nous avons 500kg en stock", time: "09:05" }, { id: 3, sender: "other", text: "Parfait! Je voudrais commander 100kg", time: "09:10" }, { id: 4, sender: "me", text: "Excellente nouvelle! Je prépare votre commande", time: "09:12" }, { id: 5, sender: "other", text: "Quand pouvons-nous récupérer?", time: "09:15" } ],
    3: [ { id: 1, sender: "other", text: "Merci pour la commande", time: "Hier" } ],
    4: [],
  };

  useEffect(() => {
    setChats(initialChats);
    setChatMessages(initialMessages);
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;
    const newMessage: Msg = { id: Date.now(), sender: "me", text: messageInput, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setChatMessages((prev) => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage] }));
    setChats((prev) => prev.map((c) => c.id === selectedChat.id ? { ...c, lastMessage: messageInput, time: newMessage.time } : c ));
    setMessageInput("");
  };

  const handleSelectChat = (chat: ChatItem) => {
    setSelectedChat(chat);
    if (chat.unread > 0) setChats((prev) => prev.map((c) => c.id === chat.id ? { ...c, unread: 0 } : c));
  };

  const filteredChats = chats.filter((chat) => chat.name.toLowerCase().includes(searchQuery.toLowerCase()) || chat.role.toLowerCase().includes(searchQuery.toLowerCase()));
  const currentMessages = selectedChat ? chatMessages[selectedChat.id] || [] : [];

  return (
    <section className="bg-gray-50 overflow-hidden p-0 pt-2">
      <div className="max-w-7xl mx-auto bg-white md:rounded-2xl h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          <div className={`${selectedChat ? "hidden md:flex" : "flex"} md:col-span-4 border-r border-gray-200 flex-col bg-white h-full overflow-hidden`}>
            <ChatList chats={filteredChats} selectedId={selectedChat?.id ?? null} searchQuery={searchQuery} onSearch={setSearchQuery} onSelect={handleSelectChat} />
          </div>

          <div className={`${!selectedChat ? "hidden md:flex" : "flex"} md:col-span-8 flex-col h-full overflow-hidden`}>
            {selectedChat ? (
              <ChatWindow selectedChat={selectedChat} messages={currentMessages} messageValue={messageInput} onChangeMessage={setMessageInput} onSendMessage={handleSendMessage} onBack={() => setSelectedChat(null)} />
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                  <div className="w-20 md:w-24 h-20 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-gray-600 mb-2">Sélectionnez une conversation</h3>
                  <p className="text-sm text-gray-500 px-4">Choisissez une conversation pour commencer à échanger</p>
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
