
Plan: agregar un módulo de "Prioridades" al dashboard con tres tarjetas predefinidas (Colombina, Solar, Digital) editables.

## Qué se construye

Una nueva sección en el **Overview** del dashboard llamada "Prioridades" que muestra tres tarjetas con la información de cada cliente/proyecto recurrente:

- **Colombina** — Lunes a viernes, 8:00 am - 5:00 pm
- **Solar** — Una producción cada dos meses
- **Digital** — Contenido semanal en Instagram y TikTok

Cada tarjeta es editable (título, descripción de frecuencia/horario) y se pueden agregar/eliminar prioridades nuevas.

## Diseño de la UI

Sección dentro de `OverviewView.tsx` con un grid de 3 columnas en desktop / 1 columna en móvil:

```text
┌─────────────── PRIORIDADES ───────────────────[+ Agregar]┐
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│ │COLOMBINA │  │  SOLAR   │  │ DIGITAL  │                │
│ │ Lun-Vie  │  │ 1 prod / │  │Semanal IG│                │
│ │ 8am-5pm  │  │ 2 meses  │  │ + TikTok │                │
│ │  [edit]  │  │  [edit]  │  │  [edit]  │                │
│ └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

Cada tarjeta:
- Icono distintivo (Briefcase / Film / Smartphone) con color de acento
- Título en mayúsculas (editable inline al hacer clic)
- Descripción de frecuencia (editable inline)
- Botón de eliminar al hover

## Implementación técnica

**1. Nueva tabla `priorities` (migración SQL):**

```sql
CREATE TABLE public.priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  icon text DEFAULT 'briefcase',
  color text DEFAULT 'primary',
  sort_order integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own priorities" ON public.priorities
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

**2. Inicialización automática:** al cargar `OverviewView` por primera vez sin prioridades, se insertan las 3 por defecto (Colombina, Solar, Digital).

**3. Componente nuevo:** `src/components/dashboard/PrioritiesSection.tsx`
- Fetch de `priorities` desde Supabase
- Edición inline de `title` y `description` con auto-guardado al blur
- Botón "+ Agregar" para nuevas prioridades
- Botón eliminar por tarjeta (con confirmación ligera)

**4. Integración:** se inserta `<PrioritiesSection />` en `OverviewView.tsx` debajo del header de bienvenida.

## Archivos a crear/modificar

1. **Migración SQL** — crear tabla `priorities` con RLS
2. **Crear** `src/components/dashboard/PrioritiesSection.tsx`
3. **Editar** `src/components/dashboard/OverviewView.tsx` — montar la nueva sección
