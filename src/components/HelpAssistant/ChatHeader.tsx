/**
 * -------------------------------------------------------
 * ChatHeader.tsx
 * -------------------------------------------------------
 * Fixed header for the Help Assistant window.
 * Features title, online indicator badge, minimize, and close actions.
 * -------------------------------------------------------
 */
import React from "react";
import { Bot, Minus, X } from "lucide-react";

interface ChatHeaderProps {
  onClose: () => void;
  onMinimize?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClose, onMinimize }) => {
  return (
    <div className="h-14 bg-gray-900/95 backdrop-blur-md border-b border-gray-800 px-4 flex items-center justify-between shrink-0 select-none">
      {/* Bot Icon & Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          {/* Online Dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5 leading-tight">
            Help Assistant
          </h3>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 leading-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Online
          </span>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-1">
        {onMinimize && (
          <button
            type="button"
            onClick={onMinimize}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Minimize assistant"
          >
            <Minus className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Close assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
