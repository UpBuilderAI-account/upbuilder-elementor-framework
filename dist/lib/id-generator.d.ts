/**
 * ID Generator for Elementor Elements
 *
 * Generates 8-character hexadecimal IDs matching Elementor's format.
 */
/**
 * Generate a random 8-character hex ID for Elementor elements.
 * Elementor uses this format: /^[a-f0-9]{8}$/
 */
export declare function generateElementId(): string;
/**
 * Generate a sequential ID (useful for deterministic builds).
 */
export declare function generateSequentialId(prefix?: string): string;
/**
 * Reset the sequential ID counter.
 */
export declare function resetIdCounter(): void;
/**
 * Validate that an ID matches Elementor's expected format.
 */
export declare function isValidElementorId(id: string): boolean;
//# sourceMappingURL=id-generator.d.ts.map