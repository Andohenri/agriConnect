import React from "react";

interface Message {
  id: number;
  sender: "me" | "other";
  text: string;
  time: string;
}

interface Props {
  msg: Message;
}

const MessageBubble: React.FC<Props> = ({ msg }) => {
  const isMe = msg.sender === "me";
  return (
    <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-xs md:max-w-lg ${
          isMe ? "bg-green-600 text-white" : "bg-white text-gray-900"
        } px-3 md:px-4 py-2 md:py-3 shadow-sm`}
        style={{
          borderRadius: isMe ? "8px 8px 0px 8px" : "8px 8px 8px 0px",
        }}
      >
        <p className="text-sm leading-relaxed wrap-break-word">{msg.text}</p>
        <div className="flex items-center justify-end gap-1 md:gap-1.5 mt-1">
          <span className={`text-xs ${isMe ? "text-green-100" : "text-gray-500"}`}>
            {msg.time}
          </span>
          {isMe && (
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" className="opacity-70">
              <path d="M11.5 0L5.5 6L2.5 3L0 5.5L5.5 11L14 2.5L11.5 0Z" fill="currentColor" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
