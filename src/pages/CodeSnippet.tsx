import { Card, CardContent, CardHeader, IconButton, Chip } from '@mui/material';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeSnippetProps {
  title: string;
  language: string;
  code: string;
  description?: string;
  tags?: string[];
}

export function CodeSnippet({ title, language, code, description, tags }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full" sx={{ backgroundColor: 'rgb(31, 41, 55)', borderColor: 'rgb(75, 85, 99)' }}>
      <CardHeader
        title={<span className="text-white">{title}</span>}
        subheader={<span className="text-gray-400">{description}</span>}
        action={
          <IconButton onClick={handleCopy} size="small" sx={{ color: 'rgb(156, 163, 175)' }}>
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </IconButton>
        }
        className="pb-2"
      />
      <CardContent className="pt-0">
        <div className="flex gap-2 mb-3">
          <Chip
            label={language}
            size="small"
            sx={{
              color: 'rgb(96, 165, 250)',
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgb(30, 58, 138)',
            }}
            variant="outlined"
          />
          {tags?.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              variant="outlined"
              sx={{
                color: 'rgb(209, 213, 219)',
                borderColor: 'rgb(75, 85, 99)',
              }}
            />
          ))}
        </div>
        <pre className="bg-gray-950 text-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-700">
          <code className="text-sm">{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
}
