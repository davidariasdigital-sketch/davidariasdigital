

## Plan: Centro de Contenido — layout 2 columnas + estadísticas de seguidores

### Diseño de la nueva interfaz

```text
┌─ Centro de Contenido ──────────────────────────────────┐
│                                                         │
│  ┌──────────────────────────┐ ┌──────────────────────┐ │
│  │  PLANEADOR (col izq)     │ │  OBJETIVOS (col der) │ │
│  │                          │ │                      │ │
│  │  Tabs: Planeador|Resumen │ │  ┌─ KPIs (2x2) ───┐  │ │
│  │                          │ │  │ Pub │ Cola     │  │ │
│  │  Instagram               │ │  │ Idea│ % publ.  │  │ │
│  │  [4 columnas grid]       │ │  └────────────────┘  │ │
│  │                          │ │                      │ │
│  │  TikTok                  │ │  ┌─ Metas mes ───┐  │ │
│  │  [4 columnas grid]       │ │  │ IG  8/15  ▓▓░│  │ │
│  │                          │ │  │ TT  4/10  ▓░░│  │ │
│  │  Ideas Futuras           │ │  │ Sol 1/3   ▓░░│  │ │
│  │  [8 columnas grid]       │ │  │ [editar metas]│  │ │
│  │                          │ │  └───────────────┘  │ │
│  │  Solar                   │ │                      │ │
│  │  [4 columnas grid]       │ │  ┌─ Distribución ┐  │ │
│  │                          │ │  │ Donut formato │  │ │
│  │                          │ │  └───────────────┘  │ │
│  └──────────────────────────┘ └──────────────────────┘ │
│                                                         │
│  ┌─ Crecimiento de seguidores (full width) ──────────┐ │
│  │  Tabs: Instagram | TikTok | Solar                  │ │
│  │  ┌──────────────────────────────────────────────┐ │ │
│  │  │  Línea/área chart — últimos 30 días          │ │ │
│  │  │  Eje Y: seguidores  Eje X: día               │ │ │
│  │  └──────────────────────────────────────────────┘ │ │
│  │  [+ Registrar conteo de hoy]                      │ │
│  │  Tabla compacta: fecha · cuenta · seguidores · Δ  │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

**Mobile (< lg)**: las 2 columnas se apilan (Planeador arriba, Objetivos debajo), y la tabla de seguidores siempre full-width.

**Desktop (lg+)**: `grid-cols-[1fr_360px]` — planeador ocupa el espacio flexible, objetivos columna fija a la derecha sticky para que no se pierda al hacer scroll.

### Componentes y datos

1. **Columna izquierda — Planeador**
   - Reutiliza el grid actual (IG, TikTok, Ideas, Solar) sin cambios de lógica.
   - Tabs internos pill-style: **Planeador** (grid actual) / **Resumen** (lista cronológica de últimos 10 publicados + próximos en cola).

2. **Columna derecha — Objetivos**
   - **KPIs 2x2** (`dash-tile`, números grandes):
     - Publicados este mes
     - En cola
     - Ideas
     - Tasa de publicación %
   - **Metas mensuales** (`dash-tile`):
     - Barra de progreso por sección (IG, TikTok, Solar) usando datos del mes actual.
     - Botón "Editar metas" → Dialog con inputs.
     - Persistencia: nueva tabla `content_goals`.
   - **Distribución por formato** (`dash-tile`):
     - Donut con `recharts` agrupando items publicados por `format`.
     - Leyenda compacta debajo.

3. **Sección inferior — Crecimiento de seguidores** (full width, `dash-tile`)
   - Tabs por plataforma: **Instagram / TikTok / Solar**.
   - Gráfico de **área** (`AreaChart` de recharts) mostrando evolución de seguidores en el tiempo.
   - Botón "+ Registrar conteo de hoy" → Dialog rápido (input numérico por plataforma).
   - Tabla compacta debajo: fecha · plataforma · seguidores · Δ vs anterior.
   - Persistencia: nueva tabla `follower_snapshots`.

### Cambios técnicos

- **Migración SQL**:
  - `content_goals` (user_id PK, ig_goal int, tiktok_goal int, solar_goal int, ideas_goal int) — 1 fila por usuario, upsert.
  - `follower_snapshots` (id, user_id, platform text, count int, snapshot_date date, created_at) — RLS estándar `auth.uid() = user_id`. Índice por (user_id, platform, snapshot_date).

- **`ContentPlannerView.tsx`**: refactor a layout `lg:grid-cols-[1fr_360px]` con header arriba, sección de seguidores debajo. Extraer el grid existente a sub-componente `<PlannerGrid />` para mantener el archivo legible.

- **Nuevos componentes**:
  - `ContentGoalsCard.tsx` — KPIs + metas + dialog editar.
  - `FormatDistributionCard.tsx` — donut.
  - `FollowerGrowthSection.tsx` — chart + dialog registrar + tabla.

- **Sin cambios** en lógica drag & drop, edición, formato, guion ni en `content_items`.

### Estilo

- Bento `gap-3 sm:gap-4`, `dash-tile rounded-2xl`.
- Columna derecha `lg:sticky lg:top-4 lg:self-start` para que las métricas queden visibles.
- Chart de seguidores con color primario (amarillo) + gradient suave, sin grid pesado, ejes minimalistas.
- KPI numbers `text-2xl sm:text-3xl font-bold`, labels `text-xs uppercase tracking-wider text-muted`.

### Archivos tocados

- Editado: `src/components/dashboard/ContentPlannerView.tsx` (layout 2 cols + integración).
- Nuevo: `src/components/dashboard/content/PlannerGrid.tsx` (extracción del grid actual).
- Nuevo: `src/components/dashboard/content/ContentGoalsCard.tsx`.
- Nuevo: `src/components/dashboard/content/FormatDistributionCard.tsx`.
- Nuevo: `src/components/dashboard/content/FollowerGrowthSection.tsx`.
- Nueva migración SQL: `content_goals` + `follower_snapshots` con RLS.

