/**
 * Widget Registry
 *
 * Maps widget types to their definitions, including Elementor widget types,
 * plugins, default settings, and validation requirements.
 */

// =============================================================================
// TYPES
// =============================================================================

export interface WidgetDefinition {
  elType: 'container' | 'widget';
  widgetType: string;
  upbuilderType: string;
  category: 'layout' | 'typography' | 'media' | 'interactive' | 'forms' | 'navigation' | 'third-party';
  plugin: 'elementor' | 'elementor-pro' | 'jkit' | 'metform';
  propertyPrefix?: string;
  defaultSettings?: Record<string, any>;
  requiredChildren?: string[];
  voidElement?: boolean;
}

// =============================================================================
// WIDGET REGISTRY
// =============================================================================

export const WIDGET_REGISTRY: Record<string, WidgetDefinition> = {
  // Layout
  container: {
    elType: 'container',
    widgetType: 'container',
    upbuilderType: 'Flexbox',
    category: 'layout',
    plugin: 'elementor',
    defaultSettings: {
      content_width: 'full',
    },
  },
  flexbox: {
    elType: 'container',
    widgetType: 'container',
    upbuilderType: 'Flexbox',
    category: 'layout',
    plugin: 'elementor',
    defaultSettings: {
      content_width: 'full',
      flex_direction: 'column',
    },
  },
  grid: {
    elType: 'container',
    widgetType: 'container',
    upbuilderType: 'Grid',
    category: 'layout',
    plugin: 'elementor',
    defaultSettings: {
      container_type: 'grid',
      content_width: 'full',
    },
  },
  section: {
    elType: 'container',
    widgetType: 'container',
    upbuilderType: 'Section',
    category: 'layout',
    plugin: 'elementor',
    defaultSettings: {
      content_width: 'full',
    },
  },

  // Typography
  heading: {
    elType: 'widget',
    widgetType: 'heading',
    upbuilderType: 'Heading',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      header_size: 'h2',
      size: 'default',
    },
  },
  'text-editor': {
    elType: 'widget',
    widgetType: 'text-editor',
    upbuilderType: 'TextEditor',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
  },
  button: {
    elType: 'widget',
    widgetType: 'button',
    upbuilderType: 'Button',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      size: 'sm',
    },
  },

  // Media
  image: {
    elType: 'widget',
    widgetType: 'image',
    upbuilderType: 'Image',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      image_size: 'full',
    },
  },
  'image-gallery': {
    elType: 'widget',
    widgetType: 'image-gallery',
    upbuilderType: 'ImageGallery',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      gallery_columns: 4,
      gallery_link: 'file',
    },
  },
  video: {
    elType: 'widget',
    widgetType: 'video',
    upbuilderType: 'Video',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
  },
  'google-maps': {
    elType: 'widget',
    widgetType: 'google_maps',
    upbuilderType: 'GoogleMaps',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      zoom: { size: 10 },
      height: { size: 300, unit: 'px' },
    },
  },

  // Icons
  icon: {
    elType: 'widget',
    widgetType: 'icon',
    upbuilderType: 'Icon',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      view: 'default',
    },
  },
  'icon-box': {
    elType: 'widget',
    widgetType: 'icon-box',
    upbuilderType: 'IconBox',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      view: 'default',
      position: 'top',
    },
  },
  'icon-list': {
    elType: 'widget',
    widgetType: 'icon-list',
    upbuilderType: 'IconList',
    category: 'typography',
    plugin: 'elementor',
    voidElement: true,
  },
  'image-box': {
    elType: 'widget',
    widgetType: 'image-box',
    upbuilderType: 'ImageBox',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      position: 'top',
    },
  },

  // Structural
  divider: {
    elType: 'widget',
    widgetType: 'divider',
    upbuilderType: 'Divider',
    category: 'layout',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      style: 'solid',
    },
  },
  spacer: {
    elType: 'widget',
    widgetType: 'spacer',
    upbuilderType: 'Spacer',
    category: 'layout',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      space: { size: 50, unit: 'px' },
    },
  },

  // Interactive
  counter: {
    elType: 'widget',
    widgetType: 'counter',
    upbuilderType: 'Counter',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      starting_number: 0,
      duration: 2000,
    },
  },
  progress: {
    elType: 'widget',
    widgetType: 'progress',
    upbuilderType: 'Progress',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      progress_type: 'default',
      display_percentage: 'show',
    },
  },
  testimonial: {
    elType: 'widget',
    widgetType: 'testimonial',
    upbuilderType: 'Testimonial',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      image_position: 'aside',
      alignment: 'center',
    },
  },
  'star-rating': {
    elType: 'widget',
    widgetType: 'star-rating',
    upbuilderType: 'StarRating',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      rating_scale: 5,
    },
  },
  alert: {
    elType: 'widget',
    widgetType: 'alert',
    upbuilderType: 'Alert',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      alert_type: 'info',
      show_dismiss: 'show',
    },
  },
  accordion: {
    elType: 'widget',
    widgetType: 'accordion',
    upbuilderType: 'Accordion',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      icon_align: 'right',
    },
  },
  tabs: {
    elType: 'widget',
    widgetType: 'tabs',
    upbuilderType: 'Tabs',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      type: 'horizontal',
    },
  },
  toggle: {
    elType: 'widget',
    widgetType: 'toggle',
    upbuilderType: 'Toggle',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      icon_align: 'right',
    },
  },
  'image-carousel': {
    elType: 'widget',
    widgetType: 'image-carousel',
    upbuilderType: 'ImageCarousel',
    category: 'media',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      slides_to_show: 3,
      slides_to_scroll: 1,
      navigation: 'both',
      autoplay: 'yes',
      infinite: 'yes',
    },
  },

  // Social
  'social-icons': {
    elType: 'widget',
    widgetType: 'social-icons',
    upbuilderType: 'SocialIcons',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
    defaultSettings: {
      shape: 'rounded',
      icon_color: 'official',
    },
  },

  // HTML
  html: {
    elType: 'widget',
    widgetType: 'html',
    upbuilderType: 'Html',
    category: 'interactive',
    plugin: 'elementor',
    voidElement: true,
  },

  // Navigation (Elementor Pro)
  'nav-menu': {
    elType: 'widget',
    widgetType: 'nav-menu',
    upbuilderType: 'NavMenu',
    category: 'navigation',
    plugin: 'elementor-pro',
    voidElement: true,
  },

  // Elementor Pro Form
  form: {
    elType: 'widget',
    widgetType: 'form',
    upbuilderType: 'ElementorForm',
    category: 'forms',
    plugin: 'elementor-pro',
    voidElement: true,
  },

  // Legacy MetForm entry. Keep it addressable without shadowing native widgetType "form".
  metform: {
    elType: 'widget',
    widgetType: 'mf',
    upbuilderType: 'Form',
    category: 'forms',
    plugin: 'metform',
    propertyPrefix: 'mf_',
    voidElement: true,
  },

  // JKit widgets
  'jkit-nav-menu': {
    elType: 'widget',
    widgetType: 'jkit_nav_menu',
    upbuilderType: 'JkitNavMenu',
    category: 'navigation',
    plugin: 'jkit',
    propertyPrefix: 'sg_',
    voidElement: true,
  },
  'jkit-icon-box': {
    elType: 'widget',
    widgetType: 'jkit_icon_box',
    upbuilderType: 'JkitIconBox',
    category: 'typography',
    plugin: 'jkit',
    propertyPrefix: 'sg_',
    voidElement: true,
  },
  'jkit-testimonials': {
    elType: 'widget',
    widgetType: 'jkit_testimonials',
    upbuilderType: 'JkitTestimonials',
    category: 'interactive',
    plugin: 'jkit',
    propertyPrefix: 'sg_',
    voidElement: true,
  },

  // Elementor Pro widgets
  'call-to-action': {
    elType: 'widget',
    widgetType: 'call-to-action',
    upbuilderType: 'CallToAction',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'flip-box': {
    elType: 'widget',
    widgetType: 'flip-box',
    upbuilderType: 'FlipBox',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  slides: {
    elType: 'widget',
    widgetType: 'slides',
    upbuilderType: 'Slides',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'media-carousel': {
    elType: 'widget',
    widgetType: 'media-carousel',
    upbuilderType: 'MediaCarousel',
    category: 'media',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'testimonial-carousel': {
    elType: 'widget',
    widgetType: 'testimonial-carousel',
    upbuilderType: 'TestimonialCarousel',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  countdown: {
    elType: 'widget',
    widgetType: 'countdown',
    upbuilderType: 'Countdown',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'price-table': {
    elType: 'widget',
    widgetType: 'price-table',
    upbuilderType: 'PriceTable',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'price-list': {
    elType: 'widget',
    widgetType: 'price-list',
    upbuilderType: 'PriceList',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  posts: {
    elType: 'widget',
    widgetType: 'posts',
    upbuilderType: 'Posts',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  gallery: {
    elType: 'widget',
    widgetType: 'gallery',
    upbuilderType: 'Gallery',
    category: 'media',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'share-buttons': {
    elType: 'widget',
    widgetType: 'share-buttons',
    upbuilderType: 'ShareButtons',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  blockquote: {
    elType: 'widget',
    widgetType: 'blockquote',
    upbuilderType: 'Blockquote',
    category: 'typography',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'animated-headline': {
    elType: 'widget',
    widgetType: 'animated-headline',
    upbuilderType: 'AnimatedHeadline',
    category: 'typography',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'search-form': {
    elType: 'widget',
    widgetType: 'search-form',
    upbuilderType: 'SearchForm',
    category: 'navigation',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'table-of-contents': {
    elType: 'widget',
    widgetType: 'table-of-contents',
    upbuilderType: 'TableOfContents',
    category: 'navigation',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  lottie: {
    elType: 'widget',
    widgetType: 'lottie',
    upbuilderType: 'Lottie',
    category: 'media',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  'code-highlight': {
    elType: 'widget',
    widgetType: 'code-highlight',
    upbuilderType: 'CodeHighlight',
    category: 'typography',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  hotspot: {
    elType: 'widget',
    widgetType: 'hotspot',
    upbuilderType: 'Hotspot',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
  reviews: {
    elType: 'widget',
    widgetType: 'reviews',
    upbuilderType: 'Reviews',
    category: 'interactive',
    plugin: 'elementor-pro',
    voidElement: true,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get widget definition by Elementor widget type
 */
export function getWidgetDef(widgetType: string): WidgetDefinition | undefined {
  return WIDGET_REGISTRY[widgetType];
}

/**
 * Get widget definition by UpBuilder component type
 */
export function getWidgetDefByUpbuilderType(upbuilderType: string): WidgetDefinition | undefined {
  return Object.values(WIDGET_REGISTRY).find(def => def.upbuilderType === upbuilderType);
}

/**
 * Get UpBuilder component type from Elementor widget type
 */
export function getUpbuilderType(widgetType: string): string | undefined {
  return WIDGET_REGISTRY[widgetType]?.upbuilderType;
}

/**
 * Check if a widget type is valid
 */
export function isValidWidgetType(widgetType: string): boolean {
  return widgetType in WIDGET_REGISTRY;
}

/**
 * Get all widgets by category
 */
export function getWidgetsByCategory(category: WidgetDefinition['category']): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter(def => def.category === category);
}

/**
 * Get all widgets by plugin
 */
export function getWidgetsByPlugin(plugin: WidgetDefinition['plugin']): WidgetDefinition[] {
  return Object.values(WIDGET_REGISTRY).filter(def => def.plugin === plugin);
}

/**
 * Check if widget is a void element (no children)
 */
export function isVoidElement(widgetType: string): boolean {
  return WIDGET_REGISTRY[widgetType]?.voidElement ?? false;
}

/**
 * Get required children for a widget
 */
export function getRequiredChildren(widgetType: string): string[] | undefined {
  return WIDGET_REGISTRY[widgetType]?.requiredChildren;
}

/**
 * Get property prefix for a widget (e.g., 'sg_' for JKit)
 */
export function getPropertyPrefix(widgetType: string): string {
  return WIDGET_REGISTRY[widgetType]?.propertyPrefix || '';
}

/**
 * Get default settings for a widget
 */
export function getDefaultSettings(widgetType: string): Record<string, any> {
  return WIDGET_REGISTRY[widgetType]?.defaultSettings || {};
}
