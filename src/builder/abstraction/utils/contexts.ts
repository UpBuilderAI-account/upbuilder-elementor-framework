/**
 * React Contexts and Hooks for Elementor Abstraction Layer
 *
 * Provides document/element context, preview mode detection, and DOM utilities.
 */

import React, { createContext, useContext } from 'react';
import { ElementorElement } from '../../../types';
import { generateElementId } from '../../../lib/id-generator';
import { useIsPreviewMode } from '../../../lib/render-mode';
import { StyleTag } from '../../../lib/css-context';

// =============================================================================
// TYPES
// =============================================================================

export type PreviewSettings = Record<string, any>;

// =============================================================================
// DOCUMENT CONTEXT
// =============================================================================

export interface DocumentContextValue {
  documentId: string;
  addElement: (element: ElementorElement, parentId?: string) => void;
  getElements: () => ElementorElement[];
}

export const DocumentContext = createContext<DocumentContextValue | null>(null);

export function useDocument(): DocumentContextValue {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocument must be used within a DocumentBuilder');
  }
  return context;
}

// =============================================================================
// ELEMENT CONTEXT
// =============================================================================

export interface ElementContextValue {
  parentId: string;
}

export const ElementContext = createContext<ElementContextValue | null>(null);

export function useElementContext(): ElementContextValue | null {
  return useContext(ElementContext);
}

// =============================================================================
// DOM UTILITIES
// =============================================================================

/**
 * Extract DOM attributes (data-*, aria-*, role, title) from props
 */
export function getDomAttributes(props: Record<string, unknown>): Record<string, string | number | boolean> {
  const attrs: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null) continue;
    if (
      key.startsWith('data-') ||
      key.startsWith('aria-') ||
      key === 'role' ||
      key === 'title'
    ) {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        attrs[key] = value;
      }
    }
  }
  return attrs;
}

// =============================================================================
// PREVIEW RUNTIME DETECTION
// =============================================================================

/**
 * Check if Elementor's native JavaScript runtime is available for preview.
 * When true, widgets like Accordion/Tabs can use Elementor's native JS handlers
 * instead of React-based implementations.
 */
export function isElementorNativePreviewRuntime(): boolean {
  return typeof window !== 'undefined' && (window as any).__UP_USE_ELEMENTOR_NATIVE_JS === true;
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export commonly used utilities from their source modules
export { generateElementId } from '../../../lib/id-generator';
export { useIsPreviewMode } from '../../../lib/render-mode';
export { StyleTag } from '../../../lib/css-context';
