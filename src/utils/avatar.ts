/**
 * Resolves avatar image URL for display in React components.
 * Supports Base64 Data URLs, absolute HTTP/HTTPS URLs, relative server paths (/uploads/...),
 * and falls back to a custom UI-Avatars SVG generator.
 */
export function getAvatarUrl(avatar: string | undefined | null, name: string = 'User'): string {
  if (!avatar || typeof avatar !== 'string' || !avatar.trim()) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`;
  }

  const clean = avatar.trim();

  // If already a Base64 Data URL or an absolute HTTP(S) URL, return directly
  if (clean.startsWith('data:') || clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // Handle relative upload paths (e.g. /uploads/avatars/...)
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';
  const baseUrl = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
  const pathPrefix = clean.startsWith('/') ? '' : '/';
  
  return `${baseUrl}${pathPrefix}${clean}`;
}
