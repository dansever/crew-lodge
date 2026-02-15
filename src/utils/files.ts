/**
 * Shared file utility functions
 * These functions can be used in both client and server contexts
 */

/**
 * Computes SHA-256 hash of a file for integrity verification
 * Works in both browser and Node.js environments
 */
export async function computeSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
