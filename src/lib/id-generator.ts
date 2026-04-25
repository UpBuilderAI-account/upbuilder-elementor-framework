/**
 * ID Generator for Elementor Elements
 *
 * Generates 8-character hexadecimal IDs matching Elementor's format.
 */

let idCounter = 0;

/**
 * Generate a random 8-character hex ID for Elementor elements.
 * Elementor uses this format: /^[a-f0-9]{8}$/
 */
export function generateElementId(): string {
  return Math.random().toString(16).slice(2, 10).padEnd(8, '0');
}

/**
 * Generate a sequential ID (useful for deterministic builds).
 */
export function generateSequentialId(prefix = ''): string {
  idCounter++;
  const hex = idCounter.toString(16).padStart(8, '0');
  return prefix ? `${prefix}${hex.slice(prefix.length)}` : hex;
}

/**
 * Reset the sequential ID counter.
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Validate that an ID matches Elementor's expected format.
 */
export function isValidElementorId(id: string): boolean {
  return /^[a-f0-9]{8}$/i.test(id);
}
