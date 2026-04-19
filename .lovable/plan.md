

## Plan

### 1. Mobile bottom nav — floating with borders

In `src/components/dashboard/MobileBottomNav.tsx`:
- Wrap the nav so it floats above the page with margins (`bottom-3 left-3 right-3` instead of `inset-x-0`).
- Add fully rounded corners (`rounded-2xl`), a visible border (`border border-[hsl(var(--dash-card-border))]`) and a soft elevated shadow (`shadow-[0_8px_28px_-8px_hsl(0_0%_0%/0.18)]`).
- Remove the top-only border + bottom-fixed shadow (which made it look attached to the screen edge).
- Keep `env(safe-area-inset-bottom)` handling by adding it to the outer wrapper margin.
- In `src/pages/Dashboard.tsx`: increase mobile bottom padding (`pb-28`) so floating bar doesn't cover content.

### 2. Remove "Clientes" view from the entire site

The `clients` Supabase table is still required (used by Quotations, Invoices, Projects, MonthlyCalendar to attach a client to records). Only the standalone **Clientes page/section** is removed.

- `src/pages/Dashboard.tsx`: remove `ClientsView` import, the `"clients"` case in `renderView`, and drop `"clients"` from the `View` union.
- `src/components/dashboard/DashboardSidebar.tsx`: remove the "Clientes" sidebar item and from the View type.
- `src/components/dashboard/MobileBottomNav.tsx`: remove the "Clientes" item and from the View type.
- `src/components/dashboard/OverviewView.tsx`: remove `"clients"` from its local View union (only "overview"/"quotations"/etc. used in onNavigate).
- Delete file `src/components/dashboard/ClientsView.tsx`.
- Leave `clients` DB table, RLS, and all `clients(id, name)` selectors used by Quotations / Invoices / Projects / MonthlyCalendar untouched.

### 3. Weekly calendar — readable on mobile

Problem at 390px: the grid is `[44px_repeat(7,1fr)]` → each day column ≈ 45px, event titles get clipped, hour labels overlap. Solution: collapse to **single-day swipeable view on mobile**, keep the 7-day grid on `sm+`.

In `src/components/dashboard/WeeklyView.tsx`:
- Add `useIsMobile()` hook.
- Add a `selectedDayIndex` state (0–6, default = today within the current week, or 0 if outside).
- Mobile header: day pills row (`L M X J V S D` + date number) — tap to switch day; chevrons shift between days (across weeks when crossing edges).
- Mobile grid: `grid-cols-[52px_1fr]` (hour col + single day col). Render only `days[selectedDayIndex]`.
- Increase mobile font sizes: hour labels `text-[11px]`, event title `text-xs`, time range `text-[10px]`, slot height `SLOT_HEIGHT_MOBILE = 56`.
- Desktop view (`sm:` breakpoint and above) keeps the existing 7-column layout untouched.
- Drag/drop, click-to-create, edit popup logic stays the same — only the rendered columns change.

### Files touched
- `src/components/dashboard/MobileBottomNav.tsx` (floating + remove Clientes)
- `src/pages/Dashboard.tsx` (remove ClientsView, more bottom padding)
- `src/components/dashboard/DashboardSidebar.tsx` (remove Clientes item)
- `src/components/dashboard/OverviewView.tsx` (View type cleanup)
- `src/components/dashboard/WeeklyView.tsx` (mobile single-day view)
- Delete: `src/components/dashboard/ClientsView.tsx`

