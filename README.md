# SnipForge Client - Beginner's Guide 🚀

Welcome to SnipForge! This guide is created to help beginners understand the project structure, React concepts used, and how to run the app.

## 🏃 How to Run the App

1. Make sure you have Node.js installed.
2. Open your terminal in the project folder.
3. Install dependencies by running:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to the link shown in your terminal (usually `http://localhost:5173`).

## 📁 Project Structure

Here is a simple breakdown of the `src` directory:

- **`components/`**: Reusable parts of the UI, such as buttons, headers, or snippet cards.
- **`pages/`**: Whole screens or pages like the `Landing.tsx` page or the `CreateSnippet.tsx` page.
- **`layouts/`**: Wrappers for our pages. For instance, an `AuthLayout` ensures the user is logged in before showing the page.
- **`routes/`**: This connects specific URLs to specific pages (e.g. `/create` goes to `CreateSnippet`).
- **`services/`**: Files that handle data logic, like `dbService.ts` which simulates fetching data from a database using local storage.
- **`utils/`**: Helper files. `db.json` lives here, serving as our mock database.

## ⚛️ React Concepts Used (Simplified)

We've removed advanced libraries and patterns to make this project super beginner-friendly!

### 1. `useState` Hook
We use `useState` to remember things inside a component, like what you typed in a form. 
Example in `CreateSnippet.tsx`:
```tsx
const [title, setTitle] = useState('');
// setTitle('New Title') updates the title on the screen immediately!
```

### 2. `useEffect` Hook
We use `useEffect` to do things when the component first appears on the screen, like fetching data.
Example in `SnippetFeed.tsx`:
```tsx
useEffect(() => {
  const data = getDB();
  setSnippets(data.snippets);
}, []); // The empty array [] means "run this only once when the page loads"
```

### 3. Props
Props are like arguments passed to a function. We use them to pass data from a parent component down to a child component (e.g. passing a snippet's title to a `CodeSnippet` card).

### 4. Forms without Complex Libraries
Instead of using complex form libraries, we handle forms the standard React way using simple state and the `onSubmit` event, so you can clearly see how the data flows!

## 🤝 Need Help?
Explore the comments inside components like `CreateSnippet.tsx` and `Landing.tsx` (in the `src/pages` folder) where we explain how state and functions work step-by-step!
