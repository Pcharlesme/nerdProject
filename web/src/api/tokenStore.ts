// Holds the Bearer access token in memory for the life of the tab, mirrored to
// sessionStorage so a same-tab refresh doesn't force a fresh login. Never
// localStorage — the token must not outlive the tab/window.
const STORAGE_KEY = "ns_access_token";

let accessToken: string | null = null;
let hydrated = false;

function hydrate(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    accessToken = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    accessToken = null;
  }
}

export function getAccessToken(): string | null {
  hydrate();
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  hydrated = true;
  accessToken = token;
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.sessionStorage.setItem(STORAGE_KEY, token);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // sessionStorage unavailable (private mode, etc.) — in-memory value still holds.
  }
}

export function hasAccessToken(): boolean {
  return getAccessToken() !== null;
}
