/**
 * Whether an unverified address is stopped at the dashboard door.
 *
 * This is deliberately a deploy flag rather than always-on. Verification mail
 * only reaches a customer once `RESEND_FROM` points at a domain verified in
 * Resend; while the sender is still Resend's sandbox, every link to a real
 * address is refused. Turning the gate on before that is fixed does not protect
 * anyone — it locks every email/password account out of an account they just
 * made, with no way to receive the link that would free them.
 *
 * Google accounts are unaffected either way: the address arrives already
 * asserted as verified by the provider.
 *
 * Note this gates the *screen*, not the booking endpoints. Those authenticate by
 * session, so treat this as an experience boundary; a real security boundary
 * would check `emailVerified` inside each server function.
 */
export const REQUIRE_EMAIL_VERIFICATION =
  (import.meta.env as Record<string, string | undefined> | undefined)
    ?.VITE_REQUIRE_EMAIL_VERIFICATION === "true";
