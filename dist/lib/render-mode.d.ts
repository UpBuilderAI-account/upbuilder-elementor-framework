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
import { ReactNode } from 'react';
export type RenderMode = 'json' | 'preview';
/**
 * Check current render mode
 */
export declare function useRenderMode(): RenderMode;
/**
 * Check if in preview mode
 */
export declare function useIsPreviewMode(): boolean;
/**
 * Provider for preview mode rendering
 * Wrap your app with this to render visible DOM instead of building JSON
 */
export declare function PreviewModeProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
/**
 * Provider for JSON compilation mode (default)
 */
export declare function JsonModeProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=render-mode.d.ts.map