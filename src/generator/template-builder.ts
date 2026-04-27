/**
 * Template Builder
 *
 * Builds and serializes Elementor templates.
 */

import { ElementorElement, ElementorTemplate, ElementorDocument } from '../types';
import { normalizeElements } from '../lib/widget-styles';

// =============================================================================
// TEMPLATE BUILDING
// =============================================================================

export interface BuildTemplateOptions {
  title?: string;
  type?: string;
  pageSettings?: Record<string, any>;
  metadata?: Record<string, any>;
  normalize?: boolean;
}

function elementsRequireElementorPro(elements: ElementorElement[]): boolean {
  const proWidgets = new Set(['nav-menu', 'form', 'slides']);
  const visit = (element: ElementorElement): boolean => {
    if (element.elType === 'widget' && element.widgetType && proWidgets.has(element.widgetType)) return true;
    return Array.isArray(element.elements) ? element.elements.some(visit) : false;
  };
  return elements.some(visit);
}

/**
 * Build an Elementor template from elements
 */
export function buildTemplate(
  elements: ElementorElement[],
  options: BuildTemplateOptions = {}
): ElementorTemplate {
  const {
    title = 'Untitled',
    type = 'page',
    pageSettings = {},
    metadata = {},
    normalize = true,
  } = options;

  // Normalize settings if requested
  const content = normalize ? normalizeElements(elements) : elements;
  const requiresPro = elementsRequireElementorPro(content);

  return {
    version: '0.4',
    title,
    type,
    metadata: {
      template_type: 'single-page',
      include_in_zip: '1',
      elementor_pro_required: requiresPro ? '1' : null,
      wp_page_template: 'elementor_canvas',
      ...metadata,
    },
    content,
    page_settings: {
      hide_title: 'yes',
      ...pageSettings,
    },
  };
}

/**
 * Build a document from elements (includes status and settings)
 */
export function buildDocument(
  elements: ElementorElement[],
  options: BuildTemplateOptions & { status?: string } = {}
): ElementorDocument {
  const {
    title = 'Untitled',
    type = 'page',
    pageSettings = {},
    status = 'publish',
    normalize = true,
  } = options;

  const content = normalize ? normalizeElements(elements) : elements;

  return {
    title,
    status,
    type,
    version: '0.4',
    settings: {},
    page_settings: {
      hide_title: 'yes',
      ...pageSettings,
    },
    elements: content,
  };
}

// =============================================================================
// SERIALIZATION
// =============================================================================

/**
 * Serialize template to JSON string
 */
export function serializeTemplate(template: ElementorTemplate, pretty = false): string {
  return JSON.stringify(template, null, pretty ? 2 : undefined);
}

/**
 * Serialize document to JSON string
 */
export function serializeDocument(document: ElementorDocument, pretty = false): string {
  return JSON.stringify(document, null, pretty ? 2 : undefined);
}

/**
 * Parse a template from JSON string
 */
export function parseTemplate(json: string): ElementorTemplate {
  return JSON.parse(json);
}

/**
 * Parse a document from JSON string
 */
export function parseDocument(json: string): ElementorDocument {
  return JSON.parse(json);
}

// =============================================================================
// FILE HELPERS
// =============================================================================

/**
 * Create a downloadable template file
 */
export function createTemplateFile(
  template: ElementorTemplate,
  filename = 'elementor-template.json'
): { filename: string; content: string; mimeType: string } {
  return {
    filename,
    content: serializeTemplate(template, true),
    mimeType: 'application/json',
  };
}

/**
 * Create a Blob for browser download
 */
export function createTemplateBlob(template: ElementorTemplate): Blob {
  const content = serializeTemplate(template, true);
  return new Blob([content], { type: 'application/json' });
}
