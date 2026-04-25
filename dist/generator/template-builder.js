/**
 * Template Builder
 *
 * Builds and serializes Elementor templates.
 */
import { normalizeElements } from '../lib/widget-styles';
/**
 * Build an Elementor template from elements
 */
export function buildTemplate(elements, options = {}) {
    const { title = 'Untitled', type = 'page', pageSettings = {}, metadata = {}, normalize = true, } = options;
    // Normalize settings if requested
    const content = normalize ? normalizeElements(elements) : elements;
    return {
        version: '0.4',
        title,
        type,
        metadata: {
            template_type: 'single-page',
            include_in_zip: '1',
            elementor_pro_required: null,
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
export function buildDocument(elements, options = {}) {
    const { title = 'Untitled', type = 'page', pageSettings = {}, status = 'publish', normalize = true, } = options;
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
export function serializeTemplate(template, pretty = false) {
    return JSON.stringify(template, null, pretty ? 2 : undefined);
}
/**
 * Serialize document to JSON string
 */
export function serializeDocument(document, pretty = false) {
    return JSON.stringify(document, null, pretty ? 2 : undefined);
}
/**
 * Parse a template from JSON string
 */
export function parseTemplate(json) {
    return JSON.parse(json);
}
/**
 * Parse a document from JSON string
 */
export function parseDocument(json) {
    return JSON.parse(json);
}
// =============================================================================
// FILE HELPERS
// =============================================================================
/**
 * Create a downloadable template file
 */
export function createTemplateFile(template, filename = 'elementor-template.json') {
    return {
        filename,
        content: serializeTemplate(template, true),
        mimeType: 'application/json',
    };
}
/**
 * Create a Blob for browser download
 */
export function createTemplateBlob(template) {
    const content = serializeTemplate(template, true);
    return new Blob([content], { type: 'application/json' });
}
//# sourceMappingURL=template-builder.js.map