import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";


interface Props {
  selectedChat: Conversation | null;
  messages: PrismaMessage[];
  messageValue: string;
  currentUserId: string;
  onChangeMessage: (v: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
}

const ChatWindow: React.FC<Props> = ({ selectedChat, messages, messageValue, currentUserId, onChangeMessage, onSendMessage, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  if (!selectedChat) return null;

  const other = selectedChat.participant1?.id === currentUserId ? selectedChat.participant2 : selectedChat.participant1;
  const name = other?.prenom ? `${other.prenom} ${other.nom ?? ""}`.trim() : other?.email ?? "Utilisateur";
  const avatar = other?.avatar ?? "👤";
  const lastActive = selectedChat.dateDerniereActivite;

  return (
    <>
      <div className="bg-green-600 md:bg-white text-white md:text-gray-900 p-3 md:p-3 border-b md:border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="md:hidden hover:bg-green-700 p-2 rounded-full transition">
            <ArrowLeft size={20} />
          </button>
          <div className="relative">
            <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-green-700 md:bg-linear-to-br md:from-green-100 md:to-green-200 flex items-center justify-center text-xl md:text-2xl shadow-sm">
              {avatar}
            </div>
          </div>
          <div>
            <h2 className="font-semibold text-base md:text-lg">{name}</h2>
            <p className="text-xs md:text-sm text-green-100 md:text-gray-500">Dernière activité: {lastActive ? new Date(lastActive).toLocaleString() : "-"}</p>
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
            <MoreVertical size={20} className="md:w-[22px] md:h-[22px]" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 md:bg-gray-50" style={{ backgroundColor: "#e5ddd5" }}>
        <div className="max-w-4xl mx-auto space-y-3 md:space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
                </div>
                <p className="text-sm">Aucun message encore.</p>
                <p className="text-sm">Commencez la conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} currentUserId={currentUserId} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput value={messageValue} onChange={onChangeMessage} onSend={onSendMessage} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }} />
    </>
  );
};

export default ChatWindow;
