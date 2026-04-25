/**
 * CSS Context and StyleTag Component
 *
 * Provides scoped CSS injection for Elementor widgets.
 */
import React from 'react';
interface CSSContextValue {
    documentId?: string;
    registerStyle: (elementId: string, css: string) => void;
    unregisterStyle: (elementId: string) => void;
    registerCSS: (elementId: string, css: string) => void;
    unregisterCSS: (elementId: string) => void;
    getStyles: () => Map<string, string>;
}
export declare function useCSSContext(): CSSContextValue | null;
interface CSSProviderProps {
    documentId?: string;
    children: React.ReactNode;
}
export declare const CSSProvider: React.FC<CSSProviderProps>;
interface StyleTagProps {
    elementId: string;
    css: string;
}
/**
 * Registers scoped CSS for an Elementor element.
 *
 * When a CSSProvider is present, styles are collected there. Otherwise this
 * component injects into one shared head-level style tag. It intentionally
 * never renders a style tag next to the widget, because style tags inside
 * flex/grid containers become layout children and distort Elementor previews.
 */
export declare const StyleTag: React.FC<StyleTagProps>;
export declare function useElementorCSS(elementId: string, css: string): void;
/**
 * Renders all collected styles from the context.
 * Useful for SSR or when you want styles in a specific location.
 */
export declare const CollectedStyles: React.FC;
export {};
//# sourceMappingURL=css-context.d.ts.map