## Rediseño del Centro de Contenido — Planner nativo

El objetivo es un planner pensado para creadores de contenido: visual, rápido de escanear, con jerarquía clara entre plataformas y un editor de guion serio. Solo se reutiliza la **paleta y el lenguaje de chips** del sistema (no la estructura de Cotizaciones).

### 1. Layout: Board tipo Kanban por plataforma

Reemplazar las 4 secciones apiladas verticalmente (Instagram → TikTok → Ideas → Solar) por un **board horizontal** donde cada plataforma es una columna scrolleable independiente, estilo Trello/Notion pero más visual.

```text
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ ● Instagram │ ● TikTok    │ ● Solar     │ ● Ideas     │
│ Marca pers. │ Día a día   │ Cinemato.   │ Banco       │
│   3/4 pub.  │   1/4 pub.  │   2/4 pub.  │   5 ideas   │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │
│ │ [Reel]  │ │ │ [Post]  │ │ │ [Corto] │ │ │ 💡 Idea │ │
│ │ Título  │ │ │ Título  │ │ │ Título  │ │ │ libre   │ │
│ │ 📄 Guion│ │ │         │ │ │ 📄 Guion│ │ │         │ │
│ │ ✓ Pub.  │ │ │ ○ Borr. │ │ │ ○ Borr. │ │ │         │ │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │
│ ┌─────────┐ │ + Añadir    │ + Añadir    │ + Añadir    │
│ │  + idea │ │             │             │             │
│ └─────────┘ │             │             │             │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

- **Encabezado de columna**: punto de color de la plataforma + nombre + objetivo en una línea + contador `publicados/total` como mini-progress.
- **Drag & drop** entre columnas (ya existe la lógica) — mover una idea a Instagram la convierte automáticamente en post de IG.
- En **móvil**: las columnas se vuelven swipeables horizontalmente con snap (gesto natural en mobile, como historias). Indicador de puntos abajo para saber en qué plataforma estás.

### 2. Tarjeta de contenido (rediseño)

Tarjeta tipo "post-it" más visual, sin parecer un campo de formulario:

- `rounded-2xl`, fondo blanco, sombra muy suave, **borde izquierdo de 3px** con el color de la plataforma (identidad visual rápida).
- **Chip de formato** arriba (`Reel`, `Carrusel`, `Cortometraje`...) con fondo de color suave por tipo — visualmente distinguible de un vistazo, no un `<select>` nativo.
- **Título** grande, editable inline al click (sin input feo — solo el texto se vuelve editable).
- Fila inferior con **microacciones siempre visibles** (no solo en hover):
  - `📄 Guion` → chip con preview de las primeras palabras del guion si existe, o `+ Guion` si está vacío.
  - `✓` toggle publicado (verde si publicado).
  - `⋯` menú (eliminar, duplicar).
- Cuando está **publicado**: la tarjeta toma un fondo verde muy sutil + check verde a la izquierda — se ve "completado" sin perder legibilidad.

### 3. Editor de Guion — Drawer dedicado

El Dialog actual es pequeño y poco usable para escribir un guion real. Lo reemplazo por un **Drawer lateral derecho** (mismo componente `Drawer` que ya usa Finanzas en mobile, pero en desktop también) que ocupa ~520px de ancho y todo el alto:

```text
┌──────────────────────────────────┐
│ ← Cerrar              ✓ Guardado │
│ ───────────────────────────────  │
│ ● Instagram · Reel               │ ← chips contexto
│ Título grande del video          │ ← editable
│                                  │
│ ┌─ HOOK (0–3 seg) ─────────────┐ │
│ │ Idea para enganchar...       │ │
│ └──────────────────────────────┘ │
│ ┌─ DESARROLLO ─────────────────┐ │
│ │ Cuerpo del video...          │ │
│ └──────────────────────────────┘ │
│ ┌─ CTA / CIERRE ───────────────┐ │
│ │ Llamado a la acción...       │ │
│ └──────────────────────────────┘ │
│ ┌─ NOTAS DE GRABACIÓN ─────────┐ │
│ │ Cámara, locación, props...   │ │
│ └──────────────────────────────┘ │
│                                  │
│ Duración estimada: [ 30 ] seg    │
└──────────────────────────────────┘
```

- Estructura **pensada para video corto**: Hook / Desarrollo / CTA / Notas — los 4 bloques que cualquier creador piensa antes de grabar.
- Cada bloque es un textarea con autosize, placeholder específico ("¿Qué dices o pasa en los primeros 3 segundos?").
- Auto-save al cerrar y al pausar de escribir (debounce 800ms) con indicador `✓ Guardado` arriba.
- Datos siguen guardándose en la columna `description` existente, serializados como JSON `{hook, body, cta, notes, duration}` — sin migración de DB necesaria. Compatibilidad: si `description` ya tiene texto plano, se carga en el bloque "Desarrollo".
- En **móvil** el Drawer ocupa pantalla completa desde abajo (ya es el comportamiento por defecto).

### 4. Sidebar de Objetivos

Se mantiene `ContentGoalsCard` pero con un pequeño cambio: el indicador lateral de cada plataforma usa el mismo color que su columna del board, reforzando la conexión visual. Es la única "guía" del planner — recordatorio del propósito de cada plataforma mientras planeas.

### Archivos a modificar

- `src/components/dashboard/ContentPlannerView.tsx` — sustituir `Dialog` de guion por `Drawer`, manejar el JSON estructurado del guion, pasar plataforma activa si aplica.
- `src/components/dashboard/content/PlannerGrid.tsx` — refactor mayor: layout de board horizontal con columnas por plataforma, header de columna con objetivo + progreso, scroll horizontal en mobile con snap, nuevo diseño de tarjeta con borde de color y chips de formato coloreados.
- `src/components/dashboard/content/ContentGoalsCard.tsx` — alinear colores de indicador con los del board.

### Lo que NO cambia

- Esquema de Supabase (`content_items`): mismas columnas, el guion estructurado vive dentro de `description` como JSON.
- Lógica de drag & drop, publicar, eliminar, cambiar formato.
- Datos existentes — guiones actuales se cargan en "Desarrollo" automáticamente.
