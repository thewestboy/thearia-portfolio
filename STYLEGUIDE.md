# Style Guide — TheAria Portfolio

> This document outlines the visual design system, interaction principles, spacing, typography, animations, and component behavior used throughout the **TheAria Portfolio**.

---

# 🎨 Color Palette

| Role | Color | Value | Usage |
|------|------|------|------|
| Background (Void) | Near Black | `#0A0A0A` | Main page background |
| Surface | Charcoal | `#161616` | Cards & panels |
| Surface Soft | White (3.5%) | `rgba(255,255,255,0.035)` | Soft overlays |
| Glass Border | White (9%) | `rgba(255,255,255,0.09)` | Glassmorphism borders |
| Primary Text | Off White | `#F2F2F5` | Main text |
| Muted Text | Grey | `#9A9AA3` | Secondary text |
| Faint Text | Dark Grey | `#5B5B63` | Labels & metadata |
| Electric Blue | Accent | `#2E6FFF` | Primary accent |
| Neon Purple | Accent | `#A855F7` | Secondary accent |
| Cyan Glow | Accent | `#22E5FF` | Interactive highlights |
| Main Gradient | Linear | `#2E6FFF → #A855F7 → #22E5FF` | Buttons, gradients, progress bars |

---

# 🔤 Typography

## Font Families

| Role | Font | Fallback |
|------|------|----------|
| Display & Headings | Space Grotesk | Segoe UI, sans-serif |
| Body & Interface | Inter | Segoe UI, sans-serif |
| Code | JetBrains Mono | Courier New, monospace |

---

## Font Sizes

| Element | Size | Weight |
|---------|------|-------|
| Hero Title | `clamp(2.6rem, 6vw, 4.6rem)` | 700 |
| Section Title | `clamp(2.1rem, 4.4vw, 3.4rem)` | 600 |
| Card Heading | `1.05rem – 1.3rem` | 600 |
| Body Text | `15.5px – 16px` | 400 |
| Small Meta | `11px – 12.5px` | 400–500 |
| Eyebrow | `12.5px` | Mono |

---

## Letter Spacing

- Mono / Eyebrow Elements → `0.14em – 0.18em`
- Headings → `-0.015em – -0.01em`

---

# 🧊 Glassmorphism

The reusable `.glass` class applies:

```css
background: linear-gradient(
    155deg,
    rgba(255,255,255,0.055),
    rgba(255,255,255,0.015)
);

border: 1px solid rgba(255,255,255,0.09);

backdrop-filter: blur(20px) saturate(140%);

border-radius: 20px;
```

Used in:

- Code Cards
- Skill Cards
- Project Cards
- Timeline Cards
- Social Cards
- Contact Form

---

# 🌀 Motion & Animation

## Easing

```css
--ease: cubic-bezier(.65,0,.35,1);
```

Used throughout the interface.

---

## Scroll Reveal

Class:

```css
.reveal-up
```

Initial State

- opacity: 0
- translateY(34px)

Activated

- When the parent `.section.is-active` becomes visible.

Timing

- Delay → `calc(var(--ri,0) * 15ms)`
- Opacity → `0.5s`
- Transform → `0.7s`

---

## Hover Effects

| Component | Effect |
|----------|--------|
| Buttons | Lift, glow, icon translation |
| Project Cards | Lift, brighter border, scaled preview |
| Social Cards | Lift with gradient overlay |
| Navigation | Background & active indicator |

---

## Keyframe Animations

- pulse-dot
- float-tag
- scroll-trickle
- slow-spin
- blink

---

# 📐 Layout

| Section | Layout | Gap |
|---------|--------|-----|
| Hero | `1.15fr 0.85fr` | 64px |
| About | `0.85fr 1.15fr` | 64px |
| Skills | Three Columns | 24px |
| Portfolio | Horizontal Flex Carousel | 24px |
| Social | Four Columns | 18px |
| Contact | Two Columns | 70px |

---

# 📱 Responsive Breakpoints

### Desktop

- Full navigation
- Wide layouts

### Tablet

- Icon navigation
- Stacked columns

### Mobile

- Bottom navigation
- Single-column layout
- Full-width cards

---

# 🖱️ Interaction

## Custom Cursor

- Enabled only on fine-pointer devices
- 7px cursor dot
- 34px animated ring
- Hover expands ring to 54px

---

## Section Navigation

- Mouse Wheel
- Touch Gestures
- Keyboard Navigation

Supports

- URL Hash
- Browser Back / Forward
- Inner Section Scrolling

---

## Portfolio Carousel

- Horizontal Snap Scrolling
- Drag to Scroll
- Previous / Next Controls

---

# ♿ Accessibility

- Semantic HTML5
- ARIA Labels
- Active Navigation States
- Live Form Feedback
- Visible Keyboard Focus
- Reduced Motion Support

---

# 🧩 Components

| Component | Description |
|-----------|-------------|
| Hero | Typewriter code card & rotating role |
| About | Animated counters |
| Skills | Animated progress bars |
| Portfolio | CSS mock windows & draggable carousel |
| Experience | Vertical timeline |
| Contact | Front-end validation & simulated submission |

---

# 📁 Project Structure

| File | Purpose |
|------|---------|
| index.html | HTML structure |
| style.css | Styles, layout & responsive design |
| script.js | Interactions, navigation & animations |

No external frameworks or build tools are used.

---

# 📦 Planned Improvements

- Dark / Light Theme
- Additional Micro-interactions
- Hero Background Particles
- Enhanced Motion Details

---

# 🚧 Work in Progress

This style guide is still under development and will continue to evolve alongside the portfolio.

Some sections may be refined, expanded, or updated in future releases.

---

**TheAria**

