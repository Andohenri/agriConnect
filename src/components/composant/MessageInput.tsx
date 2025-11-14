import React from "react";
import { Smile, Send } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const MessageInput: React.FC<Props> = ({ value, onChange, onSend, onKeyPress }) => {
  return (
    <div className="bg-gray-100 md:bg-white p-3 md:p-4 border-t border-gray-200 shrink-0">
      <div className="max-w-4xl mx-auto flex items-end gap-2 md:gap-3">
        <div className="flex-1 bg-white md:bg-gray-100 rounded-full flex items-center px-4 py-2 md:py-3 shadow-sm md:shadow-none">
          <button className="text-gray-500 hover:text-gray-700 mr-2">
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder="Écrivez votre message..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        </div>
        <button
          onClick={onSend}
          disabled={!value.trim()}
          className="bg-green-600 text-white p-3 rounded-full hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
