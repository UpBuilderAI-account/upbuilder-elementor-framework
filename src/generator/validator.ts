/**
 * Template Validator
 *
 * Validates Elementor templates for structural correctness
 * and widget-specific requirements.
 */

import { ElementorElement, ElementorTemplate, ValidationResult, ValidationError } from '../types';
import { isValidElementorId } from '../lib/id-generator';
import { isVoidElement, getRequiredChildren, getDefaultSettings } from '../widgets/registry';

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validate a single element
 */
function validateElement(
  element: ElementorElement,
  path: string,
  errors: ValidationError[],
  warnings: ValidationError[],
  seenIds: Set<string>
): void {
  // Check ID format
  if (!element.id) {
    errors.push({
      code: 'STRUCTURAL_ERROR',
      message: `Element at ${path} is missing an ID`,
      path,
    });
  } else if (!isValidElementorId(element.id)) {
    warnings.push({
      code: 'STRUCTURAL_ERROR',
      message: `Element ${element.id} at ${path} has non-standard ID format (expected 8-char hex)`,
      path,
      elementId: element.id,
    });
  }

  // Check for duplicate IDs
  if (element.id && seenIds.has(element.id)) {
    errors.push({
      code: 'STRUCTURAL_ERROR',
      message: `Duplicate element ID: ${element.id} at ${path}`,
      path,
      elementId: element.id,
    });
  }
  seenIds.add(element.id);

  // Check elType
  if (!element.elType) {
    errors.push({
      code: 'STRUCTURAL_ERROR',
      message: `Element ${element.id} at ${path} is missing elType`,
      path,
      elementId: element.id,
    });
  } else if (element.elType !== 'container' && element.elType !== 'widget') {
    errors.push({
      code: 'INVALID_VALUE',
      message: `Element ${element.id} at ${path} has invalid elType: ${element.elType}`,
      path,
      elementId: element.id,
    });
  }

  // Check widgets have widgetType
  if (element.elType === 'widget' && !element.widgetType) {
    errors.push({
      code: 'STRUCTURAL_ERROR',
      message: `Widget ${element.id} at ${path} is missing widgetType`,
      path,
      elementId: element.id,
    });
  }

  // Check void elements don't have children
  if (element.widgetType && isVoidElement(element.widgetType)) {
    if (element.elements && element.elements.length > 0) {
      warnings.push({
        code: 'STRUCTURAL_ERROR',
        message: `Widget ${element.widgetType} (${element.id}) at ${path} should not have children`,
        path,
        elementId: element.id,
        widgetType: element.widgetType,
      });
    }
  }

  // Check required children
  if (element.widgetType) {
    const requiredChildren = getRequiredChildren(element.widgetType);
    if (requiredChildren && (!element.elements || element.elements.length === 0)) {
      errors.push({
        code: 'MISSING_REQUIRED',
        message: `Widget ${element.widgetType} (${element.id}) at ${path} requires children`,
        path,
        elementId: element.id,
        widgetType: element.widgetType,
      });
    }
  }

  // Recurse into children
  if (element.elements) {
    element.elements.forEach((child, i) => {
      validateElement(child, `${path}.elements[${i}]`, errors, warnings, seenIds);
    });
  }
}

/**
 * Validate an Elementor template
 */
export function validateTemplate(template: { content: ElementorElement[] }): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const seenIds = new Set<string>();

  if (!template.content || !Array.isArray(template.content)) {
    errors.push({
      code: 'STRUCTURAL_ERROR',
      message: 'Template is missing content array',
      path: 'content',
    });
    return { valid: false, errors, warnings };
  }

  template.content.forEach((element, i) => {
    validateElement(element, `content[${i}]`, errors, warnings, seenIds);
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and throw if invalid
 */
export function validateTemplateOrThrow(template: { content: ElementorElement[] }): void {
  const result = validateTemplate(template);

  // Log warnings
  for (const warning of result.warnings) {
    console.warn(`[Template Validator] ${warning.message}`);
  }

  // Throw on errors
  if (!result.valid) {
    const errorMessages = result.errors.map(e => e.message).join('\n');
    throw new Error(`Template validation failed:\n${errorMessages}`);
  }
}
