/** Supabase wiring cancelled — auth page is UI-only. */
export const supabaseConfigured = false;
export const supabase = null;
export async function signInWithGoogle() {
  throw new Error("Auth is UI-only for now.");
}
export async function signUpWithEmail() {
  throw new Error("Auth is UI-only for now.");
}
export async function signInWithEmail() {
  throw new Error("Auth is UI-only for now.");
}
export async function signOutSupabase() {}
