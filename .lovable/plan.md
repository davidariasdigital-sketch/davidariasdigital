

## Plan: Botón de login en landing + Dashboard administrativo

### 1. Botón de inicio de sesión en el Navbar
Agregar un icono discreto (User/LogIn) en el extremo derecho del navbar que lleve a `/login`. Mantener el estilo minimal para no distraer del contenido público.

### 2. Redirigir login al Dashboard (no a Style Guide)
Modificar `Login.tsx` para que después del login redirija a `/dashboard` en lugar de `/style-guide`. Agregar enlace a Style Guide desde el dashboard.

### 3. Tablas en la base de datos
Crear las siguientes tablas con RLS (solo el usuario autenticado puede CRUD sus datos):

- **clients** — `id`, `user_id`, `name`, `email`, `phone`, `company`, `notes`, `created_at`
- **quotations** — `id`, `user_id`, `client_id` (FK), `title`, `description`, `items` (JSONB con servicios/precios), `total`, `status` (borrador/enviada/aceptada/rechazada), `created_at`
- **projects** — `id`, `user_id`, `client_id` (FK), `quotation_id` (FK nullable), `title`, `status` (pendiente/en_progreso/completado), `progress` (0-100), `start_date`, `due_date`, `notes`, `created_at`
- **tasks** — `id`, `user_id`, `project_id` (FK nullable), `title`, `completed`, `due_date`, `priority` (baja/media/alta), `created_at`

### 4. Dashboard (`/dashboard`) — Página principal protegida
Interfaz con sidebar tipo liquid-glass con navegación:
- **Resumen** — Cards con métricas (clientes activos, cotizaciones pendientes, proyectos en curso, tareas pendientes)
- **Clientes** — Lista/tabla con CRUD, búsqueda
- **Cotizaciones** — Crear/editar cotizaciones con items dinámicos, vincular a cliente, cambiar estado
- **Proyectos** — Vista de proyectos con barra de progreso, estado, fechas
- **Tareas** — Lista de pendientes con checkbox, prioridad, fecha límite
- **Guía de Estilo** — Link a la página existente

### 5. Estilo visual
Mantener la estética liquid-glass, colores mostaza/oscuro, tipografía Montserrat, bordes redondeados 1.5rem, y animaciones con framer-motion.

### Archivos a crear/modificar
- `src/components/Navbar.tsx` — Agregar botón de login
- `src/pages/Login.tsx` — Redirigir a `/dashboard`
- `src/pages/Dashboard.tsx` — Layout con sidebar y vistas
- `src/components/dashboard/DashboardSidebar.tsx`
- `src/components/dashboard/OverviewView.tsx`
- `src/components/dashboard/ClientsView.tsx`
- `src/components/dashboard/QuotationsView.tsx`
- `src/components/dashboard/ProjectsView.tsx`
- `src/components/dashboard/TasksView.tsx`
- `src/App.tsx` — Agregar ruta `/dashboard`
- Migración SQL para las 4 tablas + políticas RLS

