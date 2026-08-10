/**
 * -------------------------------------------------------
 * ChatInput.tsx
 * -------------------------------------------------------
 * Dark-themed input area for sending messages to Dialogflow.
 * Supports Enter to send, Shift+Enter for multiline, and send button states.
 * -------------------------------------------------------
 */
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const submitMessage = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow textarea up to 4 lines
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-800 p-3 shrink-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitMessage();
        }}
        className="flex items-end gap-2"
      >
        <div className="flex-1 bg-gray-950 border border-gray-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 rounded-xl px-3.5 py-2 transition-all">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder="Type your question..."
            className="w-full bg-transparent text-sm text-gray-100 placeholder:text-gray-500 outline-none resize-none no-scrollbar max-h-28 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || disabled}
          aria-label="Send message"
          className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:hover:bg-blue-600 flex items-center justify-center transition-all cursor-pointer disabled:cursor-not-allowed shrink-0 active:scale-95 shadow-md shadow-blue-600/20"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
