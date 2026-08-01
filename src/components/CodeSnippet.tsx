import { Card, CardContent, CardHeader, IconButton, Chip } from '@mui/material';
import { Copy, Check, Edit, Globe, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CodeSnippetProps {
  id?: string;
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
  visibility?: 'public' | 'private';
  onVisibilityToggle?: (id: string, newVisibility: 'public' | 'private') => void;
  onEdit?: (id: string) => void;
}

export function CodeSnippet({
  id,
  title,
  language,
  code,
  description,
  tags,
  visibility,
  onVisibilityToggle,
  onEdit
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

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

  const handleToggleVisibility = async () => {
    if (!id || !visibility || !onVisibilityToggle || isUpdatingVisibility) return;
    const newVisibility = visibility === 'public' ? 'private' : 'public';
    try {
      setIsUpdatingVisibility(true);
      await onVisibilityToggle(id, newVisibility);
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    } finally {
      setIsUpdatingVisibility(false);
    }
  };

  return (
    <Card className="w-full" sx={{ backgroundColor: 'rgb(31, 41, 55)', borderColor: 'rgb(75, 85, 99)' }}>
      <CardHeader
        title={<span className="text-white">{title}</span>}
        subheader={<span className="text-gray-400">{description}</span>}
        action={
          <div className="flex items-center gap-2">
            {visibility && (
              onVisibilityToggle ? (
                <button
                  onClick={handleToggleVisibility}
                  disabled={isUpdatingVisibility}
                  className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    visibility === 'public'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                      : 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-700'
                  } ${isUpdatingVisibility ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  title="Click to toggle visibility (Public/Private)"
                >
                  {visibility === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{visibility === 'public' ? 'Public' : 'Private'}</span>
                </button>
              ) : (
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                  visibility === 'public'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-gray-700/50 text-gray-300 border-gray-600'
                }`}>
                  {visibility === 'public' ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{visibility === 'public' ? 'Public' : 'Private'}</span>
                </span>
              )
            )}
            
            {onEdit && id && (
              <IconButton onClick={() => onEdit(id)} size="small" sx={{ color: 'rgb(156, 163, 175)', '&:hover': { color: 'rgb(96, 165, 250)' } }}>
                <Edit className="w-4.5 h-4.5" />
              </IconButton>
            )}

            <IconButton onClick={handleCopy} size="small" sx={{ color: 'rgb(156, 163, 175)' }}>
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
            </IconButton>
          </div>
        }
      />
      <CardContent>
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Chip
            label={language}
            size="small"
            sx={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'rgb(147, 197, 253)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          />
          {tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                backgroundColor: 'rgba(75, 85, 99, 0.3)',
                color: 'rgb(209, 213, 219)',
                border: '1px solid rgba(75, 85, 99, 0.4)',
                fontSize: '0.75rem'
              }}
            />
          ))}
        </div>
        <pre className="bg-gray-950 p-4 rounded-lg overflow-x-auto border border-gray-800 font-mono text-sm text-gray-100 leading-relaxed max-h-[300px] custom-code-scrollbar">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
