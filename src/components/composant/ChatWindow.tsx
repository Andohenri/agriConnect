import React, { useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { ArrowLeft, Phone, Video, MoreVertical } from "lucide-react";

export interface Chat {
  id: number;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
}

interface Props {
  selectedChat: Chat | null;
  messages: Message[];
  messageValue: string;
  onChangeMessage: (v: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
}

const ChatWindow: React.FC<Props> = ({ selectedChat, messages, messageValue, onChangeMessage, onSendMessage, onBack }) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  if (!selectedChat) return null;

  return (
    <>
      <div className="bg-green-600 md:bg-white text-white md:text-gray-900 p-3 md:p-3 border-b md:border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="md:hidden hover:bg-green-700 p-2 rounded-full transition">
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
            <h2 className="font-semibold text-base md:text-lg">{selectedChat.name}</h2>
            <p className="text-xs md:text-sm text-green-100 md:text-gray-500">
              {selectedChat.role} • <span className={selectedChat.online ? "md:text-green-600" : "md:text-gray-400"}>{selectedChat.online ? "En ligne" : "Hors ligne"}</span>
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
            messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput value={messageValue} onChange={onChangeMessage} onSend={onSendMessage} onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSendMessage(); } }} />
    </>
  );
};

export default ChatWindow;
