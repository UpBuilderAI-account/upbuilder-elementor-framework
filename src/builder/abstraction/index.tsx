/**
 * JSX Abstraction Layer for Elementor
 *
 * Clean JSX components that compile to Elementor JSON.
 * Core widgets: Grid, Flexbox, Heading, TextEditor, Button, Icon, IconList, Image
 *
 * Supports dual-mode rendering:
 * - JSON mode: compiles to Elementor JSON for export
 * - Preview mode: renders HTML with Elementor-compatible CSS for live preview
 */

// Types
export type {
  ResponsiveValue,
  SliderValue,
  GridTrackValue,
  DimensionsValue,
  GapsValue,
  LinkLike,
  IconLike,
  ImageLike,
  IconListItem,
  PositionAxisValue,
  LayoutPositionValue,
  StickyPositionValue,
  JsonValue,
  ElementorSettingsInput,
  BaseProps,
  GradientValue,
  BoxShadowValue,
  TextShadowValue,
  TextStrokeValue,
  CSSFilterValue,
  BackgroundImageValue,
  PageProps,
  GridProps,
  FlexboxProps,
  SectionProps,
  HeadingProps,
  TextEditorProps,
  ButtonProps,
  IconProps,
  BoxContentStyleProps,
  IconBoxProps,
  IconListProps,
  ImageProps,
  ImageBoxProps,
  AccordionItem,
  AccordionProps,
  ToggleProps,
  TabsItem,
  TabsProps,
  GalleryImage,
  ImageGalleryProps,
  CounterProps,
  ProgressProps,
  CarouselImage,
  ImageCarouselProps,
  NavMenuItem,
  NavMenuProps,
  ElementorFormField,
  ElementorFormProps,
  SlideItem,
  SlidesProps,
  InternalFlexboxProps,
  AbstractionKind,
  AbstractionComponentMeta,
  PreviewSettings,
  ResponsiveSuffix,
} from './types';

// Context
export {
  DocumentContext,
  useDocument,
  ElementContext,
  useElementContext,
} from './context';
export type { DocumentContextValue, ElementContextValue } from './context';

// Utils
export {
  isPlainObject,
  isResponsiveObject,
  normalizeSliderValue,
  normalizeTimeValue,
  normalizeFlexGapValue,
  normalizeLineHeight,
  normalizeLink,
  normalizeIcon,
  normalizeImage,
  normalizeTextShadow,
  normalizeDimensions,
  normalizePercentValue,
  normalizeButtonIconAlign,
  normalizeIconListAlign,
  normalizeTextAlign,
  normalizeIconBoxPosition,
  normalizeImageBoxPosition,
  normalizeBoxVerticalAlign,
  booleanToElementorYes,
  booleanToElementorShow,
  getDomAttributes,
  setResponsiveSetting,
  setResponsiveNumberSetting,
  setTextStrokeSettings,
  setBoxTextStyleSettings,
  setCssFilterSettings,
  setSimpleTypographySettings,
  normalizeGalleryImage,
  normalizeCarouselImage,
  stableRepeaterId,
  slugifyFieldId,
  normalizeFormOptions,
  normalizeElementorFormField,
  normalizeSlideItem,
  normalizeGridGaps,
  normalizeGridTrackValue,
  formatGridTrack,
  mapSharedLayoutProps,
} from './utils';

// Mappers
export { mapGridProps, mapFlexboxProps, mapWidgetProps } from './mappers';

// CSS
export {
  asPreviewSettings,
  layoutPositionClass,
  getContainerPreviewCSS,
  getHeadingCSS,
  getTextEditorCSS,
  getButtonCSS,
  getIconCSS,
  getIconBoxCSS,
  getIconListCSS,
  getImageBoxCSS,
  getAccordionCSS,
  getToggleCSS,
  getTabsCSS,
  getImageGalleryCSS,
  getCounterCSS,
  progressPercent,
  getProgressCSS,
  getImageCarouselCSS,
  getNavMenuCSS,
  getElementorFormCSS,
  getSlidesCSS,
  getImageCSS,
  widgetDataSettings,
} from './css';

// Compiler
export {
  resetIdCounter,
  generateSequentialId,
  generateElementId,
  compileReactPage,
  createElement,
  createDocument,
} from './compiler';

// Components
export {
  Page,
  Grid,
  Flexbox,
  Section,
  Heading,
  TextEditor,
  Button,
  Icon,
  IconBox,
  IconList,
  ImageBox,
  Accordion,
  Toggle,
  Tabs,
  ImageGallery,
  Counter,
  Progress,
  ProgressBar,
  ImageCarousel,
  NavMenu,
  ElementorForm,
  Slides,
  Image,
  DocumentBuilder,
} from './components';
