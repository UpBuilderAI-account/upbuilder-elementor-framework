/**
 * @upbuilder/elementor-framework v2
 *
 * A React framework for building Elementor-compatible pages.
 *
 * This framework provides:
 * - Clean JSX components that compile to Elementor JSON
 * - CSS generation matching Elementor PHP output
 * - Elementor-compatible JSON generation
 * - Full TypeScript support
 *
 * @example
 * ```tsx
 * import { DocumentBuilder, Section, Grid, Flexbox, Heading, Button } from '@upbuilder/elementor-framework';
 *
 * function MyPage() {
 *   return (
 *     <DocumentBuilder title="My Page" onBuild={doc => console.log(doc)}>
 *       <Section contentWidth="full" backgroundColor="#f5f5f5" padding={40} gap={0}>
 *         <Grid columns={3} rows={1} gap={20} padding={0}>
 *           <Flexbox gap={10} padding={20}>
 *             <Heading title="Hello World" tag="h2" color="#333" />
 *             <Button text="Click Me" align="center" backgroundColor="#6EC1E4" />
 *           </Flexbox>
 *         </Grid>
 *       </Section>
 *     </DocumentBuilder>
 *   );
 * }
 * ```
 */
export * from './types';
export { generateCSS, parseDimension, parseColor, parseTextAlign, parseTypography, parseBoxShadow, parseTextShadow, parseTextStroke, parseBorder, parseBackground, parseBorderRadius, parseSpacing, parseGap, normalizeSettings, normalizeElements, HEADING_SIZE_MAP, BUTTON_SIZE_MAP, } from './lib/widget-styles';
export { CSSProvider, useCSSContext, useElementorCSS, StyleTag, CollectedStyles, } from './lib/css-context';
export { PreviewModeProvider, JsonModeProvider, useRenderMode, useIsPreviewMode, } from './lib/render-mode';
export { generateElementId, generateSequentialId, resetIdCounter, isValidElementorId, } from './lib/id-generator';
export { DocumentBuilder, useDocument, Flexbox, Grid, Section, Heading, TextEditor, Button, Icon, Image, createElement, createDocument, } from './builder/abstraction';
export type { FlexboxProps, GridProps, SectionProps, HeadingProps, TextEditorProps, ButtonProps, IconProps, ImageProps, PageProps, ResponsiveValue, SliderValue, DimensionsValue, GradientValue, BoxShadowValue, TextShadowValue, LinkLike, IconLike, ImageLike, LayoutPositionValue, PositionAxisValue, StickyPositionValue, } from './builder/abstraction';
export { WIDGET_REGISTRY, getWidgetDef, getWidgetDefByUpbuilderType, getUpbuilderType, isValidWidgetType, getWidgetsByCategory, getWidgetsByPlugin, isVoidElement, getRequiredChildren, getPropertyPrefix, getDefaultSettings, } from './widgets/registry';
export type { WidgetDefinition } from './widgets/registry';
export { validateTemplate, validateTemplateOrThrow, buildTemplate, buildDocument, serializeTemplate, serializeDocument, parseTemplate, parseDocument, createTemplateFile, createTemplateBlob, } from './generator';
export type { BuildTemplateOptions } from './generator';
export declare const VERSION = "2.0.0";
//# sourceMappingURL=index.d.ts.map