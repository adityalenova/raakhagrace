/**
 * Every outward-facing contact point in one place.
 *
 * The WhatsApp number used to be pasted into eight files, and one of them lost
 * the `91` country code — which silently broke the only ordering channel the
 * atelier has. Build links through `whatsappLink()` instead of concatenating.
 */
export const WHATSAPP_NUMBER = "916304837120";
export const WHATSAPP_DISPLAY = "+91 63048 37120";
export const INSTAGRAM_LINK = "https://www.instagram.com/raakhagrace/";

/** A wa.me link, optionally pre-filled with a message. */
export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
