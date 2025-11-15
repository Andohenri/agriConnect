import React from "react";
import { Search } from "lucide-react";


interface Props {
  chats: Conversation[];
  selectedId: string | null;
  searchQuery: string;
  currentUserId: string;
  onSearch: (q: string) => void;
  onSelect: (chat: Conversation) => void;
}

const ChatList: React.FC<Props> = ({ chats, selectedId, searchQuery, currentUserId, onSearch, onSelect }) => {
  return (
    <div className={`flex-1 overflow-y-auto`}> 
      <div className="bg-green-600 md:bg-gray-50 text-white md:text-gray-900 p-4 border-b border-green-700 md:border-gray-200 shrink-0">
        <div className="flex items-center justify-between gap-10">
          <h1 className="text-xl font-bold">Messages</h1>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm text-gray-900"
            />
          </div>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <p>Aucune conversation trouvée</p>
        </div>
      ) : (
        chats.map((conv) => {
          const other = conv.participant1?.id === currentUserId ? conv.participant2 : conv.participant1;
          const name = other?.prenom ? `${other.prenom} ${other.nom ?? ""}`.trim() : other?.email ?? "Utilisateur";
          const role = other?.role ?? "";
          const avatar = other?.avatar ?? "👤";
          const lastMessage = conv.dernierMessage?.contenu ?? "";
          const time = conv.dernierMessage?.dateEnvoi ?? conv.dateDerniereActivite;
          const timeStr = time ? new Date(time).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "";

          return (
            <div
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`flex items-center gap-3 p-4 border-b border-gray-100 cursor-pointer transition ${
                selectedId === conv.id
                  ? "bg-green-50 md:border-r-4 md:border-r-green-600"
                  : "hover:bg-gray-50 active:bg-gray-100"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-12 md:w-14 h-12 md:h-14 rounded-full bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-2xl shadow-sm">
                  {avatar}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">{name}</h3>
                  <span className="text-xs text-gray-500 ml-2 shrink-0">{timeStr}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-gray-600 truncate flex-1">{lastMessage}</p>
                  <div className="bg-green-600 text-white text-xs min-w-5 h-5 rounded-full flex items-center justify-center px-2 shrink-0 font-medium">
                    {conv.messagesNonLusP1 + conv.messagesNonLusP2}
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{role}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChatList;
