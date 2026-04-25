/**
 * Template Validator
 *
 * Validates Elementor templates for structural correctness
 * and widget-specific requirements.
 */
import { ElementorElement, ValidationResult } from '../types';
/**
 * Validate an Elementor template
 */
export declare function validateTemplate(template: {
    content: ElementorElement[];
}): ValidationResult;
/**
 * Validate and throw if invalid
 */
export declare function validateTemplateOrThrow(template: {
    content: ElementorElement[];
}): void;
//# sourceMappingURL=validator.d.ts.map