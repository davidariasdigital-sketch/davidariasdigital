

## Plan: Optimización de rendimiento + Rediseño visual estilo referencia

### Problema de rendimiento
Los background blobs con `filter: blur(120px)` y múltiples `backdrop-filter: blur(40px)` en cada tarjeta causan repaint constante y consumo alto de GPU. La animación de framer-motion en cada cambio de vista agrega overhead.

### Cambios

**1. Optimización de rendimiento (`src/index.css`)**
- Eliminar los `.dash-blob` animados con blur pesado — reemplazar el fondo con un gradiente CSS estático simple (gris claro `#f2f1f6`)
- Simplificar `.dash-card` y `.dash-glass`: reducir `backdrop-filter` a `blur(16px)` y bajar `saturate`, o eliminarlo donde no sea visible
- Agregar `will-change: transform` solo en elementos que realmente animan
- Eliminar clases CSS no usadas (liquid-glass-rainbow, neu-card, etc.) para reducir peso

**2. Dashboard Layout (`src/pages/Dashboard.tsx`)**
- Eliminar los 3 divs `.dash-blob` del DOM
- Cambiar fondo a gradiente estático simple
- Reducir la animación de framer-motion: quitar `y: 12` y usar solo fade con `duration: 0.2`
- Agregar header mejorado: título bold "Dashboard", texto "Bienvenido de vuelta", barra de búsqueda, avatar

**3. Sidebar (`src/components/dashboard/DashboardSidebar.tsx`)**
- Sidebar oscuro negro con esquinas redondeadas internas
- Item activo: fondo amarillo/primary con texto negro, pill style prominente como en la imagen
- Items inactivos: texto gris claro, sin fondo
- Branding "David Arias" arriba, "Cerrar sesión" abajo

**4. Overview cards (`src/components/dashboard/OverviewView.tsx`)**
- Tres tarjetas en fila como la referencia:
  - Primera (amarilla): fondo `bg-primary` con esquinas redondeadas grandes, número grande bold
  - Segunda (blanca/glass): fondo blanco con borde sutil, número grande
  - Tercera (oscura): fondo negro con texto blanco, ícono "+" 
- Tipografía más grande (text-4xl/5xl para números)
- Debajo: calendario mensual con estilo limpio

**5. Vistas secundarias (Clients, Invoices, Quotations, ContentPlanner)**
- Reemplazar `dash-card` con clases simplificadas sin backdrop-filter pesado
- Usar `bg-white/80 border border-gray-200/60 rounded-2xl shadow-sm` en lugar de glass complejo

### Resultado esperado
Interfaz visualmente idéntica a la referencia (fondo gris claro, sidebar oscuro, tarjetas con contraste alto) pero sin los filtros blur pesados que causan lentitud.

