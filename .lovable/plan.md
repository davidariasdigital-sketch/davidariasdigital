

## Plan: Rediseño del Dashboard con estilo Liquid Glass

Basado en la imagen de referencia, el objetivo es transformar el dashboard para que tenga una estética de vidrio líquido (liquid glass) con un fondo claro/gris suave, tarjetas con efecto glassmorphism, y una apariencia más moderna y limpia.

### Cambios principales

**1. Dashboard Layout (`src/pages/Dashboard.tsx`)**
- Cambiar el fondo del área de contenido a un gris claro sutil (similar a la referencia) en lugar del fondo oscuro actual
- Agregar un header más prominente con el título de la vista y un saludo
- Redondear el área principal de contenido para que se sienta como un panel de vidrio

**2. Sidebar (`src/components/dashboard/DashboardSidebar.tsx`)**
- Mantener el sidebar oscuro (como en la referencia) pero mejorar el item activo con un fondo amarillo/primary prominente (pill style como en la imagen)
- Agregar el logo/nombre "David Arias" en la parte superior del sidebar
- Mover el botón de logout al fondo del sidebar

**3. Variables CSS (`src/index.css`)**
- Agregar variantes de liquid glass para modo claro del dashboard
- Crear una clase `.dashboard-glass` con fondo semi-transparente claro, blur intenso, y bordes suaves
- Crear `.dashboard-card-glass` para las tarjetas con efecto vidrio elevado y sombras suaves

**4. Overview (`src/components/dashboard/OverviewView.tsx`)**
- Rediseñar las tarjetas de estadísticas con estilo glass más prominente: bordes redondeados grandes, sombras suaves, fondos semi-transparentes blancos
- Una tarjeta destacada con fondo primary (amarillo) sólido como en la referencia
- Tipografía más grande y bold para los números

**5. Vistas secundarias (Clients, Invoices, Quotations, ContentPlanner)**
- Aplicar las mismas clases de liquid glass a las tarjetas, tablas y formularios
- Usar fondos `white/60` con backdrop-blur en lugar de los fondos oscuros actuales

### Enfoque técnico

El dashboard main area tendrá un fondo gris claro (`bg-[#f0eff5]` o similar) mientras que el sidebar mantiene su estilo oscuro. Las tarjetas usarán `backdrop-filter: blur()` con fondos `rgba(255,255,255,0.6)` y bordes `rgba(255,255,255,0.3)` para lograr el efecto glassmorphism de la referencia. Se crearán clases utilitarias CSS reutilizables para mantener consistencia.

