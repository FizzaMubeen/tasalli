---
name: Serene Dawn Sanctuary
colors:
  surface: '#fdf9f2'
  surface-dim: '#dddad3'
  surface-bright: '#fdf9f2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ec'
  surface-container: '#f1ede6'
  surface-container-high: '#ebe8e1'
  surface-container-highest: '#e6e2db'
  on-surface: '#1c1c18'
  on-surface-variant: '#404947'
  inverse-surface: '#31302c'
  inverse-on-surface: '#f4f0e9'
  outline: '#707977'
  outline-variant: '#bfc8c6'
  surface-tint: '#2d6860'
  primary: '#00443e'
  on-primary: '#ffffff'
  primary-container: '#1f5c55'
  on-primary-container: '#97d2c9'
  inverse-primary: '#97d2c9'
  secondary: '#795900'
  on-secondary: '#ffffff'
  secondary-container: '#fed173'
  on-secondary-container: '#785800'
  tertiary: '#343e3d'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b5554'
  on-tertiary-container: '#bec9c7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b2eee4'
  primary-fixed-dim: '#97d2c9'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#0d5049'
  secondary-fixed: '#ffdea0'
  secondary-fixed-dim: '#ecc064'
  on-secondary-fixed: '#261a00'
  on-secondary-fixed-variant: '#5c4300'
  tertiary-fixed: '#dae5e3'
  tertiary-fixed-dim: '#bec9c7'
  on-tertiary-fixed: '#141d1d'
  on-tertiary-fixed-variant: '#3e4948'
  background: '#fdf9f2'
  on-background: '#1c1c18'
  surface-variant: '#e6e2db'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  arabic-title:
    fontFamily: Noto Serif
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 54px
  arabic-body:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 46px
  arabic-ayah:
    fontFamily: Noto Serif
    fontSize: 22px
    fontWeight: '400'
    lineHeight: 42px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the tranquility, stillness, and spiritual renewal of a quiet courtyard at Fajr. The emotional tone is deliberate, warm, reverent, and merciful. It eliminates cognitive friction, visual chaos, and urgency cues to serve as an authentic contemplative sanctuary.

The visual style merges refined minimalism with tactile editorial warmth:
- Generous, breathable canvas space that prevents visual compression and psychological hurry.
- Understated Islamic geometric motifs, specifically faint 8-point star filigree subtly integrated into headers and framing accents.
- Absolute exclusion of human photography, facial depictions, music iconography, decorative gamification streaks, and aggressive monetization elements.
- Calming, organic architectural rhythms mirroring tranquil arched cloisters, soft morning shadows, and natural stone textures.

## Colors

The palette is rooted in the quiet serenity of ivory courtyards, deep teal mineral tiles, and aged gilt detailing.

- **Canvas & Surfaces:** 
  - Canvas / Foundation: `#F7F3EC` (Warm Ivory) sets a soft, unbleached, paper-like background that mitigates eye fatigue.
  - Card & Container Surface: `#FFFFFF` (Pure White) creates clean, gentle separation from the warm canvas.
- **Brand & Accents:**
  - Primary: `#1F5C55` (Deep Teal) conveys depth, stability, and enduring grace. Used for dominant interactive states, key iconography, and solid emphasis.
  - Primary Soft Tint: `#E3EEEC` provides low-stimulus tinted backdrops for active chips, selected rows, and pill containers.
  - Accent Gold: `#B8913A` (Muted Warm Gold) used strictly in moderation for celebratory markers, bookmark badges, prayer period indicators, and subtle stars.
- **Typography & Structure:**
  - Text Ink (Primary): `#1E2A28` offers high contrast without the harshness of pure black.
  - Secondary Text: `#5F6E6B` for subtitles, reciter credits, timestamps, and transliterations.
  - Borders & Structural Dividers: `#E6E0D6` provides soft, architectural delineation.
- **Strict Guardrail:** Bright red (`#FF0000` / high-saturation vermilions) is strictly prohibited across all surfaces, alerts, destructive states, and notifications. Error and cautionary states must employ deep terracotta or muted henna tones (e.g., `#934B36` and `#F5ECE8`).

## Typography

Typography prioritizes ease of reading, quiet dignity, and bilingual harmony.

- **Latin Hierarchy (Inter):** Functional, neutral, and unadorned. Headlines are weighted at `600` (SemiBold) to anchor focal points without visual heaviness. Body copy sits at an open `16px` with an expanded line height (`26px`) to promote relaxed comprehension.
- **Arabic Typography:** Rendered with dedicated RTL support (`dir="rtl"`). Font size spans `22px` to `28px` with an expansive line height of `1.8` to `1.95` (`42px` to `54px`) to preserve diacritics (tashkeel), baseline balance, and ornamental ligatures without vertical clipping.
- **Pairing Discipline:** When Latin transliterations accompany Arabic verses, maintain a minimum vertical gap of `12px` to separate script rhythms cleanly.

## Layout & Spacing

The layout is grounded in balanced symmetry, spacious perimeters, and deliberate white space.

- **Grid Architecture:** 
  - Mobile (360px - 599px): Single column fluid stream with `1rem` outer canvas padding.
  - Tablet (600px - 1023px): 6-column fluid structure with `2rem` outer margins and `1rem` gutters.
  - Desktop (1024px+): Max content width constrained to `1120px` centered, utilizing a 12-column layout with `1.5rem` gutters and `3rem` margins to preserve intimacy and prevent eye travel strain.
- **Vertical Rhythm:**
  - Section headers must preserve at least `space-xl` (`2.5rem`) distance above them.
  - Related group elements (e.g., Ayah with translation and reflection prompt) maintain `space-sm` to `space-md` inner padding.

## Elevation & Depth

Visual hierarchy uses tonal surface stacking paired with soft daylight ambient shadows.

- **Base Layer (Elevation 0):** Unelevated `#F7F3EC` warm ivory canvas.
- **Resting Cards (Elevation 1):** Solid `#FFFFFF` surfaces defined by a crisp `1px` structural outline in `#E6E0D6`. No aggressive drop shadow; rely primarily on boundary contrast.
- **Floating Elements & Modals (Elevation 2):** Elevated sheets, audio controls, and floating bookmark toasts use daylight diffuse diffusion:
  - `box-shadow: 0 8px 24px -4px rgba(31, 92, 85, 0.06), 0 2px 6px -1px rgba(30, 42, 40, 0.03);`
  - The subtle teal-tinted shadow mirrors natural ambient light passing through arched stone.
- **Backdrop Overlays:** Translucent ivory tint (`rgba(247, 243, 236, 0.85)`) with a gentle `8px` blur (`backdrop-filter: blur(8px)`) for overlays and bottom sheets.

## Shapes

The geometric signature balances architectural arches with soft hand-held comfort.

- **Cards & Enclosures:** Uniform `1rem` (`16px`) radius, creating calm, tactile card boundaries.
- **Interactive Badges & Chips:** Standardized `0.5rem` (`8px`) or fully rounded pill configurations (`9999px`) for quick-filter categories.
- **Decorative Accentuation:** Subtle top-border curves on primary hero sheets simulate soft Islamic arch contours (`border-radius: 1.5rem 1.5rem 1rem 1rem`).

## Components

- **Buttons:**
  - *Primary Button:* Solid `#1F5C55` background, `#FFFFFF` text, `0.75rem` vertical by `1.5rem` horizontal padding, `16px` border-radius. Active state settles into `#174742`.
  - *Secondary / Ghost Button:* `#E3EEEC` soft teal tint with `#1F5C55` typography, or transparent with a `1px` solid `#E6E0D6` border.
  - *No high-contrast red destructive buttons:* Destructive actions (e.g., "Remove Bookmark") use muted secondary ink `#5F6E6B` or soft terra-cotta tint (`#F5ECE8`) with `#934B36` label.
- **Cards:**
  - Built with `#FFFFFF` background, `16px` corner radius, `1px` border in `#E6E0D6`, and `space-lg` internal padding.
  - Verse display cards contain right-aligned Arabic text at the top, a faint `#E6E0D6` horizontal rule, followed by left-aligned English translation and metadata tags.
- **Chips & Filters:**
  - Pill-shaped (`roundedness: 3` equivalent, `9999px`), `0.375rem` vertical padding, `1rem` horizontal padding.
  - Unselected: Transparent surface with `#E6E0D6` outline and `#5F6E6B` text.
  - Selected: `#E3EEEC` fill with `#1F5C55` text and matching border.
- **Input Fields:**
  - Flat `#FFFFFF` interior with `#E6E0D6` border and `12px` roundedness.
  - Focus state shifts border color to `#1F5C55` with a subtle `2px` ring in `#E3EEEC`.
  - Placeholder text styled in `#5F6E6B` at `14px`.
- **Lists & Dividers:**
  - List items are separated by `1px` hairline rules in `#E6E0D6`.
  - List tap states invoke a brief `#E3EEEC` background tint with zero spring animation.
- **Icons & Islamic Geometric Motifs:**
  - Iconography: 24px thin outline icons (1.5px stroke width) in `#1F5C55` or `#5F6E6B`.
  - Motifs: Headers can incorporate a watermark-weight SVG rendering of an 8-point Islamic star (Khatim) filled with `#B8913A` at `8%` to `12%` opacity.