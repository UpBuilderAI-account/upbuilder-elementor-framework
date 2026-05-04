# Elementor Framework Component Reference

This directory documents the public Elementor framework components and the broader widget registry/export behavior used by the backend parser and Elementor builder.

## Public Build Surface

These files map the components exported from `@upbuilder/elementor-framework` and supported by the Elementor prompt reference.

### Runtime And Layout

- [Page](./page.md)
- [DocumentBuilder](./document-builder.md)
- [Section](./section.md)
- [Flexbox](./flexbox.md)
- [Grid](./grid.md)
- [Factory utilities](./factory-utilities.md)

### Core Widgets

- [Heading](./heading.md)
- [TextEditor](./text-editor.md)
- [Button](./button.md)
- [Image](./image.md)
- [Icon](./icon.md)

### Box, List, And Media Widgets

- [IconBox](./icon-box.md)
- [ImageBox](./image-box.md)
- [IconList](./icon-list.md)
- [ImageGallery](./image-gallery.md)
- [ImageCarousel](./image-carousel.md)
- [Slides](./slides.md)

### Interactive And Metric Widgets

- [Accordion](./accordion.md)
- [Toggle](./toggle.md)
- [Tabs](./tabs.md)
- [Counter](./counter.md)
- [Progress](./progress.md)
- [ProgressBar](./progress-bar.md)

### Navigation And Forms

- [NavMenu](./nav-menu.md)
- [ElementorForm](./elementor-form.md)
- [Form fields](./form-fields.md)

## Registry And Backend Coverage

- [Supported widget registry](./supported-widget-registry.md)
- [Validation and export caveats](./validation-and-export-caveats.md)

The registry/backend surface is intentionally broader than the public JSX component surface. Treat `src/index.ts` plus `backendv2/src/prompts/build/elementor/framework-reference.md` as the authoritative build-generation contract. Treat the broader registry/parser support as import, compatibility, or partial backend export support unless a component is also exported publicly.

## Source Files

Primary framework sources:

- `upbuilder-elementor-framework/src/index.ts`
- `upbuilder-elementor-framework/src/builder/abstraction/index.tsx`
- `upbuilder-elementor-framework/src/widgets/registry.ts`

Primary backend export sources:

- `backendv2/src/generators/react/react-parser.ts`
- `backendv2/src/generators/elementor/elementor-builder/orchestrator.ts`
- `backendv2/src/generators/elementor/elementor-builder/element-builder.ts`
- `backendv2/src/generators/elementor/props-to-settings.ts`
- `backendv2/src/validation/platforms/elementor.ts`
