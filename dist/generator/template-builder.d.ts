/**
 * Template Builder
 *
 * Builds and serializes Elementor templates.
 */
import { ElementorElement, ElementorTemplate, ElementorDocument } from '../types';
export interface BuildTemplateOptions {
    title?: string;
    type?: string;
    pageSettings?: Record<string, any>;
    metadata?: Record<string, any>;
    normalize?: boolean;
}
/**
 * Build an Elementor template from elements
 */
export declare function buildTemplate(elements: ElementorElement[], options?: BuildTemplateOptions): ElementorTemplate;
/**
 * Build a document from elements (includes status and settings)
 */
export declare function buildDocument(elements: ElementorElement[], options?: BuildTemplateOptions & {
    status?: string;
}): ElementorDocument;
/**
 * Serialize template to JSON string
 */
export declare function serializeTemplate(template: ElementorTemplate, pretty?: boolean): string;
/**
 * Serialize document to JSON string
 */
export declare function serializeDocument(document: ElementorDocument, pretty?: boolean): string;
/**
 * Parse a template from JSON string
 */
export declare function parseTemplate(json: string): ElementorTemplate;
/**
 * Parse a document from JSON string
 */
export declare function parseDocument(json: string): ElementorDocument;
/**
 * Create a downloadable template file
 */
export declare function createTemplateFile(template: ElementorTemplate, filename?: string): {
    filename: string;
    content: string;
    mimeType: string;
};
/**
 * Create a Blob for browser download
 */
export declare function createTemplateBlob(template: ElementorTemplate): Blob;
//# sourceMappingURL=template-builder.d.ts.map