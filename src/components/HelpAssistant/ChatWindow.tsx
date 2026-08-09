/**
 * -------------------------------------------------------
 * ChatWindow.tsx
 * -------------------------------------------------------
 * Main floating assistant window container.
 * Assembles ChatHeader, ChatMessages, and ChatInput using Flexbox layout.
 * Supports Escape key closing and responsive sizing.
 * -------------------------------------------------------
 */
import React, { useEffect } from "react";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages, type Message } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  isLoading?: boolean;
  onSendMessage: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  isOpen,
  onClose,
  messages,
  isLoading = false,
  onSendMessage,
}) => {
  // Listen for Escape key to close assistant
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Help Assistant Chat"
      className="fixed bottom-24 right-3 sm:right-6 z-50 w-[calc(100vw-24px)] sm:w-[400px] h-[70vh] sm:h-[580px] max-h-[600px] bg-gray-900 border border-gray-700/90 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      {/* 1. Fixed Header */}
      <ChatHeader onClose={onClose} onMinimize={onClose} />

      {/* 2. Scrollable Messages Body */}
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
      />

      {/* 3. Fixed Footer Input */}
      <ChatInput onSendMessage={onSendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatWindow;
