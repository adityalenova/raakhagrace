import { useSyncExternalStore } from "react";
import { clearGuestSession, readGuest, type GuestUser } from "./guest";

export type AppUser = {
  id: string;
  displayName: string | null;
  primaryEmail: string | null;
  profileImageUrl: string | null;
  isDevFallback: boolean;
  isGuest?: boolean;
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

/** Auth is UI-only; no live session provider. Guest optional. */
export function useCurrentUserState(): CurrentUserState {
  const guest = useSyncExternalStore(subscribeGuest, getGuestSnapshot, () => null);
  return { user: guest, isPending: false };
}

export function useCurrentUser(): AppUser | null {
  return useCurrentUserState().user;
}

export function endSessionLocal() {
  clearGuestSession();
  notifyGuestChange();
}
