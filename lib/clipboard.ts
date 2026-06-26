/**
 * Writes text to the clipboard. Returns true on success, false on any failure
 * (permission denied, insecure context, unsupported browser, etc.).
 *
 * Centralised so callers don't need to handle the DOMException themselves and
 * so the promise rejection is never left unhandled.
 */
export async function writeToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
