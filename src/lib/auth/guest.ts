/** Client-only guest session — temporary access without an account. */

export type GuestUser = {
  id: string;
  displayName: string;
  primaryEmail: null;
  profileImageUrl: null;
  isDevFallback: false;
  isGuest: true;
};

const KEY = "rg-guest-session";

export function readGuest(): GuestUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestUser;
    if (parsed?.id && parsed?.isGuest) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function startGuestSession(name = "Guest"): GuestUser {
  const user: GuestUser = {
    id: `guest-${Date.now().toString(36)}`,
    displayName: name.trim() || "Guest",
    primaryEmail: null,
    profileImageUrl: null,
    isDevFallback: false,
    isGuest: true,
  };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  return user;
}

export function clearGuestSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
