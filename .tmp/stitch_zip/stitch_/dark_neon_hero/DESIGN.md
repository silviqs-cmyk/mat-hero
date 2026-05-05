---
name: Dark Neon Hero
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#ccc3d8'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#958da1'
  outline-variant: '#4a4455'
  surface-tint: '#d2bbff'
  primary: '#d2bbff'
  on-primary: '#3f008e'
  primary-container: '#7c3aed'
  on-primary-container: '#ede0ff'
  inverse-primary: '#732ee4'
  secondary: '#5de6ff'
  on-secondary: '#00363e'
  secondary-container: '#00cbe6'
  on-secondary-container: '#00515d'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#bf2076'
  on-tertiary-container: '#ffdde7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#eaddff'
  primary-fixed-dim: '#d2bbff'
  on-primary-fixed: '#25005a'
  on-primary-fixed-variant: '#5a00c6'
  secondary-fixed: '#a2eeff'
  secondary-fixed-dim: '#2fd9f4'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  h1-hero:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  h2-section:
    fontFamily: Manrope
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-main:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-small:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-eyebrow:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  button-text:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
---

## Brand & Style

The design system is centered on a **Dark Neon** aesthetic, blending high-performance gaming visuals with an accessible educational environment. It aims to evoke a sense of digital mastery and focused energy, transforming the learning experience into a futuristic quest.

The style leverages **Glassmorphism** and **High-Contrast Neon** elements. Deep, obsidian backgrounds provide a stable foundation, while vibrant, glowing accents draw immediate attention to progress, rewards, and calls to action. The visual language uses light not just as decoration, but as a functional tool to guide the user through their educational journey, making "XP" gains and point accumulation feel physically tangible through luminous effects.

## Colors

The palette is built on a "Midnight Base" with "Luminous Accents." 

- **Core Surfaces:** The primary background uses a deep navy-black (#0B0F1A), while cards and secondary sections use slightly lighter tones (#0F1324 and #151A2E) to create depth without relying on traditional borders.
- **Neon Accents:** 
    - **Purple (#7C3AED):** The primary action color, used for main buttons and hero accents.
    - **Cyan (#22D3EE):** Used for progress indicators, active borders, and informational highlights.
    - **Magenta (#EC4899):** Reserved for secondary highlights and specialized gamification markers.
- **Semantic Colors:** Green (#22C55E) is strictly for XP gains and success states, while Gold (#FBBF24) is dedicated to points and prestigious rewards.
- **Typography:** High-contrast off-white (#F8FAFC) ensures readability against the dark backgrounds, while muted grays are used for secondary metadata.

## Typography

This design system uses a dual-font approach to balance personality with extreme legibility. 

**Manrope** is used for all headings (H1, H2). Its geometric yet modern structure provides a tech-forward feel that complements the neon aesthetic. **Inter** is the workhorse for body text, labels, and UI components, chosen for its exceptional clarity on dark screens. 

- **Information Hierarchy:** Use the "Label/Eyebrow" style in Cyan or Purple to categorize content above H2 titles.
- **Contrast:** Ensure all body text maintains at least a 7:1 contrast ratio against the dark backgrounds. Primary text should remain near-white (#F8FAFC).

## Layout & Spacing

The design system utilizes a **4px-based stepping system** to maintain mathematical harmony. 

- **Grid Model:** A 12-column fluid grid is preferred for dashboard layouts, with 16px (md) gutters. 
- **Component Padding:** Standard cards use 24px (lg) internal padding, while smaller UI elements like chips use 8px (xs) or 12px (sm).
- **Rhythm:** Vertical spacing between sections should consistently use 32px (xl) to allow the neon elements room to "breathe" and prevent visual clutter.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Luminous Effects** rather than heavy shadows.

- **Surface Tiers:** Background (#0B0F1A) -> Cards (#151A2E) -> Elevated Elements/Modals (#1B2140).
- **Inner Shadows:** Cards feature a very soft, subtle inner shadow to create a slightly "sunken" or "carved" look into the dark interface.
- **Glows:** Active states (such as the focused lesson or a primary button) use an outer glow (Drop Shadow) using the element's accent color with high blur (15-20px) and low opacity (0.3).
- **Glassmorphism:** Navigation sidebars and floating badges use a backdrop-blur (12px) with a semi-transparent fill of the Surface color to maintain context of the content beneath.

## Shapes

The shape language is "Softly Geometric." 

- **Cards:** Use a standard 12px radius to feel friendly and modern.
- **Buttons & Inputs:** Use a slightly tighter 8px radius for a more precise, functional feel.
- **Pills:** Badges for XP, Points, and status indicators use a full pill radius (999px) to distinguish them as "collectible" items.
- **Active Indicators:** Vertical lines next to active menu items or progress steps should have rounded caps.

## Components

- **Primary Buttons:** Styled with a linear gradient (Purple #7C3AED to a slightly darker shade). They must include a trailing chevron icon and a subtle purple outer glow on hover.
- **Secondary Buttons:** Ghost-style with a thin Cyan (#22D3EE) or Purple outline. The background fills slightly with 10% opacity of the border color on hover.
- **Progress Bars:** Deep dark track (#0F1324) with a Cyan (#22D3EE) fill. The leading edge of the progress fill should have a small "glow head" to indicate movement.
- **Gamification Badges:** 
    - **XP Badge:** Green background with white text and a star icon.
    - **Points Badge:** Gold background with dark text (#0B0F1A) to ensure high contrast.
- **Cards:** Include a subtle 1px border using a low-opacity version of the Cyan or Purple accent color to define the edges against the dark background.
- **Interactive States:** Any "active" item should utilize a neon border glow. Inactive items should remain desaturated or "ghosted" at 50% opacity.