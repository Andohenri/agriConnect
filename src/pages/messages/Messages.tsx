import React from "react";
import { MessageSquare, Phone, Search, Send, User, X } from "lucide-react";
import { useMediaQuery } from "react-responsive";

const Messages = () => {
  const [selectedChat, setSelectedChat] = React.useState<any>(null);
  const [messageInput, setMessageInput] = React.useState<string>("");
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  const chats = [
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
  ];

  const messages = [
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
  ];

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 h-full">
          {/* Liste des conversations */}
          <div
            className={`${
              isMobile && selectedChat ? "hidden" : "block"
            } border-r border-gray-50`}
          >
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="font-bold text-lg">Messages</h3>
              <div className="relative mt-3">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
            </div>
            <div className="overflow-y-auto h-[calc(100%-120px)]">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition ${
                    selectedChat?.id === chat.id ? "bg-green-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <div className="text-3xl">{chat.avatar}</div>
                      {chat.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm">{chat.name}</h4>
                          <p className="text-xs text-gray-500">{chat.role}</p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {chat.lastMessage}
                      </p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone de conversation */}
          <div
            className={`${
              isMobile && !selectedChat ? "hidden" : "block"
            } md:col-span-2 flex flex-col`}
          >
            {selectedChat ? (
              <>
                <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button onClick={() => setSelectedChat(null)}>
                        <X size={24} />
                      </button>
                    )}
                    <div className="text-3xl">{selectedChat.avatar}</div>
                    <div>
                      <h4 className="font-semibold">{selectedChat.name}</h4>
                      <p className="text-xs text-green-600">
                        {selectedChat.online ? "● En ligne" : "Hors ligne"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-200 rounded-full">
                      <Phone size={20} />
                    </button>
                    <button className="p-2 hover:bg-gray-200 rounded-full">
                      <User size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "me" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md ${
                          msg.sender === "me"
                            ? "bg-green-600 text-white"
                            : "bg-white"
                        } rounded-2xl px-4 py-3 shadow`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender === "me"
                              ? "text-green-100"
                              : "text-gray-400"
                          }`}
                        >
                          {msg.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-50 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition">
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <MessageSquare
                    size={64}
                    className="mx-auto mb-4 opacity-50"
                  />
                  <p>Sélectionnez une conversation</p>
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
