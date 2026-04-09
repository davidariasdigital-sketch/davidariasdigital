

## Revision de la plataforma — Problemas encontrados y correcciones

### Problemas detectados

1. **Botones invisibles en "Tabla de Costos"**: El botón "+ Nuevo servicio" y los botones de acción usan `bg-[hsl(var(--dash-accent))]` pero la variable CSS `--dash-accent` NO EXISTE en `index.css`. Esto hace que los botones no tengan color de fondo y el texto blanco sea invisible sobre fondo claro. Afecta tanto desktop como mobile.

2. **Warning de React en consola**: `QueryClientProvider` genera un warning de ref en `App.tsx`. Esto es un warning menor de compatibilidad entre versiones de React y react-query, no afecta funcionalidad.

### Correcciones propuestas

**Archivo: `src/components/dashboard/ServiceCostsView.tsx`**
- Reemplazar todas las referencias a `hsl(var(--dash-accent))` por `hsl(var(--primary))` (el amarillo dorado que ya existe y se usa en el resto del dashboard)
- Ajustar el color del texto en los botones de "Nuevo servicio" y "Añadir servicio" de `text-white` a `text-[hsl(var(--primary-foreground))]` (negro/oscuro sobre amarillo, para mantener consistencia con el resto de la UI)
- Los precios en las cards mobile también usan `dash-accent` — cambiar a `text-[hsl(var(--primary))]`

**Resumen de cambios (un solo archivo):**
- ~6 reemplazos de `dash-accent` → `primary` en `ServiceCostsView.tsx`
- Ajuste de `text-white` → `text-[hsl(var(--primary-foreground))]` en los 2 botones principales

### Lo que está correcto
- Login: se ve bien en desktop (1280px) y mobile (390px)
- Sidebar: navegación funcional, se cierra al seleccionar en mobile
- Cotizaciones: lista y botones correctos
- Clientes: grid responsive funciona bien
- Dashboard overview: calendario y actividades correctas

