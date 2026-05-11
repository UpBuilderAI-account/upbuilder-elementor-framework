/**
 * Inspector Registry
 *
 * Runtime registry that exposes each rendered component's authored React props
 * + resolved Elementor settings + default props to the host frontend (the
 * Styles Panel). The frontend reads `window.__upInspector[elementId]` after
 * selecting an element to render a settings-style inspector instead of the
 * raw CSS view.
 *
 * Active in preview mode only. JSON-mode renders bail out so the export
 * pipeline never touches the registry.
 */

import { useEffect } from 'react';
import { useIsPreviewMode } from './render-mode';
import { WIDGET_REGISTRY } from '../widgets/registry';

// =============================================================================
// TYPES
// =============================================================================

export interface InspectorMeta {
  /** React component name, e.g. "Container", "Heading", "Button". */
  component: string;
  /** Widget registry key, e.g. "heading", "icon-box", "container". */
  widgetKey: string;
  /** Raw props the React component received (the source of truth). */
  authoredProps: Record<string, unknown>;
  /** Resolved Elementor `settings` object computed by the mappers. */
  resolvedSettings: Record<string, unknown>;
  /** Default React props from the widget registry — used for non-default diffing. */
  defaultProps: Record<string, unknown>;
}

declare global {
  interface Window {
    __upInspector?: Record<string, InspectorMeta>;
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * Register a component's inspector meta on the iframe window. Bails when not
 * in preview mode (e.g. during JSON-mode export) or when running on the
 * server. Cleans up on unmount.
 *
 * Call from inside the preview branch of each abstraction component, after
 * `settings` has been computed.
 */
export function useInspectorRegistry(
  id: string,
  componentName: string,
  widgetKey: string,
  authoredProps: Record<string, unknown>,
  resolvedSettings: Record<string, unknown>,
): void {
  const isPreview = useIsPreviewMode();

  useEffect(() => {
    if (!isPreview || typeof window === 'undefined') return;

    const w = window;
    if (!w.__upInspector) w.__upInspector = {};
    w.__upInspector[id] = {
      component: componentName,
      widgetKey,
      authoredProps,
      resolvedSettings,
      defaultProps: WIDGET_REGISTRY[widgetKey]?.defaultProps ?? {},
    };

    return () => {
      if (w.__upInspector) delete w.__upInspector[id];
    };
  });
}

// =============================================================================
// HELPERS (for the frontend, also handy for tests)
// =============================================================================

/** Read a single entry from the inspector registry, or null. */
export function readInspectorMeta(id: string): InspectorMeta | null {
  if (typeof window === 'undefined' || !window.__upInspector) return null;
  return window.__upInspector[id] ?? null;
}

/** Read all currently-registered entries (snapshot copy). */
export function readAllInspectorMeta(): Record<string, InspectorMeta> {
  if (typeof window === 'undefined' || !window.__upInspector) return {};
  return { ...window.__upInspector };
}
