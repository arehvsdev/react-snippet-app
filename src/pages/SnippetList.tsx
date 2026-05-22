import { Container, Typography, TextField, InputAdornment, Box } from '@mui/material';
import { Search, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CodeSnippet } from './CodeSnippet';
import { Layout } from './Layout';
import { getDB } from '../services/dbService';

export function SnippetList() {
  const TextFieldAny = TextField as any;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [snippets, setSnippets] = useState<any[]>([]);

  useEffect(() => {
    const db = getDB();
    setSnippets(db.snippets);
  }, []);

  const filteredSnippets = snippets.filter(snippet =>
    snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.language.toLowerCase().includes(searchQuery.toLowerCase()) ||
    snippet.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <Container maxWidth="lg" className="py-8">
        <Box className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Typography variant="h3" component="h1" gutterBottom className="text-white">
                Explore Snippets
              </Typography>
              <Typography variant="body1" className="mb-4 text-gray-400">
                Browse and search through community code snippets
              </Typography>
            </div>
            <button
              onClick={() => navigate('/create')}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              New Snippet
            </button>
          </div>

          <TextFieldAny
            fullWidth
            placeholder="Search snippets by title, language, or tags..."
            value={searchQuery}
            onChange={(e: any) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="w-5 h-5 text-gray-400" />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgb(31, 41, 55)',
                color: 'white',
                '& fieldset': {
                  borderColor: 'rgb(75, 85, 99)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgb(107, 114, 128)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'rgb(59, 130, 246)',
                },
              },
              '& .MuiInputBase-input::placeholder': {
                color: 'rgb(156, 163, 175)',
                opacity: 1,
              },
            }}
          />
        </Box>

        <div className="space-y-4">
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
            <Typography variant="body1" className="text-center py-12 text-gray-400">
              No snippets found matching your search
            </Typography>
          )}
        </div>
      </Container>
    </Layout>
  );
}
