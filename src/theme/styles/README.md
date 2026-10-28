# Theme Styles Documentation

This directory contains the SCSS theme system for the application, including design tokens, breakpoints, mixins, and typography utilities.

## Import Pattern

### Recommended: Import All Styles

```scss
@use "@/theme/styles" as *;
```

This imports tokens, breakpoints, and mixins. Typography is imported separately in `global.scss`.

### Individual Imports

```scss
@use "@/theme/styles/tokens" as *;
@use "@/theme/styles/breakpoints" as *;
@use "@/theme/styles/mixins" as *;
@use "@/theme/styles/typography" as *;
```

---

## Design Tokens

### Colors

```scss
$color-text: #111; // Primary text color
$color-text-muted: #5a5a5a; // Muted/secondary text
$color-background: #fff; // Background color
$color-surface: #f5f7fa; // Surface/card background
$color-primary: #0a6cff; // Primary brand color
$color-primary-contrast: #fff; // Text on primary background
$color-secondary: #ff3b3b; // Secondary brand color
$color-black: #000; // Pure black
```

**Usage:**

```scss
.button {
  background: $color-primary;
  color: $color-primary-contrast;
}
```

### Spacing (8px Grid System)

All spacing values follow an 8px grid:

```scss
$space-0: 0; // 0px
$space-1: 4px; // 0.5 × 8px
$space-2: 8px; // 1 × 8px
$space-3: 12px; // 1.5 × 8px
$space-4: 16px; // 2 × 8px
$space-5: 20px; // 2.5 × 8px
$space-6: 24px; // 3 × 8px
$space-7: 32px; // 4 × 8px
$space-8: 40px; // 5 × 8px
$space-9: 48px; // 6 × 8px
$space-10: 64px; // 8 × 8px
```

**Usage:**

```scss
.card {
  padding: $space-6;
  margin-bottom: $space-4;
  gap: $space-2;
}
```

### Border Radius

```scss
$radius-none: 0;
$radius-sm: 2px;
$radius-md: 6px;
$radius-lg: 10px;
$radius-pill: 9999px;
```

**Usage:**

```scss
.button {
  border-radius: $radius-md;
}

.avatar {
  border-radius: $radius-pill;
}
```

### Shadows

```scss
$shadow-sm: 0 1px 2px rgb(0, 0, 0, 7%);
$shadow-md: 0 2px 8px rgb(0, 0, 0, 8%);
$shadow-lg: 0 8px 20px rgb(0, 0, 0, 12%);
```

**Usage:**

```scss
.card {
  box-shadow: $shadow-md;
}
```

### Typography Tokens

#### Font Families

```scss
$font-family-sans: "Roboto", system-ui, ...; // Primary sans-serif
$font-family-display: "Doto", $font-family-sans; // Display/headings
$font-family-condensed: "Roboto Condensed", ...; // Condensed variant
```

#### Font Weights

```scss
$font-weight-thin: 100;
$font-weight-extralight: 200;
$font-weight-light: 300;
$font-weight-regular: 400;
$font-weight-medium: 500;
$font-weight-semibold: 600;
$font-weight-bold: 700;
$font-weight-extrabold: 800;
$font-weight-black: 900;
```

#### Letter Spacing

```scss
$tracking-tight-2: -0.02em;
```

**Usage:**

```scss
.heading {
  font-family: $font-family-display;
  font-weight: $font-weight-bold;
  letter-spacing: $tracking-tight-2;
}
```

### Z-Index Scale

```scss
$z-base: 1;
$z-dropdown: 1000;
$z-sticky: 1100;
$z-fixed: 1200;
$z-modal-backdrop: 1300;
$z-modal: 1400;
$z-popover: 1500;
$z-toast: 1600;
```

**Usage:**

```scss
.modal {
  z-index: $z-modal;
}
```

### Borders & Sizes

```scss
$border-thin: 1px;
$size-corner-square: 5px;
```

### Animation Durations

```scss
$duration-fast: 200ms;
$duration-normal: 400ms;
$duration-slow: 800ms;
$duration-hero: 2400ms;
```

**Usage:**

```scss
.transition {
  transition: opacity $duration-normal ease-in-out;
}
```

---

## Breakpoints

### Available Breakpoints

```scss
$breakpoints: (
  xs: 360px,
  sm: 480px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
  xxl: 1536px,
  spec-mobile-max: 1024px,
  // Project-specific mobile max
  spec-desktop-min: 1650px, // Project-specific desktop min
);
```

### Breakpoint Mixins

#### `@include up($key)` - Min-width (mobile-first)

```scss
.card {
  padding: $space-4;

  @include up(md) {
    padding: $space-6;
  }

  @include up(lg) {
    padding: $space-8;
  }
}
```

#### `@include down($key)` - Max-width

```scss
.sidebar {
  display: none;

  @include down(lg) {
    display: block;
  }
}
```

#### `@include between($from, $to)` - Range

```scss
.container {
  width: 100%;

  @include between(md, lg) {
    max-width: 800px;
  }
}
```

**Common Patterns:**

```scss
// Mobile-first approach (recommended)
.component {
  // Mobile styles (default)
  font-size: 14px;

  @include up(md) {
    // Tablet and up
    font-size: 16px;
  }

  @include up(lg) {
    // Desktop and up
    font-size: 18px;
  }
}

// Desktop-first approach
.component {
  // Desktop styles (default)
  font-size: 18px;

  @include down(lg) {
    // Tablet and below
    font-size: 16px;
  }

  @include down(md) {
    // Mobile
    font-size: 14px;
  }
}
```

---

## Mixins

### Layout Mixins

#### `flex-center($axis)`

Centers content with flexbox.

```scss
// Center both axes (default)
.container {
  @include flex-center;
}

// Center horizontally only
.container {
  @include flex-center(x);
}

// Center vertically only
.container {
  @include flex-center(y);
}
```

#### `container($max, $pad)`

Creates a responsive container with max-width and padding.

```scss
.wrapper {
  @include container(1200px, $space-6);
}

// Custom padding
.wrapper {
  @include container(1200px, $space-8);
}
```

#### `layer-cover`

Absolute positioning covering the entire container.

```scss
.overlay {
  @include layer-cover;
  background: rgba(0, 0, 0, 0.5);
}
```

### Accessibility Mixins

#### `sr-only()`

Screen reader only content (visually hidden).

```scss
.skip-link {
  @include sr-only;
}
```

#### `focus-ring($color)`

Consistent focus ring styling.

```scss
.button {
  @include focus-ring($color-primary);
}

// Custom color
.link {
  @include focus-ring($color-secondary);
}
```

### Text Utilities

#### `line-clamp($lines)`

Truncate text after specified number of lines.

```scss
.description {
  @include line-clamp(3);
}
```

### Visual Effects

#### `elevation($level)`

Apply shadow based on elevation level.

```scss
.card {
  @include elevation(sm); // $shadow-sm
}

.modal {
  @include elevation(lg); // $shadow-lg
}
```

#### `glass-surface($alphaBg, $alphaOverlay, $blur)`

Glass morphism effect with backdrop blur.

```scss
.panel {
  @include glass-surface(0.1, 0.2, 37.5px);
}

// Custom values
.panel {
  @include glass-surface(0.15, 0.25, 50px);
}
```

### Notification Components

#### `notification-chip($bg, $color, $padY, $padX)`

Complete notification chip styling.

```scss
.badge {
  @include notification-chip($color-primary, white, 3px, 6px);
}
```

#### `notification-chip-base($padY, $padX)` + `notification-chip-theme($bg, $color)`

Split mixins for flexible theming.

```scss
.badge {
  @include notification-chip-base(3px, 6px);

  &.primary {
    @include notification-chip-theme($color-primary, white);
  }

  &.secondary {
    @include notification-chip-theme($color-secondary, white);
  }
}
```

### Animations

#### `subtle-slide-fade-in($duration, $delay)`

Subtle slide and fade-in animation.

```scss
.fade-in {
  @include subtle-slide-fade-in($duration-normal, 0.2s);
}

// Custom duration
.fade-in {
  @include subtle-slide-fade-in($duration-slow, 0s);
}
```

---

## Typography

Typography styles are defined in `typography.scss` and automatically applied to semantic HTML elements.

### Heading Styles

```scss
h1, .h1  // Display font, 2.5rem, bold
h2, .h2  // Sans font, 2rem (1.5rem on mobile), medium
h3, .h3  // Condensed font, 0.875rem, regular
h4, .h4  // Display font, 1.5rem, medium
h5, .h5  // Display font, 1.25rem, medium
h6, .h6  // Display font, 1.125rem, medium
```

### Body Text

```scss
p, .p        // 1rem, regular weight, 1rem bottom padding
small, .small // 0.875rem, muted color
.lead        // 1.125rem, primary text color
.muted       // Muted text color
```

### Utility Classes

```scss
.eyebrow     // 0.875rem, uppercase, letter-spaced, muted
.type-title  // 24px mobile / 32px desktop, regular
.type-body   // 14px mobile / 16px desktop, light, tight tracking
.type-cta    // 14px, condensed, uppercase
.type-small  // 14px mobile / 12px desktop, condensed, uppercase
.type-scoring // 12px mobile / 14px desktop, display, bold
```

**Usage:**

```html
<h1>Main Heading</h1>
<p class="type-body">Body text with custom styling</p>
<span class="eyebrow">Category Label</span>
```

---

## Best Practices

### 1. Use Design Tokens

Always use tokens instead of hardcoded values:

```scss
// ✅ Good
.button {
  padding: $space-4;
  border-radius: $radius-md;
  color: $color-primary;
}

// Less good (unless it's a value that's not to be repeated)
.button {
  padding: 16px;
  border-radius: 6px;
  color: #0a6cff;
}
```

### 2. Follow Spacing Grid

Use the 8px spacing grid consistently:

```scss
// ✅ Good
.card {
  padding: $space-6; // 24px
  gap: $space-2; // 8px
}

// Less good (unless it's a value that's not to be repeated)
.card {
  padding: 23px;
  gap: 9px;
}
```

### 3. Mobile-First Approach

Write mobile styles first, then enhance for larger screens:

```scss
// ✅ Good
.component {
  font-size: 14px;

  @include up(md) {
    font-size: 16px;
  }
}

// Less good (desktop-first)
.component {
  font-size: 16px;

  @include down(md) {
    font-size: 14px;
  }
}
```

### 4. Use Mixins for Common Patterns

Leverage mixins for consistency:

```scss
// ✅ Good
.button {
  @include flex-center;
  @include focus-ring;
}

// Less good
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  outline: 2px solid transparent;
  outline-offset: 4px;
  // ... etc
}
```

### 5. Semantic Typography

Use semantic HTML and typography classes:

```html
<!-- ✅ Good -->
<h2 class="type-title">Section Title</h2>
<p class="type-body">Body content</p>

<!-- Less good -->
<div class="title">Section Title</div>
<div class="body">Body content</div>
```

---

## File Structure

```
src/theme/styles/
├── index.scss          # Main entry point (re-exports tokens, breakpoints, mixins)
├── tokens.scss         # Design tokens (colors, spacing, typography, etc.)
├── breakpoints.scss    # Breakpoint definitions and mixins
├── mixins.scss         # Reusable mixins
├── typography.scss     # Typography styles and classes
└── README.md           # This file
```

---

## Examples

### Complete Component Example

```scss
@use "@/theme/styles" as *;

.card {
  // Layout
  @include container(800px, $space-6);
  @include flex-center(y);

  // Spacing
  padding: $space-6;
  gap: $space-4;
  margin-bottom: $space-8;

  // Visual
  background: $color-surface;
  border-radius: $radius-lg;
  @include elevation(md);

  // Typography
  h2 {
    font-family: $font-family-display;
    font-weight: $font-weight-bold;
    margin-bottom: $space-4;
  }

  p {
    color: $color-text-muted;
  }

  // Responsive
  @include up(md) {
    padding: $space-8;
    gap: $space-6;
  }

  // Accessibility
  button {
    @include focus-ring;
  }
}
```

### Responsive Layout Example

```scss
@use "@/theme/styles" as *;

.grid {
  display: grid;
  gap: $space-4;
  grid-template-columns: 1fr;

  @include up(md) {
    grid-template-columns: repeat(2, 1fr);
    gap: $space-6;
  }

  @include up(lg) {
    grid-template-columns: repeat(3, 1fr);
    gap: $space-8;
  }
}
```

---

## Additional Resources

- [CSS Components Documentation](https://css-components.net) - Phantom Studios styling solution
- [SCSS Documentation](https://sass-lang.com/documentation) - Official SCSS reference
