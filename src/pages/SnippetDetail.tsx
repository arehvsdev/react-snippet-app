import { useState } from 'react';
import { Heart, Bookmark, Share2, Copy, Check, MessageCircle, Send } from 'lucide-react';
import { getDB, saveDB } from '../services/dbService';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

interface SnippetDetailProps {
  snippet: {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    tags: string[];
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
  };
}

const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      name: 'Alex Turner',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop'
    },
    content: 'This is really helpful! I\'ve been looking for a clean implementation of this pattern.',
    createdAt: '1 hour ago',
    likes: 5
  },
  {
    id: '2',
    author: {
      name: 'Lisa Park',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'
    },
    content: 'Great snippet! One suggestion - you might want to add cleanup for the timeout in case the component unmounts.',
    createdAt: '30 minutes ago',
    likes: 12
  }
];

export function SnippetDetail({ snippet }: SnippetDetailProps) {
  const [copied, setCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(snippet.isBookmarked);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        author: {
          name: 'John Doe',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop'
        },
        content: newComment,
        createdAt: 'Just now',
        likes: 0
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleToggleBookmark = () => {
    const db = getDB();
    const newBookmarkState = !isBookmarked;
    setIsBookmarked(newBookmarkState);
    
    if (newBookmarkState) {
      db.bookmarks.push({
        id: snippet.id,
        title: snippet.title,
        language: snippet.language,
        description: snippet.description,
        tags: snippet.tags,
        code: snippet.code,
        bookmarkedAt: 'Just now'
      });
      const dbSnippet = db.snippets.find(s => String(s.id) === String(snippet.id));
      if (dbSnippet) dbSnippet.isBookmarked = true;
    } else {
      db.bookmarks = db.bookmarks.filter(b => String(b.id) !== String(snippet.id));
      const dbSnippet = db.snippets.find(s => String(s.id) === String(snippet.id));
      if (dbSnippet) dbSnippet.isBookmarked = false;
    }
    
    saveDB(db);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{snippet.title}</h1>
            <p className="text-gray-400">{snippet.description}</p>
          </div>
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <img
            src={snippet.author.avatar}
            alt={snippet.author.name}
            className="w-12 h-12 rounded-full border-2 border-gray-600"
          />
          <div>
            <p className="font-semibold text-white">{snippet.author.name}</p>
            <p className="text-sm text-gray-400">@{snippet.author.username} • {snippet.createdAt}</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
            {snippet.language}
          </span>
          {snippet.tags.map((tag) => (
            <span key={tag} className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{snippet.likes + (isLiked ? 1 : 0)}</span>
          </button>
          <button
            onClick={handleToggleBookmark}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span>{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Code Block */}
      <div className="mb-8">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
            <span className="text-sm text-gray-400">{snippet.language}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 overflow-x-auto">
            <code className="text-sm text-gray-100">{snippet.code}</code>
          </pre>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-white">
            Comments ({comments.length})
          </h2>
        </div>

        {/* Add Comment */}
        <div className="mb-6">
          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop"
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-white placeholder-gray-500 resize-none"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{comment.author.name}</span>
                    <span className="text-xs text-gray-500">{comment.createdAt}</span>
                  </div>
                  <p className="text-gray-300">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-2 ml-4">
                  <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>{comment.likes}</span>
                  </button>
                  <button className="text-sm text-gray-400 hover:text-white transition-colors">
                    Reply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
