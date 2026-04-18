
Plan: Añadir vista semanal interactiva debajo del calendario mensual.

## Qué se construye

Una nueva sección **"Esta Semana"** debajo de `MonthlyCalendar` en el Overview que muestra los 7 días de la semana actual (lunes a domingo) con sus eventos y permite:
- Ver eventos de cada día
- Arrastrar eventos para moverlos entre días
- Arrastrar tareas pendientes desde el grid existente al día deseado
- Añadir eventos rápidos haciendo clic en un día

## Diseño UI

```text
┌─── ESTA SEMANA ──── [< Sem actual >] ──────────────┐
│ ┌────┬────┬────┬────┬────┬────┬────┐               │
│ │LUN │MAR │MIÉ │JUE │VIE │SÁB │DOM │               │
│ │ 21 │ 22 │ 23 │ 24 │ 25 │ 26 │ 27 │               │
│ ├────┼────┼────┼────┼────┼────┼────┤               │
│ │📌  │    │📌  │    │📌  │    │    │  hoy: highlight│
│ │evt │ +  │evt │ +  │evt │ +  │ +  │               │
│ │evt │    │    │    │    │    │    │               │
│ └────┴────┴────┴────┴────┴────┴────┘               │
└────────────────────────────────────────────────────┘
```

- Día actual con borde de acento (amber)
- Cada evento es una píldora coloreada (usa `event.color`)
- Drop zones por día para reordenar / añadir
- Click en día vacío → popup rápido para crear evento
- Botón flechas para navegar semana anterior/siguiente

## Implementación técnica

**1. Nuevo componente:** `src/components/dashboard/WeeklyView.tsx`
- Calcula los 7 días desde el lunes de la semana actual usando `date-fns` o lógica nativa
- Fetch de `events` filtrados entre `weekStart` y `weekEnd`
- Estado local para semana visible (permite navegar adelante/atrás)
- Drag & drop:
  - Eventos existentes (`dataTransfer.setData("eventDrag", id)`) → drop en otro día actualiza `event_date`
  - Tareas del grid (ya emiten `taskDrag`) → drop crea un nuevo evento con título de la tarea
- Popup de creación rápida reutilizando el patrón de `OverviewView`

**2. Integración en `OverviewView.tsx`:**
- Insertar `<WeeklyView />` justo después de `<MonthlyCalendar />`
- No requiere cambios de schema (usa la tabla `events` existente)

**3. Sin migraciones de DB:** La tabla `events` ya tiene `event_date`, `title`, `color`, `description`, `event_time` — todo lo necesario.

## Archivos

1. **Crear** `src/components/dashboard/WeeklyView.tsx`
2. **Editar** `src/components/dashboard/OverviewView.tsx` — montar componente
