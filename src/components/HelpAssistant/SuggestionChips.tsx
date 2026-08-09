/**
 * -------------------------------------------------------
 * SuggestionChips.tsx
 * -------------------------------------------------------
 * Renders quick question suggestion pills.
 * Clicking a chip sends that query directly to Dialogflow.
 * -------------------------------------------------------
 */
import React from "react";
import { Sparkles } from "lucide-react";

interface SuggestionChipsProps {
  suggestions?: string[];
  onSelectSuggestion: (question: string) => void;
  disabled?: boolean;
}

const DEFAULT_SUGGESTIONS = [
  "How do I create a snippet?",
  "How do bookmarks work?",
  "How do I search snippets?",
  "How do I upgrade to PRO?",
];

export const SuggestionChips: React.FC<SuggestionChipsProps> = ({
  suggestions = DEFAULT_SUGGESTIONS,
  onSelectSuggestion,
  disabled = false,
}) => {
  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 px-1">
        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
        <span>Popular Questions</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            disabled={disabled}
            onClick={() => onSelectSuggestion(item)}
            className="text-xs bg-gray-800/90 hover:bg-blue-600/20 text-gray-200 hover:text-blue-300 border border-gray-700 hover:border-blue-500/40 px-3 py-1.5 rounded-full transition-all duration-150 text-left disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs active:scale-97"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;
