

## Plan

### 1. Fix Login page design for PC and tablet

The login page uses `liquid-glass` class and dark landing theme variables (`--background: 0 0% 4%`), which likely causes visual issues. The card itself uses `bg-muted/50` inputs that may not contrast well.

**Changes to `src/pages/Login.tsx`:**
- Add a proper visible background — use a light/neutral gradient or the dashboard bg color so the card stands out clearly
- Ensure the card has a solid white background with proper shadow instead of relying on `liquid-glass`
- Increase max-width slightly for tablet (`max-w-md`)
- Add a subtle decorative element that works on all screen sizes
- Ensure inputs have proper contrast and sizing for desktop

### 2. New "Tabla de Costos" (Pricing/Services table) view in the dashboard

A new section where the user can manage a table of service costs — add, edit, and delete service pricing entries.

**Database migration — create `service_costs` table:**
```sql
CREATE TABLE public.service_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL DEFAULT '',
  service text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'por servicio',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.service_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own service costs"
  ON public.service_costs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**New file `src/components/dashboard/ServiceCostsView.tsx`:**
- Table view displaying all services with columns: Categoría, Servicio, Descripción, Precio, Unidad
- Inline add/edit form (Drawer on mobile, tile on desktop — following existing patterns)
- Delete with confirmation
- Search/filter by category
- Categories could include: "Fotografía", "Video", "Edición", "Dirección creativa", etc.

**Update `src/components/dashboard/DashboardSidebar.tsx`:**
- Add new nav item "Costos" with `Receipt` or `TableProperties` icon
- Add `"service-costs"` to the `View` type

**Update `src/pages/Dashboard.tsx`:**
- Add `"service-costs"` to the `View` type
- Import and render `ServiceCostsView` in `renderView()`

### Files to create/modify:
1. **Migration** — create `service_costs` table with RLS
2. **Create** `src/components/dashboard/ServiceCostsView.tsx` — full CRUD table view
3. **Edit** `src/components/dashboard/DashboardSidebar.tsx` — add nav item
4. **Edit** `src/pages/Dashboard.tsx` — add view routing
5. **Edit** `src/pages/Login.tsx` — fix styling for PC/tablet

