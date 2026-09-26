/** Loose client-side format check — rejects the obviously wrong before hitting the network. */
export function isValidTrackingNumberFormat(value: string): boolean {
  const trimmed = value.trim();
  return /^[A-Z0-9-]{6,32}$/i.test(trimmed);
}
