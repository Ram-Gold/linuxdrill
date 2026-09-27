---
version: alpha
name: Mimo
description: A dark, energetic edtech system with playful illustration, sharp contrast, and optimistic purple accents.
colors:
  primary: "#7E4BDE"
  primary-70: "#8E63E4"
  primary-90: "#A98AF0"
  secondary: "#252746"
  tertiary: "#333661"
  neutral: "#FFFFFF"
  surface: "#2C2F53"
  on-surface: "#FFFFFF"
  border: "#3F4273"
  muted: "#A3A5C3"
  accent-warm: "#F8D24A"
  accent-blue: "#33B6FF"
  accent-orange: "#FF8A3D"
  success: "#7ED957"
  error: "#FF6B6B"
typography:
  headline-display:
    fontFamily: "aeonikFono"
    fontSize: "56px"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-2.2px"
  headline-lg:
    fontFamily: "aeonik"
    fontSize: "41px"
    fontWeight: 400
    lineHeight: "49px"
    letterSpacing: "0px"
  headline-md:
    fontFamily: "aeonik"
    fontSize: "30px"
    fontWeight: 400
    lineHeight: "32px"
    letterSpacing: "0px"
  headline-sm:
    fontFamily: "AeonikPro-Regular"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "26px"
    letterSpacing: "0px"
  body-lg:
    fontFamily: "aeonik"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "aeonik"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "aeonik"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "aeonik"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "20px"
    letterSpacing: "0px"
  label-md:
    fontFamily: "aeonik"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
  label-sm:
    fontFamily: "AeonikPro-Regular"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
  caption:
    fontFamily: "aeonik"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
    letterSpacing: "0px"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 80px
  section: 120px
components:
  button-primary:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "12px 12px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "12px 12px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.lg}"
    padding: "12px 12px"
    height: "40px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.none}"
    padding: "0px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
    height: "40px"
  card:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "24px 24px 0px"
  chip:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Mimo

## Overview

Mimo feels like a modern, playful learning brand built for ambitious beginners and career switchers. The mood is energetic but not chaotic: a deep dark canvas, bright purple calls to action, and friendly illustrations create an encouraging, game-like tone. The overall presentation is spacious and premium, with strong hierarchy and a clear focus on conversion.

## Colors

- **Primary (#7E4BDE):** The signature purple used for the main CTA and highlights. It gives the brand its optimistic, tech-forward energy without overpowering the interface.
- **Secondary (#252746):** The deep navy background that defines the page. It creates a quiet, immersive stage for white typography and colorful illustration.
- **Tertiary (#333661):** A slightly lighter navy used for raised surfaces and secondary layers. It helps separate UI modules while staying within the dark theme.
- **Surface (#2C2F53):** A subtle panel color for inputs and inset UI. This keeps form controls visible against the background without feeling boxed in.
- **On-surface (#FFFFFF):** The main text and icon color on dark surfaces. It provides maximum contrast and clarity.
- **Border (#3F4273):** A restrained blue-violet border used for cards, inputs, and outlines. It adds structure instead of shadow.
- **Muted (#A3A5C3):** The soft gray-lilac used for helper text, secondary links, and low-emphasis labels. It supports hierarchy without becoming faint.
- **Accent-Warm (#F8D24A):** A cheerful yellow used in awards, stars, and illustration details. It adds warmth and visual reward.
- **Accent-Blue (#33B6FF):** A bright cyan accent for illustration and playful device UI. It reinforces the product’s digital, coded feel.
- **Accent-Orange (#FF8A3D):** A saturated orange accent, especially effective in iconography. It adds contrast to the purple-heavy palette.
- **Success (#7ED957):** A positive green used sparingly for status cues and validation moments.
- **Error (#FF6B6B):** A high-contrast alert color reserved for form errors and destructive states.

## Typography

The system combines two clear voices: Aeonik Fono for the large hero headline and Aeonik for most interface and editorial text. Aeonik Fono brings a slightly technical, branded feel to the hero line, while Aeonik stays clean and highly readable for body copy, navigation, and controls. The page does not rely on uppercase treatment; instead, it uses weight, size, and contrast to create emphasis, with a very tight negative letter spacing on the display headline for impact.

`headline-display` is the most expressive level and should be reserved for hero statements and campaign messaging. `headline-lg`, `headline-md`, and `headline-sm` support section titles and in-page hierarchy. `body-lg`, `body-md`, and `body-sm` handle supporting copy, descriptions, and legal text. `label-lg`, `label-md`, `label-sm`, and `caption` should be used for buttons, navigation, helper text, and metadata.

## Layout & Spacing

The layout is centered and conversion-focused, with generous breathing room around the hero content. The page uses a fixed-max-width feel rather than a dense fluid editorial grid, leaving large negative space around the illustration and form. Spacing steps feel intentional and moderate: smaller gaps cluster form controls tightly, while larger section gaps separate the hero from trust indicators and top navigation.

Use `spacing.xs` and `spacing.sm` for compact stacks like labels, links, and form rows. Use `spacing.md` and `spacing.lg` for the main rhythm inside forms, cards, and nav groups. Reserve `spacing.xl`, `spacing.xxl`, and `spacing.section` for page-level separation and hero framing. Interactive groups should be aligned with consistent vertical stacking rather than loose distribution.

## Elevation & Depth

Depth is achieved mostly through color and outline rather than shadow. The interface is intentionally flat, which suits the dark learning environment and keeps the page crisp. Borders, tonal contrast, and bright button fills provide hierarchy where a shadow-based system would otherwise be used.

Cards and inputs sit on subtly lighter dark surfaces with visible borders. The primary CTA stands out because of its white fill and purple outline glow, not because of heavy depth. Illustration elements use layered color contrast and rotation to create a lively sense of depth without UI chrome.

## Shapes

The shape language is soft and approachable, with rounded rectangles as the dominant form. Buttons and inputs use medium radii, creating a friendly but disciplined look. Cards are slightly more rounded than controls, which helps them feel like containers rather than tool surfaces.

Avoid overly pill-shaped forms for core controls; the system is more balanced than bubbly. Use `rounded.lg` for buttons, `rounded.md` for inputs, and `rounded.xl` for cards and larger containers. Full rounding should be reserved for chips, badges, and small decorative elements.

## Components

### Buttons
- `button-primary` is the main conversion button: white background, dark text, `rounded.lg`, and compact 12px vertical padding. It should feel prominent and trustworthy.
- `button-secondary` uses the purple brand fill with white text and is best for secondary calls to action or alternate sign-up actions.
- `button-link` is understated, used for legal links, language selectors, and low-emphasis navigation actions.
- Button sizing is medium and consistent; keep the height near `40px` and the padding balanced for quick scanning.

### Inputs
- Inputs use a dark surface fill, subtle border, and light text with generous inner padding.
- Keep placeholder text muted and readable, and ensure focus states strengthen border contrast rather than adding heavy effects.
- Use a consistent control height around `40px` so inputs align cleanly with buttons.

### Cards
- `card` should remain dark, bordered, and minimally elevated. Padding should be generous at the top and sides, with no shadow.
- Cards are best used for grouped content, trust blocks, or small content panels rather than dramatic product promos.

### Chips and small badges
- `chip` uses the tertiary surface, full rounding, and compact padding.
- Keep chip labels short and purposeful; these are for status, tags, or micro-navigation rather than action labels.

### Navigation and links
- Navigation links are light, compact, and restrained.
- Secondary text links should use muted color and underline treatment where needed, especially for terms, privacy, and inline disclosures.
- Icons should be simple, thin, and white or muted to preserve the clean dark header.

### Trust and social proof blocks
- Ratings, publication logos, and review badges should be treated as a low-contrast supporting row.
- Use white or warm accent highlights only where emphasis is intended, such as stars or awards.

## Do's and Don'ts

- Do keep the interface dark, spacious, and high contrast.
- Do use purple as the primary action color and reserve it for important moments.
- Do prefer borders and tonal layers over heavy shadows.
- Do maintain a clean, modern sans-serif feel with Aeonik-based typography.
- Do use compact controls with consistent 40px-ish heights for forms and buttons.
- Don't introduce bright gradients, glossy effects, or neon treatments.
- Don't over-round core UI elements into pills; keep the geometry disciplined.
- Don't crowd the layout with dense text blocks or excessive component nesting.