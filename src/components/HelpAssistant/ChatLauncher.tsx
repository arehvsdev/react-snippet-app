/**
 * -------------------------------------------------------
 * ChatLauncher.tsx
 * -------------------------------------------------------
 * Floating Action Button launcher for the Help Assistant.
 * Replaces default Dialogflow orange cube branding with CodeSnippets blue launcher.
 * -------------------------------------------------------
 */
import React from "react";
import { Bot, X } from "lucide-react";

interface ChatLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const ChatLauncher: React.FC<ChatLauncherProps> = ({ isOpen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isOpen ? "Close help assistant" : "Open help assistant"}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-600/35 ring-4 ring-blue-500/15 flex items-center justify-center transition-all duration-200 hover:scale-108 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
    >
      <div className="relative flex items-center justify-center">
        {isOpen ? (
          <X className="w-6 h-6 transition-transform duration-200 rotate-0 hover:rotate-90" />
        ) : (
          <>
            <Bot className="w-6 h-6 transition-transform duration-200" />
            {/* Online Badge */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-gray-900 rounded-full"></span>
          </>
        )}
      </div>
    </button>
  );
};

export default ChatLauncher;
