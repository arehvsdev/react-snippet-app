/**
 * -------------------------------------------------------
 * ChatMessages.tsx
 * -------------------------------------------------------
 * Scrollable message container. Renders welcome screen, message bubbles,
 * timestamps, suggestion chips, and typing indicators.
 * -------------------------------------------------------
 */
import React, { useEffect, useRef } from "react";
import { Bot, User as UserIcon, Code2, Search, FolderTree, Bookmark, Sparkles, UserCheck } from "lucide-react";
import { TypingIndicator } from "./TypingIndicator";

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
}

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

const TOPICS = [
  { icon: Code2, label: "Code Snippets" },
  { icon: Search, label: "Search" },
  { icon: FolderTree, label: "Categories" },
  { icon: Bookmark, label: "Bookmarks" },
  { icon: Sparkles, label: "Subscription" },
  { icon: UserCheck, label: "Account" },
];

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  isLoading = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or typing state change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 text-sm custom-scrollbar bg-gray-900/60"
    >
      {/* Welcome Screen / Empty State */}
      <div className="bg-gray-800/80 border border-gray-700/70 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white leading-tight">Hello 👋</h4>
            <p className="text-xs text-gray-400">Welcome to SnipForge Help Assistant!</p>
          </div>
        </div>

        <p className="text-xs text-gray-300">I can help you with:</p>

        {/* Feature Topic Pills */}
        <div className="grid grid-cols-2 gap-1.5">
          {TOPICS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-900/50 border border-gray-700/50 text-xs text-gray-300"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Message History */}
      {messages.map((msg) => {
        const isUser = msg.sender === "user";
        return (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"} animate-in fade-in slide-in-from-bottom-1 duration-150`}
          >
            {/* Avatar */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-xs mt-0.5 ${
                isUser ? "bg-gray-700 text-gray-300" : "bg-gradient-to-tr from-blue-600 to-indigo-600 text-white"
              }`}
            >
              {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Bubble & Timestamp */}
            <div className={`max-w-[78%] space-y-1 ${isUser ? "text-right" : "text-left"}`}>
              <div
                className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap shadow-xs ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-xs"
                    : "bg-gray-800 border border-gray-700/80 text-gray-100 rounded-tl-xs"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-500 px-1 inline-block">{msg.timestamp}</span>
            </div>
          </div>
        );
      })}

      {/* Typing Indicator */}
      {isLoading && <TypingIndicator />}
    </div>
  );
};

export default ChatMessages;
