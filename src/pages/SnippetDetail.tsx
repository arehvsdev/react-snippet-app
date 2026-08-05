import { useState, useEffect } from 'react';
import { Heart, Bookmark, Copy, Check, MessageCircle, Send, Trash2, Pencil, Globe, Lock } from 'lucide-react';
import { useAuth } from '../layouts/AuthContext';
import { toggleBookmarkInDB, saveCommentToDB, getComments, toggleSnippetLikeInDB, toggleCommentLikeInDB, updateCommentInDB, deleteCommentInDB } from '../services/snippetService';
import toast from 'react-hot-toast';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
    username?: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string;
}

interface SnippetDetailProps {
  snippet: {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    tags: string[];
    visibility?: 'public' | 'private';
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
    isLiked?: boolean;
    bookmarksCount?: number;
  };
}

export function SnippetDetail({ snippet }: SnippetDetailProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [likesCount, setLikesCount] = useState(snippet.likes);
  const [isLiked, setIsLiked] = useState(snippet.isLiked || false);
  const [isBookmarked, setIsBookmarked] = useState(snippet.isBookmarked || false);
  const [, setBookmarksCount] = useState(snippet.bookmarksCount || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [commentPagination, setCommentPagination] = useState({ totalPages: 1, totalItems: 0, currentPage: 1 });
  const [loadingComments, setLoadingComments] = useState(false);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const isOwner = user && user.username && snippet.author?.username === user.username;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const savedComment = await saveCommentToDB(snippet.id, newComment);
        setComments([savedComment, ...comments]);
        setNewComment('');
        // Increment comments total count locally
        setCommentPagination(prev => ({
          ...prev,
          totalItems: prev.totalItems + 1
        }));
        toast.success("Comment added successfully!");
      } catch (err: any) {
        toast.error(err.message || 'Failed to add comment');
      }
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error("Please login to like snippets.");
      return;
    }
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => prev + (nextLiked ? 1 : -1));

    try {
      const res = await toggleSnippetLikeInDB(snippet.id);
      setIsLiked(res.liked);
      setLikesCount(res.likes);
    } catch (err: any) {
      setIsLiked(!nextLiked);
      setLikesCount(prev => prev + (nextLiked ? -1 : 1));
      toast.error(err.message || 'Failed to toggle like');
    }
  };

  const handleToggleCommentLike = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like comments.");
      return;
    }

    let originalComment: Comment | undefined;
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        originalComment = { ...c };
        const nextLiked = !c.isLiked;
        return {
          ...c,
          isLiked: nextLiked,
          likes: c.likes + (nextLiked ? 1 : -1)
        };
      }
      return c;
    }));

    try {
      const res = await toggleCommentLikeInDB(commentId);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            isLiked: res.liked,
            likes: res.likes
          };
        }
        return c;
      }));
    } catch (err: any) {
      if (originalComment) {
        setComments(prev => prev.map(c => (c.id === commentId ? originalComment! : c)));
      }
      toast.error(err.message || 'Failed to like comment');
    }
  };

  const handleToggleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark snippets.");
      return;
    }
    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    setBookmarksCount(prev => prev + (nextBookmarked ? 1 : -1));

    try {
      const res = await toggleBookmarkInDB(snippet.id);
      setIsBookmarked(res.bookmarked);
      setBookmarksCount(res.bookmarksCount);
      toast.success(res.bookmarked ? "Snippet saved to bookmarks!" : "Snippet removed from bookmarks.");
    } catch (err: any) {
      setIsBookmarked(!nextBookmarked);
      setBookmarksCount(prev => prev + (nextBookmarked ? -1 : 1));
      toast.error(err.message || 'Failed to toggle bookmark');
    }
  };

  const handleAddReply = async (parentId: string) => {
    if (!replyContent.trim()) return;
    try {
      const savedReply = await saveCommentToDB(snippet.id, replyContent, parentId);
      setComments(prev => [...prev, savedReply]);
      setReplyContent('');
      setReplyingTo(null);
      setCommentPagination(prev => ({
        ...prev,
        totalItems: prev.totalItems + 1
      }));
      toast.success("Reply added successfully!");
    } catch (err: any) {
      toast.error(err.message || 'Failed to add reply');
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const updated = await updateCommentInDB(commentId, editContent);
      setComments(prev => prev.map(c => (c.id === commentId ? { ...c, content: updated.content } : c)));
      setEditingCommentId(null);
      setEditContent('');
      toast.success("Comment updated successfully!");
    } catch (err: any) {
      toast.error(err.message || 'Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment? This will also delete any replies.")) return;
    try {
      await deleteCommentInDB(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId && c.parentId !== commentId));
      const deletedCount = comments.filter(c => c.id === commentId || c.parentId === commentId).length;
      setCommentPagination(prev => ({
        ...prev,
        totalItems: Math.max(0, prev.totalItems - deletedCount)
      }));
      toast.success("Comment deleted successfully!");
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete comment');
    }
  };

  const loadComments = async (page: number, append: boolean = false) => {
    if (!snippet?.id) return;
    try {
      setLoadingComments(true);
      const res = await getComments(snippet.id, { page, limit: 5 });
      const pagination = (res as any).pagination || { totalPages: 1, totalItems: res.length, currentPage: 1 };
      
      setCommentPagination(pagination);
      if (append) {
        setComments(prev => [...prev, ...res]);
      } else {
        setComments(res);
      }
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    setIsBookmarked(snippet.isBookmarked || false);
    setIsLiked(snippet.isLiked || false);
    setLikesCount(snippet.likes);
    setBookmarksCount(snippet.bookmarksCount || 0);
    setComments([]);
    setCommentPage(1);
    if (snippet?.id) {
      loadComments(1, false);
    }
  }, [snippet.id]);

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{snippet.title}</h1>
              {snippet.visibility && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  snippet.visibility === 'public'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-gray-700/50 text-gray-300 border-gray-600'
                }`}>
                  {snippet.visibility === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span className="capitalize">{snippet.visibility}</span>
                </span>
              )}
            </div>
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
            onClick={handleToggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
              isLiked
                ? 'bg-red-600/10 text-red-400 border-red-500/20 hover:bg-red-600/20'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-transparent'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-red-400' : ''}`} />
            <span>{likesCount}</span>
          </button>
          <button
            onClick={handleToggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            aria-label={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
            className={`flex items-center justify-center p-2.5 rounded-lg transition-colors border ${
              isBookmarked
                ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 hover:bg-blue-600/20'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-transparent'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current text-blue-400' : ''}`} />
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
          <pre className="p-4 overflow-x-auto custom-code-scrollbar">
            <code className="text-sm text-gray-100">{snippet.code}</code>
          </pre>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-5 h-5 text-gray-400" />
          <h2 className="text-xl font-bold text-white">
            Comments
          </h2>
        </div>

        {/* Add Comment */}
        <div className="mb-6">
          <div className="flex gap-3">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=3b82f6&color=fff`}
              alt="Your avatar"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-sm text-white placeholder-gray-500 resize-none"
                rows={2}
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
        <div className="space-y-6">
          {comments.filter(c => !c.parentId).map((comment) => {
            const rootReplies = comments.filter(r => r.parentId === comment.id);
            const canEdit = user && user.username && comment.author.username === user.username;
            const canDelete = user && user.username && (comment.author.username === user.username || isOwner);

            return (
              <div key={comment.id} className="space-y-3">
                {/* Main Comment */}
                <div className="flex gap-3">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-10 h-10 rounded-full border border-gray-700"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-700/60 border border-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{comment.author.name}</span>
                          <span className="text-[10px] text-gray-500">{comment.createdAt}</span>
                        </div>
                        
                        {/* Edit/Delete Actions */}
                        {(canEdit || canDelete) && (
                          <div className="flex items-center gap-2">
                            {canEdit && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id);
                                  setEditContent(comment.content);
                                }}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="Edit comment"
                                aria-label="Edit comment"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 hover:text-red-400 transition-colors"
                                title="Delete comment"
                                aria-label="Delete comment"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="space-y-2 mt-1">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="px-2.5 py-1 text-xs text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleEditComment(comment.id)}
                              disabled={!editContent.trim()}
                              className="px-2.5 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{comment.content}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-2 ml-2">
                      <button
                        onClick={() => handleToggleCommentLike(comment.id)}
                        className={`flex items-center gap-1 text-xs transition-colors ${
                          comment.isLiked
                            ? 'text-red-400 hover:text-red-300'
                            : 'text-gray-400 hover:text-red-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(replyingTo === comment.id ? null : comment.id);
                          setReplyContent('');
                        }}
                        className="text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Reply Input */}
                {replyingTo === comment.id && (
                  <div className="ml-12 flex gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex-1">
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={`Reply to ${comment.author.name}...`}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-650 rounded-lg text-sm text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none placeholder-gray-600"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="px-2.5 py-1 text-xs text-gray-455 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nested Replies List */}
                {rootReplies.length > 0 && (
                  <div className="ml-10 pl-3 border-l border-gray-700 space-y-3 pt-1">
                    {rootReplies.map(reply => {
                      const replyCanEdit = user && user.username && reply.author.username === user.username;
                      const replyCanDelete = user && user.username && (reply.author.username === user.username || isOwner);

                      return (
                        <div key={reply.id} className="flex gap-2.5">
                          <img
                            src={reply.author.avatar}
                            alt={reply.author.name}
                            className="w-8 h-8 rounded-full border border-gray-700"
                          />
                          <div className="flex-1">
                            <div className="bg-gray-800/40 border border-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-white text-xs">{reply.author.name}</span>
                                  <span className="text-[9px] text-gray-500">{reply.createdAt}</span>
                                </div>

                                {/* Reply Edit/Delete Actions */}
                                {(replyCanEdit || replyCanDelete) && (
                                  <div className="flex items-center gap-1.5">
                                    {replyCanEdit && (
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(reply.id);
                                          setEditContent(reply.content);
                                        }}
                                        className="text-gray-400 hover:text-white transition-colors"
                                        title="Edit reply"
                                        aria-label="Edit reply"
                                      >
                                        <Pencil className="w-3 h-3" />
                                      </button>
                                    )}
                                    {replyCanDelete && (
                                      <button
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors"
                                        title="Delete reply"
                                        aria-label="Delete reply"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>

                              {editingCommentId === reply.id ? (
                                <div className="space-y-2 mt-1">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-2.5 py-1.5 bg-gray-900 border border-gray-600 rounded-lg text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                                    rows={2}
                                  />
                                  <div className="flex justify-end gap-1.5">
                                    <button
                                      onClick={() => setEditingCommentId(null)}
                                      className="px-2 py-0.5 text-[10px] text-gray-455 hover:text-white"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleEditComment(reply.id)}
                                      disabled={!editContent.trim()}
                                      className="px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-gray-350 text-xs whitespace-pre-wrap">{reply.content}</p>
                              )}
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 ml-1">
                              <button
                                onClick={() => handleToggleCommentLike(reply.id)}
                                className={`flex items-center gap-1 text-[10px] transition-colors ${
                                  reply.isLiked
                                    ? 'text-red-400 hover:text-red-300'
                                    : 'text-gray-400 hover:text-red-400'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {commentPagination.totalPages > commentPage && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => {
                const nextPage = commentPage + 1;
                setCommentPage(nextPage);
                loadComments(nextPage, true);
              }}
              disabled={loadingComments}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-650 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
            >
              {loadingComments ? 'Loading...' : 'Load More Comments'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
