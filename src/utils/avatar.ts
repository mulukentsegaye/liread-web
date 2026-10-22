/**
 * Utility functions for generating dynamic, personalized user avatars
 * based on the user's name or custom uploaded photos.
 */

/**
 * Generates an SVG data URL with the user's first letter/initial.
 * Example: "Muluken" -> "M" on an emerald background.
 */
export function generateInitialsAvatar(name?: string, backgroundColor = '#059669'): string {
  const clean = (name || '').trim();
  const initial = clean ? clean.charAt(0).toUpperCase() : 'G';
  
  return `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='50' fill='${encodeURIComponent(backgroundColor)}'/><text x='50' y='55' font-family='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' font-size='44' font-weight='700' fill='%23ffffff' text-anchor='middle' dominant-baseline='central'>${initial}</text></svg>`;
}

/**
 * Checks whether the given avatar URL is an authentic custom photo uploaded
 * by the user (or external image URL), rather than the static legacy "LR"/"RH" placeholder.
 */
export function isCustomAvatar(avatarUrl?: string | null): boolean {
  if (!avatarUrl || typeof avatarUrl !== 'string') return false;
  const trimmed = avatarUrl.trim();
  if (!trimmed) return false;

  // Filter out the legacy static SVGs containing generic app acronyms
  if (trimmed.includes('data:image/svg+xml') && (trimmed.includes('>LR<') || trimmed.includes('>RH<'))) {
    return false;
  }

  // Any uploaded photo (JPEG, PNG, WebP data URL or HTTP URL)
  return true;
}

/**
 * Resolves the appropriate avatar URL for a user profile:
 * 1. If the user has a custom uploaded photo, returns that photo URL.
 * 2. If not, generates a dynamic vector avatar showing their name's first initial (e.g. 'M' for Muluken).
 */
export function getUserAvatar(user?: { fullName?: string; username?: string; avatarUrl?: string | null } | null): string {
  if (user && isCustomAvatar(user.avatarUrl)) {
    return user.avatarUrl!;
  }

  const displayName = user?.fullName || user?.username || 'Guest';
  return generateInitialsAvatar(displayName);
}
