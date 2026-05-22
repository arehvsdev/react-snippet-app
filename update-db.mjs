import fs from 'fs';

const dbPath = 'src/utils/db.json';
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

db.snippets = [
  {
    id: '1',
    title: 'React Custom Hook for API Calls',
    description: 'A reusable custom hook for handling API requests with loading and error states',
    language: 'TypeScript',
    code: `import { useState, useEffect } from 'react';\n\nexport function useAPI<T>(url: string) {\n  const [data, setData] = useState<T | null>(null);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState<Error | null>(null);\n\n  useEffect(() => {\n    fetch(url)\n      .then(res => res.json())\n      .then(data => setData(data))\n      .catch(err => setError(err))\n      .finally(() => setLoading(false));\n  }, [url]);\n\n  return { data, loading, error };\n}`,
    tags: ['react', 'hooks', 'typescript'],
    visibility: 'public',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      username: 'sarahj'
    },
    createdAt: '2 hours ago',
    likes: 45,
    comments: 12,
    views: 234,
    isBookmarked: false
  },
  {
    id: '2',
    title: 'Debounce Function Implementation',
    description: 'Classic debounce implementation for optimizing search inputs',
    language: 'JavaScript',
    code: `function debounce(func, wait) {\n  let timeout;\n  return function executedFunction(...args) {\n    const later = () => {\n      clearTimeout(timeout);\n      func(...args);\n    };\n    clearTimeout(timeout);\n    timeout = setTimeout(later, wait);\n  };\n}\n\n// Usage\nconst search = debounce((query) => {\n  console.log('Searching for:', query);\n}, 300);`,
    tags: ['javascript', 'performance', 'utils'],
    visibility: 'public',
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      username: 'mikechen'
    },
    createdAt: '5 hours ago',
    likes: 78,
    comments: 23,
    views: 456,
    isBookmarked: true
  },
  {
    id: '3',
    title: 'MongoDB Aggregation Pipeline',
    description: 'Complex aggregation example for data analytics',
    language: 'JavaScript',
    code: `db.orders.aggregate([\n  {\n    $match: {\n      status: "completed",\n      orderDate: { $gte: new Date("2024-01-01") }\n    }\n  },\n  {\n    $group: {\n      _id: "$customerId",\n      totalSpent: { $sum: "$amount" },\n      orderCount: { $sum: 1 }\n    }\n  },\n  {\n    $sort: { totalSpent: -1 }\n  },\n  {\n    $limit: 10\n  }\n]);`,
    tags: ['mongodb', 'database', 'aggregation'],
    visibility: 'public',
    author: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      username: 'emmaw'
    },
    createdAt: '1 day ago',
    likes: 92,
    comments: 18,
    views: 678,
    isBookmarked: false
  },
  {
    id: '4',
    title: 'React useState Hook',
    language: 'TypeScript',
    description: 'Basic example of useState for managing component state',
    tags: ['react', 'hooks'],
    code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <button onClick={() => setCount(count + 1)}>\n      Count: {count}\n    </button>\n  );\n}`,
    visibility: 'public',
    author: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      username: 'johndoe'
    },
    createdAt: '2 days ago',
    likes: 15,
    comments: 2,
    views: 120,
    isBookmarked: false
  },
  {
    id: '5',
    title: 'Array Map Function',
    language: 'JavaScript',
    description: 'Transform array elements using map',
    tags: ['array', 'functional'],
    code: `const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled); // [2, 4, 6, 8, 10]`,
    visibility: 'public',
    author: {
      name: 'John Doe',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      username: 'johndoe'
    },
    createdAt: '3 days ago',
    likes: 25,
    comments: 5,
    views: 150,
    isBookmarked: true
  },
  {
    id: '6',
    title: 'Fetch API Example',
    language: 'JavaScript',
    description: 'Making HTTP requests with async/await',
    tags: ['api', 'async'],
    code: `async function fetchData() {\n  try {\n    const response = await fetch('https://api.example.com/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching data:', error);\n  }\n}`,
    visibility: 'public',
    author: {
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      username: 'sarahj'
    },
    createdAt: '4 days ago',
    likes: 60,
    comments: 8,
    views: 310,
    isBookmarked: false
  },
  {
    id: '7',
    title: 'CSS Flexbox Layout',
    language: 'CSS',
    description: 'Center content using flexbox',
    tags: ['css', 'layout'],
    code: `.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n}`,
    visibility: 'public',
    author: {
      name: 'Mike Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      username: 'mikechen'
    },
    createdAt: '1 week ago',
    likes: 120,
    comments: 15,
    views: 890,
    isBookmarked: false
  },
  {
    id: '8',
    title: 'Python List Comprehension',
    language: 'Python',
    description: 'Create lists using comprehension syntax',
    tags: ['python', 'lists'],
    code: `# Square all even numbers from 0 to 9\nsquares = [x**2 for x in range(10) if x % 2 == 0]\nprint(squares)  # [0, 4, 16, 36, 64]`,
    visibility: 'public',
    author: {
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      username: 'emmaw'
    },
    createdAt: '1 week ago',
    likes: 45,
    comments: 3,
    views: 200,
    isBookmarked: false
  }
];

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully updated db.json');
