# GLB Design System Documentation

**Version:** 1.0  
**Brand Essence:**  
Confident minimalism that blends *streetwear edge* with *aesthetic calm.*  
GLB’s look is cinematic, human, and tactile — a digital mirror of high-end street fashion.

---

## 1. Core Brand Identity

### 1.1 Brand Statement
> *GLB represents individuality through unity — wear what you stand for.*

### 1.2 Design Goals
- Simple, aesthetic, and bold.  
- Create *FOMO through subtle exclusivity.*  
- Every page should breathe — generous negative space, clean typography, and consistent rhythm.

---

## 2. Color System

### 2.1 Primary Palette

| Name | HEX | RGB | Usage |
|------|------|------|-------|
| **Charcoal Black** | `#1A1A1A` | 26, 26, 26 | Backgrounds, header/footer, primary text on light backgrounds |
| **Ivory White** | `#F5F5F0` | 245, 245, 240 | Main background for light mode, contrast sections |
| **Muted Sand** | `#CFC4B2` | 207, 196, 178 | Secondary surfaces, product cards, hover states |

### 2.2 Accent Palette

| Name | HEX | RGB | Usage |
|------|------|------|-------|
| **Deep Rust** | `#B14B34` | 177, 75, 52 | Primary accent, call-to-action buttons, highlights |
| **Dusty Olive** | `#7D826B` | 125, 130, 107 | Secondary accent, overlays, input borders |
| **Electric Blue** | `#007FFF` | 0, 127, 255 | Hover animations, badges, link indicators |

### 2.3 Neutral Palette

| Name | HEX | RGB | Usage |
|------|------|------|-------|
| **Graphite Gray** | `#2E2E2E` | 46, 46, 46 | Secondary background, footer text |
| **Soft Gray** | `#9E9E9E` | 158, 158, 158 | Body text, borders |
| **Warm White** | `#FAFAF8` | 250, 250, 248 | Backgrounds for product cards, highlights |

### 2.4 Color Usage Rules

**Do:**
- Maintain contrast ratio > 4.5:1 for accessibility.
- Use *Deep Rust* sparingly — only for active states or CTAs.
- Keep primary background either *Charcoal Black* or *Ivory White*, not both simultaneously on one page.

**Don’t:**
- Mix *Electric Blue* and *Deep Rust* together.
- Overuse gradients or multiple accent tones in one view.

---

## 3. Typography System

### 3.1 Font Families

| Type | Font Family | Usage |
|------|--------------|-------|
| **Display / Headers** | `Neue Montreal`, `Bebas Neue`, fallback: `Montserrat`, sans-serif | Logo, hero text, major headings |
| **Body / Paragraphs** | `Inter`, `Satoshi`, fallback: `Helvetica Neue`, sans-serif | Body copy, buttons, UI labels |
| **Accent / Quotes** | `Tan Nimbus`, `Playfair Display Italic` | Campaign lines, taglines |

### 3.2 Font Scale (px)

| Element | Size | Weight | Line Height | Letter Spacing |
|----------|------|---------|--------------|----------------|
| **H1 (Hero Header)** | 72px | 700 | 1.0 | -1% |
| **H2 (Section Header)** | 48px | 600 | 1.1 | -0.5% |
| **H3 (Subheader)** | 32px | 600 | 1.2 | Normal |
| **Body Text (P)** | 18px | 400 | 1.6 | Normal |
| **Small Text** | 14px | 400 | 1.6 | 1% |
| **Buttons / Labels** | 16px | 500 | 1.5 | 2% |

### 3.3 Typography Usage Rules

**Do:**
- Use uppercase for hero headlines and product names.
- Keep line height tight in large headers (1.0–1.2).
- Maintain consistent scaling across breakpoints.

**Don’t:**
- Mix italicized display fonts in body text.
- Use more than 2 typefaces per screen.

---

## 4. Layout & Grid System

### 4.1 Grid

| Device | Columns | Max Width | Margin |
|---------|----------|------------|--------|
| **Desktop** | 12 | 1200px | 80px |
| **Tablet** | 8 | - | 40px |
| **Mobile** | 4 | - | 20px |

### 4.2 Spacing Scale (8px Baseline)

| Token | Spacing | Use |
|--------|----------|-----|
| XS | 4px | Element gaps, icons |
| S | 8px | Tight inner padding |
| M | 16px | Component margins |
| L | 24px | Section padding |
| XL | 32px | Page layout gaps |
| XXL | 64px | Major section breaks |

### 4.3 Layout Rules

**Do:**
- Maintain 80–100px white space between sections.
- Keep consistent padding inside containers (L or XL spacing).
- Align content to grid columns.

**Don’t:**
- Crowd product grids.
- Center-align all text (except hero banners).

---

## 5. Components

### 5.1 Buttons

**Primary Button**
- Background: `#B14B34`
- Text: `#F5F5F0`
- Border Radius: `6px`
- Padding: `12px 32px`
- Font: Inter 16px, 500 weight
- Hover: background → `#953A29`, scale → `0.98`

**Secondary Button**
- Border: 1px solid `#7D826B`
- Text: `#F5F5F0`
- Hover: background → `#7D826B`, text → `#F5F5F0`

**Do:**
- Use one primary CTA per screen.
- Use micro-interactions (press-in motion, fade 0.3s ease).

**Don’t:**
- Add drop shadows.  
- Stack multiple button types together.

---

### 5.2 Cards (Product Tiles)

**Structure:**
- Aspect ratio: 1:1
- Background: `#FAFAF8`
- Image: full width
- Text block: padding 16px, bottom-aligned
- Hover:
  - Overlay darkens `rgba(0,0,0,0.25)`
  - Text slides up 10px
  - “+ Closet” icon fades in

**Typography:**
- Product Name: 18px, Inter 500
- Price: 16px, Inter 400, `#9E9E9E`

---

### 5.3 Navigation Bar

**Specs:**
- Height: 80px
- Background: `rgba(26,26,26,0.85)`
- Sticky top position
- Centered logo, spaced links
- Scroll: height shrinks to 64px, solid background `#1A1A1A`

**Interaction:**
- Hover underline grows from center to edges.
- Active link color: `#B14B34`

---

### 5.4 Modals & Overlays

- Background: `rgba(0,0,0,0.7)`
- Container: `#F5F5F0`, radius 12px, max-width 600px
- Drop animation: fade-in + slide-up (30px, 0.3s ease-out)

---

## 6. Imagery & Texture

**Style:**
- High contrast, muted grading.
- Urban settings, real models.
- Optional analog film grain overlay (opacity 5–10%).

**Do:**
- Feature diverse young adults (18–26).
- Use lifestyle imagery to create connection.

**Don’t:**
- Use oversaturated or glossy stock images.

---

## 7. Interaction Design & Motion

**Principles:**
- Motion serves purpose.
- Duration: 0.2–0.4s (ease-in-out).
- Keep transitions subtle.

**Examples:**
- Scroll reveal: fade + 10px slide-up.
- Logo morph: smooth G→L→B loop.
- Mode toggle: animated sun/moon (0.6s).

---

## 8. Accessibility

- Contrast ratio ≥ 4.5:1  
- Focus outlines: visible, `#007FFF`  
- Motion alternatives for “reduce motion”  
- Clickable areas ≥ 44px  

---

## 9. Brand Voice (Copy & Tone)

**Tone:**  
Minimal, grounded, self-assured.  
Avoid exaggeration or slang.

**Examples:**  
- “Wear what you stand for.”  
- “Made for the grounded.”  
- “Subtle. Intentional. Yours.”

---

## 10. Do’s & Don’ts Summary

| Element | Do | Don’t |
|----------|----|-------|
| **Colors** | Use 2–3 per screen | Mix too many accents |
| **Typography** | Bold headers, clean body | Combine too many fonts |
| **Layout** | Keep white space generous | Cram elements |
| **Buttons** | Use flat style, subtle motion | Add gradients/shadows |
| **Imagery** | Real, cinematic | Overedited or fake |

---

## 11. Implementation Tokens

```json
{
  "colors": {
    "primary": "#1A1A1A",
    "secondary": "#F5F5F0",
    "accent": "#B14B34",
    "sand": "#CFC4B2",
    "olive": "#7D826B",
    "blue": "#007FFF",
    "gray": "#9E9E9E"
  },
  "typography": {
    "fontDisplay": "Neue Montreal, Bebas Neue, Montserrat, sans-serif",
    "fontBody": "Inter, Helvetica Neue, sans-serif",
    "fontAccent": "Playfair Display Italic, serif",
    "sizes": {
      "h1": 72,
      "h2": 48,
      "h3": 32,
      "body": 18,
      "small": 14,
      "button": 16
    }
  },
  "spacing": [4, 8, 16, 24, 32, 64],
  "borderRadius": 6,
  "animation": {
    "duration": "0.3s",
    "timing": "ease-in-out"
  }
}
