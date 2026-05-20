import { useState } from "react";
import { Check, Copy } from "lucide-react";
import toast from "react-hot-toast";

interface CodeSnippetProps {
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export const CodeSnippet = ({
  title,
  language,
  code,
  description,
  tags,
}: CodeSnippetProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code.");
    }
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-6 text-gray-900 transition-all hover:shadow-md">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">{description}</p>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Copy Code"
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Content Section */}
      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Language Chip */}
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-blue-500 text-blue-600 bg-blue-50">
            {language}
          </span>
          {/* Tag Chips */}
          {tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-200 text-gray-600 bg-gray-50"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Code Block */}
        <pre className="bg-[#0b1329] text-gray-100 p-5 rounded-xl overflow-x-auto border border-[#1b2b47] shadow-inner font-mono text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
