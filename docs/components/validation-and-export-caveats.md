# Validation And Export Caveats

## Purpose

This file collects cross-cutting rules that apply across multiple component docs. Individual component files describe the public prop surface; this page documents the places where prompt rules, framework runtime behavior, parser capture, backend export, and validation do not perfectly line up.

## Required Props And Defaults

The prompt reference and validator are intentionally stricter than TypeScript for stable Elementor output. In practice, generated code should provide explicit defaults for layout and core widget props even when TypeScript marks them optional.

Important validator-required or strongly expected values include:

| Component | Values to provide explicitly |
| --- | --- |
| `Section` | `contentWidth`, `wrap`, `padding`; prompt also asks for `name` |
| `Grid` | `columns`, `rows`, `contentWidth`, `padding`, `gap` |
| `Flexbox` | `contentWidth`, `wrap`, `width`, `padding`, `gap` |
| `Heading` | `title`, `tag`, `align`, `color`, `fontSize`, `fontWeight`, `lineHeight` |
| `TextEditor` | `content`, `align`, `color`, `fontSize`, `lineHeight`, `paragraphSpacing` |
| `Button` | `text` or `icon`, `backgroundColor`, `textColor`, `padding` |
| `Icon` | `icon`, `color`, `size` |
| `Image` | `image`, `image_size` |

Some prompt requirements are stricter than validator requirements. For example, prompt guidance asks for `Section.name` and fuller `IconBox`/`ImageBox` content props, while validation focuses on the minimum needed to avoid broken Elementor JSON.

## Responsive Rules

Use responsive objects with `desktop`, `tablet`, and `mobile` keys for first-class responsive props:

```tsx
fontSize={{ desktop: 56, tablet: 44, mobile: 34 }}
```

Avoid breakpoint-suffixed JSX props such as `fontSizeTablet`, `paddingMobile`, `colsTablet`, or `rowsMobile` in generated framework code. Some backend compatibility paths know older aliases, but the public framework contract is responsive object syntax.

Shared `BaseProps` also include responsive `zIndex` and advanced `positioning`/`sticky` fields. These are inherited by most components even when a component doc focuses on widget-specific fields.

## Positioning And Sticky

The framework type surface can express `absolute`, `fixed`, and sticky settings. The prompt contract is stricter: prefer normal layout, use `positioning.mode: 'absolute'` only when necessary, and do not generate fixed or sticky positioning unless explicitly requested.

Backend prop export for `sticky` maps only the core sticky controls currently produced by `props-to-settings.ts`: `sticky`, `sticky_offset`, `sticky_effects_offset`, and `sticky_parent`. It does not emit every native Elementor sticky control such as `sticky_on` or `sticky_anchor_link_offset` from first-class JSX props.

## Grid Rules

Framework `<Grid>` is supported and maps to Elementor container grid settings.

Raw CSS grid declarations are not supported in arbitrary CSS classes. Avoid:

- `display: grid`
- `display: inline-grid`
- `grid-template-*`
- `grid-row` / `grid-column`
- `grid-auto-flow`
- `justify-items`
- grid placement shorthands

Use the `Grid` component props instead.

## Removed Or Forbidden JSX Props

Do not use old shorthand or removed aliases in generated framework code:

```txt
p, px, py, m, mx, my, bg, cols,
*Tablet, *Mobile breakpoint suffix props,
Button.color, Button.bgHover, Button.border, Button.typography,
Image.src, Image.imageSize,
Flexbox.columns, Flexbox.rows
```

Prefer the explicit public props documented in each component file.

## Raw Settings

`settings={{ ... }}` merges last and can override generated settings. It is useful for native Elementor controls that have no first-class prop, but it can bypass prompt-level safety.

Raw settings often need Elementor enable/toggle fields. Examples:

| Control family | Typical toggle |
| --- | --- |
| Typography | `*_typography: 'custom'` |
| Background | `*_background: 'classic'` or equivalent |
| Border | `*_border: 'solid'` |
| Shadow | `*_box_shadow_type: 'yes'` |

Avoid raw overlay slideshow/gallery settings, raw shadow objects without the matching toggle, and raw `background_overlay_image` unless the target Elementor control family is fully understood.

## CSS Validation Caveats

The CSS conversion path rejects or flags several patterns that the framework prop path may avoid:

- structural pseudo selectors and pseudo-elements that Elementor cannot represent safely
- ID selectors and universal selectors in authored CSS
- multi-stop, conic, and repeating gradients
- `margin: auto`
- `backdrop-filter`
- `clip-path` and masks
- percentage translate transforms and 3D transforms
- `aspect-ratio`
- container queries
- scroll snap and scroll behavior
- breakpoint-suffixed CSS property names such as `padding_mobile`

Prefer typed framework props over arbitrary CSS when a prop exists.

## Pro And Partial Support

Public Pro JSX components are `NavMenu`, `ElementorForm`, and `Slides`. Backend compatibility mappings can also emit Pro/theme widgets such as `call-to-action`, `share-buttons`, `search-form`, and `theme-site-logo`, but export metadata currently does not always report those extra Pro requirements.

The registry and validation layer accept some component names that are not public JSX exports. Passing validation is not proof that a component can be imported from `@upbuilder/elementor-framework`.

## Import And Render Diagnostics

Elementor ZIP import is a lossy compatibility path today. The import generator still emits React using the Webflow framework in places, so imported templates are not a true Elementor-framework round trip.

The full-page PHP render report page requests fast JSON by default, so browser diagnostics are usually absent unless the request includes `diagnostics=true` or the ZIP report is downloaded.
