/**
 * -------------------------------------------------------
 * FaqAnswers.ts
 * -------------------------------------------------------
 * Standalone reference dictionary module for SnipForge FAQs.
 * Extracted into a dedicated module to keep DialogflowChat.tsx
 * clean, modular, and decoupled.
 * -------------------------------------------------------
 */

export const FAQ_ANSWERS: Record<string, string> = {
  "how do i create a snippet?":
    "To create a snippet, click on the '+ Create' button in the top navigation bar. Fill in the title, select a programming language, enter your code snippet, add tags, and choose visibility (Public for all users, or Private for PRO users). Click 'Create Snippet' to publish!",

  "how do bookmarks work?":
    "You can bookmark any public code snippet by clicking the Bookmark icon on the snippet card. All your saved snippets are neatly organized under 'My Snippets -> Bookmarks' tab or from the '/bookmarks' page.",

  "how do i upgrade to pro?":
    "Upgrade to PRO by clicking 'Subscription' in the top menu or visiting the '/pricing' page. PRO unlocks unlimited private snippet storage, gold profile badges, custom themes, and priority support for just ₹199/month!",

  "how do i edit a snippet?":
    "Navigate to 'My Snippets' from your profile or header menu, find the snippet you want to modify, and click the 'Edit' button on the snippet card.",

  "what is a private snippet?":
    "Private snippets are secure code snippets visible only to you. FREE plan users can create up to 5 private snippets, while PRO members get unlimited private snippet storage.",

  "how do i search snippets?":
    "Use the global search bar on the Home feed ('/snippet-feed') to search snippets by title, description, language, tags, or author username.",

  "how do categories work?":
    "Categories organize snippets into topic buckets (e.g., Web Development, Data Science, Algorithms). You can filter the feed by selecting a category from the sidebar.",

  "how do tags work?":
    "Tags are keywords prefixed with '#' attached to snippets. Click any tag on a snippet card to instantly filter the feed for matching tagged snippets.",

  "how do i change my profile?":
    "Click your avatar in the top-right header and select 'Settings' to update your full name, phone number, and bio. Select 'Change Password' to update your password.",
};

/**
 * Searches the FAQ dictionary for a matching question string.
 */
export const getFaqAnswer = (query: string): string | null => {
  if (!query) return null;
  const normalized = query.trim().toLowerCase();
  return FAQ_ANSWERS[normalized] || null;
};
