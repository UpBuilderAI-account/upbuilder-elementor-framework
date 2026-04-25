/**
 * JSX Abstraction Layer for Elementor
 *
 * Clean JSX components that compile to Elementor JSON.
 * Core widgets: Grid, Flexbox, Heading, TextEditor, Button, Icon, Image
 *
 * Supports dual-mode rendering:
 * - JSON mode: compiles to Elementor JSON for export
 * - Preview mode: renders HTML with Elementor-compatible CSS for live preview
 */
import React, { type ReactNode } from 'react';
import { ElementorElement, ElementorDocument } from '../../types';
import { generateElementId } from '../../lib/id-generator';
export type ResponsiveValue<T> = T | {
    desktop?: T;
    tablet?: T;
    mobile?: T;
};
export type SliderValue = number | string | {
    size?: number | string;
    unit?: string;
};
export type GridTrackValue = number | string;
export type DimensionsValue = number | {
    top?: number | string;
    right?: number | string;
    bottom?: number | string;
    left?: number | string;
    unit?: string;
};
export type GapsValue = {
    row?: number | string;
    column?: number | string;
    unit?: string;
};
export type LinkLike = string | {
    url: string;
    is_external?: boolean;
    nofollow?: boolean;
};
export type IconLike = string | {
    value?: string;
    library?: string;
};
export type ImageLike = string | {
    url?: string;
    id?: number | string;
    alt?: string;
};
export type PositionAxisValue = {
    side?: 'start' | 'end';
    offset?: ResponsiveValue<SliderValue>;
};
export type LayoutPositionValue = {
    mode: 'absolute' | 'fixed';
    horizontal?: PositionAxisValue;
    vertical?: PositionAxisValue;
    zIndex?: ResponsiveValue<number>;
};
export type StickyPositionValue = {
    side?: 'top' | 'bottom';
    devices?: Array<'desktop' | 'tablet' | 'mobile'>;
    offset?: ResponsiveValue<SliderValue>;
    effectsOffset?: ResponsiveValue<SliderValue>;
    anchorLinkOffset?: ResponsiveValue<SliderValue>;
    parent?: boolean;
};
type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
type ElementorSettingsInput = Record<string, JsonValue>;
type BaseProps = {
    id?: string;
    className?: string;
    settings?: ElementorSettingsInput;
    children?: ReactNode;
    role?: string;
    title?: string;
    positioning?: LayoutPositionValue;
    zIndex?: ResponsiveValue<number>;
    sticky?: StickyPositionValue;
    [key: `data-${string}`]: string | number | boolean | undefined;
    [key: `aria-${string}`]: string | number | boolean | undefined;
};
export type PageProps = {
    title?: string;
    children?: ReactNode;
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
    color?: string;
    horizontal?: number;
    vertical?: number;
    blur?: number;
    spread?: number;
    position?: 'outline' | 'inset';
};
export type TextShadowValue = {
    color?: string;
    horizontal?: number;
    vertical?: number;
    blur?: number;
};
export type BackgroundImageValue = {
    url: string;
    position?: 'center center' | 'center left' | 'center right' | 'top center' | 'top left' | 'top right' | 'bottom center' | 'bottom left' | 'bottom right';
    size?: 'auto' | 'cover' | 'contain';
    repeat?: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
};
export type GridProps = BaseProps & {
    columns: ResponsiveValue<GridTrackValue>;
    rows: ResponsiveValue<GridTrackValue>;
    gap?: ResponsiveValue<SliderValue>;
    rowGap?: ResponsiveValue<SliderValue>;
    columnGap?: ResponsiveValue<SliderValue>;
    alignItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
    alignContent?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>;
    justifyItems?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch'>;
    justifyContent?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'>;
    padding?: ResponsiveValue<DimensionsValue>;
    margin?: ResponsiveValue<DimensionsValue>;
    backgroundColor?: string;
    borderRadius?: DimensionsValue;
    minHeight?: ResponsiveValue<SliderValue>;
    width?: ResponsiveValue<SliderValue>;
    contentWidth?: 'full' | 'boxed';
    boxedWidth?: ResponsiveValue<SliderValue>;
    autoFlow?: ResponsiveValue<'row' | 'column'>;
};
export type FlexboxProps = BaseProps & {
    direction?: ResponsiveValue<'row' | 'column' | 'row-reverse' | 'column-reverse'>;
    justify?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>;
    alignItems?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch'>;
    alignContent?: ResponsiveValue<'flex-start' | 'center' | 'flex-end' | 'stretch' | 'space-between' | 'space-around' | 'space-evenly'>;
    gap?: ResponsiveValue<SliderValue>;
    wrap?: ResponsiveValue<'nowrap' | 'wrap'>;
    padding?: ResponsiveValue<DimensionsValue>;
    margin?: ResponsiveValue<DimensionsValue>;
    backgroundColor?: string;
    backgroundGradient?: GradientValue;
    backgroundImage?: BackgroundImageValue;
    backgroundOverlay?: string | GradientValue;
    borderRadius?: DimensionsValue;
    borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
    borderWidth?: DimensionsValue;
    borderColor?: string;
    boxShadow?: BoxShadowValue;
    minHeight?: ResponsiveValue<SliderValue>;
    width?: ResponsiveValue<SliderValue>;
    contentWidth?: 'full' | 'boxed';
    boxedWidth?: ResponsiveValue<SliderValue>;
    flexGrow?: ResponsiveValue<number>;
    flexShrink?: ResponsiveValue<number>;
    overflow?: 'visible' | 'hidden';
};
export type SectionProps = FlexboxProps & {
    /** Section name for layers panel display (e.g., "HeroSection") */
    name?: string;
};
export type HeadingProps = BaseProps & {
    title?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
    size?: 'default' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
    align?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
    color?: string;
    fontSize?: ResponsiveValue<SliderValue>;
    fontWeight?: string | number;
    fontFamily?: string;
    fontStyle?: 'normal' | 'italic' | 'oblique';
    textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
    lineHeight?: ResponsiveValue<SliderValue>;
    letterSpacing?: ResponsiveValue<SliderValue>;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textShadow?: TextShadowValue;
    link?: LinkLike;
    blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn' | 'difference' | 'exclusion';
};
export type TextEditorProps = BaseProps & {
    content?: string;
    align?: ResponsiveValue<'left' | 'center' | 'right' | 'justify'>;
    color?: string;
    fontSize?: ResponsiveValue<SliderValue>;
    fontFamily?: string;
    lineHeight?: ResponsiveValue<SliderValue>;
    letterSpacing?: ResponsiveValue<SliderValue>;
    paragraphSpacing?: ResponsiveValue<SliderValue>;
    columns?: ResponsiveValue<number>;
    columnGap?: ResponsiveValue<SliderValue>;
};
export type ButtonProps = BaseProps & {
    text?: string;
    link?: LinkLike;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    align?: ResponsiveValue<'left' | 'center' | 'right' | 'stretch'>;
    icon?: IconLike;
    iconPosition?: 'left' | 'right';
    iconSpacing?: SliderValue;
    textColor?: string;
    backgroundColor?: string;
    hoverTextColor?: string;
    hoverBackgroundColor?: string;
    borderType?: 'none' | 'solid' | 'double' | 'dotted' | 'dashed';
    borderWidth?: ResponsiveValue<SliderValue>;
    borderColor?: string;
    borderRadius?: ResponsiveValue<DimensionsValue>;
    padding?: ResponsiveValue<DimensionsValue>;
    fontSize?: ResponsiveValue<SliderValue>;
    fontWeight?: string | number;
    lineHeight?: ResponsiveValue<SliderValue>;
    letterSpacing?: ResponsiveValue<SliderValue>;
    contentAlign?: ResponsiveValue<'start' | 'center' | 'end' | 'space-between'>;
};
export type IconProps = BaseProps & {
    icon?: IconLike;
    view?: 'default' | 'stacked' | 'framed';
    shape?: 'circle' | 'square' | 'rounded';
    align?: ResponsiveValue<'left' | 'center' | 'right'>;
    color?: string;
    backgroundColor?: string;
    hoverColor?: string;
    hoverBackgroundColor?: string;
    size?: ResponsiveValue<SliderValue>;
    padding?: SliderValue;
    borderWidth?: SliderValue;
    borderRadius?: ResponsiveValue<DimensionsValue>;
    borderColor?: string;
    link?: LinkLike;
    rotate?: ResponsiveValue<number>;
};
export type ImageProps = BaseProps & {
    image?: ImageLike;
    image_size?: 'full' | 'large' | 'medium' | 'thumbnail';
    alt?: string;
    caption?: string;
    link?: LinkLike;
    align?: ResponsiveValue<'left' | 'center' | 'right'>;
    width?: ResponsiveValue<SliderValue>;
    maxWidth?: ResponsiveValue<SliderValue>;
    height?: ResponsiveValue<SliderValue>;
    objectFit?: ResponsiveValue<'fill' | 'cover' | 'contain' | 'scale-down'>;
    objectPosition?: ResponsiveValue<string>;
    borderRadius?: ResponsiveValue<DimensionsValue>;
    opacity?: number;
};
interface DocumentContextValue {
    documentId: string;
    addElement: (element: ElementorElement, parentId?: string) => void;
    getElements: () => ElementorElement[];
}
export declare function useDocument(): DocumentContextValue;
type AbstractionKind = 'page' | 'container' | 'widget';
type AbstractionComponentMeta = {
    kind: AbstractionKind;
    name: string;
    widgetKey?: string;
    containerType?: 'grid' | 'flex';
};
export declare const Page: React.FC<PageProps> & {
    __elementorAbstraction?: AbstractionComponentMeta;
};
export declare const Grid: React.FC<GridProps>;
export declare const Flexbox: React.FC<FlexboxProps>;
export declare const Section: React.FC<SectionProps>;
export declare const Heading: React.FC<HeadingProps>;
export declare const TextEditor: React.FC<TextEditorProps>;
export declare const Button: React.FC<ButtonProps>;
export declare const Icon: React.FC<IconProps>;
export declare const Image: React.FC<ImageProps>;
interface DocumentBuilderProps {
    title?: string;
    children: React.ReactNode;
    onBuild?: (doc: ElementorDocument) => void;
}
export declare const DocumentBuilder: React.FC<DocumentBuilderProps>;
export declare function compileReactPage(input: ReactNode, title?: string): ElementorDocument;
export declare function createElement(type: 'container' | 'widget', widgetType: string | undefined, settings: Record<string, any>, children?: ElementorElement[]): ElementorElement;
export declare function createDocument(elements: ElementorElement[], options?: {
    title?: string;
    pageSettings?: Record<string, any>;
}): ElementorDocument;
export { generateElementId };
//# sourceMappingURL=index.d.ts.map