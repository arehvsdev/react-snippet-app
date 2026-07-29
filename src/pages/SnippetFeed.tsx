import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Eye } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { SnippetDetail } from './SnippetDetail';
import { Layout } from './Layout';
import { getSnippets } from '../services/snippetService';

export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  visibility: 'public' | 'private';
  author: {
    name: string;
    avatar: string;
    username: string;
  };
  createdAt: string;
  likes: number;
  comments: number;
  views: number;
  isBookmarked: boolean;
}

export function SnippetFeed() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>();

  useEffect(() => {
    const loadSnippets = async () => {
      try {
        const data = await getSnippets();
        setSnippets(data);
        if (data.length > 0) {
          setSelectedSnippet(data[0]);
        }
      } catch (err) {
        console.error("Failed to load snippets:", err);
      }
    };
    loadSnippets();
  }, []);

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar activeCategory={activeCategory} onCategorySelect={setActiveCategory} />

        {/* Snippet List */}
        <div className="w-96 bg-gray-800 border-r border-gray-700">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Recent Snippets</h2>
            <div className="space-y-3">
              {snippets.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => setSelectedSnippet(snippet)}
                  className={`w-full text-left p-4 rounded-lg transition-colors ${selectedSnippet?.id === snippet.id
                      ? 'bg-gray-700 border-l-4 border-blue-500'
                      : 'bg-gray-800/50 hover:bg-gray-700'
                    }`}
                >
                  {/* Author Info */}
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={snippet.author.avatar}
                      alt={snippet.author.name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-400">{snippet.author.name}</span>
                    <span className="text-xs text-gray-500">• {snippet.createdAt}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white mb-1 line-clamp-2">
                    {snippet.title}
                  </h3>

                  {/* Language Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                      {snippet.language}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {snippet.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {snippet.comments}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {snippet.views}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 bg-gray-900">
          {selectedSnippet ? (
            <SnippetDetail snippet={selectedSnippet} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {/* <Code2 className="w-16 h-16 text-gray-600 mx-auto mb-4" /> */}
                <p className="text-gray-400 text-lg">Select a snippet to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
