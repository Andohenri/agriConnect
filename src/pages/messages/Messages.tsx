import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Send,
  Smile,
  Search,
} from "lucide-react";

interface Chat {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
}

interface ChatMessages {
  [key: number]: Message[];
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [chatMessages, setChatMessages] = useState<ChatMessages>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const initialChats: Chat[] = [
    {
      id: 1,
      name: "Marie Rasoa",
      role: "Paysan",
      avatar: "👩‍🌾",
      lastMessage: "Le produit est prêt",
      time: "10:30",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "AgriTrade SA",
      role: "Collecteur",
      avatar: "🏢",
      lastMessage: "Quand pouvons-nous récupérer?",
      time: "09:15",
      unread: 0,
      online: true,
    },
    {
      id: 3,
      name: "Jean Rakoto",
      role: "Paysan",
      avatar: "👨‍🌾",
      lastMessage: "Merci pour la commande",
      time: "Hier",
      unread: 0,
      online: false,
    },
    {
      id: 4,
      name: "Sophie Martin",
      role: "Collecteur",
      avatar: "👩‍💼",
      lastMessage: "La livraison est confirmée",
      time: "Hier",
      unread: 0,
      online: false,
    },
  ];

  const [chats, setChats] = useState<Chat[]>(initialChats);

  const initialMessages: ChatMessages = {
    1: [
      {
        id: 1,
        sender: "other",
        text: "Bonjour, est-ce que le riz est toujours disponible?",
        time: "09:00",
      },
      {
        id: 2,
        sender: "me",
        text: "Oui, nous avons 500kg en stock",
        time: "09:05",
      },
    ],
    2: [
      {
        id: 1,
        sender: "other",
        text: "Bonjour, est-ce que le riz est toujours disponible?",
        time: "09:00",
      },
      {
        id: 2,
        sender: "me",
        text: "Oui, nous avons 500kg en stock",
        time: "09:05",
      },
      {
        id: 3,
        sender: "other",
        text: "Parfait! Je voudrais commander 100kg",
        time: "09:10",
      },
      {
        id: 4,
        sender: "me",
        text: "Excellente nouvelle! Je prépare votre commande",
        time: "09:12",
      },
      {
        id: 5,
        sender: "other",
        text: "Quand pouvons-nous récupérer?",
        time: "09:15",
      },
    ],
    3: [
      {
        id: 1,
        sender: "other",
        text: "Merci pour la commande",
        time: "Hier",
      },
    ],
    4: [],
  };

  useEffect(() => {
    setChatMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: Message = {
      id: Date.now(),
      sender: "me",
      text: messageInput,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage],
    }));

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              lastMessage: messageInput,
              time: newMessage.time,
            }
          : chat
      )
    );

    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectChat = (chat: Chat) => {
    setSelectedChat(chat);
    if (chat.unread > 0) {
      setChats((prev) =>
        prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c))
      );
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMessages = selectedChat
    ? chatMessages[selectedChat.id] || []
    : [];

  return (
    <section className="bg-gray-50 overflow-hidden p-0 pt-2">
      <div className="max-w-7xl mx-auto bg-white md:rounded-2xl h-[calc(100vh-64px)] ">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full ">
          {/* Sidebar - Liste des conversations */}
          <div
            className={`${
              selectedChat ? "hidden md:flex" : "flex"
            } md:col-span-4 border-r border-gray-200 flex-col bg-white h-full overflow-hidden`}
          >
            {/* Header */}
            <div className="bg-green-600 md:bg-gray-50 text-white md:text-gray-900 p-4 border-b border-green-700 md:border-gray-200 shrink-0">
              <div className="flex items-center justify-between  gap-10">
                <h1 className="text-xl font-bold">Messages</h1>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 md:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
                  />
                </div>
                {/* <button className="hover:bg-green-700 md:hover:bg-gray-200  rounded-full transition">
                  <MoreVertical size={20} />
                </button> */}
              </div>
            </div>

            {/* Liste des chats */}
            <div className="flex-1 overflow-y-auto">
              {filteredChats.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <p>Aucune conversation trouvée</p>
                </div>
              ) : (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleSelectChat(chat)}
                    className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition ${
                      selectedChat?.id === chat.id
                        ? "bg-green-50 md:border-l-4 md:border-l-green-600"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-12 md:w-14 h-12 md:h-14 rounded-full bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-2xl shadow-sm">
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 md:w-4 h-3 md:h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {chat.name}
                        </h3>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-gray-600 truncate flex-1">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <div className="bg-green-600 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-2 shrink-0 font-medium">
                            {chat.unread}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {chat.role}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Zone de conversation */}
          <div
            className={`${
              !selectedChat ? "hidden md:flex" : "flex"
            } md:col-span-8 flex-col h-full overflow-hidden`}
          >
            {selectedChat ? (
              <>
                {/* Header conversation */}
                <div className="bg-green-600 md:bg-white text-white md:text-gray-900 p-3 md:p-3 border-b md:border-gray-200 flex items-center justify-between shadow-sm shrink-0">
                  <div className="flex items-center gap-3 md:gap-4">
                    <button
                      onClick={() => setSelectedChat(null)}
                      className="md:hidden hover:bg-green-700 p-2 rounded-full transition"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <div className="relative">
                      <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-green-700 md:bg-linear-to-br md:from-green-100 md:to-green-200 flex items-center justify-center text-xl md:text-2xl shadow-sm">
                        {selectedChat.avatar}
                      </div>
                      {selectedChat.online && (
                        <div className="absolute bottom-0 right-0 w-3 md:w-3.5 h-3 md:h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h2 className="font-semibold text-base md:text-lg">
                        {selectedChat.name}
                      </h2>
                      <p className="text-xs md:text-sm text-green-100 md:text-gray-500">
                        {selectedChat.role} •{" "}
                        <span
                          className={
                            selectedChat.online
                              ? "md:text-green-600"
                              : "md:text-gray-400"
                          }
                        >
                          {selectedChat.online ? "En ligne" : "Hors ligne"}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button className="hover:bg-green-700 md:hover:bg-gray-100 p-2 md:p-2.5 rounded-full transition">
                      <Video size={20} className="md:w-[22px] md:h-[22px]" />
                    </button>
                    <button className="hover:bg-green-700 md:hover:bg-gray-100 p-2 md:p-2.5 rounded-full transition">
                      <Phone size={20} className="md:w-[22px] md:h-[22px]" />
                    </button>
                    <button className="hover:bg-green-700 md:hover:bg-gray-100 p-2 md:p-2.5 rounded-full transition">
                      <MoreVertical
                        size={20}
                        className="md:w-[22px] md:h-[22px]"
                      />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div
                  className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 md:bg-gray-50"
                  style={{
                    backgroundColor: "#e5ddd5",
                  }}
                >
                  <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
                    {currentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Send size={28} className="text-gray-400" />
                          </div>
                          <p className="text-sm">Aucun message encore.</p>
                          <p className="text-sm">Commencez la conversation!</p>
                        </div>
                      </div>
                    ) : (
                      currentMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.sender === "me"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`relative max-w-xs md:max-w-lg ${
                              msg.sender === "me"
                                ? "bg-green-600 text-white"
                                : "bg-white text-gray-900"
                            } px-3 md:px-4 py-2 md:py-3 shadow-sm`}
                            style={{
                              borderRadius:
                                msg.sender === "me"
                                  ? "8px 8px 0px 8px"
                                  : "8px 8px 8px 0px",
                            }}
                          >
                            <p className="text-sm leading-relaxed wrap-break-words">
                              {msg.text}
                            </p>
                            <div className="flex items-center justify-end gap-1 md:gap-1.5 mt-1">
                              <span
                                className={`text-xs ${
                                  msg.sender === "me"
                                    ? "text-green-100"
                                    : "text-gray-500"
                                }`}
                              >
                                {msg.time}
                              </span>
                              {msg.sender === "me" && (
                                <svg
                                  width="16"
                                  height="12"
                                  viewBox="0 0 16 12"
                                  fill="none"
                                  className="opacity-70"
                                >
                                  <path
                                    d="M11.5 0L5.5 6L2.5 3L0 5.5L5.5 11L14 2.5L11.5 0Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Input zone */}
                <div className="bg-gray-100 md:bg-white p-3 md:p-4 border-t border-gray-200 shrink-0">
                  <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
                    <div className="flex-1 bg-white md:bg-gray-100 rounded-full flex items-center px-4 py-2 md:py-3 shadow-sm md:shadow-none">
                      <button className="text-gray-500 hover:text-gray-700 mr-2">
                        <Smile size={20} />
                      </button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Écrivez votre message..."
                        className="flex-1 outline-none text-sm bg-transparent"
                      />
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-400">
                  <div className="w-20 md:w-24 h-20 md:h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Send size={36} className="md:w-10 md:h-10 text-gray-400" />
                  </div>
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
