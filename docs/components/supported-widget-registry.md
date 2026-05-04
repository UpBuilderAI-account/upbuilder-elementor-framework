# Supported Widget Registry

## Purpose

The framework registry maps widget keys to Elementor widget metadata. It is exported publicly, but it is not the same thing as "implemented React components" and it is broader than the parser/backend validation sets.

Primary file:

```ts
upbuilder-elementor-framework/src/widgets/registry.ts
```

Public exports:

```ts
import {
  WIDGET_REGISTRY,
  getWidgetDef,
  getWidgetDefByUpbuilderType,
  getUpbuilderType,
  isValidWidgetType,
  getWidgetsByCategory,
  getWidgetsByPlugin,
  isVoidElement,
  getRequiredChildren,
  getPropertyPrefix,
  getDefaultSettings,
} from '@upbuilder/elementor-framework';

import type { WidgetDefinition } from '@upbuilder/elementor-framework';
```

## Registry Shape

```ts
interface WidgetDefinition {
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
```

Lookup keys are registry keys, not always Elementor `widgetType` values. Examples: `google-maps` maps to Elementor `google_maps`; `metform` maps to `mf`; `jkit-nav-menu` maps to `jkit_nav_menu`.

## Public Framework Exports

The public abstraction exports these implemented JSX components from `src/index.ts`:

| Group | Public components |
| --- | --- |
| Document/layout | `DocumentBuilder`, `Flexbox`, `Grid`, `Section` |
| Core widgets | `Heading`, `TextEditor`, `Button`, `Icon`, `IconBox`, `IconList`, `Accordion`, `Toggle`, `Tabs`, `Counter`, `Progress`, `ProgressBar`, `Image`, `ImageBox`, `ImageGallery`, `ImageCarousel` |
| Elementor Pro implemented widgets | `NavMenu`, `ElementorForm`, `Slides` |
| Utilities | `createElement`, `createDocument` |

Types are also exported for the implemented props and item shapes, including `NavMenuProps`, `NavMenuItem`, `ElementorFormProps`, `ElementorFormField`, `SlidesProps`, and `SlideItem`.

Important distinction: registry entries such as `Video`, `GoogleMaps`, `Divider`, `Spacer`, `SocialIcons`, `Testimonial`, `StarRating`, `Alert`, `CallToAction`, `SearchForm`, and many other Pro entries can exist in `WIDGET_REGISTRY` or backend mappings without being public React components in this framework package.

## Framework Registry Entries

### Layout

| Key | elType | widgetType | UpBuilder type | Plugin | Defaults |
| --- | --- | --- | --- | --- | --- |
| `container` | container | `container` | `Flexbox` | elementor | `content_width: full` |
| `flexbox` | container | `container` | `Flexbox` | elementor | `content_width: full`, `flex_direction: column` |
| `grid` | container | `container` | `Grid` | elementor | `container_type: grid`, `content_width: full` |
| `section` | container | `container` | `Section` | elementor | `content_width: full` |

### Core Elementor Widgets

| Key | widgetType | UpBuilder type | Category | Defaults / notes |
| --- | --- | --- | --- | --- |
| `heading` | `heading` | `Heading` | typography | `header_size: h2`, `size: default` |
| `text-editor` | `text-editor` | `TextEditor` | typography | none |
| `button` | `button` | `Button` | typography | `size: sm` |
| `image` | `image` | `Image` | media | `image_size: full` |
| `image-gallery` | `image-gallery` | `ImageGallery` | media | `gallery_columns: 4`, `gallery_link: file` |
| `video` | `video` | `Video` | media | registry/backend parser and builder support; not public JSX export |
| `google-maps` | `google_maps` | `GoogleMaps` | media | `zoom: 10`, `height: 300px`; registry/backend parser and builder support; not public JSX export |
| `icon` | `icon` | `Icon` | typography | `view: default` |
| `icon-box` | `icon-box` | `IconBox` | typography | `view: default`, `position: top` |
| `icon-list` | `icon-list` | `IconList` | typography | none |
| `image-box` | `image-box` | `ImageBox` | media | `position: top` |
| `divider` | `divider` | `Divider` | layout | registry/backend support; not public JSX export |
| `spacer` | `spacer` | `Spacer` | layout | registry/backend support; not public JSX export |
| `counter` | `counter` | `Counter` | interactive | `starting_number: 0`, `duration: 2000` |
| `progress` | `progress` | `Progress` | interactive | `progress_type: default`, `display_percentage: show` |
| `testimonial` | `testimonial` | `Testimonial` | interactive | registry entry and validator allowance; backend parser/builder support is not currently a first-class mapped path |
| `star-rating` | `star-rating` | `StarRating` | interactive | registry/backend support; not public JSX export |
| `alert` | `alert` | `Alert` | interactive | registry/backend support; public backend component name is often `AlertBox` |
| `accordion` | `accordion` | `Accordion` | interactive | `icon_align: right` |
| `tabs` | `tabs` | `Tabs` | interactive | `type: horizontal` |
| `toggle` | `toggle` | `Toggle` | interactive | `icon_align: right` |
| `image-carousel` | `image-carousel` | `ImageCarousel` | media | slides/navigation/autoplay defaults |
| `social-icons` | `social-icons` | `SocialIcons` | interactive | registry/backend support; not public JSX export |
| `html` | `html` | `Html` | interactive | registry/backend support; backend parser uses `HtmlEmbed` |

All listed widget entries are marked `voidElement: true`.

Note: public validation accepts some registry/backend-only component names even when the package does not export a JSX component for them. Validation success is not proof that `import { Video } from '@upbuilder/elementor-framework'` or similar will work.

### Native Elementor Pro Entries

| Key | widgetType | UpBuilder type | Category | Public JSX component? |
| --- | --- | --- | --- | --- |
| `nav-menu` | `nav-menu` | `NavMenu` | navigation | yes |
| `form` | `form` | `ElementorForm` | forms | yes |
| `call-to-action` | `call-to-action` | `CallToAction` | interactive | backend mapping only in current package |
| `flip-box` | `flip-box` | `FlipBox` | interactive | registry only |
| `slides` | `slides` | `Slides` | interactive | yes |
| `media-carousel` | `media-carousel` | `MediaCarousel` | media | registry only |
| `testimonial-carousel` | `testimonial-carousel` | `TestimonialCarousel` | interactive | registry only |
| `countdown` | `countdown` | `Countdown` | interactive | registry only |
| `price-table` | `price-table` | `PriceTable` | interactive | registry only |
| `price-list` | `price-list` | `PriceList` | interactive | registry only |
| `posts` | `posts` | `Posts` | interactive | registry only |
| `gallery` | `gallery` | `Gallery` | media | registry only |
| `share-buttons` | `share-buttons` | `ShareButtons` | interactive | backend mapping only in current package |
| `blockquote` | `blockquote` | `Blockquote` | typography | registry only |
| `animated-headline` | `animated-headline` | `AnimatedHeadline` | typography | registry only |
| `search-form` | `search-form` | `SearchForm` | navigation | backend mapping only in current package |
| `table-of-contents` | `table-of-contents` | `TableOfContents` | navigation | registry only |
| `lottie` | `lottie` | `Lottie` | media | registry only |
| `code-highlight` | `code-highlight` | `CodeHighlight` | typography | registry only |
| `hotspot` | `hotspot` | `Hotspot` | interactive | registry only |
| `reviews` | `reviews` | `Reviews` | interactive | registry only |

### Legacy / Third-Party Entries

| Key | widgetType | UpBuilder type | Plugin | Prefix | Status |
| --- | --- | --- | --- | --- | --- |
| `metform` | `mf` | `Form` | metform | `mf_` | Legacy addressable entry; native `form` is separate. Backend comments say MetForm support was removed. |
| `jkit-nav-menu` | `jkit_nav_menu` | `JkitNavMenu` | jkit | `sg_` | Legacy registry entry. Backend comments say JKit support was removed. |
| `jkit-icon-box` | `jkit_icon_box` | `JkitIconBox` | jkit | `sg_` | Legacy registry entry. Backend comments say JKit support was removed. |
| `jkit-testimonials` | `jkit_testimonials` | `JkitTestimonials` | jkit | `sg_` | Legacy registry entry. Backend comments say JKit support was removed. |

## Helper Semantics

| Helper | Behavior |
| --- | --- |
| `getWidgetDef(widgetType)` | Looks up `WIDGET_REGISTRY[widgetType]`. Despite the parameter name, this is registry-key lookup. |
| `getWidgetDefByUpbuilderType(upbuilderType)` | Returns the first matching definition by `upbuilderType`. If multiple entries share a component type, the first registry order wins. |
| `getUpbuilderType(widgetType)` | Returns `WIDGET_REGISTRY[widgetType]?.upbuilderType`. Registry-key lookup. |
| `isValidWidgetType(widgetType)` | Checks the key exists in `WIDGET_REGISTRY`. |
| `getWidgetsByCategory(category)` | Filters values by `category`. |
| `getWidgetsByPlugin(plugin)` | Filters values by `plugin`. |
| `isVoidElement(widgetType)` | Reads `voidElement` by registry key, defaulting to `false`. |
| `getRequiredChildren(widgetType)` | Reads `requiredChildren` by registry key. Current registry entries do not define required children. |
| `getPropertyPrefix(widgetType)` | Returns `propertyPrefix` or empty string. |
| `getDefaultSettings(widgetType)` | Returns `defaultSettings` or `{}`. |

## Backend Registry And Validation Support

The backend has its own mappings:

| File | Role |
| --- | --- |
| `backendv2/src/generators/elementor/types.ts` | `COMP_TYPE_TO_ELEMENTOR` maps parsed component types to Elementor `elType`/`widgetType`; `ELEMENTOR_WIDGET_TYPES_KEBAB` is the kebab/underscore widget allow-list. |
| `backendv2/src/generators/react/react-parser.ts` | Maps JSX component names into structure component types and captures Elementor widget props/style props. |
| `backendv2/src/generators/elementor/elementor-builder/element-builder.ts` | Converts structure elements and style props to Elementor settings, with explicit cases for implemented/supported widgets. |
| `backendv2/src/generators/elementor/elementor-builder/validator.ts` | Validates generated settings against per-widget setting allow-lists. |
| `backendv2/src/generators/elementor/elementor-parser/type-mapping.ts` | Reverse maps Elementor `widgetType` values back to UpBuilder component types. |
| `backendv2/src/validation/platforms/elementor.ts` | Platform-level valid component sets and hierarchy rules. |

Backend type mapping includes more aliases and parser/export targets than the framework public exports. Examples include Webflow-like aliases (`Paragraph`, `Span`, `RichText`, `Map`, `HtmlEmbed`), nested widgets (`NestedTabs`, `NestedAccordion`, `NestedCarousel`), theme/search widgets (`SiteLogo`, `SearchForm`), and carousel/swiper helper components.

Export ZIP metadata currently identifies `nav-menu`, `form`, and `slides` as Pro usage. Backend compatibility mappings can also emit Pro/theme widgets such as `call-to-action`, `share-buttons`, `search-form`, and `theme-site-logo`; those extra requirements may not be reflected in template-kit metadata.

Backend `ELEMENTOR_WIDGET_TYPES_KEBAB` currently allows:

```txt
heading, text-editor, image, video, button, divider, spacer, google_maps,
icon, image-box, icon-box, star-rating, image-carousel, image-gallery,
icon-list, counter, progress, testimonial, tabs, accordion, toggle,
social-icons, alert, audio, shortcode, html, menu-anchor, sidebar,
read-more, text-path, nested-tabs, nested-accordion, nested-carousel,
nav-menu, search-form, form, slides, share-buttons, call-to-action,
theme-site-logo
```

This backend allow-list is not identical to `WIDGET_REGISTRY`. For example, backend validation allows `theme-site-logo`, while the framework registry does not list it; framework registry lists many Pro widgets such as `lottie`, `hotspot`, and `reviews` that are not in the backend kebab allow-list shown above.

## Nav And Form Status

| Component | Framework export | Registry | Backend type mapping | Platform validation |
| --- | --- | --- | --- | --- |
| `NavMenu` | yes | `nav-menu` -> `nav-menu`, plugin `elementor-pro` | `NavMenu` -> `nav-menu`; reverse parser maps `nav-menu` -> `NavMenu` | Listed in `ELEMENTOR_PRO_WIDGETS` |
| `ElementorForm` | yes | `form` -> `form`, plugin `elementor-pro` | `ElementorForm` -> `form`; reverse parser maps `form` -> `ElementorForm` | Listed in `ELEMENTOR_PRO_WIDGETS` |

## Caveats And Inconsistencies

- `WIDGET_REGISTRY` is useful metadata, not proof that a JSX component exists.
- `getWidgetDef()` and related helpers use registry keys, which sometimes differ from actual Elementor `widgetType` values.
- Platform validation's `getRequiredPlugin()` currently returns `elementor` for every widget, even though `NavMenu`, `ElementorForm`, and `Slides` are listed as Pro widgets elsewhere.
- Backend comments say JKit, MetForm, and generic Form widgets were removed, but the framework registry keeps legacy third-party entries addressable.
- Backend parser recognizes responsive `Laptop` suffixes generically; the framework component mappers mainly emit desktop/tablet/mobile settings.
- All framework registry widgets are leaf/void widgets except containers. Backend platform validation also treats all widgets as leaf nodes and only containers as child-bearing elements.

## Example

```ts
import {
  getWidgetDef,
  getWidgetsByPlugin,
  isVoidElement,
} from '@upbuilder/elementor-framework';

const nav = getWidgetDef('nav-menu');

console.log(nav?.widgetType);      // nav-menu
console.log(nav?.upbuilderType);   // NavMenu
console.log(nav?.plugin);          // elementor-pro

const proWidgets = getWidgetsByPlugin('elementor-pro')
  .map((widget) => widget.upbuilderType);

console.log(isVoidElement('form')); // true
```
