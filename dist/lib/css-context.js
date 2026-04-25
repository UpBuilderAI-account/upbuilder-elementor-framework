import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * CSS Context and StyleTag Component
 *
 * Provides scoped CSS injection for Elementor widgets.
 */
import { createContext, useContext, useMemo, useCallback, useEffect, useRef, useState } from 'react';
const CSSContext = createContext(null);
const fallbackStyles = new Map();
let fallbackStyleElement = null;
function getFallbackStyleElement() {
    if (typeof document === 'undefined') {
        return null;
    }
    if (fallbackStyleElement?.isConnected) {
        return fallbackStyleElement;
    }
    const existing = document.querySelector('style[data-elementor-framework-styles]');
    fallbackStyleElement = existing || document.createElement('style');
    fallbackStyleElement.setAttribute('data-elementor-framework-styles', '');
    if (!existing) {
        document.head.appendChild(fallbackStyleElement);
    }
    return fallbackStyleElement;
}
function syncFallbackStyles() {
    const styleElement = getFallbackStyleElement();
    if (!styleElement) {
        return;
    }
    styleElement.textContent = Array.from(fallbackStyles.values()).join('\n');
}
function registerFallbackStyle(elementId, css) {
    if (!css || !css.trim()) {
        return;
    }
    if (fallbackStyles.get(elementId) === css) {
        return;
    }
    fallbackStyles.set(elementId, css);
    syncFallbackStyles();
}
function unregisterFallbackStyle(elementId) {
    if (!fallbackStyles.delete(elementId)) {
        return;
    }
    syncFallbackStyles();
}
export function useCSSContext() {
    return useContext(CSSContext);
}
export const CSSProvider = ({ documentId, children }) => {
    const stylesMapRef = useRef(new Map());
    const [, forceUpdate] = useState(0);
    const registerStyle = useCallback((elementId, css) => {
        if (css && css.trim() && stylesMapRef.current.get(elementId) !== css) {
            stylesMapRef.current.set(elementId, css);
            forceUpdate(n => n + 1);
        }
    }, []);
    const unregisterStyle = useCallback((elementId) => {
        if (stylesMapRef.current.has(elementId)) {
            stylesMapRef.current.delete(elementId);
            forceUpdate(n => n + 1);
        }
    }, []);
    const getStyles = useCallback(() => stylesMapRef.current, []);
    const value = useMemo(() => ({
        documentId,
        registerStyle,
        unregisterStyle,
        registerCSS: registerStyle,
        unregisterCSS: unregisterStyle,
        getStyles,
    }), [documentId, registerStyle, unregisterStyle, getStyles]);
    const allCss = Array.from(stylesMapRef.current.values()).join('\n');
    return (_jsxs(CSSContext.Provider, { value: value, children: [allCss && (_jsx("style", { "data-elementor-collected-styles": true, dangerouslySetInnerHTML: { __html: allCss } })), children] }));
};
/**
 * Registers scoped CSS for an Elementor element.
 *
 * When a CSSProvider is present, styles are collected there. Otherwise this
 * component injects into one shared head-level style tag. It intentionally
 * never renders a style tag next to the widget, because style tags inside
 * flex/grid containers become layout children and distort Elementor previews.
 */
export const StyleTag = ({ elementId, css }) => {
    const context = useCSSContext();
    useEffect(() => {
        if (context && css) {
            context.registerStyle(elementId, css);
            return () => context.unregisterStyle(elementId);
        }
        if (!context && css) {
            registerFallbackStyle(elementId, css);
            return () => unregisterFallbackStyle(elementId);
        }
        return undefined;
    }, [context, elementId, css]);
    return null;
};
export function useElementorCSS(elementId, css) {
    const context = useCSSContext();
    useEffect(() => {
        if (context && css) {
            context.registerStyle(elementId, css);
            return () => context.unregisterStyle(elementId);
        }
        if (!context && css) {
            registerFallbackStyle(elementId, css);
            return () => unregisterFallbackStyle(elementId);
        }
        return undefined;
    }, [context, elementId, css]);
}
// =============================================================================
// COLLECTED STYLES COMPONENT
// =============================================================================
/**
 * Renders all collected styles from the context.
 * Useful for SSR or when you want styles in a specific location.
 */
export const CollectedStyles = () => {
    const context = useCSSContext();
    if (!context) {
        return null;
    }
    const styles = context.getStyles();
    const allCss = Array.from(styles.values()).join('\n');
    if (!allCss) {
        return null;
    }
    return (_jsx("style", { "data-elementor-collected-styles": true, dangerouslySetInnerHTML: { __html: allCss } }));
};
//# sourceMappingURL=css-context.js.map