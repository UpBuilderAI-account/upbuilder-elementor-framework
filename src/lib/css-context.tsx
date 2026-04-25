/**
 * CSS Context and StyleTag Component
 *
 * Provides scoped CSS injection for Elementor widgets.
 */

import React, { createContext, useContext, useMemo, useCallback, useEffect, useRef, useState } from 'react';

// =============================================================================
// CSS CONTEXT
// =============================================================================

interface CSSContextValue {
  documentId?: string;
  registerStyle: (elementId: string, css: string) => void;
  unregisterStyle: (elementId: string) => void;
  registerCSS: (elementId: string, css: string) => void;
  unregisterCSS: (elementId: string) => void;
  getStyles: () => Map<string, string>;
}

const CSSContext = createContext<CSSContextValue | null>(null);

const fallbackStyles = new Map<string, string>();
let fallbackStyleElement: HTMLStyleElement | null = null;

function getFallbackStyleElement(): HTMLStyleElement | null {
  if (typeof document === 'undefined') {
    return null;
  }

  if (fallbackStyleElement?.isConnected) {
    return fallbackStyleElement;
  }

  const existing = document.querySelector<HTMLStyleElement>('style[data-elementor-framework-styles]');
  fallbackStyleElement = existing || document.createElement('style');
  fallbackStyleElement.setAttribute('data-elementor-framework-styles', '');

  if (!existing) {
    document.head.appendChild(fallbackStyleElement);
  }

  return fallbackStyleElement;
}

function syncFallbackStyles(): void {
  const styleElement = getFallbackStyleElement();
  if (!styleElement) {
    return;
  }

  styleElement.textContent = Array.from(fallbackStyles.values()).join('\n');
}

function registerFallbackStyle(elementId: string, css: string): void {
  if (!css || !css.trim()) {
    return;
  }

  if (fallbackStyles.get(elementId) === css) {
    return;
  }

  fallbackStyles.set(elementId, css);
  syncFallbackStyles();
}

function unregisterFallbackStyle(elementId: string): void {
  if (!fallbackStyles.delete(elementId)) {
    return;
  }

  syncFallbackStyles();
}

export function useCSSContext(): CSSContextValue | null {
  return useContext(CSSContext);
}

// =============================================================================
// CSS PROVIDER
// =============================================================================

interface CSSProviderProps {
  documentId?: string;
  children: React.ReactNode;
}

export const CSSProvider: React.FC<CSSProviderProps> = ({ documentId, children }) => {
  const stylesMapRef = useRef<Map<string, string>>(new Map());
  const [, forceUpdate] = useState(0);

  const registerStyle = useCallback((elementId: string, css: string) => {
    if (css && css.trim() && stylesMapRef.current.get(elementId) !== css) {
      stylesMapRef.current.set(elementId, css);
      forceUpdate(n => n + 1);
    }
  }, []);

  const unregisterStyle = useCallback((elementId: string) => {
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

  return (
    <CSSContext.Provider value={value}>
      {allCss && (
        <style
          data-elementor-collected-styles
          dangerouslySetInnerHTML={{ __html: allCss }}
        />
      )}
      {children}
    </CSSContext.Provider>
  );
};

// =============================================================================
// STYLE TAG COMPONENT
// =============================================================================

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
export const StyleTag: React.FC<StyleTagProps> = ({ elementId, css }) => {
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

export function useElementorCSS(elementId: string, css: string): void {
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
export const CollectedStyles: React.FC = () => {
  const context = useCSSContext();

  if (!context) {
    return null;
  }

  const styles = context.getStyles();
  const allCss = Array.from(styles.values()).join('\n');

  if (!allCss) {
    return null;
  }

  return (
    <style
      data-elementor-collected-styles
      dangerouslySetInnerHTML={{ __html: allCss }}
    />
  );
};
