/**
 * Widget Registry
 *
 * Maps widget types to their definitions, including Elementor widget types,
 * plugins, default settings, and validation requirements.
 */
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
export declare const WIDGET_REGISTRY: Record<string, WidgetDefinition>;
/**
 * Get widget definition by Elementor widget type
 */
export declare function getWidgetDef(widgetType: string): WidgetDefinition | undefined;
/**
 * Get widget definition by UpBuilder component type
 */
export declare function getWidgetDefByUpbuilderType(upbuilderType: string): WidgetDefinition | undefined;
/**
 * Get UpBuilder component type from Elementor widget type
 */
export declare function getUpbuilderType(widgetType: string): string | undefined;
/**
 * Check if a widget type is valid
 */
export declare function isValidWidgetType(widgetType: string): boolean;
/**
 * Get all widgets by category
 */
export declare function getWidgetsByCategory(category: WidgetDefinition['category']): WidgetDefinition[];
/**
 * Get all widgets by plugin
 */
export declare function getWidgetsByPlugin(plugin: WidgetDefinition['plugin']): WidgetDefinition[];
/**
 * Check if widget is a void element (no children)
 */
export declare function isVoidElement(widgetType: string): boolean;
/**
 * Get required children for a widget
 */
export declare function getRequiredChildren(widgetType: string): string[] | undefined;
/**
 * Get property prefix for a widget (e.g., 'sg_' for JKit)
 */
export declare function getPropertyPrefix(widgetType: string): string;
/**
 * Get default settings for a widget
 */
export declare function getDefaultSettings(widgetType: string): Record<string, any>;
//# sourceMappingURL=registry.d.ts.map