/**
 * -------------------------------------------------------
 * TypingIndicator.tsx
 * -------------------------------------------------------
 * Displays an animated 3-dot loading indicator (● ● ●)
 * while waiting for Dialogflow response.
 * -------------------------------------------------------
 */
import React from "react";
import { Bot } from "lucide-react";

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-2.5 my-3 animate-in fade-in slide-in-from-left-2 duration-200">
      {/* Bot Avatar */}
      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
        <Bot className="w-4 h-4" />
      </div>

      {/* Typing Bubble */}
      <div className="bg-gray-800 border border-gray-700/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-md flex items-center gap-1.5">
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
