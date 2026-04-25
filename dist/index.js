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
// =============================================================================
// CORE TYPES
// =============================================================================
export * from './types';
// =============================================================================
// LIBRARY UTILITIES
// =============================================================================
export { 
// CSS Generation
generateCSS, parseDimension, parseColor, parseTextAlign, parseTypography, parseBoxShadow, parseTextShadow, parseTextStroke, parseBorder, parseBackground, parseBorderRadius, parseSpacing, parseGap, normalizeSettings, normalizeElements, HEADING_SIZE_MAP, BUTTON_SIZE_MAP, } from './lib/widget-styles';
export { 
// CSS Context
CSSProvider, useCSSContext, useElementorCSS, StyleTag, CollectedStyles, } from './lib/css-context';
export { 
// Render Mode (Preview vs JSON compilation)
PreviewModeProvider, JsonModeProvider, useRenderMode, useIsPreviewMode, } from './lib/render-mode';
export { 
// ID Generation
generateElementId, generateSequentialId, resetIdCounter, isValidElementorId, } from './lib/id-generator';
// =============================================================================
// ABSTRACTION LAYER (JSX Components)
// =============================================================================
export { 
// Document Builder
DocumentBuilder, useDocument, 
// Container Components
Flexbox, Grid, Section, 
// Widget Components
Heading, TextEditor, Button, Icon, Image, 
// Utility Functions
createElement, createDocument, } from './builder/abstraction';
// =============================================================================
// WIDGET REGISTRY
// =============================================================================
export { WIDGET_REGISTRY, getWidgetDef, getWidgetDefByUpbuilderType, getUpbuilderType, isValidWidgetType, getWidgetsByCategory, getWidgetsByPlugin, isVoidElement, getRequiredChildren, getPropertyPrefix, getDefaultSettings, } from './widgets/registry';
// =============================================================================
// GENERATOR (Template Building & Validation)
// =============================================================================
export { validateTemplate, validateTemplateOrThrow, buildTemplate, buildDocument, serializeTemplate, serializeDocument, parseTemplate, parseDocument, createTemplateFile, createTemplateBlob, } from './generator';
// =============================================================================
// VERSION
// =============================================================================
export const VERSION = '2.0.0';
//# sourceMappingURL=index.js.map