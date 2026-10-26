/**
 * Best-effort access to `localStorage`.
 *
 * Browsers may deny storage access (private mode, quota, disabled site data),
 * so every editor path that persists or restores local state must keep working
 * when the storage API throws. Reads fail soft to `null`, writes are ignored.
 */

/**
 * Reads a value without throwing when storage access is denied.
 * @param {string} key - The storage key.
 * @returns {string | null} The stored value, or `null` if unavailable.
 */
export function getStoredItem(key: string): string | null {
  try {
    return globalThis.localStorage?.getItem(key) ?? null;
  }
  catch {
    return null;
  }
}

/**
 * Writes a value without throwing when storage access is denied.
 * @param {string} key - The storage key.
 * @param {string} value - The value to store.
 */
export function setStoredItem(key: string, value: string): void {
  try {
    globalThis.localStorage?.setItem(key, value);
  }
  catch {
    // Persisting local state is best effort.
  }
}

/**
 * Removes a value without throwing when storage access is denied.
 * @param {string} key - The storage key.
 */
export function removeStoredItem(key: string): void {
  try {
    globalThis.localStorage?.removeItem(key);
  }
  catch {
    // Persisting local state is best effort.
  }
}
