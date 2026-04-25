/**
 * Render Mode Context
 *
 * Controls whether components render:
 * - 'json': Build Elementor JSON data (default, for export)
 * - 'preview': Render visible DOM elements (for live preview)
 *
 * Preview mode is automatically enabled when:
 * - The app is wrapped in PreviewModeProvider, OR
 * - window.__UP_PREVIEW_MODE is true (set by the preview bundler)
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { CSSProvider } from './css-context';

export type RenderMode = 'json' | 'preview';

const RenderModeContext = createContext<RenderMode | null>(null);

/**
 * Check if preview mode is enabled globally
 * This allows the bundler to enable preview without wrapping in a provider
 */
function isGlobalPreviewMode(): boolean {
  if (typeof window !== 'undefined') {
    return !!(window as any).__UP_PREVIEW_MODE;
  }
  return false;
}

/**
 * Check current render mode
 */
export function useRenderMode(): RenderMode {
  const context = useContext(RenderModeContext);
  // If context is set, use it; otherwise check global flag
  if (context !== null) return context;
  return isGlobalPreviewMode() ? 'preview' : 'json';
}

/**
 * Check if in preview mode
 */
export function useIsPreviewMode(): boolean {
  const context = useContext(RenderModeContext);
  // If context is set, use it; otherwise check global flag
  if (context !== null) return context === 'preview';
  return isGlobalPreviewMode();
}

/**
 * Provider for preview mode rendering
 * Wrap your app with this to render visible DOM instead of building JSON
 */
export function PreviewModeProvider({ children }: { children: ReactNode }) {
  return (
    <RenderModeContext.Provider value="preview">
      <CSSProvider>
        <div className="elementor">
          {children}
        </div>
      </CSSProvider>
    </RenderModeContext.Provider>
  );
}

/**
 * Provider for JSON compilation mode (default)
 */
export function JsonModeProvider({ children }: { children: ReactNode }) {
  return (
    <RenderModeContext.Provider value="json">
      {children}
    </RenderModeContext.Provider>
  );
}
