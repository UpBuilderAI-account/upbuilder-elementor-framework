# Elementor Form Fields

## Purpose

`ElementorFormField` describes one item in the native Elementor Pro Form widget's `form_fields` repeater. The framework accepts friendly prop names and normalizes them into Elementor setting names.

Fields are only used through `ElementorForm`:

```tsx
import { ElementorForm } from '@upbuilder/elementor-framework';
import type { ElementorFormField } from '@upbuilder/elementor-framework';
```

## TypeScript API

```ts
type ElementorFormField = {
  _id?: string;
  custom_id?: string;
  type?: 'text' | 'email' | 'textarea' | 'url' | 'tel' | 'radio' | 'select' | 'checkbox' | 'acceptance' | 'number' | 'date' | 'time' | 'upload' | 'password' | 'html' | 'hidden';
  field_type?: string;
  label?: string;
  field_label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string | string[];
  field_options?: string;
  defaultValue?: string;
  field_value?: string;
  width?: string;
  rows?: number;
  css_classes?: string;
  field_html?: string;
  allow_multiple?: boolean;
  inline_list?: boolean;
  select_size?: number;
  min?: number;
  max?: number;
};
```

Backend builder also accepts these additional field keys when parsed through `backendv2`: `file_types`, `allowed_types`, `max_files`, `max_file_size`, and `acceptance_text`.

## Field Normalization

Framework normalization is handled by `normalizeElementorFormField(field, index)`.

| Input | Output setting | Default / notes |
| --- | --- | --- |
| `_id` | `_id` | If absent, generated as `field_{index + 1}`. |
| `custom_id` | `custom_id` | If absent, uses `_id`, then a slug from label/type. |
| `field_type` / `type` | `field_type` | `field_type` wins; defaults to `text`. |
| `field_label` / `label` | `field_label` | `field_label` wins; defaults to empty string. |
| `placeholder` | `placeholder` | Defaults to empty string. |
| `required` | `required` | `true` -> `true` string, otherwise empty string. |
| `width` | `width` | Defaults to `100`. |
| `field_value` / `defaultValue` | `field_value` | Only emitted when provided; `field_value` wins. |
| `field_options` / `options` | `field_options` | Arrays become newline-delimited strings. |
| `rows` | `rows` | Textarea rows. |
| `css_classes` | `css_classes` | Raw class string. |
| `field_html` | `field_html` | Used by `html` preview field. |
| `allow_multiple` | `allow_multiple` | `true` -> `true` string, `false` -> empty string. |
| `inline_list` | `inline_list` | `true` -> `yes`, `false` -> empty string. |
| `select_size` | `select_size` | Number. |
| `min` | `field_min` | Number input min. |
| `max` | `field_max` | Number input max. |

For `checkbox` and `radio`, if no options are supplied, the framework uses the label or field type as a one-option fallback.

## Supported Field Types

Framework union:

| Type | Preview rendering |
| --- | --- |
| `text` | `<input type="text">` |
| `email` | `<input type="email">` |
| `textarea` | `<textarea>` with `rows` defaulting to `4`. |
| `url` | `<input type="url">` |
| `tel` | `<input type="tel">` |
| `radio` | Option subgroup, one input per newline-delimited option. |
| `select` | `<select>` with options from `field_options`. |
| `checkbox` | Option subgroup, checkbox input names include `[]`. |
| `acceptance` | Single checkbox plus label; no normal field label is rendered by preview. |
| `number` | `<input type="number">` with `field_min` / `field_max`. |
| `date` | `<input type="date">` |
| `time` | `<input type="time">` |
| `upload` | `<input type="file">` |
| `password` | `<input type="password">` |
| `html` | `<div class="elementor-field elementor-field-html">` with `field_html` or `field_value` as HTML. |
| `hidden` | `<input type="hidden">`; no label/group label. |

`field_type` is typed as `string`, so raw Elementor field types can be passed even when they are not listed in the `type` union. Preview falls back to `<input type="{field_type}">`, except `upload` maps to `file`.

## Responsive Support

Fields themselves do not accept `ResponsiveValue` props in the framework type. Field width is a scalar string that becomes an Elementor column class such as `elementor-col-50`.

Responsive layout belongs to `ElementorForm` props:

| Form prop | Setting |
| --- | --- |
| `buttonWidth` | `button_width`, `button_width_tablet`, `button_width_mobile` |
| `buttonAlign` | `button_align`, `button_align_tablet`, `button_align_mobile` |
| `columnGap` | `column_gap`, `column_gap_tablet`, `column_gap_mobile` |
| `rowGap` | `row_gap`, `row_gap_tablet`, `row_gap_mobile` |
| `fieldBorderRadius` | `field_border_radius`, `field_border_radius_tablet`, `field_border_radius_mobile` |

Backend validation only accepts Elementor-native column widths for field and button widths: `10`, `11`, `12`, `14`, `16`, `20`, `25`, `30`, `33`, `40`, `50`, `60`, `66`, `70`, `75`, `80`, `83`, `90`, `100`.

## Preview Behavior

Each visible field renders inside:

```html
<div class="elementor-field-type-text elementor-field-group elementor-column elementor-field-group-name elementor-col-100">
```

Preview details:

| Behavior | Notes |
| --- | --- |
| Field id | `form-field-{custom_id}`. |
| Field name | `form_fields[{custom_id}]`; checkboxes use `form_fields[{custom_id}][]`. |
| Required | Preview checks `field.required === "true"` after normalization. |
| Labels | Render when form `show_labels` is not empty and type is not `hidden`, `html`, or `acceptance`. |
| Required marker | Adds `elementor-field-required`; also adds `elementor-mark-required` when form `mark_required` is `yes`. |
| Options | Split by newline after normalization. |
| Select caret | Preview renders Elementor-like caret markup. |
| HTML field | Uses `dangerouslySetInnerHTML`; only pass trusted HTML. |

## Parser And Backend Export Notes

Backend `ElementorForm` field parsing accepts arrays or JSON strings. A field item is considered valid when it has at least one of `field_type`, `type`, `label`, or `field_label`, and any provided `field_type`/`type` is a string.

Backend field normalization is similar to the framework, with these differences:

| Area | Framework | Backend builder |
| --- | --- | --- |
| Escaping | Stores labels/placeholders as provided. | Escapes labels, placeholders, acceptance text, button text, and form name. |
| `field_value` | Only emitted if provided. | Always emitted, defaulting to empty string. |
| Upload keys | Only `allow_multiple` exposed in framework type. | Also maps `file_types`, `allowed_types`, `max_files`, and `max_file_size`. |
| Acceptance text | Uses label in preview. | Also maps `acceptance_text` if present. |
| `inline_list`, `select_size`, `css_classes`, `field_html` | Framework maps these. | Backend builder interface shown does not map these keys in its `ElementorForm` case. |

## Caveats

- `width` is typed as `string`; use native Elementor column width strings to avoid validator errors.
- `required` maps to the string `true`, not boolean `true`, in Elementor JSON.
- `field_type` overrides `type`; `field_label` overrides `label`; `field_value` overrides `defaultValue`.
- The preview does not upload files or submit data.
- HTML field preview injects HTML directly.

## Example

```tsx
import { ElementorForm } from '@upbuilder/elementor-framework';

export function SignupForm() {
  return (
    <ElementorForm
      formName="Signup"
      fields={[
        {
          type: 'email',
          label: 'Email',
          custom_id: 'email',
          placeholder: 'you@example.com',
          required: true,
          width: '66',
        },
        {
          type: 'select',
          label: 'Plan',
          custom_id: 'plan',
          options: ['Starter', 'Pro', 'Enterprise'],
          defaultValue: 'Pro',
          width: '33',
        },
        {
          type: 'acceptance',
          label: 'I agree to be contacted',
          custom_id: 'consent',
          required: true,
        },
      ]}
      buttonText="Join"
      buttonWidth={25}
      submitActions={['email']}
    />
  );
}
```
