/**
 * Generator Module
 *
 * Exports for building, validating, and serializing Elementor templates.
 */

export {
  validateTemplate,
  validateTemplateOrThrow,
} from './validator';

export {
  buildTemplate,
  buildDocument,
  serializeTemplate,
  serializeDocument,
  parseTemplate,
  parseDocument,
  createTemplateFile,
  createTemplateBlob,
} from './template-builder';

export type { BuildTemplateOptions } from './template-builder';
