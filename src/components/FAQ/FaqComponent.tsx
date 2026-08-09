/**
 * -------------------------------------------------------
 * FaqComponent.tsx
 * -------------------------------------------------------
 * Standalone FAQ Component.
 * Completely separate from Dialogflow.
 * Renders categorized accordions, search filter, and instant FAQ answers.
 * -------------------------------------------------------
 */
import React, { useState } from "react";
import { Search, ChevronDown, HelpCircle, X, Code2, Bookmark, Sparkles, UserCheck } from "lucide-react";

interface FAQItem {
  id: string;
  category: "General" | "Snippets" | "PRO & Pricing" | "Account";
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: "1",
    category: "Snippets",
    question: "How do I create a code snippet?",
    answer: "Click the '+ Create' button in the top navigation bar. Enter a title, select the programming language, paste your code, add optional tags and description, then choose Public or Private visibility.",
  },
  {
    id: "2",
    category: "Snippets",
    question: "How do bookmarks work?",
    answer: "Click the Bookmark icon on any public snippet card to save it to your library. You can view all saved snippets in the 'Bookmarks' tab or from your Profile.",
  },
  {
    id: "3",
    category: "PRO & Pricing",
    question: "How do I upgrade to PRO?",
    answer: "Click 'Subscription' or 'Pricing' in the navigation bar, then click 'Upgrade to PRO'. Complete the payment via Razorpay to instantly unlock unlimited private snippets, PRO badges, and custom themes for ₹199/month.",
  },
  {
    id: "4",
    category: "Snippets",
    question: "What is a private snippet?",
    answer: "Private snippets are visible only to you. FREE plan members can create up to 3 snippets total and 5 private snippets, while PRO members get unlimited private storage.",
  },
  {
    id: "5",
    category: "General",
    question: "How do I search for snippets?",
    answer: "Use the global search bar on the Home feed ('/snippet-feed') to search snippets by title, language, description, or author username. You can also filter by categories from the sidebar.",
  },
  {
    id: "6",
    category: "Account",
    question: "How do I change my profile information or password?",
    answer: "Click your header avatar, select 'Settings' to update your full name, bio, or phone number. Select 'Change Password' to update your account password.",
  },
];

interface FaqComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaqComponent: React.FC<FaqComponentProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>("1");

  if (!isOpen) return null;

  const categories = ["All", "Snippets", "PRO & Pricing", "General", "Account"];

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
              <p className="text-xs text-gray-400">Quick answers to common questions about SnipForge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
            aria-label="Close FAQ modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-6 pb-2 space-y-4 border-b border-gray-700/60 bg-gray-800/90 shrink-0">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder:text-gray-500 outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "bg-gray-900/60 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-700/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-gray-400 space-y-2">
              <HelpCircle className="w-8 h-8 text-gray-500 mx-auto" />
              <p className="text-sm font-semibold">No questions found matching your search</p>
              <p className="text-xs text-gray-500">Try searching for different keywords or select 'All'.</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div
                  key={item.id}
                  className="bg-gray-900/60 border border-gray-700/70 rounded-xl overflow-hidden transition-all duration-150"
                >
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-700/30 transition-colors cursor-pointer"
                  >
                    <span className="text-sm font-semibold text-gray-200 pr-4">{item.question}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                        isExpanded ? "rotate-180 text-blue-400" : ""
                      }`}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 text-xs text-gray-300 leading-relaxed border-t border-gray-800/80 animate-in fade-in duration-150">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaqComponent;
