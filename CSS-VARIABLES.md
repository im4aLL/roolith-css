# CSS variable reference

Every custom property this framework emits, grouped by the component that owns it, so a new component can pick an existing token instead of inventing a value. All variables are prefixed `--r-`.

## How settings and CSS variables work

Settings are compile-time inputs. Custom properties are runtime outputs.

```
src/sass/_settings.scss        inputs: colours, spacing, sizes, theme seeds and overrides
        |
        v
src/sass/_resolved.scss        merges defaults, validates the palette, derives theme roles
        |
        v
src/sass/_css-variable.scss    emits the custom properties
        |
        v
components                     read var(--r-*)
```

- `_settings.scss` holds plain `!default` values. Override any of them with `@use 'roolith' with (...)`; nothing in it runs logic.
- `_resolved.scss` merges those inputs over built-in defaults and derives the light and dark role maps with `color.mix()`. It also derives each slot's text-safe colour: the lightest blend toward black (light) or white (dark) that clears 4.5:1 on every surface the variant can be painted on, measured with the WCAG contrast formula at build time. A slot without a foreground pair, a missing required slot, or an ambiguous accent role fails the build here.
- `_css-variable.scss` turns the resolved values into custom properties. Palette primitives are emitted once in `:root`. Theme roles, and the component tokens that differ per theme, are emitted in `:root`, `.theme-light`, `.theme-dark` and the `prefers-color-scheme: dark` block, so switching a class or the OS setting switches the values at runtime.
- Components never import theme values directly; they read `var(--r-*)`. A component that needs a different value in a narrow scope overrides the custom property locally instead of branching on `.theme-dark`.
- Palette variant loops inside SCSS (`.button-primary`, `.badge-danger`) call `palette-fill()`, `palette-on()` and `palette-text()` with `resolved.$slot-roles` to decide between a role token and a primitive. A fill always pairs with its `-on` foreground; a slot used as text, such as an outline variant, reads its `-text` pair instead.

## Choosing a variable

1. For colour, use the semantic token for the meaning: `--r-text`, `--r-surface`, `--r-border`, or one of their tiers. Do not reach for a palette primitive unless the value is genuinely a palette colour.
2. Use a component token when the value belongs to that component and must stay tunable without touching SCSS logic.
3. Use `--r-color-{slot}` and `--r-color-{slot}-on` for palette variants, and always paint text or icons on a filled surface with the `-on` pair. When the slot is the text colour rather than the fill (outline, text and tinted variants), use `--r-color-{slot}-text`; it is derived per theme to stay readable on the page and on the slot's own tint.
4. Never use `--r-theme-*` in a component. Those are the per-theme primitives; the semantic aliases already point at them.
5. Never hardcode a colour, radius, or spacing that a token already covers, and never add a `.theme-dark` colour rule in a component.
6. Add spacing, radius, sizes, and shadows as `$` settings plus one `--r-*` declaration. Add per-theme differences to the `$-theme-component-tokens` map instead of a shared declaration.

## Palette primitives

`$colors` in `_settings.scss` defines the slots. Each slot gets a fill, a foreground pair for content on that fill, and a derived text pair for the slot used as text on a surface.

| Variable | Use for |
| --- | --- |
| `--r-color-primary` | Primary brand fill |
| `--r-color-primary-on` | Text and icons on a primary fill |
| `--r-color-primary-text` | The primary slot used as text on a surface |
| `--r-color-secondary` | Secondary fill |
| `--r-color-secondary-on` | Text and icons on a secondary fill |
| `--r-color-secondary-text` | The secondary slot used as text on a surface |
| `--r-color-tertiary` | Tertiary fill |
| `--r-color-tertiary-on` | Text and icons on a tertiary fill |
| `--r-color-tertiary-text` | The tertiary slot used as text on a surface |
| `--r-color-info` | Informational fill |
| `--r-color-info-on` | Text and icons on an info fill |
| `--r-color-info-text` | The info slot used as text on a surface |
| `--r-color-success` | Success fill |
| `--r-color-success-on` | Text and icons on a success fill |
| `--r-color-success-text` | The success slot used as text on a surface |
| `--r-color-danger` | Danger fill |
| `--r-color-danger-on` | Text and icons on a danger fill |
| `--r-color-danger-text` | The danger slot used as text on a surface |
| `--r-color-link` | Link fill |
| `--r-color-link-on` | Text and icons on a link fill |
| `--r-color-link-text` | The link slot used as text on a surface |
| `--r-color-dark` | Dark fill |
| `--r-color-dark-on` | Text and icons on a dark fill |
| `--r-color-dark-text` | The dark slot used as text on a surface |
| `--r-color-black` | Black fill |
| `--r-color-black-on` | Text and icons on a black fill |
| `--r-color-black-text` | The black slot used as text on a surface |
| `--r-color-white` | White fill |
| `--r-color-white-on` | Text and icons on a white fill |
| `--r-color-white-text` | The white slot used as text on a surface |
| `--r-color-light` | Light fill |
| `--r-color-light-on` | Text and icons on a light fill |
| `--r-color-light-text` | The light slot used as text on a surface |

`--r-color-{slot}` and `--r-color-{slot}-on` are theme-independent. `--r-color-{slot}-text` is not: it is the same slot derived once per theme, because a light-side value such as `light` is invisible on a light page while a dark-side value such as `black` is invisible on a dark one. It is declared in every theme scope, so it follows `.theme-light`, `.theme-dark` and the OS setting.

A new slot inherits the same pattern: add it to `$colors`, add a pair to `$colors-on`, and `--r-color-{slot}`, `--r-color-{slot}-on` and `--r-color-{slot}-text` are emitted automatically. The text pair is derived, so a new palette does not need a third hand-picked colour per slot.

## Accent roles

`$accent-roles` aliases a role to a palette slot. Roles are what components should read for accent colour, not the slot directly.

| Variable | Default slot | Use for |
| --- | --- | --- |
| `--r-accent` | primary | Primary accent for interactive elements |
| `--r-accent-on` | primary | Text and icons on an accent fill |
| `--r-accent-text` | primary | The primary slot used as text on a surface |
| `--r-danger` | danger | Destructive actions and errors |
| `--r-danger-on` | danger | Text and icons on a danger fill |
| `--r-danger-text` | danger | The danger slot used as text on a surface |
| `--r-success` | success | Success states |
| `--r-success-on` | success | Text and icons on a success fill |
| `--r-success-text` | success | The success slot used as text on a surface |
| `--r-warning` | info | Warning states |
| `--r-warning-on` | info | Text and icons on a warning fill |
| `--r-warning-text` | info | The info slot used as text on a surface |
| `--r-info` | info | Informational states |
| `--r-info-on` | info | Text and icons on an info fill |
| `--r-info-text` | info | The info slot used as text on a surface |

## Theme primitives

`--r-theme-*` is the derived per-theme layer. It is declared in `:root`, `.theme-light`, `.theme-dark` and the OS dark block, and re-declares its role values in those scopes so custom properties resolve correctly on the element where the theme class sits. Use the semantic aliases below instead of reading these directly, with two exceptions: state values that have no alias (`--r-theme-table-highlight`, `--r-theme-comment-highlight`, `--r-theme-radio-selected`, `--r-theme-loader-head`) and `--r-theme-on-surface`, which is the direction colour used by the surface scale mixes.

| Primitive | Semantic alias |
| --- | --- |
| `--r-theme-page` | `--r-surface-page` |
| `--r-theme-surface` | `--r-surface` |
| `--r-theme-surface-raised` | `--r-surface-raised` |
| `--r-theme-surface-overlay` | `--r-surface-overlay` |
| `--r-theme-surface-muted` | `--r-surface-muted` |
| `--r-theme-surface-inverse` | `--r-surface-inverse` |
| `--r-theme-surface-hover` | `--r-surface-hover` |
| `--r-theme-control` | `--r-surface-control` |
| `--r-theme-control-hover` | `--r-surface-control-hover` |
| `--r-theme-text` | `--r-text` |
| `--r-theme-text-muted` | `--r-text-muted` |
| `--r-theme-text-subtle` | `--r-text-subtle` |
| `--r-theme-text-faint` | `--r-text-faint` |
| `--r-theme-text-quiet` | `--r-text-quiet` |
| `--r-theme-text-tertiary` | `--r-text-tertiary` |
| `--r-theme-text-separator` | `--r-text-separator` |
| `--r-theme-text-strong` | `--r-text-strong` |
| `--r-theme-text-inverse` | `--r-text-inverse` |
| `--r-theme-text-control` | `--r-text-control` |
| `--r-theme-text-placeholder` | `--r-text-placeholder` |
| `--r-theme-text-helper` | `--r-text-helper` |
| `--r-theme-text-label` | `--r-text-label` |
| `--r-theme-text-disabled` | `--r-text-disabled` |
| `--r-theme-border-subtle` | `--r-border-subtle` |
| `--r-theme-border-layout` | `--r-border-layout` |
| `--r-theme-border` | `--r-border` |
| `--r-theme-border-control` | `--r-border-control` |
| `--r-theme-border-emphasis` | `--r-border-emphasis` |
| `--r-theme-border-hairline` | `--r-border-hairline` |
| `--r-theme-link` | `--r-link` |
| `--r-theme-on-surface` | none, used by the surface scale |
| `--r-theme-table-highlight` | none, used by table row highlight |
| `--r-theme-comment-highlight` | none, used by comments |
| `--r-theme-radio-selected` | none, used by the radio fill |
| `--r-theme-loader-head` | none, used by the loader head |

## Semantic tokens

These are declared in the shared `:root, .theme-light, .theme-dark` rule, so they work in any theme scope without a component rule.

### Surface

| Variable | Use for |
| --- | --- |
| `--r-surface-page` | Page background |
| `--r-surface` | Default content surface, cards |
| `--r-surface-raised` | Raised panels, inputs, modals |
| `--r-surface-overlay` | Floating overlays, dropdowns, combo boxes |
| `--r-surface-muted` | Muted background, toolbars, sidebars, table stripes |
| `--r-surface-inverse` | Inverted surface, tooltips |
| `--r-surface-hover` | Hover background for rows and items |
| `--r-surface-control` | Resting control background, default button |
| `--r-surface-control-hover` | Hover control background, default button |

### Surface scales

Blends between a surface and the theme `on-surface` colour. Use them for depth steps instead of hardcoded transparency.

| Variable | Use for |
| --- | --- |
| `--r-surface-raised-step-5` | Faint raised step |
| `--r-surface-raised-step-8` | Dividers on raised surfaces |
| `--r-surface-raised-step-10` | Borders and separators on raised surfaces |
| `--r-surface-raised-step-20` | Loader track |
| `--r-surface-raised-step-30` | Progress bar fill |
| `--r-surface-raised-step-50` | Modal close icon |
| `--r-surface-raised-step-60` | Footer text on a raised surface |
| `--r-surface-muted-step-2` | Faint muted step, primary control fill |
| `--r-surface-muted-step-3` | Striped row hover |
| `--r-surface-muted-step-5` | Muted borders and tracks |
| `--r-surface-muted-step-10` | Table header border |

### Text

| Variable | Use for |
| --- | --- |
| `--r-text` | Body text |
| `--r-text-muted` | Secondary text labels |
| `--r-text-subtle` | Less emphasized supporting text |
| `--r-text-faint` | Faint text and carets |
| `--r-text-quiet` | Quiet text, comments, code |
| `--r-text-tertiary` | Tertiary metadata |
| `--r-text-separator` | Separators and breadcrumb separator colour |
| `--r-text-strong` | Headings and strong emphasis |
| `--r-text-inverse` | Text on an inverse surface |
| `--r-text-control` | Text inside form controls |
| `--r-text-placeholder` | Placeholder text and default icon colour |
| `--r-text-helper` | Helper and hint text |
| `--r-text-label` | Form labels |
| `--r-text-disabled` | Disabled text |
| `--r-link` | Links |

### Border

| Variable | Use for |
| --- | --- |
| `--r-border-subtle` | Faint dividers and card header borders |
| `--r-border-layout` | Layout, header, and footer separators |
| `--r-border` | Default border and dropdown border |
| `--r-border-control` | Form control border |
| `--r-border-emphasis` | Emphasized border on hover |
| `--r-border-hairline` | Hairline separators, accordion borders |

### Global

| Variable | Use for |
| --- | --- |
| `--r-global-base-font-size` | Root font size |
| `--r-global-base-font` | Base font family |
| `--r-global-font-weight` | Base font weight |
| `--r-global-font-bold-weight` | Bold font weight |
| `--r-global-background-color` | Page background alias |
| `--r-global-font-color` | Default text colour alias |
| `--r-global-font-color-light` | Muted text colour alias |
| `--r-global-border-radius` | Shared border radius |
| `--r-global-width` | Container max width |

### Focus and animation

| Variable | Use for |
| --- | --- |
| `--r-focus-ring-color` | Focus outline colour |
| `--r-animation-easing` | Shared easing |
| `--r-animation-duration` | Shared duration |

## Component tokens

### Button

| Variable | Use for |
| --- | --- |
| `--r-button-radius` | Button corner radius |
| `--r-button-hover-shadow` | Default button hover shadow |
| `--r-button-hover-shadow-dark` | Default button hover shadow in dark |
| `--r-button-active-shadow` | Default button active shadow |
| `--r-button-active-dark-shadow` | Default button active shadow in dark |
| `--r-button-default-background` | Default button background |
| `--r-button-default-border` | Default button border |
| `--r-button-default-color` | Default button label |
| `--r-button-default-hover-background` | Default button hover background |
| `--r-button-default-hover-border` | Default button hover border |
| `--r-button-default-hover-color` | Default button hover label, per theme |

Coloured button variants read `--r-accent`, `--r-danger`, `--r-success`, `--r-warning`, `--r-info`, a palette `--r-color-{slot}`, and their `-on` pairs.

### Nav

| Variable | Use for |
| --- | --- |
| `--r-nav-border-radius` | Nav item radius |
| `--r-nav-spacing` | Nav item padding |
| `--r-nav-primary-color` | Primary nav variant fill |

### Form

| Variable | Use for |
| --- | --- |
| `--r-form-input-placeholder-color` | Placeholder text |
| `--r-form-input-background-color` | Input background |
| `--r-form-input-color` | Input text |
| `--r-form-input-border-color` | Input border |
| `--r-form-input-hover-border-color` | Input border on hover |
| `--r-form-input-focus-border-color` | Input border on focus |
| `--r-form-text-color` | Helper text under an input |
| `--r-form-input-radius` | Input radius |
| `--r-form-checkbox-label-color` | Checkbox and radio label |
| `--r-form-disable-input-color` | Disabled input text |
| `--r-form-primary-color` | Primary field fill |
| `--r-form-primary-border-color` | Primary field border |
| `--r-form-primary-hover-color` | Primary field border on hover |
| `--r-form-primary-focus-color` | Primary field focus fill, paired with `--r-form-input-color` |
| `--r-form-error-color` | Error state |
| `--r-form-success-color` | Success state |
| `--r-form-warning-color` | Warning state |
| `--r-form-field-search-hint-background` | Search hint panel background |
| `--r-form-field-search-hint-border-color` | Search hint panel border |
| `--r-form-field-search-divider-color` | Search hint divider |
| `--r-form-field-search-item-hover-background` | Search hint item hover |
| `--r-form-field-search-border-color` | Search field border |
| `--r-form-field-search-hint-color` | Search hint text |
| `--r-form-radio-group-gap` | Radio group gap |
| `--r-form-radio-group-item-padding` | Radio group item padding |
| `--r-form-radio-group-width` | Radio group width |
| `--r-form-radio-selected-border-color` | Selected radio border |
| `--r-form-radio-selected-background-color` | Selected radio fill |
| `--r-form-radio-selected-color` | Selected radio mark |
| `--r-form-radio-text-color` | Radio group text |

### Table

| Variable | Use for |
| --- | --- |
| `--r-table-header-border-color` | Header bottom border |
| `--r-table-border-color` | Cell border |
| `--r-table-header-font-weight` | Header font weight |
| `--r-table-spacing` | Cell padding |
| `--r-table-row-hover-color` | Row hover background |
| `--r-table-primary-header-color` | Primary table header background |
| `--r-table-row-striped-color` | Striped row background |
| `--r-table-row-striped-hover-color` | Striped row hover |
| `--r-table-row-highlight-color` | Highlighted row background |

### Image

| Variable | Use for |
| --- | --- |
| `--r-img-radius` | Image radius |
| `--r-img-caption-color` | Caption text |

### Message

| Variable | Use for |
| --- | --- |
| `--r-message-radius` | Message radius |
| `--r-message-close-color` | Close icon |

### Badge

| Variable | Use for |
| --- | --- |
| `--r-badge-radius` | Badge radius |
| `--r-badge-background` | Default badge background |
| `--r-badge-color` | Default badge text |

### Breadcrumb

| Variable | Use for |
| --- | --- |
| `--r-breadcrumb-spacing` | Item gap |
| `--r-breadcrumb-size` | Font size |
| `--r-breadcrumb-default-color` | Item text |
| `--r-breadcrumb-sep-symbol` | Separator content |
| `--r-breadcrumb-sep-color` | Separator colour |

### Card

| Variable | Use for |
| --- | --- |
| `--r-card-radius` | Card radius |
| `--r-card-shadow` | Card shadow |
| `--r-card-header-footer-border` | Header and footer divider |
| `--r-card-header-footer-color` | Header and footer text |
| `--r-card-background` | Card background |

### Dropdown

| Variable | Use for |
| --- | --- |
| `--r-dropdown-icons-size` | Caret size |
| `--r-dropdown-icons-size-small` | Small caret size |
| `--r-dropdown-icons-size-large` | Large caret size |
| `--r-dropdown-width` | Menu width |
| `--r-dropdown-background` | Menu background |
| `--r-dropdown-border-color` | Menu border |
| `--r-dropdown-shadow` | Menu shadow |
| `--r-dropdown-item-color` | Item text |
| `--r-dropdown-item-hover-background-color` | Item hover background |
| `--r-dropdown-item-sep` | Item divider |

### Modal

| Variable | Use for |
| --- | --- |
| `--r-modal-background` | Backdrop |
| `--r-modal-content-background` | Dialog background |
| `--r-modal-close-color` | Close icon |
| `--r-modal-content-radius` | Dialog radius |
| `--r-modal-content-spacing` | Dialog padding |
| `--r-modal-content-shadow` | Dialog shadow |
| `--r-modal-border-color` | Dialog border |

### Accordion

| Variable | Use for |
| --- | --- |
| `--r-accordion-border-color` | Accordion divider |

### Tab

| Variable | Use for |
| --- | --- |
| `--r-tab-active-color` | Active tab |
| `--r-tab-border-color` | Tab border |

### Box

| Variable | Use for |
| --- | --- |
| `--r-box-spacing` | Box padding |
| `--r-box-spacing-small` | Small box padding |
| `--r-box-spacing-large` | Large box padding |
| `--r-box-border-radius` | Box radius |
| `--r-box-background-color` | Box background |
| `--r-box-border-color` | Box border |
| `--r-box-header-text-color` | Box header text |
| `--r-box-footer-color` | Box footer text |

### Progress

| Variable | Use for |
| --- | --- |
| `--r-progress-background` | Track background |
| `--r-progress-background-shadow` | Track inner shadow |
| `--r-progress-bar-color` | Bar fill |
| `--r-progress-bar-radius` | Bar radius |

### Collage

| Variable | Use for |
| --- | --- |
| `--r-collage-item-default-width` | Item width |
| `--r-collage-item-default-height` | Item height |
| `--r-collage-item-default-gap` | Item gap |
| `--r-collage-item-small-gap` | Small gap |
| `--r-collage-item-large-gap` | Large gap |
| `--r-collage-caption-background` | Caption RGB triplet, use as `rgba(var(--r-collage-caption-background), 0.7)` |
| `--r-collage-caption-color` | Caption text |

### Avatar

| Variable | Use for |
| --- | --- |
| `--r-avatar-default-size` | Default size |
| `--r-avatar-small-size` | Small size |
| `--r-avatar-label-color` | Initials |
| `--r-avatar-label-hover-color` | Initials on hover |

### Tag

| Variable | Use for |
| --- | --- |
| `--r-tag-color` | Base tag colour; the theme scopes mix the background, border, and text from it |

### Comment

| Variable | Use for |
| --- | --- |
| `--r-comment-highlight-color` | Highlighted comment background |

### Toast notification

| Variable | Use for |
| --- | --- |
| `--r-toast-notification-width` | Toast width |

### Loader

| Variable | Use for |
| --- | --- |
| `--r-loader-border-color` | Spinner track |
| `--r-loader-border-top-color` | Spinner head |

### Icon

| Variable | Use for |
| --- | --- |
| `--r-icon-color` | Default icon colour |
| `--r-icon-size` | Default size |
| `--r-icon-small-size` | Small size |
| `--r-icon-large-size` | Large size |

### Code

| Variable | Use for |
| --- | --- |
| `--r-code-background` | Code background |
| `--r-code-color` | Code text |

### Layout

| Variable | Use for |
| --- | --- |
| `--r-layout-sidebar-width` | Sidebar width |
| `--r-layout-compact-sidebar-width` | Compact sidebar width |
| `--r-layout-border-color` | Layout divider |
| `--r-layout-border-width` | Layout divider width |
| `--r-layout-header-background-color` | Header background |
| `--r-layout-header-border-color` | Header border |
| `--r-layout-header-logo-width` | Logo width |
| `--r-layout-header-padding` | Header padding |
| `--r-layout-header-height` | Header height |
| `--r-layout-header-toggle-color` | Header toggle icon |
| `--r-layout-header-nav-color` | Header nav text |
| `--r-layout-header-search-width` | Header search width |

### Sidebar nav

| Variable | Use for |
| --- | --- |
| `--r-sidebar-nav-header-color` | Section header |
| `--r-sidebar-group-sep-color` | Group separator |
| `--r-sidebar-nav-padding` | Nav padding |
| `--r-sidebar-nav-link-color` | Link text |
| `--r-sidebar-nav-active-background-color` | Active item background |
| `--r-sidebar-nav-item-border-radius` | Item radius |
| `--r-sidebar-nav-list-label-font-weight` | Group label weight |
| `--r-sidebar-nav-item-caret-size` | Caret size |

### Tooltip

| Variable | Use for |
| --- | --- |
| `--r-tooltip-bg-color` | Tooltip background |
| `--r-tooltip-text-color` | Tooltip text |
| `--r-tooltip-padding` | Padding |
| `--r-tooltip-padding-large` | Large padding |
| `--r-tooltip-border-radius` | Radius |
| `--r-tooltip-transition-duration` | Show transition duration |
| `--r-tooltip-transition-delay` | Show transition delay |
| `--r-tooltip-border-color` | Tooltip border |
| `--r-tooltip-content-btn-bg-color` | Action button background inside a tooltip |

### Popover

| Variable | Use for |
| --- | --- |
| `--r-popover-color` | Text |
| `--r-popover-border-radius` | Radius |
| `--r-popover-width` | Width |
| `--r-popover-border-color` | Border |
| `--r-popover-offset` | Offset from the trigger |

### Drawer

| Variable | Use for |
| --- | --- |
| `--r-drawer-container-background` | Backdrop |
| `--r-drawer-background` | Panel background |
| `--r-drawer-close-button-color` | Close icon |
| `--r-drawer-border-radius` | Panel radius |
| `--r-drawer-content-spacing` | Panel padding |
| `--r-drawer-border-color` | Panel border |

### Switch

| Variable | Use for |
| --- | --- |
| `--r-form-switch-background-color` | Track, off |
| `--r-form-switch-checked-background-color` | Track, on |
| `--r-form-switch-handler-color` | Knob |
| `--r-form-switch-size` | Default size |
| `--r-form-switch-size-large` | Large size |

### Range

| Variable | Use for |
| --- | --- |
| `--r-form-range-height` | Track height |
| `--r-form-range-track-color` | Track |
| `--r-form-range-thumb-color` | Thumb |
| `--r-form-range-thumb-hover-color` | Thumb on hover |
| `--r-form-range-border-radius` | Track radius |
| `--r-form-range-thumb-size` | Thumb size, derived from the height |
| `--r-form-range-value` | Fill percentage, set inline per input |

### Action menu

| Variable | Use for |
| --- | --- |
| `--r-action-menu-list-gap` | Item gap |
| `--r-action-menu-item-color` | Item text and icon |
| `--r-action-menu-item-hover-color` | Item text on hover |
| `--r-action-menu-item-hover-background` | Item hover background |
| `--r-action-menu-item-border-radius` | Item radius |

### Pagination

| Variable | Use for |
| --- | --- |
| `--r-pagination-item-active-background-color` | Active page background |
| `--r-pagination-item-active-color` | Active page text |
| `--r-pagination-item-color` | Page text |
| `--r-pagination-item-hover-color` | Page text on hover |
| `--r-pagination-item-background` | Page background |
| `--r-pagination-item-hover-background` | Page hover background |
| `--r-pagination-item-border-radius` | Page radius |
| `--r-pagination-item-border-color` | Page border |
| `--r-pagination-item-font-size` | Page font size |

### Block

Every block rhythm value derives from the base token: the per-component block spacing tokens below are fixed multiples of it, so retuning `--r-block-padding` retunes block spacing together.

| Variable | Use for |
| --- | --- |
| `--r-block-padding` | Block content rhythm |

### Block box

| Variable | Use for |
| --- | --- |
| `--r-block-box-spacing` | Box padding |
| `--r-block-box-size` | Box size |
| `--r-block-box-color` | Text |
| `--r-block-box-hover-color` | Text on hover |
| `--r-block-box-hover-background` | Background on hover |
| `--r-block-box-icon-color` | Icon |
| `--r-block-box-hl-color` | Highlighted value |

### Block form

| Variable | Use for |
| --- | --- |
| `--r-block-form-group-border-color` | Group border |
| `--r-block-form-group-border-radius` | Group radius |
| `--r-block-form-group-padding` | Group padding |
| `--r-block-form-border-color` | Form border |
| `--r-block-form-text-color` | Form text |

### Block list

| Variable | Use for |
| --- | --- |
| `--r-block-list-item-border-color` | Item divider |

### Block enable

| Variable | Use for |
| --- | --- |
| `--r-block-enable-box-spacing` | Box padding |
| `--r-block-enable-active-background-color` | Active card surface |

### Indicator

| Variable | Use for |
| --- | --- |
| `--r-indicator-icon-size` | Arrow size |
| `--r-indicator-flat-color` | Flat state |
| `--r-indicator-upward-color` | Upward state |
| `--r-indicator-downward-color` | Downward state |
| `--r-indicator-online-color` | Online state |

### Block stat

| Variable | Use for |
| --- | --- |
| `--r-block-stat-item-gap` | Item gap |
| `--r-block-stat-item-background-color` | Item background |
| `--r-block-stat-item-hover-background-color` | Item hover background |
| `--r-block-stat-item-border-radius` | Item radius |

### Quick menu

| Variable | Use for |
| --- | --- |
| `--r-quick-menu-background` | Menu background |
| `--r-quick-menu-spacing` | Item padding |
| `--r-quick-menu-font-size` | Item label size |
| `--r-quick-menu-spacing-small` | Small item padding |
| `--r-quick-menu-font-size-small` | Small label size |
| `--r-quick-menu-spacing-x-small` | Extra small item padding |
| `--r-quick-menu-font-size-x-small` | Extra small label size |

### Block stat table

| Variable | Use for |
| --- | --- |
| `--r-block-stat-table-header-color` | Header text |
| `--r-block-stat-table-indicator-color` | Indicator background |

### Combo box

| Variable | Use for |
| --- | --- |
| `--r-combo-box-icon-size` | Caret size |
| `--r-combo-box-width` | Menu width |
| `--r-combo-box-background` | Menu background |
| `--r-combo-box-border-color` | Menu border |
| `--r-combo-box-shadow` | Menu shadow |
| `--r-combo-box-item-color` | Item text |
| `--r-combo-box-item-hover-background-color` | Item hover background |
| `--r-combo-box-item-sep` | Item divider |
| `--r-combo-box-border-radius` | Menu radius |
| `--r-combo-box-secondary-color` | Secondary item text |
| `--r-combo-box-item-header-color` | Item header text |
| `--r-combo-box-show-animation-duration` | Show animation duration |
| `--r-combo-box-item-x-padding` | Item horizontal padding |
| `--r-combo-box-item-y-padding` | Item vertical padding |

### Block inline

| Variable | Use for |
| --- | --- |
| `--r-block-inline-gap` | Inline block gap |

### Block banner

| Variable | Use for |
| --- | --- |
| `--r-block-banner-text-color` | Banner text |

### Form datepicker

| Variable | Use for |
| --- | --- |
| `--r-form-datepicker-background-color` | Calendar background |
| `--r-form-datepicker-color` | Calendar text |
| `--r-form-datepicker-border-color` | Calendar border |
| `--r-form-datepicker-border-radius` | Calendar radius |
| `--r-form-datepicker-margin-top` | Offset from the input |
| `--r-form-datepicker-strong-weight` | Today and selected weight |
| `--r-form-datepicker-accent-color` | Accent fill |
| `--r-form-datepicker-accent-text-color` | Text on the accent fill |
| `--r-form-datepicker-row-gap` | Row gap |
| `--r-form-datepicker-tile-height` | Day tile height |
| `--r-form-datepicker-controls-background-color` | Controls background |
| `--r-form-datepicker-controls-hover-text-color` | Controls text on hover |

## Theme-scoped component tokens

These are not in the shared rule. Each theme scope declares its own value, so a component can read them without a `.theme-dark` rule.

| Variable | Use for |
| --- | --- |
| `--r-nav-link-color` | Nav link text |
| `--r-nav-dimmed-link-color` | Dimmed nav link text |
| `--r-nav-active-link-color` | Active nav link text |
| `--r-dropdown-item-hover-color` | Dropdown item hover text |
| `--r-combo-box-item-hover-color` | Combo box item hover text |
| `--r-action-menu-item-background` | Action menu background |
| `--r-quick-menu-link-hover-background` | Quick menu link hover background |
| `--r-tag-background` | Tag background |
| `--r-tag-border-color` | Tag border |
| `--r-tag-text-color` | Tag text |
| `--r-comment-border` | Comment divider |
| `--r-sidebar-nav-link-hover-color` | Sidebar link hover text |
| `--r-sidebar-nav-active-color` | Sidebar active text |
| `--r-layout-secondary-background-color` | Secondary layout column background |
| `--r-popover-background` | Popover background |
| `--r-form-datepicker-controls-hover-color` | Datepicker controls hover background |
| `--r-button-active-shadow` | Default button active shadow |
| `--r-block-enable-active-border-color` | Active card border |
| `--r-message-background` | Neutral message surface |
| `--r-badge-surface` | Neutral badge surface |

## Local overrides

A component may override a token inside its own scope when a size or spacing changes at a breakpoint. These are overrides, not new tokens, so do not document or duplicate them elsewhere.

- `--r-quick-menu-font-size` and `--r-quick-menu-spacing` stepping down at small widths.
- `--r-layout-sidebar-width` switching to the compact width.
- `--r-nav-link-color` mapped to `--r-layout-header-nav-color` in the layout header.
- `--r-form-switch-size` switching to the large size.
- `--r-animation-duration` mapped to `--r-combo-box-show-animation-duration`.

## Build-time settings

`_settings.scss` holds the inputs behind these tokens. Override them with Sass configuration, not by editing compiled CSS.

```scss
@use 'roolith' with (
    $global-base-font: ('Inter', sans-serif),
    $global-border-radius: 0.5rem,
    $colors: (
        primary: #3b5bdb,
        secondary: #7048e8,
        tertiary: #0b7285,
        info: #a05f00,
        success: #2b8a3e,
        danger: #c92a2a,
        link: #4263eb,
        dark: #1e2128,
        black: #0b0d12,
        white: #ffffff,
        light: #f4f5f8,
    ),
    $colors-on: (primary: #ffffff),
    $theme-dark-color: #0c0c0c
);
```

Groups in `_settings.scss`: Global, Breakpoints, Grid, Palette, Palette foreground pairs, Accent roles, Theme, Animation, and one group per component. The full list is the file itself.

## Adding a token

Case 1, a static value used in both themes:

1. Add the setting under the component group in `_settings.scss`, for example `$rating-star-size: rem(16) !default;`.
2. Emit it under the same group in `_css-variable.scss`, for example `--r-rating-star-size: #{$rating-star-size};`.
3. Read it in the component as `var(--r-rating-star-size)`.

Case 2, a value that differs between light and dark:

1. Add the key and its light value to the `light` map in `$-theme-component-tokens` in `_css-variable.scss`.
2. Add the key and its dark value to the `dark` map.
3. Read the key as `var(--r-{key})`. It is declared in every theme scope; do not add a shared declaration.

Case 3, a new semantic colour used by several components:

1. Add the role to the map returned by `theme-roles()` in `_theme.scss`, or add a seed and a step to `_resolved.scss` if it can be derived from an existing anchor.
2. Emit the alias in the shared rule in `_css-variable.scss`, for example `--r-surface-accent-subtle: var(--r-theme-surface-accent-subtle);`.
3. Use the alias in components. Do not read `--r-theme-*` directly.

Case 4, a new palette variant:

1. Add the slot to `$colors` and its pair to `$colors-on`.
2. The primitive `--r-color-{slot}`, the pair `--r-color-{slot}-on`, the derived text pair `--r-color-{slot}-text`, and any variant loop that iterates `$colors` pick it up automatically.
3. Use the fill for a filled variant, the `-on` pair for content on that fill, and the `-text` pair wherever the slot is the text colour.

Run `npm run build` after any token change. The build fails on a palette slot without a foreground pair, a missing `primary`, `link`, `secondary` or `tertiary` slot, or two roles claiming one slot without a role named after it.
