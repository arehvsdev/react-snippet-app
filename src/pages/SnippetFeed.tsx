import { useState, useEffect } from "react";
import AuthLayout from "../layouts/AuthLayout";
import { CodeSnippet } from "../components/CodeSnippet";
import { getDB } from "../services/dbService";
import { Search } from "lucide-react";

const SnippetFeed = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [snippets, setSnippets] = useState<any[]>([]);

  useEffect(() => {
    // Load snippets from local mock database
    const db = getDB();
    setSnippets(db.snippets || []);
  }, []);

  // Filter snippets based on query (title, language, or tags)
  const filteredSnippets = snippets.filter((snippet) => {
    const query = searchQuery.toLowerCase();
    return (
      snippet.title.toLowerCase().includes(query) ||
      snippet.language.toLowerCase().includes(query) ||
      snippet.tags.some((tag: string) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <AuthLayout>
      <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl shadow-sm p-8 text-gray-900 mt-6">
        {/* Header and Search */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Code Snippets
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            Browse and search through your collection of code snippets
          </p>

          <div className="relative mt-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search snippets by title, language, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Snippets List */}
        <div className="space-y-6">
          {filteredSnippets.length > 0 ? (
            filteredSnippets.map((snippet) => (
              <CodeSnippet
                key={snippet.id}
                title={snippet.title}
                language={snippet.language}
                code={snippet.code}
                description={snippet.description}
                tags={snippet.tags}
              />
            ))
          ) : (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
              <p className="text-gray-500 font-medium">
                No snippets found matching your search
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default SnippetFeed;
