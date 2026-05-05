# MatHero Design System

## Purpose
MatHero uses a single dark neon premium UI language across student and admin flows. The system is extracted from the `Ден 1` dashboard screen and centralized so new screens feel like the same product.

## Core Principles
- Dark layered backgrounds, never plain white surfaces
- Premium neon accents with restrained glow
- Large rounded cards and pill buttons
- High-contrast headings with cooler secondary text
- Desktop-first educational game dashboard composition
- Accent colors communicate content type, not decoration only

## Tokens

### Color Tokens
- Background
  - `--mh-bg`
  - `--mh-bg-deep`
- Surface
  - `--mh-surface`
  - `--mh-surface-2`
  - `--mh-surface-3`
  - `--mh-surface-overlay`
- Border
  - `--mh-line`
  - `--mh-line-soft`
  - `--mh-line-strong`
- Text
  - `--mh-text`
  - `--mh-text-soft`
  - `--mh-text-muted`
  - `--mh-text-dim`
- Accent
  - `--mh-accent-cyan`
  - `--mh-accent-cyan-soft`
  - `--mh-accent-purple`
  - `--mh-accent-fuchsia`
  - `--mh-accent-pink`
  - `--mh-accent-lime`
  - `--mh-accent-gold`
  - `--mh-accent-amber`
- Semantic
  - `--mh-success`
  - `--mh-warning`
  - `--mh-error`

### Typography Tokens
- `--font-display`
- `--font-sans`
- `--mh-label-size`
- `--mh-label-tracking`
- `--mh-body-line`

### Spacing Tokens
- `--mh-space-section`
- `--mh-space-card`
- `--mh-space-card-lg`
- `--mh-space-grid`
- `--mh-space-sidebar`
- `--mh-space-button-x`
- `--mh-space-button-y`

### Radius Tokens
- `--mh-radius-card`
- `--mh-radius-card-lg`
- `--mh-radius-button`
- `--mh-radius-badge`
- `--mh-radius-input`
- `--mh-radius-modal`

### Shadow / Glow Tokens
- `--mh-shadow-panel`
- `--mh-shadow-soft`
- `--mh-glow-cyan`
- `--mh-glow-purple`
- `--mh-glow-pink`
- `--mh-glow-lime`
- `--mh-glow-active`

## Semantic Utility Classes
Defined in [src/app/globals.css](/abs/path/C:/New%20folder/maturohero/src/app/globals.css):

- Layout and surfaces
  - `mh-shell-bg`
  - `mh-card`
  - `mh-card-muted`
  - `mh-panel-sidebar`
  - `mh-card-cyan`
  - `mh-card-purple`
  - `mh-card-green`
  - `mh-card-gold`
- Typography
  - `mh-label`
  - `mh-heading-xl`
  - `mh-heading-lg`
  - `mh-copy`
  - `mh-copy-muted`
- Buttons
  - `mh-btn`
  - `mh-btn-primary`
  - `mh-btn-secondary`
  - `mh-btn-success`
  - `mh-btn-ghost`
  - `mh-btn-danger`
- Badges
  - `mh-badge`
  - `mh-badge--cyan`
  - `mh-badge--purple`
  - `mh-badge--green`
  - `mh-badge--gold`
  - `mh-badge--neutral`
- Progress
  - `mh-progress-track`
  - `mh-progress-track--compact`
  - `mh-progress-track--default`
  - `mh-progress-fill--cyan`
  - `mh-progress-fill--pink`
  - `mh-progress-fill--lime`
- Navigation
  - `mh-sidebar-item`
  - `mh-sidebar-item--active`
  - `mh-timeline-item`
  - `mh-timeline-item--active`
- Forms
  - `mh-input`
  - `mh-select`
  - `mh-textarea`
  - `mh-input--error`
  - `mh-select--error`
  - `mh-textarea--error`
- Data and overlays
  - `mh-admin-table`
  - `mh-modal`
  - `mh-modal-backdrop`

## Standard Components
Located in `src/components/ui/`:

- `NeonButton`
- `NeonCard`
- `Badge`
- `SectionHeader`
- `SidebarItem`
- `DayTimelineItem`
- `StatCard`
- `FormInput`
- `AdminTable`
- `Modal`

Shared screens should prefer these primitives instead of introducing one-off styling.

## State Rules

### Buttons
- Default: solid or translucent surface
- Hover: slight lift and stronger glow
- Focus: cyan outline
- Disabled: reduced opacity, no interaction

### Cards
- Default: dark gradient panel
- Hover: small lift for interactive cards only
- Active: stronger border and glow

### Inputs
- Default: dark field, soft border
- Hover: slightly stronger border
- Focus: cyan glow
- Error: rose border and error glow

### Navigation Items
- Default: muted text, transparent panel
- Hover: subtle lightening
- Active: stronger surface fill, accent line/glow

## Usage Rules
- Do not place raw hex colors inside JSX
- Do not add random Tailwind color utilities for new UI work
- Introduce new colors only as tokens first
- Prefer `components/ui` primitives before making screen-specific components
- Student and admin experiences must share the same token source
