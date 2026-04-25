# UpBuilder Elementor Framework Reference

Use only the exported primitives from `@upbuilder/elementor-framework`:

```tsx
import { Section, Grid, Flexbox, Heading, TextEditor, Button, Icon, Image } from '@upbuilder/elementor-framework';
```

## Current API Only

Do not use old shorthand props such as `bg`, `typography`, `columnsMobile`, `gapMobile`, `paddingMobile`, `imageSize`, `textAlign`, `p`, `px`, `py`, `cols`, `as`, `src`, or button `color`.

Use these current props instead:

| Need | Prop |
|------|------|
| Background color | `backgroundColor` |
| Background image | `backgroundImage={{ url, size, position, repeat }}` |
| Button text color | `textColor` |
| Hover colors | `hoverBackgroundColor`, `hoverTextColor` |
| Typography | `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing`, `textTransform` |
| Text alignment | `align` on `Heading` / `TextEditor` |
| Container alignment | `alignItems` on `Section` / `Flexbox` |
| Flex layout | `direction`, `wrap`, `width`, `justify`, `alignItems`, `gap` on `Section` / `Flexbox` |
| Responsive values | `{ desktop, tablet, mobile }` object on the same prop |
| Image size | `image_size` |
| Image/Icon alignment | Required `align`; framework fallback is left, but generated code must set it |
| Border | `borderType`, `borderWidth`, `borderColor`, `borderRadius` |
| Spacing | `padding`, `margin` |
| Custom positioning | `positioning={{ mode, horizontal, vertical, zIndex }}` |
| Layering | `zIndex` |
| Sticky bars | `sticky` (Elementor Pro required) |

Use `backgroundImage` as one object on `Section` or `Flexbox`:

```tsx
backgroundImage={{
  url: "asset://hero.webp",
  size: "cover",
  position: "center center",
  repeat: "no-repeat",
}}
```

Do not use `backgroundSize`, `backgroundPosition`, or `backgroundRepeat`; put those values inside `backgroundImage`.

## Positioning

Use normal Grid/Flexbox layout first. Use `positioning` only for overlays, badges, decorative layers, fixed bars, pinned UI, and intentional overlaps.

```tsx
<Image
  image="asset://badge.webp"
  image_size="full"
  align="left"
  width={80}
  positioning={{
    mode: "absolute",
    horizontal: { side: "end", offset: 24 },
    vertical: { side: "start", offset: 24 },
    zIndex: 3,
  }}
/>
```

`mode` supports `"absolute"` and `"fixed"`. Use `side: "start"` and `side: "end"` instead of left/right so Elementor can handle RTL correctly. `zIndex` can be used directly on any component, including responsive values.

Sticky headers/bars use `sticky`, not `positioning.mode`. Sticky requires Elementor Pro:

```tsx
<Section contentWidth="full" wrap="nowrap" padding={0} sticky={{ side: "top", devices: ["desktop", "tablet"], offset: 0 }} zIndex={50}>
  {/* header */}
</Section>
```

## Containers

### Section

Top-level page section. `contentWidth` and `wrap` are required.

```tsx
<Section
  contentWidth="full"
  wrap="wrap"
  alignItems="center"
  padding={{
    desktop: { top: 80, right: 48, bottom: 80, left: 48 },
    mobile: { top: 48, right: 24, bottom: 48, left: 24 },
  }}
  backgroundColor="#f5f5f5"
  data-html-id="hero"
>
  {/* content */}
</Section>
```

### Grid

Use Grid for multi-Flexbox layouts. `columns`, `rows`, and `contentWidth` are required.

```tsx
<Grid
  columns={{ desktop: 3, tablet: 2, mobile: 1 }}
  rows={{ desktop: 1, tablet: 2, mobile: 3 }}
  contentWidth="full"
  gap={{ desktop: 32, mobile: 20 }}
  padding={0}
  data-html-id="features-grid"
>
  <Flexbox contentWidth="full" direction="column" wrap="nowrap" width="100%" gap={16} padding={24} backgroundColor="#fff">Card 1</Flexbox>
  <Flexbox contentWidth="full" direction="column" wrap="nowrap" width="100%" gap={16} padding={24} backgroundColor="#fff">Card 2</Flexbox>
  <Flexbox contentWidth="full" direction="column" wrap="nowrap" width="100%" gap={16} padding={24} backgroundColor="#fff">Card 3</Flexbox>
</Grid>
```

### Flexbox

Use Flexbox for flex layouts and styled wrappers. `contentWidth`, `wrap`, and `width` are required. `direction` defaults to `row`; set `direction="column"` for vertical stacks.

Use `width="100%"` for full-width wrappers, cards, grid items, columns, and vertical layout stacks. Use `width="auto"` for chips, pills, nav items, compact buttons, badges, and other inline controls inside a row or wrap parent.

```tsx
<Flexbox
  contentWidth="full"
  direction="column"
  wrap="nowrap"
  width="100%"
  gap={16}
  padding={{ desktop: 24, mobile: 16 }}
  backgroundColor="#ffffff"
  borderRadius={8}
  alignItems="center"
  justify="center"
  data-html-id="card"
>
  <Heading title="Title" tag="h3" />
  <TextEditor content="<p>Description paragraph.</p>" />
</Flexbox>
```

Inline chip example:

```tsx
<Flexbox contentWidth="full" wrap="wrap" width="100%" gap={20} padding={0} justify="center">
  <Flexbox contentWidth="full" wrap="nowrap" width="auto" gap={16} padding={{ top: 12, right: 24, bottom: 12, left: 24 }}>
    <TextEditor content="<p><strong>Category</strong></p>" align="left" />
    <Image image="asset://caret.webp" image_size="full" align="left" width={{ size: 24, unit: "px" }} />
  </Flexbox>
</Flexbox>
```


## Widgets

### Heading

```tsx
<Heading
  title="Page Title"
  tag="h1"
  color="#111111"
  fontSize={{ desktop: 56, mobile: 36 }}
  fontWeight={700}
  lineHeight={1.1}
  align="center"
  data-html-id="hero-heading"
/>
```

`tag` supports `h1` through `h6`, `p`, and `span`.

### TextEditor

```tsx
<TextEditor
  content="<p>Paragraph content here.</p>"
  color="#666666"
  fontSize={18}
  lineHeight={1.6}
  align="center"
  data-html-id="hero-text"
/>
```

### Button

```tsx
<Button
  text="Get Started"
  align="center"
  backgroundColor="#111111"
  textColor="#ffffff"
  hoverBackgroundColor="#333333"
  hoverTextColor="#ffffff"
  padding={{ top: 16, right: 32, bottom: 16, left: 32 }}
  borderRadius={4}
  fontWeight={600}
  link={{ url: "#cta" }}
  data-html-id="hero-button"
/>
```

For navigation links, use Button with transparent background:

```tsx
<Button
  text="About"
  align="center"
  backgroundColor="transparent"
  textColor="#333333"
  padding={0}
  link={{ url: "#about" }}
  data-html-id="nav-about"
/>
```

### Icon

`align` is required. The framework falls back to left internally, but generated code must always set it explicitly.

```tsx
<Icon
  icon="fas fa-bolt"
  align="left"
  size={28}
  color="#111111"
  data-html-id="feature-icon"
/>
```

### Image

`image`, `image_size`, and `align` are required. The framework falls back to left internally, but generated code must always set `align` explicitly.

```tsx
<Image
  image="https://placehold.co/600x500/e5e5e5/666666?text=Hero"
  image_size="full"
  align="left"
  width="100%"
  borderRadius={8}
  data-html-id="hero-image"
/>
```

## Patterns

### Hero

```tsx
<Section
  contentWidth="full"
  wrap="wrap"
  alignItems="center"
  padding={{
    desktop: { top: 120, right: 48, bottom: 120, left: 48 },
    mobile: { top: 64, right: 24, bottom: 64, left: 24 },
  }}
  backgroundColor="#fafafa"
  data-html-id="hero"
>
  <Grid columns={{ desktop: 2, mobile: 1 }} rows={1} contentWidth="full" gap={{ desktop: 64, mobile: 32 }} padding={0} data-html-id="hero-grid">
    <Flexbox contentWidth="full" direction="column" wrap="nowrap" width="100%" gap={32} padding={0} justify="center" data-html-id="hero-content">
      <Heading title="Welcome" tag="h1" color="#111" fontSize={{ desktop: 56, mobile: 36 }} fontWeight={700} lineHeight={1.1} data-html-id="hero-heading" />
      <TextEditor content="<p>Hero description.</p>" color="#666" fontSize={18} lineHeight={1.6} data-html-id="hero-text" />
      <Grid columns={{ desktop: 2, mobile: 1 }} rows={1} contentWidth="full" gap={16} padding={0} data-html-id="hero-buttons">
        <Button text="Get Started" align="center" backgroundColor="#111" textColor="#fff" padding={{ top: 16, right: 32, bottom: 16, left: 32 }} borderRadius={4} link={{ url: "#cta" }} data-html-id="hero-primary" />
        <Button text="Learn More" align="center" backgroundColor="transparent" textColor="#111" borderType="solid" borderWidth={1} borderColor="#111" padding={{ top: 16, right: 32, bottom: 16, left: 32 }} borderRadius={4} link={{ url: "#about" }} data-html-id="hero-secondary" />
      </Grid>
    </Flexbox>
    <Flexbox contentWidth="full" direction="row" wrap="nowrap" width="100%" gap={0} padding={0} alignItems="center" justify="center" data-html-id="hero-image-col">
      <Image image="https://placehold.co/600x500/e5e5e5/666666?text=Hero" image_size="full" align="left" width="100%" borderRadius={8} data-html-id="hero-image" />
    </Flexbox>
  </Grid>
</Section>
```

## Elementor Defaults To Override

| Default | Override |
|---------|----------|
| Section/Flexbox/Grid padding: 10px | `padding={0}` or explicit padding |
| Section/Flexbox/Grid gap: 20px | `gap={...}` |
| Flexbox child width in flex rows | `width="100%"` for fill, `width="auto"` for intrinsic inline sizing |
| Button default background | `backgroundColor="..."` or `backgroundColor="transparent"` |
| Button default text color | `textColor="..."` |
| Icon default size/color | `size={...}` and `color="..."` |

## Troubleshooting

```tsx
// Multi-Flexbox layout
<Grid columns={3} rows={1} contentWidth="full" gap={24} padding={0} />

// Vertical stack
<Flexbox contentWidth="full" direction="column" wrap="nowrap" width="100%" gap={16} padding={0} />

// Text-only nav button
<Button text="Home" align="center" backgroundColor="transparent" textColor="#333" padding={0} link={{ url: "/" }} />
```
