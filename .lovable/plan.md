

## Plan: unificar Cotizaciones y Cuentas por Cobrar en una sola ventana "Finanzas"

### Diseño de la interfaz

Una sola pantalla **Finanzas** con:

1. **Header** con título "Finanzas" + botón "Nueva" (dropdown: Cotización / Cuenta por cobrar).
2. **Resumen unificado** (3 tarjetas tipo bento, mismo estilo que ya usan los módulos):
   - Pendiente por cobrar (de invoices)
   - Total cobrado (de invoices)
   - Cotizaciones aceptadas / total (de quotations)
3. **Tabs** ("Cotizaciones" | "Cuentas por cobrar") usando el componente `Tabs` ya existente (`@/components/ui/tabs`) con estilo adaptado al dashboard (pill-style, no `bg-muted` plano).
4. **Contenido de cada tab**: la lista + formulario actuales de cada módulo, sin cambios en la lógica de Supabase ni en los PDFs.

```text
┌─ Finanzas ───────────────────────── [+ Nueva ▾] ┐
│  ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│  │ Pendiente │ │ Cobrado   │ │ Cotiz. OK │     │
│  └───────────┘ └───────────┘ └───────────┘     │
│                                                 │
│  ( Cotizaciones )  ( Cuentas por cobrar )      │
│  ─────────────────────────────────────────     │
│  [ Lista activa según tab ]                    │
└─────────────────────────────────────────────────┘
```

### Cambios de archivos

1. **Nuevo** `src/components/dashboard/FinanceView.tsx`
   - Estado `tab: "quotations" | "invoices"`.
   - Carga ligera de totales (pendiente, cobrado, # cotizaciones aceptadas) con dos queries `select` agregadas.
   - Renderiza `<QuotationsView />` o `<InvoicesView />` según tab.
   - Botón "Nueva" con menú simple (dropdown) que dispara el alta del módulo activo (vía prop `defaultOpenForm` opcional, o simplemente cambia de tab y abre el form).

2. **`QuotationsView.tsx` / `InvoicesView.tsx`**
   - Aceptar prop opcional `embedded?: boolean` para **ocultar el header propio** (título + botón "Nueva") cuando se renderizan dentro de FinanceView, evitando duplicación. Resto intacto.
   - Exponer un `ref` o prop `openFormSignal` para que el botón "Nueva" del header padre pueda abrir el form correspondiente. Implementación simple: prop `triggerNew: number` (contador) que un `useEffect` observa.

3. **`src/pages/Dashboard.tsx`**
   - Reemplazar las dos vistas (`quotations`, `invoices`) por una sola `finance`.
   - `View` queda: `"overview" | "finance" | "content-planner" | "service-costs"`.
   - `renderView` solo case `finance` → `<FinanceView />`.

4. **`DashboardSidebar.tsx`** y **`MobileBottomNav.tsx`**
   - Reemplazar los dos items "Cotizaciones" y "Cuentas de Cobro" por uno solo: **"Finanzas"** con icono `Wallet` (o `DollarSign`).

5. **`OverviewView.tsx`**
   - Actualizar el tipo `View` local para usar `"finance"` en lugar de `"quotations" | "invoices"` (revisar si `onNavigate` se usa con esos valores; si no, solo limpiar el union).

### Estilo de los Tabs (alineado con la estética actual)

Wrap manual en lugar del `TabsList` por defecto, para conservar el lenguaje "pill" del dashboard:

```tsx
<div className="inline-flex gap-1 p-1 rounded-full bg-[hsl(0,0%,96%)] border border-[hsl(var(--dash-card-border))]">
  {tabs.map(t => (
    <button className={tab===t.id 
      ? "bg-[hsl(var(--dash-card-bg))] text-[hsl(var(--dash-text))] shadow-sm rounded-full px-4 py-1.5 text-sm font-bold"
      : "text-[hsl(var(--dash-text-muted))] rounded-full px-4 py-1.5 text-sm font-semibold"
    }>{t.label}</button>
  ))}
</div>
```

### Lo que NO cambia
- Tablas Supabase (`quotations`, `invoices`, `clients`).
- PDFs (`invoice-pdf.ts`, `quotation-pdf.ts`).
- Lógica de creación/edición/eliminación.
- Asistente IA de cotizaciones.

### Archivos tocados
- Nuevo: `src/components/dashboard/FinanceView.tsx`
- Editado: `src/components/dashboard/QuotationsView.tsx` (prop `embedded`, `triggerNew`)
- Editado: `src/components/dashboard/InvoicesView.tsx` (prop `embedded`, `triggerNew`)
- Editado: `src/pages/Dashboard.tsx`
- Editado: `src/components/dashboard/DashboardSidebar.tsx`
- Editado: `src/components/dashboard/MobileBottomNav.tsx`
- Editado: `src/components/dashboard/OverviewView.tsx` (limpieza tipo `View`)

