# Bordik UI Kit

> **Purpose.** One source of truth for visual patterns. When you build a new
> component, check here first — we likely already have the answer. When
> something feels off, fix it here so the whole app inherits the fix.
>
> Tokens already live in `design-system/tokens/*.css` and are imported via
> `app/globals.css`. This document explains **which token to use where** and
> provides copy-pasteable component patterns.

---

## 1. Colours

### 1.1 Palette (`design-system/tokens/colors.css`)

| Role | Token | Hex | Where to use |
|------|-------|-----|--------------|
| Page background | `--md-sys-color-background` | `#F0F1F5` | Body, behind cards |
| Card surface | `--md-sys-color-surface` | `#FFFFFF` | Standalone cards, modals |
| Muted surface | `#F5F6F8` | `#F5F6F8` | Toolbar, filter chips, input fields |
| Border | `#E2E4EA` | `#E2E4EA` | Thin 1 px separators, dashed groupings |
| Text primary | `#1A1A1A` | `#1A1A1A` | Titles, body copy |
| Text secondary | `#6B7280` | `#6B7280` | Descriptions, inactive labels |
| Text tertiary | `#9CA3AF` | `#9CA3AF` | Mono uppercase field labels, captions |
| Text disabled | `#C7CAD1` | `#C7CAD1` | Disabled button text |
| Accent dark | `#1A1A1A` | `#1A1A1A` | Primary action buttons |
| Success | `#22C55E` | `#22C55E` | Positive scale bands, «В цели» |
| Success dark | `#059669` | `#059669` | «Пройден» pills |
| Warning | `#F59E0B` | `#F59E0B` | Mid-range scale, amber notices |
| Error | `#EF4444` | `#EF4444` | High-risk scale, destructive actions |
| Error dark | `#991B1B` | `#991B1B` | Critical scale («крайне высокий») |
| Fav yellow | `#FEF3C7` / `#D97706` | — | Favourite star fill and outline |

**Semantic pairs (don't mix cold & warm variants across a single component):**

```
Info  → #EEF4FF bg, #1D4ED8 text, #3B82F6 border
Warn  → #FFFBEB bg, #B45309 text, #F59E0B border
Error → #FEF2F2 bg, #B91C1C text, #EF4444 border
OK    → #ECFDF5 bg, #059669 text, #22C55E border
```

### 1.2 Rule: neutral by default

We write about medicine — users already feel urgency. Do NOT paint
internal components in alarm colours. Red / orange should mean **the
result says the patient is in trouble**, not «this is a warning callout».
For structural warnings (rules, disclaimers, consent) use **grey borders
+ mono-uppercase labels**.

---

## 2. Typography

### 2.1 Fonts (`design-system/tokens/typography.css`)

| Family | Token | Usage |
|--------|-------|-------|
| Montserrat Variable | `var(--font-display)` | Headings h1–h4 |
| Inter (inherited from body) | `var(--font-body)` | Body, inputs, buttons |
| JetBrains Mono Variable | `var(--font-mono)` | Labels (uppercase), values, codes, counters |

### 2.2 Scale

| Token | Size | Use |
|-------|------|-----|
| `--text-xs` | 11–12 px | Captions, pills, mono labels |
| `--text-sm` | 13 px | Body copy, button labels |
| `--text-base` | 14 px | Input values, card body |
| `--text-lg` | 16 px | Card titles (h4) |
| `--text-xl` | 18 px | Section headers (h3) |
| `--text-2xl` | 22–24 px | Page headers (h2) |
| `--text-3xl` | 28 px | Big numbers (score total) |

### 2.3 Rules

- Mono labels are `uppercase` with `letter-spacing: 0.06em – 0.08em`
- Never mix display + mono in the same inline span — display with mono feels noisy
- Body copy: `line-height: 1.5`. Dense tabular UI: `1.3`. Callouts: `1.55`.
- Bold (`700`) reserved for headings + key numbers, NOT body copy
- `font-weight: 500` for emphasis inside body text (not `600+`)

---

## 3. Spacing

8-point base. Live tokens in `design-system/tokens/spacing.css`.

| Token | Px | Use |
|-------|----|-----|
| `--space-1` | 4 | Icon-to-text, tight inline gaps |
| `--space-2` | 8 | Default flex gap |
| `--space-3` | 12 | Card content spacing |
| `--space-4` | 16 | Section separators |
| `--space-5` | 20 | Card padding |
| `--space-6` | 24 | Page padding, large card padding |
| `--space-8` | 32 | Big vertical rhythm |
| `--space-10` | 40 | Between major sections |
| `--space-12` | 48 | Page hero top offset |

**Rules of thumb**

- Card internal padding: `20 24` (h v) or `24 28` for spacious
- Button padding: `8 16` small, `10 20` default, `12 24` large
- Input height: 44 px (aligns with lg button)
- Modal padding: `28 32`

---

## 4. Border radius

| Token | Px | Use |
|-------|----|-----|
| `--md-sys-shape-corner-small` | 4 | Nothing by default |
| `--md-sys-shape-corner-medium` | 8 | Icon chips |
| `--md-sys-shape-corner-large` | 12 | Input fields, callouts |
| `--md-sys-shape-corner-extra-large` | 16–20 | Cards, modals |
| `32` | 32 | Page main container (see `app/page.tsx`) |
| `--md-sys-shape-corner-full` | 9999 | Pills, chips, counters, buttons with mono label |

**Consistency rule**: inside one nested surface, the inner radius should be
≤ outer radius minus the padding. Breaking this makes corners look
mis-nested (a 12 px radius card inside a 16 px modal reads wrong).

---

## 5. Shadows

```css
/* Idle, no interaction implied */
box-shadow: 0 1px 2px rgba(16,24,40,0.04);

/* Hoverable card */
box-shadow: 0 1px 2px rgba(16,24,40,0.06), 0 2px 8px rgba(16,24,40,0.06);

/* Popover / dropdown */
box-shadow: 0 8px 24px rgba(15,23,42,0.12);

/* Modal */
box-shadow: 0 24px 48px rgba(15,23,42,0.24);
```

Do NOT invent new shadow recipes. If a component needs something different,
promote one of these to a CSS variable and use it everywhere.

---

## 6. Buttons

```tsx
// Primary (the only mandatory action on a screen)
<button style={{
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '10px 20px', borderRadius: 10,
  background: '#1A1A1A', color: '#FFFFFF',
  border: 'none', cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
  transition: 'background 180ms',
}}
  onMouseEnter={(e) => { e.currentTarget.style.background = '#000000'; }}
  onMouseLeave={(e) => { e.currentTarget.style.background = '#1A1A1A'; }}
>
  Label →
</button>

// Secondary (muted surface, neutral alternative)
background: '#F5F6F8'; color: '#1A1A1A';
hover: '#E2E4EA'

// Ghost (text-only, dismiss actions)
background: 'transparent'; color: '#6B7280';
hover: color '#1A1A1A'

// Destructive
background: '#B91C1C'; color: '#FFFFFF';
hover: '#991B1B'

// Disabled
background: '#E2E4EA'; color: '#9CA3AF'; cursor: 'not-allowed';
```

**Size scale**

| Name | Padding | Font | Use |
|------|---------|------|-----|
| sm | `6 12` | 12 px 600 | Toolbar pill, filter chip |
| md | `8 16` | 13 px 600 | Default |
| lg | `10 20` | 13 px 600 | Primary CTA |
| xl | `12 24` | 14 px 600 | Modal confirm |

Every button with a trailing → or leading ← icon uses `gap: 6` and `svg size 14`.

---

## 7. Inputs

### 7.1 Number / select field

- Height 44 px, padding `12 14`
- Background `#F5F6F8`, border-radius 12
- No border by default; focus adds `box-shadow: 0 0 0 2px #1A1A1A` via outline
- Label above, font-size 12, colour `#6B7280`, weight 500
- Hint icon ℹ (see `components/tools/ToolView.tsx → InlineHintIcon`) trailing the label

### 7.2 Checkbox

Square 20×20, radius 6. Unchecked: `#F5F6F8` + `0 0 0 1px #E2E4EA inset`.
Checked: `#1A1A1A` bg, `#FFFFFF` tick SVG (stroke-width 3).

**Rule**: group checkboxes at the END of a calculator form
(`components/tools/ToolView.tsx → CalculatorBody` does this automatically).

### 7.3 Switch (IOSSwitch)

Used for on/off profile preferences. See `components/profile/*` for the
canonical implementation.

---

## 8. Callouts

Callouts are **the** pattern for rule blocks, warnings, and formulas.

### 8.1 Neutral (rules / disclaimers)

```tsx
<div style={{
  background: '#FFFFFF', borderRadius: 12,
  padding: '18px 20px',
  borderLeft: '3px solid #D1D5DB',
}}>
  <p style={{
    fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700,
    color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em',
    margin: '0 0 10px 0',
  }}>
    Section label
  </p>
  {/* body */}
</div>
```

### 8.2 Coloured (live in Markdown via `app/globals.css`)

- `ℹ` → `.callout-info` (blue)
- `⚠` → `.callout-warning` (amber)
- `✓` / `✅` → `.callout-success` (green)
- `🎯` → `.callout-goal` (teal)
- `💡` → `.callout-tip` (violet)

Written as blockquote in runner `info:`. React Markdown renderer detects
the leading emoji and applies the class. **Do NOT roll your own colour
callouts in component code** — these classes already style them.

### 8.3 Formula callout

Triggered by an info paragraph whose only child is inline `` `...` ``:

```css
.lesson-content.tool-info p:has(> code:only-child) { … }
```

Displays as a blue `ФОРМУЛА` card (label above, mono text below).
Prefer a bulleted list when multiple formulas share one section — each
bullet gets its own callout automatically.

---

## 9. Modals

```tsx
<AnimatePresence>
  {open && (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}
      onClick={close}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: 16,
          padding: '28px 28px 22px',
          maxWidth: 400, width: '100%',
          boxShadow: '0 24px 48px rgba(15,23,42,0.24)',
        }}
      >
        {/* title + body + actions */}
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

**Max-width scale**: 400 (confirm), 520 (form), 720 (detail), 960 (full).

---

## 10. Icons

- Library: Lucide-style strokes (`stroke-width: 2`, `stroke-linecap: round`, `stroke-linejoin: round`).
- Sizes: 12 / 14 / 16 / 18 / 20 / 24 / 32 px. Never in between.
- Colour: `currentColor` — inherits from surrounding text.
- Filled variants (favourites, pinned) use the same SVG with `fill='currentColor'` and `stroke='none'`.

---

## 11. Animations

```tsx
// Hover fade (background/colour)
transition: 'background 180ms, color 180ms'

// Element enter (modal, consent, result card)
initial={{ opacity: 0, y: 8 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}

// Exit (modal dismiss)
exit={{ opacity: 0 }} / transition={{ duration: 0.12 }}

// Pulse (critical timer, unread indicator)
animation: 'bordik-timer-pulse 1s ease-in-out infinite'
@keyframes bordik-timer-pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.55 } }
```

Framer-motion is used for orchestration (`AnimatePresence`, route changes).
Simple hover effects stay in inline CSS `transition` — spinning up motion
for a `1 → 0.9 opacity` change is wasteful.

---

## 12. Layout primitives

### Main container
- Flex column, `overflow: hidden`
- Rounded on left edge only: `borderTopLeftRadius: 32, borderBottomLeftRadius: 32`
- Subtle 1 px border: `boxShadow: '0 0 0 1px #F0F1F5'`

### Sidebar
- 280 px wide on desktop, full-width drawer on mobile
- No border radius — it's the under-layer

### Toolbar (tools page)
- `display: flex, flexWrap: wrap, gap: 8`
- Filter chips use `borderRadius: 999`, `padding: 7 12`

---

## 13. File locations

| What | Where |
|------|-------|
| Colour tokens | `design-system/tokens/colors.css` |
| Typography tokens | `design-system/tokens/typography.css` |
| Spacing tokens | `design-system/tokens/spacing.css` |
| Shape tokens | `design-system/tokens/shape.css` |
| Motion tokens | `design-system/tokens/motion.css` |
| Global styles + callouts | `app/globals.css` |
| Existing generic UI | `components/ui/` |
| Canonical consent example | `components/course/TestStartConsent.tsx` |
| Canonical modal example | `components/course/TestActiveView.tsx` (exit confirm) |
| Canonical callout example | in runner `info:` markdown + `app/globals.css` |

---

## 14. Lint rules for the future

If you find yourself doing any of the below — stop, then fix the underlying
pattern instead:

1. Adding a new `#HEX` that isn't in this doc → either promote to a token
   or reuse the closest existing one.
2. New `padding: '13px 15px'` style numbers → snap to the spacing scale.
3. Custom colour callout with `borderRadius: 8` and `background: 'red'` →
   use `.callout-warning` / `.callout-error` classes via emoji-prefixed
   blockquote, or the neutral callout pattern in §8.1.
4. `fontFamily: 'Arial', 'Helvetica'` → use CSS variables only.
5. New modal without `AnimatePresence` → inherit the pattern in §9.
6. A `12 px` radius inside a `12 px` radius card → nest correctly (§4 rule).

If a new pattern genuinely doesn't fit here, **add it to this document** in
the relevant section instead of inventing one-off styling in a component.
