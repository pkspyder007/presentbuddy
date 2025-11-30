# PresentBuddy Design System

## Neo-Brutalism Design Language

This document outlines the design system and visual language for the PresentBuddy website. Follow these guidelines to maintain consistency across all components and pages.

---

## Design Principles

### 1. **Bold & Unapologetic**

- High contrast between elements
- Thick, visible borders (4px minimum)
- No subtlety - everything should be clear and direct

### 2. **Geometric & Structured**

- No rounded corners (border-radius: 0)
- Clean lines and sharp edges
- Grid-based layouts

### 3. **High Contrast**

- Pure black (#000000) for text and borders
- White (#FFFFFF) for backgrounds
- Bright accent colors (Yellow #FDE047) for highlights

### 4. **Offset Shadows**

- All shadows are offset (not soft/blurred)
- Shadows create depth through displacement
- Shadow colors: pure black with full opacity

---

## Color Palette

### Primary Colors

```css
/* Black - Primary text, borders, shadows */
--black: #000000;
--foreground: 0 0% 0%;

/* White - Backgrounds, cards */
--white: #FFFFFF;
--background: 0 0% 100%;

/* Yellow - Accent color for badges, icons, highlights */
--yellow: #FDE047; /* yellow-300 */
```

### Usage Guidelines

- **Black**: Use for all text, borders, and shadows
- **White**: Use for card backgrounds and main sections
- **Yellow**: Use sparingly for badges, icon backgrounds, and call-to-action highlights
- **Gray backgrounds**: Use `#FAFAFA` or `#F5F5F5` for section backgrounds

---

## Typography

### Font Weights

- **Headings**: `font-black` (900) - Use for h1, h2, h3
- **Body Text**: `font-bold` (700) - Use for paragraphs and descriptions
- **No light weights** - Everything should be bold and impactful

### Font Sizes

```css
/* Hero Heading */
text-5xl md:text-6xl lg:text-7xl  /* 48px - 72px */

/* Section Headings */
text-4xl md:text-5xl  /* 36px - 48px */

/* Card Titles */
text-lg  /* 18px */

/* Body Text */
text-base  /* 16px */
text-sm    /* 14px */
text-xs    /* 12px */
```

### Letter Spacing

- Use `tracking-tight` for large headings
- Default tracking for body text

---

## Borders

### Border Width

- **All borders**: `4px` (use `border-4` in Tailwind)
- **Border color**: Always black (`border-black`)

### Border Radius

- **No rounded corners**: `border-radius: 0` (use `rounded-none` or remove rounded classes)
- Sharp, geometric edges only

### Usage

```css
/* Cards */
border-4 border-black

/* Buttons */
border-4 border-black

/* Icon containers */
border-4 border-black
```

---

## Shadows

### Shadow System

All shadows are offset (hard shadows), not soft/blurred:

```css
/* Small shadow - 4px offset */
.shadow-brutal-sm {
  box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 1);
}

/* Default shadow - 6px offset */
.shadow-brutal {
  box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 1);
}

/* Large shadow - 8px offset */
.shadow-brutal-lg {
  box-shadow: 8px 8px 0px 0px rgba(0, 0, 0, 1);
}
```

### Usage Guidelines

- **Cards**: Use `shadow-brutal-sm` by default, `shadow-brutal` on hover
- **CTA Cards**: Use `shadow-brutal-lg` for emphasis
- **Buttons**: Use `shadow-brutal-sm` by default
- **Icons/Badges**: Use `shadow-brutal-sm`

---

## Spacing

### Section Padding

```css
/* Standard sections */
py-24 md:py-32  /* 96px - 128px vertical padding */

/* Hero section */
pt-20 pb-32 md:pt-32 md:pb-40  /* Extra padding for hero */
```

### Container Padding

```css
px-6 md:px-8  /* 24px - 32px horizontal padding */
```

### Component Spacing

```css
/* Card padding */
p-6  /* 24px */

/* Button padding */
px-8 py-6  /* 32px horizontal, 24px vertical */

/* Gap between elements */
gap-3  /* 12px */
gap-6  /* 24px */
```

---

## Background Patterns

### Grid Pattern

```css
.bg-brutal-grid {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.15) 2px, transparent 2px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.15) 2px, transparent 2px);
  background-size: 40px 40px;
}
```

- Use on section backgrounds
- Opacity: 40-50%

### Diagonal Pattern

```css
.bg-brutal-diagonal {
  background-image: 
    repeating-linear-gradient(
      45deg,
      transparent,
      transparent 20px,
      rgba(0, 0, 0, 0.05) 20px,
      rgba(0, 0, 0, 0.05) 40px
    );
}
```

- Use on hero and CTA sections
- Opacity: 30-40%

### Section Backgrounds

```css
/* Hero */
bg-brutal-hero  /* White with subtle gradient */

/* Sections */
bg-brutal-section  /* #FAFAFA */

/* CTA */
bg-brutal-cta  /* #F5F5F5 */
```

---

## Components

### Buttons

#### Primary Button

```tsx
<Button 
  size="lg" 
  className="text-base px-8 py-6 bg-black text-white font-black border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none"
>
  Button Text
</Button>
```

#### Outline Button

```tsx
<Button 
  size="lg" 
  variant="outline"
  className="text-base px-8 py-6 bg-white text-black font-black border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none"
>
  Button Text
</Button>
```

**Button States:**

- **Default**: Has shadow, no offset
- **Hover**: Translates 1px right and down, shadow increases
- **Active**: Returns to original position, shadow removed

### Cards

#### Standard Card

```tsx
<Card className="bg-white border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal transition-all">
  <CardHeader>
    {/* Content */}
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### CTA Card

```tsx
<Card className="bg-white shadow-brutal-lg">
  {/* Larger shadow for emphasis */}
</Card>
```

### Badges

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-300 border-4 border-black shadow-brutal-sm font-bold">
  <Icon />
  <span>Badge Text</span>
</div>
```

### Icon Containers

```tsx
<div className="w-12 h-12 bg-yellow-300 border-4 border-black flex items-center justify-center shadow-brutal-sm">
  <Icon className="w-6 h-6 text-black" />
</div>
```

---

## Interactive States

### Hover Effects

- **Cards**: Translate 1px right and down, increase shadow
- **Buttons**: Translate 1px right and down, increase shadow
- **No color changes** - only position and shadow

### Active States

- **Buttons**: Return to original position, remove shadow
- Creates a "pressed" effect

### Transitions

```css
transition-all  /* Smooth transitions for all properties */
```

---

## Layout Patterns

### Hero Section

- Centered content
- Large, bold heading
- Yellow badge at top
- Two CTA buttons (primary and outline)
- Feature list with checkmarks

### Feature Cards Grid

- 3 columns on desktop (lg:grid-cols-3)
- 2 columns on tablet (md:grid-cols-2)
- 1 column on mobile
- Gap: 24px (gap-6)

### Use Cases List

- Vertical list with left-aligned content
- Yellow icon container on left
- Bold titles, bold descriptions
- Border and shadow on each item

### Step-by-Step Section

- 3 columns on desktop
- Large numbered circles (black background, white text)
- Bold titles and descriptions

---

## Do's and Don'ts

### ✅ Do

- Use 4px black borders on all interactive elements
- Use offset shadows (not soft/blurred)
- Use bold/black font weights
- Use yellow sparingly for accents
- Maintain high contrast
- Use geometric patterns for backgrounds
- Keep sharp, clean edges

### ❌ Don't

- Don't use rounded corners
- Don't use soft shadows or blur effects
- Don't use light font weights
- Don't use subtle colors or gradients
- Don't use soft transitions or animations
- Don't use pastel or muted colors
- Don't add unnecessary decorative elements

---

## Code Examples

### Complete Card Example

```tsx
<Card className="h-full bg-white border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal transition-all">
  <CardHeader className="pb-3">
    <div className="w-12 h-12 bg-yellow-300 border-4 border-black flex items-center justify-center mb-4 shadow-brutal-sm">
      <Icon className="w-6 h-6 text-black" />
    </div>
    <CardTitle className="text-lg font-black text-black mb-2">
      Feature Title
    </CardTitle>
  </CardHeader>
  <CardContent>
    <CardDescription className="text-sm leading-relaxed text-black font-bold">
      Feature description text goes here.
    </CardDescription>
  </CardContent>
</Card>
```

### Complete Button Example

```tsx
<Button 
  size="lg" 
  className="text-base px-8 py-6 bg-black text-white font-black border-4 border-black shadow-brutal-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none transition-all"
>
  <Download className="mr-2 w-4 h-4" />
  Install Extension
</Button>
```

---

## Accessibility

### Color Contrast

- Black text on white background: ✅ WCAG AAA
- White text on black background: ✅ WCAG AAA
- Yellow accent: Use with black text for sufficient contrast

### Focus States

- Maintain visible focus rings
- Use `focus-visible:ring-2 focus-visible:ring-black`

### Interactive Elements

- Ensure hover states are clear and obvious
- Maintain sufficient touch targets (minimum 44x44px)

---

## File Structure

```
website/
├── app/
│   ├── globals.css          # Design system CSS variables and utilities
│   └── page.tsx             # Main page implementation
├── components/
│   └── ui/
│       ├── button.tsx       # Button component with brutal styling
│       └── card.tsx         # Card component with brutal styling
└── DESIGN_SYSTEM.md         # This file
```

---

## Updates & Maintenance

When updating the design system:

1. Update this documentation first
2. Update CSS variables in `globals.css`
3. Update component implementations
4. Update all instances across the codebase
5. Test visual consistency

---

**Last Updated**: 2024

**Design Style**: Neo-Brutalism

**Maintained By**: Development Team

