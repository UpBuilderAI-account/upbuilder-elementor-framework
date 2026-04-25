import { jsx as _jsx } from "react/jsx-runtime";
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
import { createContext, useContext } from 'react';
import { CSSProvider } from './css-context';
const RenderModeContext = createContext(null);
/**
 * Check if preview mode is enabled globally
 * This allows the bundler to enable preview without wrapping in a provider
 */
function isGlobalPreviewMode() {
    if (typeof window !== 'undefined') {
        return !!window.__UP_PREVIEW_MODE;
    }
    return false;
}
/**
 * Check current render mode
 */
export function useRenderMode() {
    const context = useContext(RenderModeContext);
    // If context is set, use it; otherwise check global flag
    if (context !== null)
        return context;
    return isGlobalPreviewMode() ? 'preview' : 'json';
}
/**
 * Check if in preview mode
 */
export function useIsPreviewMode() {
    const context = useContext(RenderModeContext);
    // If context is set, use it; otherwise check global flag
    if (context !== null)
        return context === 'preview';
    return isGlobalPreviewMode();
}
/**
 * Provider for preview mode rendering
 * Wrap your app with this to render visible DOM instead of building JSON
 */
export function PreviewModeProvider({ children }) {
    return (_jsx(RenderModeContext.Provider, { value: "preview", children: _jsx(CSSProvider, { children: _jsx("div", { className: "elementor", children: children }) }) }));
}
/**
 * Provider for JSON compilation mode (default)
 */
export function JsonModeProvider({ children }) {
    return (_jsx(RenderModeContext.Provider, { value: "json", children: children }));
}
//# sourceMappingURL=render-mode.js.map