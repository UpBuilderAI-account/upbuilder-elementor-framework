/**
 * Core Types for Elementor Framework v2
 *
 * Matches Elementor's exact data structures for perfect compatibility.
 */
export type DimensionValue = number | string | {
    size: number;
    unit: string;
};
export type SpacingValue = number | {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
    unit?: string;
    isLinked?: boolean;
};
export type GapValue = number | {
    size?: number;
    row?: number;
    column?: number;
    unit?: string;
};
export type GradientValue = {
    type?: 'linear' | 'radial';
    angle?: number;
    colorA?: string;
    colorB?: string;
    locationA?: number;
    locationB?: number;
    position?: 'center center' | 'center left' | 'center right' | 'top center' | 'top left' | 'top right' | 'bottom center' | 'bottom left' | 'bottom right';
};
export type BoxShadowValue = {
    horizontal?: number;
    vertical?: number;
    blur?: number;
    spread?: number;
    color?: string;
    position?: 'outline' | 'inset' | '';
};
export type TextShadowValue = {
    horizontal?: number;
    vertical?: number;
    blur?: number;
    color?: string;
};
export type BorderValue = {
    type?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed' | 'groove';
    width?: number | SpacingValue;
    color?: string;
};
export type TypographyValue = {
    fontFamily?: string;
    fontSize?: DimensionValue;
    fontWeight?: string | number;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
    lineHeight?: DimensionValue;
    letterSpacing?: DimensionValue;
    wordSpacing?: DimensionValue;
};
export type LinkValue = {
    url: string;
    is_external?: boolean;
    nofollow?: boolean;
    custom_attributes?: string;
};
export type IconValue = {
    value: string;
    library?: 'fa-solid' | 'fa-regular' | 'fa-brands' | 'svg' | 'eicons';
};
export type ImageValue = {
    url: string;
    id?: number;
    alt?: string;
    title?: string;
    size?: string;
};
export type ElementorElType = 'container' | 'widget';
export interface ElementorElement {
    id: string;
    elType: ElementorElType;
    widgetType?: string;
    settings: Record<string, unknown>;
    elements?: ElementorElement[];
    isInner?: boolean;
}
export interface ElementorTemplate {
    version: string;
    title: string;
    type: string;
    metadata?: Record<string, unknown>;
    content: ElementorElement[];
    page_settings?: Record<string, unknown>;
}
export interface ElementorDocument {
    title?: string;
    status?: string;
    type?: string;
    version?: string;
    settings?: Record<string, unknown>;
    page_settings?: Record<string, unknown>;
    elements: ElementorElement[];
}
export interface WidgetProps {
    element: ElementorElement;
    children?: React.ReactNode;
    isEditor?: boolean;
    documentId?: string;
}
export interface CSSRule {
    selector: string;
    properties: Record<string, string | undefined>;
    /** For media queries, allows targeting a nested selector (e.g. ' > .e-con-inner'). */
    nestedSelector?: string;
}
export interface CSSProperties {
    [key: string]: string | number | undefined;
}
export interface ValidationError {
    code: 'MISSING_REQUIRED' | 'MISSING_TOGGLE' | 'INVALID_VALUE' | 'STRUCTURAL_ERROR';
    message: string;
    widgetType?: string;
    setting?: string;
    elementId?: string;
    path?: string;
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';
export declare const BREAKPOINT_SUFFIXES: Record<Breakpoint, string>;
export declare const BREAKPOINT_WIDTHS: Record<Breakpoint, number>;
//# sourceMappingURL=types.d.ts.map