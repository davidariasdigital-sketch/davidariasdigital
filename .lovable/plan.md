

## Plan: 4 cambios solicitados

### 1. Video de SOLAR → YouTube correcto
**Archivo:** `src/components/BrandsSection.tsx`
- Cambiar la URL del iframe de `https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1` a `https://www.youtube.com/embed/FlBSdQNGvz0?autoplay=1`

### 2. Quitar "DIGITAL CRAFTSMAN" del footer
**Archivo:** `src/components/Footer.tsx`
- Eliminar las líneas 70-77 (el bloque "Big type" con los `<h2>` de DIGITAL y CRAFTSMAN)

### 3. Quitar sección de Proyectos del dashboard
**Archivos afectados:**
- `src/pages/Dashboard.tsx`: Quitar import de `ProjectsView`, quitar `"projects"` del tipo `View`, quitar el case del switch
- `src/components/dashboard/DashboardSidebar.tsx`: Quitar `"projects"` del tipo `View`, quitar el item de Proyectos del array `items`, quitar import de `FolderKanban`
- `src/components/dashboard/OverviewView.tsx`: Quitar la card de "Proyectos activos" y `FolderKanban` import, quitar `"projects"` del tipo `View`
- Actualizar el texto del header en Dashboard para quitar la condición de `projects`

### 4. Añadir sección de Cuentas por Cobrar
**Base de datos** — Nueva migración para crear tabla `invoices`:
- `id` (uuid, PK), `user_id` (uuid, not null), `client_id` (uuid, FK nullable a clients), `quotation_id` (uuid, FK nullable a quotations), `concept` (text), `amount` (numeric), `status` (enum: pendiente, pagada, vencida), `due_date` (date), `paid_date` (date nullable), `notes` (text nullable), `created_at` (timestamptz)
- RLS policies para el usuario autenticado

**Nuevo archivo:** `src/components/dashboard/InvoicesView.tsx`
- CRUD de cuentas por cobrar con formulario (concepto, cliente, monto, fecha de vencimiento, estado, notas)
- Lista con indicadores visuales de estado (pendiente=amarillo, pagada=verde, vencida=rojo)
- Opción de vincular a una cotización existente
- Resumen rápido: total pendiente, total cobrado

**Integración al dashboard:**
- Añadir `"invoices"` al tipo `View` en todos los archivos relevantes
- Agregar item "Cuentas por Cobrar" con icono `DollarSign` al sidebar
- Agregar card de resumen al OverviewView
- Actualizar header del Dashboard

