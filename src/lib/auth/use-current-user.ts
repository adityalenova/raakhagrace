import { useSyncExternalStore } from "react";
import { authClient, authEnabled } from "./client";
import { clearGuestSession, readGuest, type GuestUser } from "./guest";

export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback: boolean;
  isGuest?: boolean;
  /**
   * Whether the address on this account has been confirmed by clicking the link
   * we mail on sign-up. Google-asserted addresses arrive already verified; a
   * guest session has no address to verify, so it stays `undefined`.
   */
  emailVerified?: boolean;
};

export type CurrentUserState = {
  user: AppUser | null;
  isPending: boolean;
};

const guestListeners = new Set<() => void>();
function emitGuest() {
  guestListeners.forEach((l) => l());
}
function subscribeGuest(cb: () => void) {
  guestListeners.add(cb);
  return () => guestListeners.delete(cb);
}
function getGuestSnapshot(): GuestUser | null {
  return readGuest();
}

export function notifyGuestChange() {
  emitGuest();
}

/**
 * The signed-in identity for the UI.
 *
 * Server session wins; a local guest session is the fallback for visitors who
 * chose "continue as guest". While Better Auth is still resolving the cookie
 * (or bearer) session we report `isPending` so gates render nothing instead of
 * flashing a signed-out state on hard reload.
 */
export function useCurrentUserState(): CurrentUserState {
  const guest = useSyncExternalStore(subscribeGuest, getGuestSnapshot, () => null);
  const { data, isPending } = authClient.useSession();

  const account = data?.user
    ? {
        id: data.user.id,
        displayName: data.user.name ?? null,
        // For a Google sign-in this is the address Google asserted, already
        // marked verified by the provider — safe to show and to email.
        primaryEmail: data.user.email ?? null,
        profileImageUrl: data.user.image ?? null,
        isDevFallback: false,
        isGuest: false,
        emailVerified: data.user.emailVerified ?? false,
      }
    : null;

  if (authEnabled && isPending && !guest) return { user: null, isPending: true };
  return { user: account ?? guest, isPending: false };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}

export function endSessionLocal() {
  clearGuestSession();
  notifyGuestChange();
}
