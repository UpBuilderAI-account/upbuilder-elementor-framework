/**
 * Elementor Defaults
 *
 * These paths mirror the demo-app Elementor runtime asset bundle. The package
 * includes the files under elementor-defaults/elementor-css, while backend
 * preview serves the same files from /cdn/css/elementor.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface GeneratedCSS {
  /** Combined CSS string (empty - use linked Elementor runtime files instead) */
  css: string;
  /** Font Awesome URL for icons */
  fontAwesomeCdnUrl: string | null;
  /** Elementor Frontend CSS URL */
  elementorCdnUrl: string | null;
  /** Elementor CSS URLs to include in preview/export documents */
  cssUrls: string[];
  /** Elementor JS URLs available for runtime integrations */
  jsUrls: string[];
}

export const ELEMENTOR_ASSET_BASE_URL = '/cdn/css/elementor';
export const FONT_AWESOME_CDN_URL = `${ELEMENTOR_ASSET_BASE_URL}/fontawesome/all.min.css`;
export const ELEMENTOR_CDN_URL = `${ELEMENTOR_ASSET_BASE_URL}/frontend.min.css`;

export const ELEMENTOR_LIB_CSS_URLS = [
  `${ELEMENTOR_ASSET_BASE_URL}/e-swiper.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/lib/elementor-icons.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/lib/e-gallery.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/lib/swiper.min.css`,
];

export const ELEMENTOR_WIDGET_CSS_URLS = [
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-accordion.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-counter.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-divider.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-heading.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-icon-box.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-icon-list.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-image-box.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-image-carousel.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-image.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-nested-accordion.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-progress.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-spacer.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-star-rating.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-tabs.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-testimonial.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-text-editor.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/widgets/widget-toggle.min.css`,
];

export const ELEMENTOR_PRO_WIDGET_CSS_URLS = [
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-countdown.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-form.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-gallery.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-nav-menu.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-price-list.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-price-table.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-search-form.min.css`,
  `${ELEMENTOR_ASSET_BASE_URL}/pro/widget-slides.min.css`,
];

export const ELEMENTOR_JS_URLS = [
  `${ELEMENTOR_ASSET_BASE_URL}/js/jquery.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/webpack.runtime.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/webpack-pro.runtime.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/frontend-modules.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/frontend.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/frontend-pro.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/elements-handlers.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/dialog.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/e-gallery.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/toggle.2a177a3ef4785d3dfbc5.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/counter.12335f45aaa79d244f24.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/progress.0ea083b809812c0e3aa1.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/image-carousel.6167d20b95b33386757b.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/nav-menu.3afa8f5eb1fef7c22561.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/form.cfd61a9174be80f835c6.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/slides.8e9b74f1b31471377df8.bundle.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/jquery-numerator.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/jquery.smartmenus.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/swiper.min.js`,
  `${ELEMENTOR_ASSET_BASE_URL}/js/waypoints.min.js`,
];

export const ELEMENTOR_CSS_URLS = [
  ELEMENTOR_CDN_URL,
  ...ELEMENTOR_LIB_CSS_URLS,
  ...ELEMENTOR_WIDGET_CSS_URLS,
  ...ELEMENTOR_PRO_WIDGET_CSS_URLS,
];

/**
 * Get Elementor defaults CSS config
 * Returns linked asset URLs instead of embedding the minified runtime files.
 */
export function getElementorDefaultsCSS(options?: { includeFontAwesome?: boolean }): GeneratedCSS {
  const includeFa = options?.includeFontAwesome ?? true;
  return {
    css: '',
    fontAwesomeCdnUrl: includeFa ? FONT_AWESOME_CDN_URL : null,
    elementorCdnUrl: ELEMENTOR_CDN_URL,
    cssUrls: includeFa ? [FONT_AWESOME_CDN_URL, ...ELEMENTOR_CSS_URLS] : ELEMENTOR_CSS_URLS,
    jsUrls: ELEMENTOR_JS_URLS,
  };
}

/**
 * Get raw CSS string (empty - use linked assets instead)
 * @deprecated Use getElementorDefaultsCSS().cssUrls instead.
 */
export function getCSS(): string {
  return '';
}

// =============================================================================
// RE-EXPORTS
// =============================================================================

// Re-export registry utilities for convenience
export {
  getWidgetDef,
  getWidgetDefByUpbuilderType,
  getUpbuilderType,
  isVoidElement,
  getWidgetsByCategory,
  getWidgetsByPlugin,
  isValidWidgetType,
  getDefaultSettings,
  getPropertyPrefix,
  getRequiredChildren,
  WIDGET_REGISTRY,
} from '../src/widgets/registry';

// Re-export types
export type { WidgetDefinition } from '../src/widgets/registry';
