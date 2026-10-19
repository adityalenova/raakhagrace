const KEY = "raakha-admin";

// Internal only — never import these into UI components.
const ADMIN_EMAIL = "atelier@raakhagrace.com";
const ADMIN_PASSWORD = "Lotus#2026";

export function isAdminAuthed() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEY) === "1";
}

export function adminLogin(email: string, password: string) {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(KEY, "1");
    return true;
  }
  return false;
}

export function adminLogout() {
  sessionStorage.removeItem(KEY);
}
