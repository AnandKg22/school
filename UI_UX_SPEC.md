# UI/UX Specification — AKSchool

> Design Tokens, Typography, Theme Progression, and Accessibility for **AKSchool (CommunityOS)**

---

## 1. Design Aesthetics & Visual Identity

AKSchool adopts a refined, modern SaaS aesthetic reminiscent of modern community platforms: clean typography, subtle border contrasts, accessible color tokens, and fluid card transitions.

### Color Palette & Tokens
- **Background:**
  - Dark Mode: `bg-slate-950` (`#020617`) with secondary cards in `bg-slate-900/80` (`#0f172a`).
  - Light Mode: `bg-slate-50` (`#f8fafc`) with cards in `bg-white` (`#ffffff`).
- **Primary Accents:**
  - Electric Indigo: `from-indigo-600 to-violet-600` for primary buttons and active indicators.
  - Emerald Green: `text-emerald-400` / `bg-emerald-500/10` for points, completed lessons, and health badges.
  - Amber Gold: `text-amber-400` / `bg-amber-500/10` for VIP tiers and pinned discussions.
- **Borders & Dividers:**
  - Subtle dark borders: `border-slate-800` / `border-slate-700/60`.
  - Light dividers: `border-slate-200`.

---

## 2. Typography

- **System Font Stack:** Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.
- **Heading Hierarchy:**
  - `h1`: 2.25rem (36px), font-bold, tracking-tight.
  - `h2`: 1.5rem (24px), font-semibold, tracking-tight.
  - `h3`: 1.125rem (18px), font-medium.
  - `body`: 0.875rem (14px) / 1rem (16px), line-height 1.5.

---

## 3. Responsive Layout & Breakpoints

- **Mobile ($< 768\text{px}$):**
  - Single column feed.
  - Collapsible drawer for spaces navigation.
  - Sticky bottom or top actions.
- **Tablet ($768\text{px} - 1024\text{px}$):**
  - Two-column view: compact spaces sidebar + main content feed.
- **Desktop ($> 1024\text{px}$):**
  - Three-column master-detail view: spaces navigation (left), main discussion / lesson player (center), community stats & member leaderboard (right).

---

## 4. Accessibility & Interaction Invariants

- **Zero Placeholder Text:** Real seed content for discussions, instructors, and lessons; no "Lorem ipsum" or non-functional buttons.
- **Keyboard Navigation:** Tab focus rings (`focus:ring-2 focus:ring-indigo-500`) on all interactive buttons, inputs, and modals.
- **Feedback States:** Loading skeletons on feed fetch, optimistic counters on like reactions, clear error banners on failed submissions.
