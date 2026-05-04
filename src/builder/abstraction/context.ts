/**
 * Context definitions for the Elementor JSX Abstraction Layer
 */

import { createContext, useContext } from 'react';
import type { ElementorElement } from '../../types';

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
