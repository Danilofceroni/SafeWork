---
name: SafeWork
description: Multi-tenant SaaS for industrial work permit management in the Chilean fishing industry
colors:
  navy: "#002D62"
  navy-light: "#003d85"
  navy-dark: "#001d40"
  orange: "#F96B07"
  orange-light: "#ff8a3d"
  orange-dark: "#d45800"
  surface: "#f8fafc"
  background: "#f1f5f9"
  card: "#ffffff"
  border: "#e2e8f0"
  muted: "#64748b"
  text: "#0f172a"
  text-secondary: "#334155"
  status-active: "#10b981"
  status-pending: "#f59e0b"
  status-critical: "#ef4444"
  status-closed: "#6b7280"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-primary-hover:
    backgroundColor: "{colors.orange-dark}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.navy}"
    rounded: "{rounded.lg}"
    padding: "10px 20px"
  nav-item-active:
    backgroundColor: "{colors.orange}"
    textColor: "{colors.card}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  nav-item-default:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  status-badge-active:
    backgroundColor: "#ecfdf5"
    textColor: "#065f46"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-badge-pending:
    backgroundColor: "#fffbeb"
    textColor: "#92400e"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-badge-critical:
    backgroundColor: "#fef2f2"
    textColor: "#991b1b"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  status-badge-closed:
    backgroundColor: "#f1f5f9"
    textColor: "#475569"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  input-default:
    backgroundColor: "{colors.card}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "12px 16px 12px 44px"
---

# Design System: SafeWork

## 1. Overview

**Creative North Star: "The Operations Center"**

SafeWork is designed like a mission-critical control room: every element visible because something depends on it, no decoration without operational purpose. A Prevencionista scanning 15 active permits at 06:30 on the plant floor needs to orient in under two seconds — the design earns that in structure, not in style. The sidebar is the command spine, institutional navy anchoring authority and continuity. Alert orange fires only when a decision or action is required; its rarity is what makes it a reliable signal.

The palette, typography, and elevation vocabulary are all calibrated for high-stakes readability: outdoor industrial lighting, shared tablets, users who may be wearing gloves. Information density is a feature, not a problem. Components repeat consistently — the same button shape, the same badge vocabulary, the same card anatomy — because the tool should disappear into the task. When an operator has memorized the interface, the interface has succeeded.

What this system explicitly rejects: the cheerful consumer app (gradient accents, playful copy, illustration-heavy empty states — tone is incompatible with a safety-critical context); the generic startup dashboard (decorative gradients, hero metrics that perform rather than inform); legacy enterprise tools (cluttered navigation, opaque state labeling, interactions that require training rather than intuition).

**Key Characteristics:**
- Institutional navy as structural backbone; alert orange reserved for action and urgency only
- Status legibility treated as a safety requirement, not a design choice
- Flat-by-default surfaces with state-responsive elevation
- Touch-appropriate density: 44px minimum interactive targets throughout
- Single typeface family, multiple weights — no decorative fonts in a tool this critical
- Motion conveys state change only; no orchestrated page sequences

---

## 2. Colors: The Institutional Palette

A two-accent palette built for operational clarity. Navy carries structure and authority; orange is the single action signal; status colors form a sealed semantic vocabulary that never bleeds into decoration.

### Primary
- **Institutional Navy** (`#002D62`): The structural color — sidebar background, brand identity, focus rings, link text. Conveys authority and continuity. Present on every screen as the left rail; its dominance provides orientation.
- **Navy Light** (`#003d85`): Hover state for navy surfaces; interactive navy elements at rest in lighter contexts.
- **Navy Dark** (`#001d40`): Deepest navy for pressed states and maximum-contrast backgrounds.

### Secondary
- **Alert Orange** (`#F96B07`): The single action color. Used exclusively for: primary CTA buttons, the active navigation item, expiring/critical permit accents. Its scarcity is the system. When orange appears, an action is available or required.
- **Orange Light** (`#ff8a3d`): Hover state on orange elements.
- **Orange Dark** (`#d45800`): Active/pressed state on orange elements; confirms the action was received.

### Tertiary (Status Vocabulary)
- **Active Green** (`#10b981`): Permit is active and within time bounds. Used in badges and status dots only.
- **Pending Amber** (`#f59e0b`): Permit is awaiting a required signature or approval.
- **Critical Red** (`#ef4444`): Permit is expiring, high-risk, or requires immediate attention. Not a brand color.
- **Closed Gray** (`#6b7280`): Permit is completed or archived. Recedes deliberately.

### Neutral
- **Page Canvas** (`#f1f5f9`): Root background — cool slate-tinted white that separates from card surfaces.
- **Inner Surface** (`#f8fafc`): Secondary containers (search bars, tenant selectors, form backgrounds within cards).
- **Card White** (`#ffffff`): Elevated content surfaces — data tables, permission lists, dashboard panels.
- **Border** (`#e2e8f0`): Dividers, card outlines, input strokes at rest. Never drawn attention to.
- **Muted** (`#64748b`): Secondary text, placeholder text, inactive icon color. Use only where text is genuinely secondary. Verify 4.5:1 against its background before shipping.
- **Text Primary** (`#0f172a`): All primary text — headings, labels, data.
- **Text Secondary** (`#334155`): Body copy, descriptions, metadata.

### Named Rules
**The One Accent Rule.** Alert orange is used on ≤15% of any given screen. Its role is singularly: primary actions, the active navigation item, and critical urgency signals. Orange used decoratively loses its operational meaning. If a design uses orange for a third thing, that thing is wrong.

**The Status Contract.** The four status colors (green / amber / red / gray) form a sealed vocabulary. They are never repurposed — red is not a brand accent, amber is not a warm highlight. Each status color always appears with both an icon and a text label; color alone fails in poor lighting and for colorblind operators.

---

## 3. Typography

**Display Font:** Inter (system-ui, -apple-system, sans-serif fallback)
**Body Font:** Inter (same family, different weights)
**Mono Font:** ui-monospace, SFMono-Regular, Menlo (for permit IDs and reference codes)

**Character:** A single family across all text roles. Inter at 700 for commands, 600 for labels, 400 for content — the weight axis provides all the hierarchy a tool UI needs without introducing a second voice. Precise, functional, no editorial ambition.

### Hierarchy
- **Display** (700, 2.25rem / 36px, lh 1.2, ls -0.01em): Login panel hero heading and first-run onboarding titles only. Not used inside the authenticated dashboard.
- **Headline** (700, 1.5rem / 24px, lh 1.3, ls -0.01em): Page-level titles ("Panel de Control"). One per view.
- **Title** (600, 0.9375rem / 15px, lh 1.4): Section headings, card headers, sidebar section labels.
- **Body** (400, 0.875rem / 14px, lh 1.5): Primary content — permit descriptions, form labels, status messages. 65–75ch max-width on prose.
- **Label** (500–600, 0.75rem / 12px, lh 1.4): Tags, badges, metadata, navigation items, button text. Semibold (600) for actions; medium (500) for passive metadata.
- **Mono** (400, 0.625rem / 10px, ls +0.05em): Permit IDs (PG-2026-0412), timestamps, reference codes. Monospaced to align across columns.

### Named Rules
**The Single Voice Rule.** Inter is the only typeface in this system. Never introduce a serif, display, or script face. The operational context demands unambiguous legibility at any size, on any screen, in any lighting. Typographic variety belongs in publications; this is a tool.

**The Scale Ceiling Rule.** No text larger than 2.25rem (36px) inside the authenticated surfaces. The Headline role at 1.5rem is the working ceiling in the dashboard. Above that, the UI is performing rather than informing.

---

## 4. Elevation

The system is flat by default. Depth is expressed in two ways: tonal layering (canvas → surface → card) and state-responsive shadows. Shadows do not decorate; they announce state.

### Shadow Vocabulary
- **Ambient Rest** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Cards and panels at rest. Barely visible; provides the minimum separation from the canvas needed to register as a surface.
- **Ambient Hover** (`0 4px 6px -1px rgb(0 0 0 / 0.10), 0 2px 4px -2px rgb(0 0 0 / 0.10)`): Interactive cards and list items on hover/focus. The lift communicates clickability.
- **Action Accent** (`0 10px 15px -3px rgb(249 107 7 / 0.20), 0 4px 6px -4px rgb(249 107 7 / 0.10)`): Primary CTA buttons only. The colored shadow grounds the orange button against the surface and communicates its priority. Intensifies slightly on hover.
- **Topbar Sticky** (`none`; border-bottom only): The top navigation bar uses a 1px border rather than a shadow to separate from content — prevents the "floating header" feeling that breaks the dense data layout.

### Named Rules
**The Flat-by-Default Rule.** Every surface rests flat. Shadows appear only in response to state (hover, active, floating dialog). A card that is decorated with a shadow at rest when it isn't interactive is wrong — the shadow implies affordance that doesn't exist.

**The Tonal Layering Rule.** Three distinct surface values create depth without shadows: Page Canvas (`#f1f5f9`) → Inner Surface (`#f8fafc`) → Card White (`#ffffff`). A fourth level (modal backdrop) uses Canvas with opacity overlay. These are not interchangeable; don't skip levels.

---

## 5. Components

### Buttons

**Precise and decisive — pressing a button here authorizes work that happens in the physical world.**

- **Shape:** Gently curved (12px / `rounded-xl`)
- **Primary (CTA):** Alert orange background (`#F96B07`), white text, 10px / 20px padding, Action Accent shadow. Used for "Solicitar Nuevo Permiso" and primary form submissions. Always full-width inside form panels; inline with explicit width in header/toolbar contexts.
- **Primary Hover:** Orange deepens to `#d45800`; button lifts 1px (`translateY(-1px)`); shadow intensifies. Active press returns to rest position.
- **Ghost / Text Link:** No background, navy text, no border. On hover: `#f8fafc` background fills in. Used for "Ver todos los permisos" and navigation shortcuts.
- **Destructive (Logout):** `#fef2f2` background, `#dc2626` text, `#fee2e2` border. Small size (8px padding). Never orange — uses red's semantic territory deliberately.
- **Disabled:** 50% opacity, `cursor: not-allowed`. No color change beyond opacity.
- **Focus ring:** 2px `#F96B07` at 3px offset (primary), 2px `#002D62` at 3px offset (ghost).

### Status Badges

**The permit's state in four words or fewer. The most safety-critical component in the system.**

- **Shape:** Pill (9999px radius)
- **Structure:** Colored dot (6px circle) + text label. Always both. Never color-only.
- **Active** (`#ecfdf5` bg / `#065f46` text / `#6ee7b7` dot): Valid, within time bounds.
- **Pending** (`#fffbeb` bg / `#92400e` text / `#f59e0b` dot): Awaiting required signature or action.
- **Critical** (`#fef2f2` bg / `#991b1b` text / `#f87171` dot): Expiring or high-risk. Draws the eye.
- **Closed** (`#f1f5f9` bg / `#475569` text / `#94a3b8` dot): Completed. Deliberately recedes.
- **Padding:** 4px vertical / 10px horizontal.
- **Text:** 12px, font-weight 600.

### Cards / Data Panels

**Data containers, not decorative tiles. The boundary exists to group; the interior exists to inform.**

- **Corner Style:** Gently curved (16px / `rounded-2xl`)
- **Background:** Card White (`#ffffff`)
- **Shadow:** Ambient Rest at default; Ambient Hover on interactive rows within the card
- **Border:** 1px `#e2e8f0` — present but never the visual focus
- **Internal Padding:** 20–24px on card headers and footers; 16–24px on list rows
- **Header anatomy:** Icon container (32px, tinted bg) + title (600 weight) + subtitle (12px muted) + count badge; separated from rows by 1px border
- **Row anatomy:** Icon (36px, slate-50 bg) + title/location + status badge + metadata; rows divide with 60%-opacity border. Hover background: `#f8fafc`.
- **Footer:** `#f8fafc` background, "Ver todos" link in navy

### Inputs / Fields

**Intake forms for real work authorizations. Precision over personality.**

- **Style:** White background, 1px `#e2e8f0` border at rest, 12px radius
- **Focus:** Border shifts to `#F96B07` with 3px orange/30 focus ring. Unmistakable without alarming.
- **Icon prefix:** Left icon at 14–16px in `#94a3b8`; input text left-padded 44px to clear the icon
- **Placeholder:** `#94a3b8` — verify this meets 4.5:1 against `#ffffff` background (it is approximately 3.0:1, which technically falls short of AA for normal text; use `#64748b` minimum)
- **Disabled:** 50% opacity, `cursor: not-allowed`
- **Error:** Border to `#ef4444`, red/10 focus ring; error message at 12px red text below the field
- **Touch target:** Minimum 48px total height in mobile contexts

### Navigation (Sidebar)

**The command spine. Always present; orientation is instantaneous.**

- **Container:** Full-height, 272px wide, Institutional Navy (`#002D62`) background; no radius (anchors to the viewport edge)
- **Logo area:** 72px height, 1px `rgba(255,255,255,0.06)` bottom border
- **Tenant selector:** `rgba(255,255,255,0.06)` background, `rgba(255,255,255,0.10)` on hover; 12px radius; chevron indicates multi-tenant capability
- **Nav items at rest:** 50% white text (`rgba(255,255,255,0.5)`), no background; icons at 40% opacity
- **Nav items hover:** 100% white text, `rgba(255,255,255,0.06)` background; icons at 70% opacity
- **Active nav item:** Alert orange background (`#F96B07`), white text, orange-tinted shadow — the one place orange dominates the sidebar. Unmistakable location indicator.
- **User section:** 72px footer, 1px top border at 6% white; avatar with orange gradient; 14px name / 12px role; logout icon in 30% white, shifts to red-400 on hover

### Status Feed (Activity Log)

**The audit trail made readable. Each event is one line — action + actor + time.**

- **Row height:** 48–52px
- **Icon containers:** 32px circles with semantic background tints (green/blue/slate/amber per event type)
- **Event text:** 14px, 70% weight, text-slate-700. Time stamp right-aligned, 12px muted, fixed width
- **Hover:** `#f8fafc/50` background wash — subtle, not a card

---

## 6. Do's and Don'ts

### Do:
- **Do** use Alert Orange exclusively for primary CTAs, the active navigation item, and safety-urgency signals. Its rarity is its power.
- **Do** pair every status color with an icon AND a text label — never color alone. This is a safety requirement, not a preference.
- **Do** verify that muted text (`#64748b`) achieves 4.5:1 contrast against its background before using it for anything more than secondary metadata. Bump to `#475569` or `#334155` when in doubt.
- **Do** maintain 44px minimum touch targets on all interactive elements. This is a plant-floor tool; users may be wearing gloves.
- **Do** use `shadow-sm` at rest and `shadow-md` on hover for interactive cards. The lift communicates clickability before the cursor changes.
- **Do** use `@media (prefers-reduced-motion: reduce)` alternatives for every animation. Older shared plant tablets may have this setting enabled.
- **Do** keep the three tonal layers distinct: Canvas (`#f1f5f9`) → Surface (`#f8fafc`) → Card (`#ffffff`). Skipping a level collapses depth.
- **Do** use Inter at 600+ weight for any label that needs to communicate state or instruction. 400-weight labels disappear in dense layouts.

### Don't:
- **Don't** use orange decoratively — as a section highlight, an icon tint, or a background accent. It loses its operational meaning immediately.
- **Don't** use red (`#ef4444`, `status-critical`) outside its semantic role as "critical / error / expiring." Red is not a brand color in this system.
- **Don't** default to cards for grouping. Cards are data containers with a discrete boundary; if the boundary isn't earning its keep, remove it. Nested cards are always wrong.
- **Don't** ship without `@media (prefers-reduced-motion: reduce)` alternatives. All Framer Motion animations require a reduced-motion branch that uses opacity transitions only, not transforms.
- **Don't** use `border-left` greater than 1px as a colored stripe on list items or callouts. Use background tints or icon prefixes instead.
- **Don't** use gradient text (`background-clip: text`) anywhere in the system. Emphasis is carried by weight and size.
- **Don't** add eyebrow labels ("PRINCIPAL", "SECTION", "TOOLS") above nav groups or content sections as default scaffolding. The current sidebar "Principal" label is one existing instance; don't extend the pattern.
- **Don't** let Framer Motion stagger animations gate content visibility. All staggered sections must be visible at their default opacity in case the transition doesn't fire (hidden tab, headless renderer, older device).
- **Don't** give this interface the tone of a consumer app — no playful micro-copy, no illustration-heavy empty states, no cheerful gradient CTAs. A supervisor using this to authorize confined-space entry is not in a "delightful" moment.
- **Don't** make placeholder text `#94a3b8` on a white background — it fails 4.5:1 AA contrast. Use `#64748b` minimum.
